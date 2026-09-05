import { ApiClient } from './apiClient';
import { CartItem, WishlistItem } from '@/types/cart';
import { getDeviceFingerprint } from '../utils/deviceFingerprint';

export interface CustomerProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: string;
  isGuest: boolean;
  createdAt: string;
}

export interface AuthStatusResponse {
  authenticated: boolean;
  isGuest: boolean;
  customer: CustomerProfile | null;
}

export interface AuthSuccessPayload {
  customer: CustomerProfile;
  token: string;
  cart?: CartItem[];
  wishlist?: WishlistItem[];
}

function getLocalGuestData() {
  let guestCart: CartItem[] = [];
  let guestWishlist: WishlistItem[] = [];
  if (typeof window !== 'undefined') {
    try {
      const c = localStorage.getItem('tbe-cart');
      if (c) guestCart = JSON.parse(c);
    } catch {
      // ignore
    }
    try {
      const w = localStorage.getItem('tbe-wishlist');
      if (w) guestWishlist = JSON.parse(w);
    } catch {
      // ignore
    }
  }
  const deviceFingerprint = getDeviceFingerprint();
  return { guestCart, guestWishlist, deviceFingerprint };
}

function handleAuthSync(payload: AuthSuccessPayload) {
  if (typeof window === 'undefined') return;

  if (Array.isArray(payload.cart)) {
    localStorage.setItem('tbe-cart', JSON.stringify(payload.cart));
    window.dispatchEvent(new CustomEvent('tbe-cart-sync', { detail: payload.cart }));
  }

  if (Array.isArray(payload.wishlist)) {
    localStorage.setItem('tbe-wishlist', JSON.stringify(payload.wishlist));
    window.dispatchEvent(new CustomEvent('tbe-wishlist-sync', { detail: payload.wishlist }));
  }
}

export class AuthService {
  /**
   * Register a new member account and merge existing guest cart
   */
  public static async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
    phone?: string;
  }): Promise<AuthSuccessPayload> {
    const guestData = getLocalGuestData();
    const payload = await ApiClient.post<AuthSuccessPayload>('/api/auth/register', {
      ...data,
      ...guestData,
    });
    handleAuthSync(payload);
    return payload;
  }

  /**
   * Log in with existing credentials and join existing guest cart with account cart
   */
  public static async login(data: {
    email: string;
    password: string;
  }): Promise<AuthSuccessPayload> {
    const guestData = getLocalGuestData();
    const payload = await ApiClient.post<AuthSuccessPayload>('/api/auth/login', {
      ...data,
      ...guestData,
    });
    handleAuthSync(payload);
    return payload;
  }

  /**
   * Log out of current session
   */
  public static async logout(): Promise<void> {
    await ApiClient.post('/api/auth/logout');
  }

  /**
   * Get current authenticated profile or guest status
   */
  public static async getMe(): Promise<AuthStatusResponse> {
    return ApiClient.get<AuthStatusResponse>('/api/auth/me');
  }
}
