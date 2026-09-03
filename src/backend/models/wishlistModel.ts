import { prisma, isPrismaConnected } from '../db/prisma';
import { logger } from '../utils/logger';

export interface WishlistRecord {
  productId: string;
  addedAt: string;
}

// In-memory fallback store keyed by userIdentifier
const inMemoryWishlistStore: Map<string, Map<string, string>> = new Map();

export class WishlistModel {
  /**
   * Resolve a product's DB ID if given a slug or ID
   */
  private static async resolveProductId(productIdOrSlug: string): Promise<string> {
    if (!(await isPrismaConnected())) return productIdOrSlug;
    try {
      const prod = await prisma.product.findFirst({
        where: {
          OR: [{ id: productIdOrSlug }, { slug: productIdOrSlug }],
        },
        select: { id: true },
      });
      return prod ? prod.id : productIdOrSlug;
    } catch {
      return productIdOrSlug;
    }
  }

  /**
   * Get all wishlist items for a given user/session identifier
   */
  public static async getWishlist(userIdentifier = 'guest'): Promise<WishlistRecord[]> {
    const key = userIdentifier.trim() || 'guest';

    if (await isPrismaConnected()) {
      try {
        const items = await prisma.wishlistItem.findMany({
          where: { userIdentifier: key },
          orderBy: { createdAt: 'desc' },
        });

        return items.map((item) => ({
          productId: item.productId,
          addedAt: item.createdAt.toISOString(),
        }));
      } catch (err) {
        logger.warn('Failed to fetch wishlist from Prisma, falling back to in-memory store', {
          error: err,
        });
      }
    }

    const userMap = inMemoryWishlistStore.get(key);
    if (!userMap) return [];

    return Array.from(userMap.entries()).map(([productId, addedAt]) => ({
      productId,
      addedAt,
    }));
  }

  /**
   * Toggle a product in user's wishlist
   */
  public static async toggleWishlist(
    rawProductId: string,
    userIdentifier = 'guest'
  ): Promise<{ wishlisted: boolean; items: WishlistRecord[] }> {
    const key = userIdentifier.trim() || 'guest';
    const productId = await this.resolveProductId(rawProductId);
    const now = new Date();
    let wishlisted = false;

    if (await isPrismaConnected()) {
      try {
        const existing = await prisma.wishlistItem.findUnique({
          where: {
            userIdentifier_productId: {
              userIdentifier: key,
              productId,
            },
          },
        });

        if (existing) {
          await prisma.wishlistItem.delete({
            where: { id: existing.id },
          });
          wishlisted = false;
          logger.info(`✓ Removed item ${productId} from wishlist in Prisma for user ${key}`);
        } else {
          await prisma.wishlistItem.create({
            data: {
              userIdentifier: key,
              productId,
              createdAt: now,
            },
          });
          wishlisted = true;
          logger.info(`✓ Added item ${productId} to wishlist in Prisma for user ${key}`);
        }

        const items = await this.getWishlist(key);
        return { wishlisted, items };
      } catch (err) {
        logger.warn('Failed to toggle wishlist item in Prisma, using in-memory store', {
          error: err,
        });
      }
    }

    // In-memory fallback logic
    let userMap = inMemoryWishlistStore.get(key);
    if (!userMap) {
      userMap = new Map();
      inMemoryWishlistStore.set(key, userMap);
    }

    if (userMap.has(productId)) {
      userMap.delete(productId);
      wishlisted = false;
    } else {
      userMap.set(productId, now.toISOString());
      wishlisted = true;
    }

    const items = Array.from(userMap.entries()).map(([pid, addedAt]) => ({
      productId: pid,
      addedAt,
    }));

    return { wishlisted, items };
  }

  /**
   * Add a product to user's wishlist
   */
  public static async addToWishlist(
    rawProductId: string,
    userIdentifier = 'guest'
  ): Promise<WishlistRecord[]> {
    const key = userIdentifier.trim() || 'guest';
    const productId = await this.resolveProductId(rawProductId);
    const now = new Date();

    if (await isPrismaConnected()) {
      try {
        await prisma.wishlistItem.upsert({
          where: {
            userIdentifier_productId: {
              userIdentifier: key,
              productId,
            },
          },
          create: {
            userIdentifier: key,
            productId,
            createdAt: now,
          },
          update: {},
        });
        return await this.getWishlist(key);
      } catch (err) {
        logger.warn('Failed to add wishlist item in Prisma', { error: err });
      }
    }

    let userMap = inMemoryWishlistStore.get(key);
    if (!userMap) {
      userMap = new Map();
      inMemoryWishlistStore.set(key, userMap);
    }
    userMap.set(productId, now.toISOString());

    return Array.from(userMap.entries()).map(([pid, addedAt]) => ({
      productId: pid,
      addedAt,
    }));
  }

  /**
   * Remove a product from user's wishlist
   */
  public static async removeFromWishlist(
    rawProductId: string,
    userIdentifier = 'guest'
  ): Promise<WishlistRecord[]> {
    const key = userIdentifier.trim() || 'guest';
    const productId = await this.resolveProductId(rawProductId);

    if (await isPrismaConnected()) {
      try {
        await prisma.wishlistItem.deleteMany({
          where: {
            userIdentifier: key,
            productId,
          },
        });
        return await this.getWishlist(key);
      } catch (err) {
        logger.warn('Failed to remove wishlist item in Prisma', { error: err });
      }
    }

    const userMap = inMemoryWishlistStore.get(key);
    if (userMap) {
      userMap.delete(productId);
    }

    return this.getWishlist(key);
  }

  /**
   * Clear all items from wishlist for userIdentifier
   */
  public static async clearWishlist(userIdentifier = 'guest'): Promise<boolean> {
    const key = userIdentifier.trim() || 'guest';

    if (await isPrismaConnected()) {
      try {
        await prisma.wishlistItem.deleteMany({
          where: { userIdentifier: key },
        });
        logger.info(`✓ Cleared wishlist in Prisma for user ${key}`);
      } catch (err) {
        logger.warn('Failed to clear wishlist in Prisma', { error: err });
      }
    }

    inMemoryWishlistStore.delete(key);
    return true;
  }
}
