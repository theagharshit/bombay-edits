import { prisma, isPrismaConnected } from '@/backend/db/prisma';
import { CartItem } from '@/types/cart';
import { mergeCarts } from '@/backend/utils/cartMerge';
import { logger } from '@/backend/utils/logger';
import { Prisma } from '@prisma/client';

export interface CartFilter {
  customerId?: string;
  sessionToken?: string;
  deviceFingerprint?: string;
}

// In-memory fallback if database connection is unavailable
const memoryCartStore = new Map<string, CartItem[]>();

function getMemoryKey(filter: CartFilter): string {
  return filter.customerId || filter.sessionToken || filter.deviceFingerprint || 'anon';
}

export class CartModel {
  /**
   * Retrieve active cart for a customer or guest
   */
  public static async getCart(filter: CartFilter): Promise<CartItem[]> {
    if (!filter.customerId && !filter.sessionToken && !filter.deviceFingerprint) {
      return [];
    }

    if (await isPrismaConnected()) {
      try {
        let dbItems: Array<{
          id: string;
          productId: string | null;
          productSlug: string;
          name: string;
          price: Prisma.Decimal;
          image: string;
          colour: string;
          size: string;
          quantity: number;
          maxQuantity: number;
        }> = [];

        if (filter.customerId) {
          dbItems = await prisma.cartItem.findMany({
            where: { customerId: filter.customerId },
            orderBy: { createdAt: 'asc' },
          });

          // Fallback to customer.cartData if cart_items rows haven't been seeded yet
          if (dbItems.length === 0) {
            const customer = await prisma.customer.findUnique({
              where: { id: filter.customerId },
              select: { cartData: true },
            });
            if (
              customer?.cartData &&
              Array.isArray(customer.cartData) &&
              customer.cartData.length > 0
            ) {
              return customer.cartData as unknown as CartItem[];
            }
          }
        } else {
          const orConditions: Prisma.CartItemWhereInput[] = [];
          if (filter.sessionToken) orConditions.push({ guestSessionToken: filter.sessionToken });
          if (filter.deviceFingerprint)
            orConditions.push({ deviceFingerprint: filter.deviceFingerprint });

          if (orConditions.length > 0) {
            dbItems = await prisma.cartItem.findMany({
              where: { OR: orConditions },
              orderBy: { createdAt: 'asc' },
            });
          }
        }

        if (dbItems.length > 0) {
          return dbItems.map((item) => ({
            productId: item.productId || item.productSlug,
            slug: item.productSlug,
            name: item.name,
            price: Number(item.price),
            image: item.image,
            colour: item.colour,
            size: item.size,
            quantity: item.quantity,
            maxQuantity: item.maxQuantity,
          }));
        }
      } catch (err) {
        logger.warn('Failed to fetch cart from Prisma, checking memory store', { error: err });
      }
    }

    return memoryCartStore.get(getMemoryKey(filter)) || [];
  }

  /**
   * Persist complete cart state into relational cart_items table and snapshot columns
   */
  public static async setCart(filter: CartFilter, items: CartItem[]): Promise<CartItem[]> {
    const cleanItems = mergeCarts([], Array.isArray(items) ? items : []);

    memoryCartStore.set(getMemoryKey(filter), cleanItems);

    if (await isPrismaConnected()) {
      try {
        // Collect known product IDs to prevent foreign key errors
        const productIds = cleanItems.map((i) => i.productId).filter(Boolean);
        const existingProducts = await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true },
        });
        const validProductIdSet = new Set(existingProducts.map((p) => p.id));

        if (filter.customerId) {
          // 1. Authenticated customer cart
          await prisma.$transaction(async (tx) => {
            await tx.cartItem.deleteMany({
              where: { customerId: filter.customerId },
            });

            if (cleanItems.length > 0) {
              await tx.cartItem.createMany({
                data: cleanItems.map((i) => ({
                  customerId: filter.customerId,
                  productId: validProductIdSet.has(i.productId) ? i.productId : null,
                  productSlug: i.slug || i.productId,
                  name: i.name || 'Artisanal Piece',
                  price: new Prisma.Decimal(i.price || 0),
                  image: i.image || '',
                  colour: i.colour || 'Default',
                  size: i.size || 'Free Size',
                  quantity: i.quantity || 1,
                  maxQuantity: i.maxQuantity || 10,
                })),
              });
            }

            await tx.customer.update({
              where: { id: filter.customerId },
              data: { cartData: cleanItems as unknown as Prisma.InputJsonValue },
            });
          });
        } else {
          // 2. Guest cart
          const orConditions: Prisma.CartItemWhereInput[] = [];
          if (filter.sessionToken) orConditions.push({ guestSessionToken: filter.sessionToken });
          if (filter.deviceFingerprint)
            orConditions.push({ deviceFingerprint: filter.deviceFingerprint });

          if (orConditions.length > 0) {
            await prisma.$transaction(async (tx) => {
              await tx.cartItem.deleteMany({
                where: { OR: orConditions },
              });

              if (cleanItems.length > 0) {
                await tx.cartItem.createMany({
                  data: cleanItems.map((i) => ({
                    guestSessionToken: filter.sessionToken || null,
                    deviceFingerprint: filter.deviceFingerprint || null,
                    productId: validProductIdSet.has(i.productId) ? i.productId : null,
                    productSlug: i.slug || i.productId,
                    name: i.name || 'Artisanal Piece',
                    price: new Prisma.Decimal(i.price || 0),
                    image: i.image || '',
                    colour: i.colour || 'Default',
                    size: i.size || 'Free Size',
                    quantity: i.quantity || 1,
                    maxQuantity: i.maxQuantity || 10,
                  })),
                });
              }

              // Also update guest_sessions table snapshot
              if (filter.sessionToken) {
                await tx.guestSession.updateMany({
                  where: { sessionToken: filter.sessionToken },
                  data: {
                    cartData: cleanItems as unknown as Prisma.InputJsonValue,
                    lastActiveAt: new Date(),
                  },
                });
              }
            });
          }
        }
      } catch (err) {
        logger.error('Failed to set cart items in Prisma', err);
      }
    }

    return cleanItems;
  }

  /**
   * Completely clear cart across every table:
   * - Deletes rows in cart_items table
   * - Resets customer.cartData to []
   * - Resets guest_sessions.cartData to []
   * - Clears in-memory store
   */
  public static async clearCart(filter: CartFilter): Promise<void> {
    memoryCartStore.delete(getMemoryKey(filter));

    if (await isPrismaConnected()) {
      try {
        if (filter.customerId) {
          // Delete customer's cart items
          await prisma.cartItem.deleteMany({
            where: { customerId: filter.customerId },
          });

          await prisma.customer.update({
            where: { id: filter.customerId },
            data: { cartData: [] },
          });
        }

        // Also wipe any guest rows associated with sessionToken or deviceFingerprint
        const guestOrConditions: Prisma.CartItemWhereInput[] = [];
        if (filter.sessionToken) guestOrConditions.push({ guestSessionToken: filter.sessionToken });
        if (filter.deviceFingerprint)
          guestOrConditions.push({ deviceFingerprint: filter.deviceFingerprint });

        if (guestOrConditions.length > 0) {
          await prisma.cartItem.deleteMany({
            where: { OR: guestOrConditions },
          });
        }

        if (filter.sessionToken) {
          await prisma.guestSession.updateMany({
            where: { sessionToken: filter.sessionToken },
            data: { cartData: [] },
          });
        }
      } catch (err) {
        logger.error('Failed to clear cart across tables in Prisma', err);
      }
    }
  }

  /**
   * Join guest cart items into customer account on login / registration.
   * Merges quantities, persists joined cart to Customer and cart_items table,
   * and cleans up the temporary guest session rows.
   */
  public static async mergeGuestCartIntoCustomer(params: {
    customerId: string;
    sessionToken?: string;
    deviceFingerprint?: string;
    guestItems?: CartItem[];
  }): Promise<CartItem[]> {
    const { customerId, sessionToken, deviceFingerprint, guestItems } = params;

    // 1. Get customer's current saved cart
    const existingCustomerCart = await this.getCart({ customerId });

    // 2. Get incoming guest items (either provided or fetched from guest session)
    let incomingItems = guestItems || [];
    if (incomingItems.length === 0 && (sessionToken || deviceFingerprint)) {
      incomingItems = await this.getCart({ sessionToken, deviceFingerprint });
    }

    // 3. Join both carts together
    const joinedCart = mergeCarts(existingCustomerCart, incomingItems);

    // 4. Save joined cart under customerId in PostgreSQL
    await this.setCart({ customerId }, joinedCart);

    // 5. Clean up guest session rows so user does not run redundant guest sessions
    if (sessionToken || deviceFingerprint) {
      await this.clearCart({ sessionToken, deviceFingerprint });
    }

    logger.info(
      `✓ Successfully joined guest cart into customer (${customerId}): ${joinedCart.length} total items`
    );
    return joinedCart;
  }
}
