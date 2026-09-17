/**
 * Money helpers — all prices are integer minor units (paise / NPR paisa).
 * Never use Float. Never parseFloat on a price.
 */

const CURRENCY_DECIMALS: Record<string, number> = {
  NPR: 2,
  INR: 2,
  USD: 2,
};

/**
 * Format an integer minor-unit amount for display.
 * e.g. formatMoney(1850000, 'NPR') → 'Rs. 18,500.00'
 */
export function formatMoney(amountMinor: number, currencyCode = 'NPR'): string {
  const decimals = CURRENCY_DECIMALS[currencyCode] ?? 2;
  const major = amountMinor / Math.pow(10, decimals);
  const symbols: Record<string, string> = { NPR: 'Rs. ', INR: '₹', USD: '$' };
  const symbol = symbols[currencyCode] ?? currencyCode + ' ';
  return symbol + major.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Convert a display value (e.g. "18500") to minor units (e.g. 1850000).
 * Accepts decimal strings like "185.50" → 18550
 */
export function toMinorUnits(displayValue: string, currencyCode = 'NPR'): number {
  const decimals = CURRENCY_DECIMALS[currencyCode] ?? 2;
  const parsed = parseFloat(displayValue.replace(/[^0-9.]/g, ''));
  if (isNaN(parsed)) throw new Error(`Invalid money value: ${displayValue}`);
  return Math.round(parsed * Math.pow(10, decimals));
}

/**
 * Convert minor units to a display major number (for form inputs).
 */
export function fromMinorUnits(amountMinor: number, currencyCode = 'NPR'): number {
  const decimals = CURRENCY_DECIMALS[currencyCode] ?? 2;
  return amountMinor / Math.pow(10, decimals);
}
