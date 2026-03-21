import { Webhook } from "@creem_io/nextjs";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { buildSubscriptionUpdate, buildSubscriptionUpsert, handleCreditGrant } from "./handlers";
import { sendPaymentConfirmationEmail } from "@/lib/email-service";
import { getPlanName, PRODUCT_PRICE_MAPPING } from "@/lib/credits-config";

export const POST = Webhook({
  webhookSecret: process.env.CREEM_WEBHOOK_SECRET!,

  onCheckoutCompleted: async (event) => {
    const db = getSupabaseAdmin();
    console.log(`[webhook] checkout.completed fired. webhookId=${event.webhookId}`);
    console.log(`[webhook] metadata:`, JSON.stringify(event.metadata));
    console.log(`[webhook] product: id=${event.product.id}, name=${event.product.name}`);
    console.log(`[webhook] subscription:`, event.subscription ? `id=${event.subscription.id}` : "none (one-time)");

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

    console.log(`[webhook] built row:`, JSON.stringify(row));

    if (!row.user_id) {
      console.log("[webhook][ERROR] checkout.completed: no user_id in metadata, skipping");
      return;
    }

    // Idempotency check
    const { data: existing } = await db
      .from("webhook_events")
      .select("id")
      .eq("id", event.webhookId)
      .single();

    if (existing) {
      console.log(`[webhook] duplicate event ${event.webhookId}, skipping`);
      return;
    }

    // Upsert subscription FIRST, before recording the webhook event
    const { error: subError } = await db.from("subscriptions").upsert(row, { onConflict: "user_id" });
    if (subError) {
      console.error(`[webhook][ERROR] subscriptions.upsert FAILED:`, subError.message, subError.details, subError.hint);
    } else {
      console.log(`[webhook] subscriptions.upsert SUCCESS for user ${row.user_id}`);
    }

    // Record webhook event AFTER critical operations succeed
    await db.from("webhook_events").insert({
      id: event.webhookId,
      event_type: "checkout.completed",
    });

    // Send Payment Confirmation Email
    const { data: userData } = await db.auth.admin.getUserById(row.user_id);
    if (userData?.user?.email) {
      await sendPaymentConfirmationEmail(userData.user.email, {
        firstName: userData.user.user_metadata?.full_name?.split(" ")[0] || "there",
        planName: row.product_name || "Active",
        amount: event.subscription?.current_period_end_date ? "Subscription Activated" : "Paid",
      });
    }

    const productName = row.product_name ?? "Product";
    const isOneTime = !event.subscription?.id || productName.toLowerCase().includes("nova pro max");

    // Store license key if present in the event
    const licenseKey = (event as any).feature?.license?.key;
    if (licenseKey && row.user_id) {
       console.log(`[webhook] Storing license key for user ${row.user_id}`);
       const { error: licError } = await db.from("licenses").upsert({
          user_id: row.user_id,
          creem_license_key: licenseKey,
          creem_product_id: row.creem_product_id,
          product_name: productName,
          status: "active",
          activated_at: new Date().toISOString()
       }, { onConflict: "creem_license_key" });
       if (licError) console.error(`[webhook][ERROR] licenses.upsert FAILED:`, licError.message);
    }

    await handleCreditGrant(
      db, 
      row.user_id, 
      row.creem_product_id, 
      productName,
      isOneTime ? "purchase" : "subscription_topup",
      (event as any).amount // Pass the actual amount paid
    );

    // Record billing event for notification
    if (row.user_id) {
      await db.from("billing_events").insert({
        user_id: row.user_id,
        event_type: "checkout.completed",
        creem_transaction_id: (event as any).transaction_id,
        amount: (event as any).amount,
        currency: (event as any).currency || "USD",
        reason: `Successful purchase of ${productName}`,
        status: "open",
      });
    }
  },

  onSubscriptionPaid: async (event) => {
    const db = getSupabaseAdmin();
    console.log(`[webhook] subscription.paid fired. subscription_id=${event.id}`);
    const update = buildSubscriptionUpdate("active", {
      current_period_end_date: event.current_period_end_date,
    });
    const { error: updateErr } = await db.from("subscriptions").update(update).eq("creem_subscription_id", event.id);
    if (updateErr) {
      console.error(`[webhook][ERROR] subscription.paid update FAILED:`, updateErr.message);
    } else {
      console.log(`[webhook] subscription.paid update SUCCESS for sub ${event.id}`);
    }

    // Grant credits for the new period
    const { data: sub, error: subFetchErr } = await db
      .from("subscriptions")
      .select("user_id, creem_product_id, product_name")
      .eq("creem_subscription_id", event.id)
      .single();

    if (subFetchErr) {
      console.error(`[webhook][ERROR] subscription.paid: could not find subscription row for sub ${event.id}:`, subFetchErr.message);
    }

    if (sub && sub.user_id && sub.creem_product_id) {
      await handleCreditGrant(
        db, 
        sub.user_id, 
        sub.creem_product_id, 
        sub.product_name ?? "Subscription",
        "subscription_topup",
        (event as any).amount // Pass the actual amount paid
      );

      // Record billing event for notification
      await db.from("billing_events").insert({
        user_id: sub.user_id,
        event_type: "subscription_topup",
        creem_transaction_id: event.id,
        amount: (event as any).amount,
        currency: (event as any).currency || "USD",
        reason: `Subscription renewed: ${sub.product_name ?? "Active Plan"}`,
        status: "open",
      });
    } else {
      console.error(`[webhook][ERROR] subscription.paid: no matching subscription found for creem_subscription_id=${event.id}`);
    }
  },

  onSubscriptionCanceled: async (event) => {
    const db = getSupabaseAdmin();
    const update = buildSubscriptionUpdate("cancelled", {
      canceled_at: event.canceled_at,
    });
    await db.from("subscriptions").update(update).eq("creem_subscription_id", event.id);

    // Record billing event for notification
    const { data: sub } = await db.from("subscriptions").select("user_id, product_name").eq("creem_subscription_id", event.id).single();
    if (sub?.user_id) {
      await db.from("billing_events").insert({
        user_id: sub.user_id,
        event_type: "subscription.canceled",
        creem_subscription_id: event.id,
        reason: `Subscription to ${sub.product_name || "Plan"} cancelled`,
        status: "open",
      });
    }
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
    const { data: sub } = await db.from("subscriptions").select("user_id, product_name").eq("creem_subscription_id", event.id).single();
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
    const productName = (typeof event.product === "string" ? undefined : event.product.name) || getPlanName(productId);
    
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
      const previousName = existingSub.product_name || getPlanName(existingSub.creem_product_id) || "previous plan";
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

  onGrantAccess: async ({ reason, customer, metadata }) => {
    const userId = (metadata as Record<string, string> | undefined)?.referenceId;
    console.log(
      `[webhook] Grant access (${reason}) for user ${userId ?? "unknown"}, customer ${customer.email}`,
    );
  },

  onRevokeAccess: async ({ reason, customer, metadata }) => {
    const userId = (metadata as Record<string, string> | undefined)?.referenceId;
    console.log(
      `[webhook] Revoke access (${reason}) for user ${userId ?? "unknown"}, customer ${customer.email}`,
    );
  },
});
