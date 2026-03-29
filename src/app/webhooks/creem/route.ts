import { Webhook } from "@creem_io/nextjs";
import { enqueueEmail, isBullMQConfigured } from "@/lib/bullmq";
import { buildCacheKey, deleteCacheKey } from "@/lib/cache";
import { getPlanName, PRODUCT_PRICE_MAPPING } from "@/lib/credits-config";
import { sendPaymentConfirmationEmail } from "@/lib/email-service";
import { logger } from "@/lib/logger";
import { captureServerEvent } from "@/lib/posthog-server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { buildSubscriptionUpdate, buildSubscriptionUpsert, handleCreditGrant } from "./handlers";

type CheckoutEventExtras = {
  amount?: number;
  currency?: string;
  transaction_id?: string;
  feature?: {
    license?: {
      key?: string;
    };
  };
};

type SubscriptionPaidEventExtras = {
  amount?: number;
  currency?: string;
};

async function invalidateAdminCache() {
  await Promise.all([
    deleteCacheKey(buildCacheKey("admin", "profiles")),
    deleteCacheKey(buildCacheKey("admin", "credit_transactions")),
    deleteCacheKey(buildCacheKey("admin", "subscriptions")),
    deleteCacheKey(buildCacheKey("admin", "counts")),
  ]);
}

export const POST = Webhook({
  webhookSecret: process.env.CREEM_WEBHOOK_SECRET!,

  onCheckoutCompleted: async (event) => {
    const db = getSupabaseAdmin();
    const eventExtras = event as CheckoutEventExtras;
    logger.info("Webhook checkout.completed fired", {
      event: "webhook.checkout.completed",
      webhookId: event.webhookId,
      productId: event.product.id,
      productName: event.product.name,
      subscriptionId: event.subscription?.id,
    });

    const row = buildSubscriptionUpsert({
      metadata: event.metadata as { user_id?: string } | undefined,
      product: { id: event.product.id, name: event.product.name },
      customer: event.customer ? { id: event.customer.id } : { id: "" },
      subscription: event.subscription
        ? {
            id: event.subscription.id,
            current_period_end_date: event.subscription.current_period_end_date,
            canceled_at: null,
          }
        : undefined,
    });

    logger.info("Webhook subscription row built", {
      event: "webhook.checkout.subscription_row",
      webhookId: event.webhookId,
      row,
    });

    if (!row.user_id) {
      logger.warn("Webhook skipped: missing metadata.user_id", {
        event: "webhook.checkout.missing_user_id",
        webhookId: event.webhookId,
      });
      return;
    }

    // Idempotency check
    const { data: existing } = await db
      .from("webhook_events")
      .select("id")
      .eq("id", event.webhookId)
      .single();

    if (existing) {
      logger.info("Webhook duplicate skipped", {
        event: "webhook.duplicate",
        webhookId: event.webhookId,
      });
      return;
    }

    // Upsert subscription FIRST, before recording the webhook event
    const { error: subError } = await db
      .from("subscriptions")
      .upsert(row, { onConflict: "user_id" });
    if (subError) {
      logger.error("Webhook subscriptions upsert failed", {
        event: "webhook.subscriptions_upsert_failed",
        webhookId: event.webhookId,
        error: subError.message,
        details: subError.details,
        hint: subError.hint,
      });
    } else {
      logger.info("Webhook subscriptions upserted", {
        event: "webhook.subscriptions_upserted",
        webhookId: event.webhookId,
        userId: row.user_id,
      });
    }

    // Record webhook event AFTER critical operations succeed
    await db.from("webhook_events").insert({
      id: event.webhookId,
      event_type: "checkout.completed",
    });

    // Send Payment Confirmation Email
    const { data: userData } = await db.auth.admin.getUserById(row.user_id);
    if (userData?.user?.email) {
      const emailProps = {
        firstName: userData.user.user_metadata?.full_name?.split(" ")[0] || "there",
        planName: row.product_name || "Active",
        amount: event.subscription?.current_period_end_date ? "Subscription Activated" : "Paid",
      };

      if (isBullMQConfigured()) {
        await enqueueEmail({
          type: "payment-confirmation",
          email: userData.user.email,
          ...emailProps,
        });
      } else {
        await sendPaymentConfirmationEmail(userData.user.email, emailProps);
      }
    }

    const productName = row.product_name ?? "Product";
    const isOneTime = !event.subscription?.id || productName.toLowerCase().includes("nova pro max");

    if (isOneTime && row.user_id) {
      const { error: purchaseError } = await db.from("purchases").insert({
        user_id: row.user_id,
        creem_customer_id: row.creem_customer_id,
        creem_product_id: row.creem_product_id,
        product_name: productName,
      });

      if (purchaseError) {
        logger.error("Webhook purchases insert failed", {
          event: "webhook.purchases_insert_failed",
          webhookId: event.webhookId,
          userId: row.user_id,
          error: purchaseError.message,
          details: purchaseError.details,
          hint: purchaseError.hint,
        });
      } else {
        logger.info("Webhook purchase inserted", {
          event: "webhook.purchases_inserted",
          webhookId: event.webhookId,
          userId: row.user_id,
          productId: row.creem_product_id,
        });
      }
    }

    // Store license key if present in the event
    const licenseKey = eventExtras.feature?.license?.key;
    if (licenseKey && row.user_id) {
      logger.info("Webhook storing license key", {
        event: "webhook.license_store_start",
        userId: row.user_id,
      });
      const { error: licError } = await db.from("licenses").upsert(
        {
          user_id: row.user_id,
          creem_license_key: licenseKey,
          creem_product_id: row.creem_product_id,
          product_name: productName,
          status: "active",
          activated_at: new Date().toISOString(),
        },
        { onConflict: "creem_license_key" },
      );
      if (licError) {
        logger.error("Webhook license upsert failed", {
          event: "webhook.licenses_upsert_failed",
          userId: row.user_id,
          error: licError.message,
        });
      }
    }

    await handleCreditGrant(
      db,
      row.user_id,
      row.creem_product_id,
      productName,
      isOneTime ? "purchase" : "subscription_topup",
      eventExtras.amount, // Pass the actual amount paid
    );

    // Record billing event for notification
    if (row.user_id) {
      await db.from("billing_events").insert({
        user_id: row.user_id,
        event_type: "checkout.completed",
        creem_transaction_id: eventExtras.transaction_id,
        amount: eventExtras.amount,
        currency: eventExtras.currency || "USD",
        reason: `Successful purchase of ${productName}`,
        status: "open",
      });
    }

    await invalidateAdminCache();

    captureServerEvent(row.user_id, "checkout_completed", {
      product_id: row.creem_product_id,
      product_name: productName,
      amount: eventExtras.amount,
      currency: eventExtras.currency,
    });
  },

  onSubscriptionPaid: async (event) => {
    const db = getSupabaseAdmin();
    const eventExtras = event as SubscriptionPaidEventExtras;
    logger.info("Webhook subscription.paid fired", {
      event: "webhook.subscription.paid",
      subscriptionId: event.id,
    });
    const update = buildSubscriptionUpdate("active", {
      current_period_end_date: event.current_period_end_date,
    });
    const { error: updateErr } = await db
      .from("subscriptions")
      .update(update)
      .eq("creem_subscription_id", event.id);
    if (updateErr) {
      logger.error("Webhook subscription.paid update failed", {
        event: "webhook.subscription_paid_update_failed",
        subscriptionId: event.id,
        error: updateErr.message,
      });
    } else {
      logger.info("Webhook subscription.paid updated", {
        event: "webhook.subscription_paid_updated",
        subscriptionId: event.id,
      });
    }

    // Grant credits for the new period
    const { data: sub, error: subFetchErr } = await db
      .from("subscriptions")
      .select("user_id, creem_product_id, product_name")
      .eq("creem_subscription_id", event.id)
      .single();

    if (subFetchErr) {
      logger.error("Webhook subscription.paid could not find subscription row", {
        event: "webhook.subscription_paid_missing_row",
        subscriptionId: event.id,
        error: subFetchErr.message,
      });
    }

    if (sub?.user_id && sub.creem_product_id) {
      await handleCreditGrant(
        db,
        sub.user_id,
        sub.creem_product_id,
        sub.product_name ?? "Subscription",
        "subscription_topup",
        eventExtras.amount, // Pass the actual amount paid
      );

      // Record billing event for notification
      await db.from("billing_events").insert({
        user_id: sub.user_id,
        event_type: "subscription_topup",
        creem_transaction_id: event.id,
        amount: eventExtras.amount,
        currency: eventExtras.currency || "USD",
        reason: `Subscription renewed: ${sub.product_name ?? "Active Plan"}`,
        status: "open",
      });
    } else {
      logger.error("Webhook subscription.paid missing matching subscription", {
        event: "webhook.subscription_paid_no_match",
        subscriptionId: event.id,
      });
    }

    await invalidateAdminCache();

    if (sub?.user_id) {
      captureServerEvent(sub.user_id, "subscription_paid", {
        subscription_id: event.id,
        product_name: sub.product_name,
        amount: eventExtras.amount,
        currency: eventExtras.currency,
      });
    }
  },

  onSubscriptionCanceled: async (event) => {
    const db = getSupabaseAdmin();
    const update = buildSubscriptionUpdate("cancelled", {
      canceled_at: event.canceled_at,
    });
    await db.from("subscriptions").update(update).eq("creem_subscription_id", event.id);

    // Record billing event for notification
    const { data: sub } = await db
      .from("subscriptions")
      .select("user_id, product_name")
      .eq("creem_subscription_id", event.id)
      .single();
    if (sub?.user_id) {
      await db.from("billing_events").insert({
        user_id: sub.user_id,
        event_type: "subscription.canceled",
        creem_subscription_id: event.id,
        reason: `Subscription to ${sub.product_name || "Plan"} cancelled`,
        status: "open",
      });
    }

    await invalidateAdminCache();
  },

  onSubscriptionExpired: async (event) => {
    const db = getSupabaseAdmin();
    await db
      .from("subscriptions")
      .update({ status: "expired" })
      .eq("creem_subscription_id", event.id);
  },

  onSubscriptionPaused: async (event) => {
    const db = getSupabaseAdmin();
    await db
      .from("subscriptions")
      .update({ status: "paused" })
      .eq("creem_subscription_id", event.id);
  },

  onSubscriptionTrialing: async (event) => {
    const db = getSupabaseAdmin();
    const update = buildSubscriptionUpdate("trialing", {
      current_period_end_date: event.current_period_end_date,
    });
    await db.from("subscriptions").update(update).eq("creem_subscription_id", event.id);
  },

  onSubscriptionPastDue: async (event) => {
    const db = getSupabaseAdmin();
    await db
      .from("subscriptions")
      .update({ status: "past_due" })
      .eq("creem_subscription_id", event.id);

    // Record billing event for notification
    const { data: sub } = await db
      .from("subscriptions")
      .select("user_id, product_name")
      .eq("creem_subscription_id", event.id)
      .single();
    if (sub?.user_id) {
      await db.from("billing_events").insert({
        user_id: sub.user_id,
        event_type: "subscription.past_due",
        creem_subscription_id: event.id,
        reason: `Action Required: Payment failed for ${sub.product_name || "Plan"}`,
        status: "open",
      });
    }
  },

  onSubscriptionUpdate: async (event) => {
    const db = getSupabaseAdmin();
    const productId = typeof event.product === "string" ? event.product : event.product.id;
    const productName =
      (typeof event.product === "string" ? undefined : event.product.name) ||
      getPlanName(productId);

    // Fetch current subscription to detect upgrade vs downgrade
    const { data: existingSub } = await db
      .from("subscriptions")
      .select("user_id, creem_product_id, product_name")
      .eq("creem_subscription_id", event.id)
      .single();

    await db
      .from("subscriptions")
      .update({
        creem_product_id: productId,
        product_name: productName,
        status: event.status,
        current_period_end: event.current_period_end_date
          ? new Date(event.current_period_end_date).toISOString()
          : undefined,
      })
      .eq("creem_subscription_id", event.id);

    // Record billing event for upgrade/downgrade notification
    if (existingSub?.user_id && existingSub.creem_product_id !== productId) {
      const previousName =
        existingSub.product_name || getPlanName(existingSub.creem_product_id) || "previous plan";
      // Determine upgrade vs downgrade by checking plan tiers (higher price = upgrade)
      const previousPrice = PRODUCT_PRICE_MAPPING[existingSub.creem_product_id] ?? 0;
      const newPrice = PRODUCT_PRICE_MAPPING[productId] ?? 0;
      const isUpgrade = newPrice >= previousPrice;

      await db.from("billing_events").insert({
        user_id: existingSub.user_id,
        event_type: isUpgrade ? "subscription.upgraded" : "subscription.downgraded",
        creem_subscription_id: event.id,
        reason: isUpgrade
          ? `Plan upgraded: ${previousName} → ${productName}`
          : `Plan downgraded: ${previousName} → ${productName}`,
        status: "open",
      });
    }

    await invalidateAdminCache();
  },

  onRefundCreated: async (event) => {
    const db = getSupabaseAdmin();
    const subscriptionId =
      typeof event.subscription === "string" ? event.subscription : event.subscription?.id;

    const { data: sub } = await db
      .from("subscriptions")
      .select("user_id")
      .eq("creem_subscription_id", subscriptionId ?? "")
      .single();

    await db.from("billing_events").insert({
      user_id: sub?.user_id,
      event_type: "refund",
      creem_transaction_id: event.transaction.id,
      amount: event.refund_amount,
      currency: event.refund_currency,
      status: "completed",
    });
  },

  onDisputeCreated: async (event) => {
    const db = getSupabaseAdmin();
    const subscriptionId =
      typeof event.subscription === "string" ? event.subscription : event.subscription?.id;

    const { data: sub } = await db
      .from("subscriptions")
      .select("user_id")
      .eq("creem_subscription_id", subscriptionId ?? "")
      .single();

    await db.from("billing_events").insert({
      user_id: sub?.user_id,
      event_type: "dispute",
      creem_transaction_id: event.transaction.id,
      amount: event.amount,
      currency: event.currency,
      status: "open",
    });
  },

  onGrantAccess: async (context: {
    reason: string;
    customer: { email: string };
    metadata?: Record<string, unknown>;
  }) => {
    const userId = (context.metadata as Record<string, string> | undefined)?.referenceId;
    logger.info("Webhook grant access", {
      event: "webhook.grant_access",
      reason: context.reason,
      userId: userId ?? "unknown",
      customerEmail: context.customer.email,
    });
  },

  onRevokeAccess: async (context: {
    reason: string;
    customer: { email: string };
    metadata?: Record<string, unknown>;
  }) => {
    const userId = (context.metadata as Record<string, string> | undefined)?.referenceId;
    logger.info("Webhook revoke access", {
      event: "webhook.revoke_access",
      reason: context.reason,
      userId: userId ?? "unknown",
      customerEmail: context.customer.email,
    });
  },
});
