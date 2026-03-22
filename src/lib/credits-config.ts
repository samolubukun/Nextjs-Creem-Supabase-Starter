import { CREDIT_UNLIMITED } from "@/app/api/credits/helpers";

/**
 * Mapping of Creem Product IDs to credit amounts.
 * These should match the IDs in your .env.local file.
 */
export const PRODUCT_CREDIT_MAPPING: Record<string, number> = {
  // Starter Plan
  [process.env.NEXT_PUBLIC_CREEM_STARTER_PRODUCT_ID ?? "prod_10ZHaKvlzE1vAYa7317R6s"]: 100,

  // Creator Plan
  [process.env.NEXT_PUBLIC_CREEM_PRO_PRODUCT_ID ?? "prod_4eT7MCvY7sH2BvNa5DTHh7"]: 500,

  // Professional Plan
  [process.env.NEXT_PUBLIC_CREEM_ENTERPRISE_PRODUCT_ID ?? "prod_4lFbtDJGdVOjpjk6CwghSr"]: 2000,

  // Content Nova Pro Max (One-time)
  [process.env.NEXT_PUBLIC_CREEM_PRO_MAX_PRODUCT_ID ?? "prod_W3MrXbD703JLiOAJyL6TD"]:
    CREDIT_UNLIMITED,
};

/**
 * Mapping of Creem Product IDs to their prices in cents.
 */
export const PRODUCT_PRICE_MAPPING: Record<string, number> = {
  [process.env.NEXT_PUBLIC_CREEM_STARTER_PRODUCT_ID ?? "prod_10ZHaKvlzE1vAYa7317R6s"]: 1000,
  [process.env.NEXT_PUBLIC_CREEM_PRO_PRODUCT_ID ?? "prod_4eT7MCvY7sH2BvNa5DTHh7"]: 2900,
  [process.env.NEXT_PUBLIC_CREEM_ENTERPRISE_PRODUCT_ID ?? "prod_4lFbtDJGdVOjpjk6CwghSr"]: 7900,
  [process.env.NEXT_PUBLIC_CREEM_PRO_MAX_PRODUCT_ID ?? "prod_W3MrXbD703JLiOAJyL6TD"]: 300000,
};

export const PLANS = [
  {
    id: process.env.NEXT_PUBLIC_CREEM_STARTER_PRODUCT_ID ?? "prod_10ZHaKvlzE1vAYa7317R6s",
    name: "Starter",
    price: 1000,
    period: "month",
  },
  {
    id: process.env.NEXT_PUBLIC_CREEM_PRO_PRODUCT_ID ?? "prod_4eT7MCvY7sH2BvNa5DTHh7",
    name: "Creator",
    price: 2900,
    period: "month",
  },
  {
    id: process.env.NEXT_PUBLIC_CREEM_ENTERPRISE_PRODUCT_ID ?? "prod_4lFbtDJGdVOjpjk6CwghSr",
    name: "Professional",
    price: 7900,
    period: "month",
  },
  {
    id: process.env.NEXT_PUBLIC_CREEM_PRO_MAX_PRODUCT_ID ?? "prod_W3MrXbD703JLiOAJyL6TD",
    name: "Nova Pro Max",
    price: 300000, // $3,000.00
    period: "one-time",
  },
];

export function getPlanName(productId: string): string {
  return PLANS.find((p) => p.id === productId)?.name || "Plan";
}

export function getCreditsForProduct(productId: string, productName?: string): number {
  // 1. Try exact ID match first (most reliable)
  if (PRODUCT_CREDIT_MAPPING[productId] !== undefined) {
    return PRODUCT_CREDIT_MAPPING[productId]!;
  }

  const name = productName?.toLowerCase() || getPlanName(productId).toLowerCase();

  // 2. Fallback to strict name-based check for Pro Max/Lifetime
  if (
    name.includes("pro max") ||
    name.includes("lifetime") ||
    (name.includes("nova") && name.includes("max"))
  ) {
    return CREDIT_UNLIMITED;
  }

  return 0;
}

export function getPriceForProduct(productId: string, productName?: string): number {
  // 1. Try exact ID match first
  if (PRODUCT_PRICE_MAPPING[productId] !== undefined) {
    return PRODUCT_PRICE_MAPPING[productId]!;
  }

  const name = productName?.toLowerCase() || getPlanName(productId).toLowerCase();

  // 2. Fallback to strict name-based check for Pro Max
  if (name.includes("pro max") || (name.includes("nova") && name.includes("max"))) {
    return 300000;
  }

  return 0;
}
