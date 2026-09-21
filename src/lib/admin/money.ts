/**
 * Money helpers — all prices in the database are stored as whole currency units
 * (e.g. 25600 = Rs. 25,600).
 */

/**
 * Format an integer currency amount for display.
 * e.g. formatMoney(25600, 'NPR') → 'Rs. 25,600'
 */
export function formatMoney(amount: number, currencyCode = 'NPR'): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0';
  }
  const symbols: Record<string, string> = { NPR: 'Rs. ', INR: '₹', USD: '$' };
  const symbol = symbols[currencyCode] ?? (currencyCode ? `${currencyCode} ` : 'Rs. ');
  return symbol + Math.round(amount).toLocaleString('en-IN');
}

/**
 * Convert a display value string (e.g. "25,600") to integer number.
 */
export function toMinorUnits(displayValue: string): number {
  const parsed = parseFloat(displayValue.replace(/[^0-9.]/g, ''));
  if (isNaN(parsed)) throw new Error(`Invalid money value: ${displayValue}`);
  return Math.round(parsed);
}

/**
 * Convert integer amount to a display major number (for form inputs).
 */
export function fromMinorUnits(amount: number): number {
  return amount;
}
