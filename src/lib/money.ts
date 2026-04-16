/**
 * Converts a decimal amount (e.g., 40.50) to cents (4050)
 * Used for storing prices in the database
 */
export function convertToCents(amount: string | number): number {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (!Number.isFinite(num) || num < 0) return 0;
  return Math.trunc(num * 100);
}

/**
 * Converts cents (e.g., 4050) to a decimal amount (40.50)
 * Used for display purposes
 */
export function formatCentsToDisplay(cents: number | string): string {
  const amount = typeof cents === "string" ? parseInt(cents, 10) : cents;
  if (!Number.isFinite(amount)) return "0.00";
  return (amount / 100).toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formats a price for display with currency symbol
 */
export function formatPrice(cents: number | string): string {
  return `$${formatCentsToDisplay(cents)}`;
}
