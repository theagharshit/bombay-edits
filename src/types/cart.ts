export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  colour: string;
  size: string;
  quantity: number;
  maxQuantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  shippingZone: ShippingZone | null;
  shippingCost: number;
  total: number;
}

export type ShippingZone =
  | 'mumbai'
  | 'rest-of-india'
  | 'nepal'
  | 'rest-of-world';

export interface ShippingRate {
  zone: ShippingZone;
  label: string;
  description: string;
  rate: number;
  freeAbove?: number;
  estimatedDays: string;
}

export type Currency = 'NPR' | 'INR' | 'USD';

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  rate: number; // relative to NPR
  locale: string;
}

export interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  shippingZone: ShippingZone;
  shippingMethod: 'standard' | 'express';
  paymentMethod: string;
  notes?: string;
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
}

export type CheckoutStep = 'contact' | 'shipping' | 'payment' | 'review';
