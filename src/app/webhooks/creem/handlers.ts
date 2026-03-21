import type { SupabaseClient } from "@supabase/supabase-js";
import { getCreditsForProduct, getPriceForProduct } from "@/lib/credits-config";
import { CREDIT_UNLIMITED } from "@/app/api/credits/helpers";

/**
 * Pure functions for webhook event processing.
 * Extracted from route handler for testability.
 */

const STATUS_MAP: Record<string, string> = {
  "subscription.canceled": "cancelled",
  "subscription.active": "active",
  "subscription.past_due": "past_due",
  "subscription.trialing": "trialing",
  "subscription.paused": "paused",
  "subscription.expired": "expired",
  "subscription.unpaid": "past_due",
  "subscription.paid": "active",
  "subscription.update": "active",
};

export function mapSubscriptionStatus(eventType: string): string | null {
  return STATUS_MAP[eventType] ?? null;
}

export async function handleCreditGrant(
  db: SupabaseClient,
  userId: string,
  productId: string,
  productName: string,
  transactionType: "subscription_topup" | "purchase" = "subscription_topup",
  actualPaidCents?: number,
) {
  const credits = getCreditsForProduct(productId, productName);
  const standardPriceCents = getPriceForProduct(productId, productName);
  
  console.log(`[webhook] handleCreditGrant: userId=${userId}, productId=${productId}, productName=${productName}, credits=${credits === CREDIT_UNLIMITED ? "UNLIMITED" : credits}`);
  
  if (credits === 0) {
    console.log(`[webhook][WARN] handleCreditGrant: 0 credits for product ${productId} (${productName}), skipping`);
    return;
  }

  // Determine if this is an adjustment (pro-rated payment)
  let tag = "";
  const finalPriceCents = actualPaidCents !== undefined ? actualPaidCents : standardPriceCents;

  if (actualPaidCents !== undefined && actualPaidCents !== standardPriceCents) {
    if (actualPaidCents > standardPriceCents) {
      tag = " (Adjustment)";
    } else if (actualPaidCents < standardPriceCents && actualPaidCents > 0) {
      // If they paid less than standard, it's likely a mid-cycle upgrade/downgrade
      tag = " (Upgrade/Adjustment)";
    }
  }

  console.log(`[webhook] Granting ${credits === CREDIT_UNLIMITED ? "unlimited" : credits} credits to ${userId} for ${productName}${tag}`);

  // 1. Log the transaction with embedded price metadata
  const { error: txError } = await db.from("credit_transactions").insert({
    user_id: userId,
    amount: credits,
    type: transactionType,
    description: `Credit grant for ${productName}${tag} [PRICE:${finalPriceCents}]`,
  });
  if (txError) {
    console.error(`[webhook][ERROR] credit_transactions.insert FAILED:`, txError.message, txError.details);
  } else {
    console.log(`[webhook] credit_transactions.insert SUCCESS`);
  }

  // 1b. Update total spent in profile
  if (finalPriceCents > 0) {
    const { error: rpcError } = await db.rpc("increment_total_spent", { 
      p_user_id: userId, 
      p_amount: finalPriceCents 
    });
    if (rpcError) {
      console.error(`[webhook][ERROR] increment_total_spent RPC FAILED:`, rpcError.message);
    }
  }

  // 2. Upsert the credits wallet
  if (credits === CREDIT_UNLIMITED) {
    const { error: credErr } = await db.from("credits").upsert(
      { user_id: userId, balance: CREDIT_UNLIMITED, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
    if (credErr) {
      console.error(`[webhook][ERROR] credits.upsert (unlimited) FAILED:`, credErr.message, credErr.details);
    } else {
      console.log(`[webhook] credits.upsert (unlimited) SUCCESS`);
    }
  } else {
    const { data: wallet, error: walletErr } = await db
      .from("credits")
      .select("balance")
      .eq("user_id", userId)
      .single();

    if (walletErr) {
      console.log(`[webhook] No existing credits wallet for user ${userId}, will create one. Error: ${walletErr.message}`);
    }

    const currentBalance = wallet?.balance ?? 0;
    
    if (currentBalance === CREDIT_UNLIMITED) {
      console.log(`[webhook] User ${userId} already has unlimited credits, skipping`);
      return;
    }

    const newBalance = currentBalance + credits;
    console.log(`[webhook] Credits: current=${currentBalance}, adding=${credits}, new=${newBalance}`);

    const { error: credErr } = await db.from("credits").upsert(
      { 
        user_id: userId, 
        balance: newBalance, 
        updated_at: new Date().toISOString() 
      },
      { onConflict: "user_id" }
    );
    if (credErr) {
      console.error(`[webhook][ERROR] credits.upsert FAILED:`, credErr.message, credErr.details, credErr.hint);
    } else {
      console.log(`[webhook] credits.upsert SUCCESS: balance now ${newBalance} for user ${userId}`);
    }
  }
}

interface CheckoutEvent {
  metadata?: { user_id?: string };
  product: { id: string; name?: string };
  customer: { id: string };
  subscription?: {
    id: string;
    current_period_end_date?: Date | null;
    canceled_at?: Date | null;
  };
  feature?: {
    license?: { key: string };
  };
}

export interface SubscriptionUpsertRow {
  user_id: string | undefined;
  creem_customer_id: string;
  creem_subscription_id: string | undefined;
  creem_product_id: string;
  product_name: string | undefined;
  status: string;
  current_period_end?: string;
}

export function buildSubscriptionUpsert(event: CheckoutEvent): SubscriptionUpsertRow {
  return {
    user_id: event.metadata?.user_id,
    creem_customer_id: event.customer.id,
    creem_subscription_id: event.subscription?.id,
    creem_product_id: event.product.id,
    product_name: event.product.name,
    status: "active",
    current_period_end: event.subscription?.current_period_end_date
      ? new Date(event.subscription.current_period_end_date).toISOString()
      : undefined,
  };
}

interface SubscriptionUpdateFields {
  current_period_end_date?: Date | null;
  canceled_at?: Date | null;
}

export interface SubscriptionUpdateRow {
  status: string;
  current_period_end?: string;
  cancel_at?: string;
}

export function buildSubscriptionUpdate(
  status: string,
  fields: SubscriptionUpdateFields,
): SubscriptionUpdateRow {
  const row: SubscriptionUpdateRow = { status };

  if (fields.current_period_end_date) {
    row.current_period_end = new Date(fields.current_period_end_date).toISOString();
  }

  if (status === "scheduled_cancel" && fields.canceled_at) {
    row.cancel_at = new Date(fields.canceled_at).toISOString();
  }

  return row;
}
