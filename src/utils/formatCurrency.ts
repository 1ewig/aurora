/**
 * Aurora — src/utils/formatCurrency.ts
 *
 * Formats a numeric amount as a locale-aware currency string (USD default).
 * Renders whole-dollar amounts without decimal places for a clean luxury presentation.
 */

/** Formats a number as USD (or specified currency) with no decimals. */
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
