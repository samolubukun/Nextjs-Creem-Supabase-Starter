import { CREDIT_UNLIMITED } from "@/app/api/credits/helpers";
import { formatCurrency } from "@/lib/currency";

export interface RawTransaction {
  id: string;
  amount: number;
  type: string;
  description?: string;
  created_at: string | number;
  status: string;
}

interface FormattedTransaction {
  id: string;
  amount: number;
  displayAmount: string;
  status: string;
  created_at: string;
  description: string;
  planType: string;
}

export function cleanDescription(description: string): string {
  if (!description) return "";
  let cleaned = description;

  // 1. Aggressively strip the [PRICE:XXXX] metadata
  cleaned = cleaned.replace(/\[\s*PRICE\s*:\s*\d+\s*\]/gi, "").trim();

  // 2. Secondary fallback for any stray metadata bits
  cleaned = cleaned.replace(/PRICE\s*:\s*\d+/gi, "").trim();

  // 3. Remove any empty brackets left over
  cleaned = cleaned.replace(/\[\s*\]/g, "").trim();

  return cleaned;
}

export function formatTransaction(tx: RawTransaction): FormattedTransaction {
  const isUnlimited = tx.amount === CREDIT_UNLIMITED;
  let rawDescription = tx.description || "";
  let priceCents: number | null = null;

  // Extract [PRICE:X] from description if present
  const priceMatch = rawDescription.match(/\[\s*PRICE\s*:\s*(\d+)\s*\]/i);
  if (priceMatch) {
    priceCents = parseInt(priceMatch[1], 10);
  }

  // Use the universal cleaner
  rawDescription = cleanDescription(rawDescription);

  // Determine what to show in the "Amount" column
  const displayAmount =
    priceCents !== null
      ? formatCurrency(priceCents)
      : isUnlimited
        ? "Unlimited"
        : formatCurrency(Math.abs(tx.amount));

  // A transaction is One-time ONLY if it's a 'purchase' type OR specifically the Pro Max plan
  const isOneTime =
    tx.type === "purchase" ||
    (tx.type !== "subscription_topup" && rawDescription.toLowerCase().includes("pro max"));

  return {
    id: tx.id,
    amount: tx.amount,
    displayAmount,
    status: tx.status,
    description: rawDescription || (tx.amount > 0 ? "Credit Induction" : "System Usage"),
    planType: isOneTime ? "One-time" : "Subscription",
    created_at:
      typeof tx.created_at === "number"
        ? new Date(tx.created_at).toISOString()
        : String(tx.created_at),
  };
}
