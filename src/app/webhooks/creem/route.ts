import { Webhook } from "@creem_io/nextjs";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { buildSubscriptionUpdate, buildSubscriptionUpsert, handleCreditGrant } from "./handlers";
import { sendPaymentConfirmationEmail } from "@/lib/email-service";
import { getPlanName } from "@/lib/credits-config";

export const POST = Webhook({
  webhookSecret: process.env.CREEM_WEBHOOK_SECRET!,

  onCheckoutCompleted: async (event) => {
    const db = getSupabaseAdmin();
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

    if (!row.user_id) {
      console.log("[webhook] checkout.completed: no user_id in metadata, skipping");
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

    await db.from("webhook_events").insert({
      id: event.webhookId,
      event_type: "checkout.completed",
    });

    await db.from("subscriptions").upsert(row, { onConflict: "user_id" });

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
       await db.from("licenses").upsert({
          user_id: row.user_id,
          creem_license_key: licenseKey,
          creem_product_id: row.creem_product_id,
          product_name: productName,
          status: "active",
          activated_at: new Date().toISOString()
       }, { onConflict: "creem_license_key" });
    }

    await handleCreditGrant(
      db, 
      row.user_id, 
      row.creem_product_id, 
      productName,
      isOneTime ? "purchase" : "subscription_topup",
      (event as any).amount // Pass the actual amount paid
    );
  },

  onSubscriptionPaid: async (event) => {
    const db = getSupabaseAdmin();
    const update = buildSubscriptionUpdate("active", {
      current_period_end_date: event.current_period_end_date,
    });
    await db.from("subscriptions").update(update).eq("creem_subscription_id", event.id);

    // Grant credits for the new period
    const { data: sub } = await db
      .from("subscriptions")
      .select("user_id, creem_product_id, product_name")
      .eq("creem_subscription_id", event.id)
      .single();

    if (sub && sub.user_id && sub.creem_product_id) {
      await handleCreditGrant(
        db, 
        sub.user_id, 
        sub.creem_product_id, 
        sub.product_name ?? "Subscription",
        "subscription_topup",
        (event as any).amount // Pass the actual amount paid
      );
    }
  },

  onSubscriptionCanceled: async (event) => {
    const db = getSupabaseAdmin();
    const update = buildSubscriptionUpdate("cancelled", {
      canceled_at: event.canceled_at,
    });
    await db.from("subscriptions").update(update).eq("creem_subscription_id", event.id);
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
  },

  onSubscriptionUpdate: async (event) => {
    const db = getSupabaseAdmin();
    const productId = typeof event.product === "string" ? event.product : event.product.id;
    const productName = (typeof event.product === "string" ? undefined : event.product.name) || getPlanName(productId);
    
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
