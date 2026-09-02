import { Currency } from '@/types/cart';
import { currencies } from '@/backend/models/shippingModel';

export function formatPrice(
  amount: number,
  currency: Currency = 'NPR'
): string {
  const config = currencies.find(c => c.code === currency);
  if (!config) return `Rs. ${amount.toLocaleString()}`;

  const converted = Math.round(amount * config.rate);

  if (currency === 'NPR') {
    return `Rs. ${converted.toLocaleString('en-NP')}`;
  }
  if (currency === 'INR') {
    return `₹${converted.toLocaleString('en-IN')}`;
  }
  return `$${converted.toLocaleString('en-US')}`;
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '…';
}
