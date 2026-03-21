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
  
  if (credits === 0) return;

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
  await db.from("credit_transactions").insert({
    user_id: userId,
    amount: credits,
    type: transactionType,
    description: `Credit grant for ${productName}${tag} [PRICE:${finalPriceCents}]`,
  });

  // 1b. Update total spent in profile
  if (finalPriceCents > 0) {
    await db.rpc("increment_total_spent", { 
      p_user_id: userId, 
      p_amount: finalPriceCents 
    });
  }

  // 2. Upsert the credits wallet
  if (credits === CREDIT_UNLIMITED) {
    await db.from("credits").upsert(
      { user_id: userId, balance: CREDIT_UNLIMITED, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
  } else {
    const { data: wallet } = await db
      .from("credits")
      .select("balance")
      .eq("user_id", userId)
      .single();

    const currentBalance = wallet?.balance ?? 0;
    
    if (currentBalance === CREDIT_UNLIMITED) return;

    await db.from("credits").upsert(
      { 
        user_id: userId, 
        balance: currentBalance + credits, 
        updated_at: new Date().toISOString() 
      },
      { onConflict: "user_id" }
    );
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
