/**
 * Centralized currency configuration.
 * Change these values to localize the entire application.
 */
export const CURRENCY = "USD";
export const CURRENCY_LOCALE = "en-US";

export function formatCurrency(amountCents: number) {
  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: "currency",
    currency: CURRENCY,
  }).format(amountCents / 100);
}
