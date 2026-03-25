import type { SupabaseClient } from "@supabase/supabase-js";
import { CREDIT_UNLIMITED } from "@/app/api/credits/helpers";
import { getCreditsForProduct, getPriceForProduct } from "@/lib/credits-config";
import { logger } from "@/lib/logger";

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

  logger.info("Webhook credit grant processing started", {
    event: "webhook.credit_grant_start",
    userId,
    productId,
    productName,
    credits: credits === CREDIT_UNLIMITED ? "UNLIMITED" : credits,
  });

  if (credits === 0) {
    logger.warn("Webhook credit grant skipped due to zero credits", {
      event: "webhook.credit_grant_zero_credits",
      productId,
      productName,
    });
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

  logger.info("Webhook granting credits", {
    event: "webhook.credit_grant",
    userId,
    productName,
    credits: credits === CREDIT_UNLIMITED ? "UNLIMITED" : credits,
    priceCents: finalPriceCents,
    tag,
  });

  // 1. Log the transaction with embedded price metadata
  const { error: txError } = await db.from("credit_transactions").insert({
    user_id: userId,
    amount: credits,
    type: transactionType,
    description: `Credit grant for ${productName}${tag} [PRICE:${finalPriceCents}]`,
  });
  if (txError) {
    logger.error("Webhook credit transaction insert failed", {
      event: "webhook.credit_transaction_insert_failed",
      userId,
      error: txError.message,
      details: txError.details,
    });
  } else {
    logger.info("Webhook credit transaction inserted", {
      event: "webhook.credit_transaction_inserted",
      userId,
    });
  }

  // 1b. Update total spent in profile
  if (finalPriceCents > 0) {
    const { error: rpcError } = await db.rpc("increment_total_spent", {
      p_user_id: userId,
      p_amount: finalPriceCents,
    });
    if (rpcError) {
      logger.error("Webhook increment_total_spent RPC failed", {
        event: "webhook.increment_total_spent_failed",
        userId,
        error: rpcError.message,
      });
    }
  }

  // 2. Upsert the credits wallet
  if (credits === CREDIT_UNLIMITED) {
    const { error: credErr } = await db
      .from("credits")
      .upsert(
        { user_id: userId, balance: CREDIT_UNLIMITED, updated_at: new Date().toISOString() },
        { onConflict: "user_id" },
      );
    if (credErr) {
      logger.error("Webhook unlimited credits upsert failed", {
        event: "webhook.credits_unlimited_upsert_failed",
        userId,
        error: credErr.message,
        details: credErr.details,
      });
    } else {
      logger.info("Webhook unlimited credits upserted", {
        event: "webhook.credits_unlimited_upserted",
        userId,
      });
    }
  } else {
    const { data: wallet, error: walletErr } = await db
      .from("credits")
      .select("balance")
      .eq("user_id", userId)
      .single();

    if (walletErr) {
      logger.info("Webhook no existing credits wallet, creating one", {
        event: "webhook.credits_wallet_missing",
        userId,
        error: walletErr.message,
      });
    }

    const currentBalance = wallet?.balance ?? 0;

    if (currentBalance === CREDIT_UNLIMITED) {
      logger.info("Webhook skipped wallet update because user is unlimited", {
        event: "webhook.credits_wallet_unlimited_skip",
        userId,
      });
      return;
    }

    const newBalance = currentBalance + credits;
    logger.info("Webhook credits wallet update calculated", {
      event: "webhook.credits_wallet_calculated",
      userId,
      currentBalance,
      creditsToAdd: credits,
      newBalance,
    });

    const { error: credErr } = await db.from("credits").upsert(
      {
        user_id: userId,
        balance: newBalance,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
    if (credErr) {
      logger.error("Webhook credits upsert failed", {
        event: "webhook.credits_upsert_failed",
        userId,
        error: credErr.message,
        details: credErr.details,
        hint: credErr.hint,
      });
    } else {
      logger.info("Webhook credits upserted", {
        event: "webhook.credits_upserted",
        userId,
        newBalance,
      });
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
