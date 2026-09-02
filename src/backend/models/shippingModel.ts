import { ShippingRate, CurrencyConfig } from '@/types/cart';

export const shippingRates: ShippingRate[] = [
  {
    zone: 'mumbai',
    label: 'Mumbai',
    description: 'Standard delivery within Mumbai, Navi Mumbai, and Thane',
    rate: 200,
    freeAbove: 5000,
    estimatedDays: '2–3 business days',
  },
  {
    zone: 'rest-of-india',
    label: 'Rest of India',
    description: 'Delivery across India outside Mumbai',
    rate: 350,
    freeAbove: 8000,
    estimatedDays: '5–7 business days',
  },
  {
    zone: 'nepal',
    label: 'Nepal',
    description: 'Delivery across Nepal',
    rate: 1500,
    estimatedDays: '7–10 business days',
  },
  {
    zone: 'rest-of-world',
    label: 'Rest of world',
    description: 'International delivery',
    rate: 3500,
    estimatedDays: '10–15 business days',
  },
];

export const currencies: CurrencyConfig[] = [
  {
    code: 'INR',
    symbol: '₹',
    rate: 1,
    locale: 'en-IN',
  },
  {
    code: 'NPR',
    symbol: 'Rs.',
    rate: 1.6, // 1 INR = 1.6 NPR
    locale: 'en-NP',
  },
  {
    code: 'USD',
    symbol: '$',
    rate: 0.012, // 1 INR ≈ 0.012 USD
    locale: 'en-US',
  },
];

export const FREE_SHIPPING_THRESHOLD_MUMBAI = 5000;
export const FREE_SHIPPING_THRESHOLD_INDIA = 8000;

export function getShippingRate(zone: string): ShippingRate | undefined {
  return shippingRates.find((r) => r.zone === zone);
}

export function calculateShipping(zone: string, subtotal: number): number {
  const rate = getShippingRate(zone);
  if (!rate) return 0;
  if (rate.freeAbove && subtotal >= rate.freeAbove) return 0;
  return rate.rate;
}

export class ShippingModel {
  public static getAllRates(): ShippingRate[] {
    return shippingRates;
  }

  public static getRateByZone(zone: string): ShippingRate | undefined {
    return getShippingRate(zone);
  }

  public static calculateShipping(zone: string, subtotal: number): number {
    return calculateShipping(zone, subtotal);
  }

  public static getCurrencies(): CurrencyConfig[] {
    return currencies;
  }

  public static getCurrencyByCode(code: string): CurrencyConfig | undefined {
    return currencies.find((c) => c.code === code);
  }
}
