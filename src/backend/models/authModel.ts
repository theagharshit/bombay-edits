import { prisma } from '@/backend/db/prisma';
import {
  hashPassword,
  verifyPassword,
  signJwt,
  verifyJwt,
  JwtUserPayload,
} from '@/backend/utils/jwt';
import { CartItem, WishlistItem } from '@/types/cart';
import { CartModel } from './cartModel';
import { mergeWishlists } from '../utils/cartMerge';
import { Prisma } from '@prisma/client';

export interface RegisterDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  guestCart?: CartItem[];
  guestWishlist?: WishlistItem[];
  guestSessionToken?: string;
  deviceFingerprint?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
  guestCart?: CartItem[];
  guestWishlist?: WishlistItem[];
  guestSessionToken?: string;
  deviceFingerprint?: string;
}

export interface SanitizedCustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: string;
  isGuest: boolean;
  createdAt: Date;
}

export class AuthModel {
  /**
   * Register a new member account or upgrade an existing guest account
   */
  public static async register(
    dto: RegisterDTO
  ): Promise<{
    customer: SanitizedCustomer;
    token: string;
    cart: CartItem[];
    wishlist: WishlistItem[];
  }> {
    const email = dto.email.trim().toLowerCase();
    const password = dto.password;

    if (!email || !password || password.length < 6) {
      throw new Error('Valid email and password with at least 6 characters required');
    }

    const hashedPassword = await hashPassword(password);

    // Check if customer already exists in DB
    const existing = await prisma.customer.findUnique({
      where: { email },
    });

    let customer;

    if (existing) {
      if (existing.passwordHash) {
        throw new Error('An account with this email already exists. Please sign in.');
      }
      // Customer checked out previously as a guest -> Upgrade to full member!
      customer = await prisma.customer.update({
        where: { id: existing.id },
        data: {
          passwordHash: hashedPassword,
          firstName: dto.firstName.trim() || existing.firstName,
          lastName: dto.lastName.trim() || existing.lastName,
          phone: dto.phone?.trim() || existing.phone,
          isGuest: false,
        },
      });
    } else {
      // New Customer
      customer = await prisma.customer.create({
        data: {
          email,
          passwordHash: hashedPassword,
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          phone: dto.phone?.trim() || null,
          role: 'customer',
          isGuest: false,
        },
      });
    }

    // Auto-link any past guest orders placed with this email to this customer profile
    try {
      await prisma.order.updateMany({
        where: {
          customerEmail: email,
          customerId: null,
        },
        data: {
          customerId: customer.id,
        },
      });
    } catch {
      // Non-fatal if order linking fails
    }

    const token = await signJwt({
      customerId: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      role: customer.role,
      isGuest: false,
    });

    // Merge guest cart items into customer account
    let joinedCart: CartItem[] = [];
    try {
      joinedCart = await CartModel.mergeGuestCartIntoCustomer({
        customerId: customer.id,
        sessionToken: dto.guestSessionToken,
        deviceFingerprint: dto.deviceFingerprint,
        guestItems: dto.guestCart,
      });
    } catch {
      joinedCart = dto.guestCart || [];
    }

    // Merge guest wishlist into customer profile
    let joinedWishlist: WishlistItem[] = [];
    try {
      const existingWishlist = (customer.wishlistData as unknown as WishlistItem[]) || [];
      const incomingWishlist = dto.guestWishlist || [];
      joinedWishlist = mergeWishlists(existingWishlist, incomingWishlist);

      await prisma.customer.update({
        where: { id: customer.id },
        data: { wishlistData: joinedWishlist as unknown as Prisma.InputJsonValue },
      });

      if (dto.deviceFingerprint || dto.guestSessionToken) {
        await prisma.wishlistItem.updateMany({
          where: {
            userIdentifier: {
              in: [dto.deviceFingerprint || '', dto.guestSessionToken || ''].filter(Boolean),
            },
          },
          data: { customerId: customer.id },
        });
      }
    } catch {
      joinedWishlist = dto.guestWishlist || [];
    }

    return {
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        role: customer.role,
        isGuest: customer.isGuest,
        createdAt: customer.createdAt,
      },
      token,
      cart: joinedCart,
      wishlist: joinedWishlist,
    };
  }

  /**
   * Log in an existing member and join any guest items into their account
   */
  public static async login(
    dto: LoginDTO
  ): Promise<{
    customer: SanitizedCustomer;
    token: string;
    cart: CartItem[];
    wishlist: WishlistItem[];
  }> {
    const email = dto.email.trim().toLowerCase();
    const customer = await prisma.customer.findUnique({
      where: { email },
    });

    if (!customer || !customer.passwordHash) {
      throw new Error('Invalid email or password.');
    }

    const passwordMatch = await verifyPassword(dto.password, customer.passwordHash);
    if (!passwordMatch) {
      throw new Error('Invalid email or password.');
    }

    const token = await signJwt({
      customerId: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      role: customer.role,
      isGuest: customer.isGuest,
    });

    // Merge guest cart items into customer account
    let joinedCart: CartItem[] = [];
    try {
      joinedCart = await CartModel.mergeGuestCartIntoCustomer({
        customerId: customer.id,
        sessionToken: dto.guestSessionToken,
        deviceFingerprint: dto.deviceFingerprint,
        guestItems: dto.guestCart,
      });
    } catch {
      joinedCart = await CartModel.getCart({ customerId: customer.id });
    }

    // Merge guest wishlist into customer profile
    let joinedWishlist: WishlistItem[] = [];
    try {
      const existingWishlist = (customer.wishlistData as unknown as WishlistItem[]) || [];
      const incomingWishlist = dto.guestWishlist || [];
      joinedWishlist = mergeWishlists(existingWishlist, incomingWishlist);

      await prisma.customer.update({
        where: { id: customer.id },
        data: { wishlistData: joinedWishlist as unknown as Prisma.InputJsonValue },
      });

      if (dto.deviceFingerprint || dto.guestSessionToken) {
        await prisma.wishlistItem.updateMany({
          where: {
            userIdentifier: {
              in: [dto.deviceFingerprint || '', dto.guestSessionToken || ''].filter(Boolean),
            },
          },
          data: { customerId: customer.id },
        });
      }
    } catch {
      joinedWishlist = (customer.wishlistData as unknown as WishlistItem[]) || [];
    }

    return {
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        role: customer.role,
        isGuest: customer.isGuest,
        createdAt: customer.createdAt,
      },
      token,
      cart: joinedCart,
      wishlist: joinedWishlist,
    };
  }

  /**
   * Validate a JWT token and retrieve the current customer profile
   */
  public static async getCustomerFromToken(token: string): Promise<SanitizedCustomer | null> {
    const payload = await verifyJwt<JwtUserPayload>(token);
    if (!payload || !payload.customerId) return null;

    const customer = await prisma.customer.findUnique({
      where: { id: payload.customerId },
    });

    if (!customer) return null;

    return {
      id: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      role: customer.role,
      isGuest: customer.isGuest,
      createdAt: customer.createdAt,
    };
  }

  /**
   * Extract and authenticate customer from NextRequest (via httpOnly auth_token cookie or Bearer header)
   */
  public static async getCustomerFromRequest(req: {
    cookies: { get(name: string): { value: string } | undefined };
    headers: { get(name: string): string | null };
  }): Promise<SanitizedCustomer | null> {
    let token = req.cookies.get('auth_token')?.value;
    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.slice(7).trim();
      }
    }
    if (!token) return null;
    return AuthModel.getCustomerFromToken(token);
  }
}
