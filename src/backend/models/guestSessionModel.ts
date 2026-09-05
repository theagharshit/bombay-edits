import { prisma, isPrismaConnected } from '../db/prisma';
import { Prisma } from '@prisma/client';
import { CartItem, WishlistItem } from '@/types/cart';
import { logger } from '../utils/logger';
import crypto from 'crypto';

export const GUEST_SESSION_TTL_DAYS = 30;
export const GUEST_SESSION_TTL_MS = GUEST_SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;

export interface GuestSessionData {
  id: string;
  sessionToken: string;
  deviceFingerprint?: string | null;
  cart: CartItem[];
  wishlist: WishlistItem[];
  lastActiveAt: Date;
  expiresAt: Date;
  createdAt: Date;
}

export interface SessionLookupOptions {
  token?: string;
  deviceFingerprint?: string;
}

// In-memory fallback when Prisma is not connected
const inMemorySessions = new Map<string, GuestSessionData>();
const inMemoryFingerprints = new Map<string, string>(); // fingerprint -> sessionToken

export class GuestSessionModel {
  /**
   * Generate a unique, cryptographically secure guest session token
   */
  public static generateSessionToken(): string {
    return `gst_${crypto.randomBytes(24).toString('hex')}`;
  }

  /**
   * Retrieve an existing valid guest session or create a new 30-day session.
   * Deduplicates by sessionToken and/or deviceFingerprint.
   */
  public static async getOrCreateSession(optionsOrToken?: string | SessionLookupOptions): Promise<{
    session: GuestSessionData;
    isNew: boolean;
  }> {
    const now = new Date();
    const newExpiresAt = new Date(Date.now() + GUEST_SESSION_TTL_MS);

    const cleanToken = (
      typeof optionsOrToken === 'string' ? optionsOrToken : optionsOrToken?.token
    )?.trim();
    const cleanFingerprint = (
      typeof optionsOrToken === 'object' ? optionsOrToken?.deviceFingerprint : undefined
    )?.trim();

    if ((await isPrismaConnected()) && prisma.guestSession) {
      try {
        // 1. Try finding by session token first
        if (cleanToken) {
          const existing = await prisma.guestSession.findUnique({
            where: { sessionToken: cleanToken },
          });

          if (existing && existing.expiresAt > now) {
            // Touch activity & slide 30-day expiry
            const updatePayload: Prisma.GuestSessionUpdateInput = {
              lastActiveAt: now,
              expiresAt: newExpiresAt,
            };

            // Associate fingerprint if not present
            if (cleanFingerprint && !existing.deviceFingerprint) {
              const fingerprintOwner = await prisma.guestSession.findUnique({
                where: { deviceFingerprint: cleanFingerprint },
              });
              if (!fingerprintOwner) {
                updatePayload.deviceFingerprint = cleanFingerprint;
              }
            }

            const updated = await prisma.guestSession.update({
              where: { id: existing.id },
              data: updatePayload,
            });

            return {
              session: {
                id: updated.id,
                sessionToken: updated.sessionToken,
                deviceFingerprint: updated.deviceFingerprint,
                cart: (updated.cartData as unknown as CartItem[]) || [],
                wishlist: (updated.wishlistData as unknown as WishlistItem[]) || [],
                lastActiveAt: updated.lastActiveAt,
                expiresAt: updated.expiresAt,
                createdAt: updated.createdAt,
              },
              isNew: false,
            };
          }
        }

        // 2. If token not provided or expired, find by deviceFingerprint
        if (cleanFingerprint) {
          const existingByFp = await prisma.guestSession.findUnique({
            where: { deviceFingerprint: cleanFingerprint },
          });

          if (existingByFp && existingByFp.expiresAt > now) {
            // Touch activity & refresh 30-day lifetime
            const updated = await prisma.guestSession.update({
              where: { id: existingByFp.id },
              data: {
                lastActiveAt: now,
                expiresAt: newExpiresAt,
              },
            });

            return {
              session: {
                id: updated.id,
                sessionToken: updated.sessionToken,
                deviceFingerprint: updated.deviceFingerprint,
                cart: (updated.cartData as unknown as CartItem[]) || [],
                wishlist: (updated.wishlistData as unknown as WishlistItem[]) || [],
                lastActiveAt: updated.lastActiveAt,
                expiresAt: updated.expiresAt,
                createdAt: updated.createdAt,
              },
              isNew: false,
            };
          }
        }

        // 3. Create or atomic upsert by deviceFingerprint to avoid concurrency duplicates
        const newToken = GuestSessionModel.generateSessionToken();

        if (cleanFingerprint) {
          const session = await prisma.guestSession.upsert({
            where: { deviceFingerprint: cleanFingerprint },
            update: {
              lastActiveAt: now,
              expiresAt: newExpiresAt,
            },
            create: {
              sessionToken: newToken,
              deviceFingerprint: cleanFingerprint,
              cartData: [],
              wishlistData: [],
              lastActiveAt: now,
              expiresAt: newExpiresAt,
            },
          });

          return {
            session: {
              id: session.id,
              sessionToken: session.sessionToken,
              deviceFingerprint: session.deviceFingerprint,
              cart: (session.cartData as unknown as CartItem[]) || [],
              wishlist: (session.wishlistData as unknown as WishlistItem[]) || [],
              lastActiveAt: session.lastActiveAt,
              expiresAt: session.expiresAt,
              createdAt: session.createdAt,
            },
            isNew: session.sessionToken === newToken,
          };
        }

        // No fingerprint provided: standard create
        const created = await prisma.guestSession.create({
          data: {
            sessionToken: newToken,
            cartData: [],
            wishlistData: [],
            lastActiveAt: now,
            expiresAt: newExpiresAt,
          },
        });

        return {
          session: {
            id: created.id,
            sessionToken: created.sessionToken,
            deviceFingerprint: created.deviceFingerprint,
            cart: [],
            wishlist: [],
            lastActiveAt: created.lastActiveAt,
            expiresAt: created.expiresAt,
            createdAt: created.createdAt,
          },
          isNew: true,
        };
      } catch (err) {
        logger.warn(
          'Failed to query or create guest session in Prisma, falling back to in-memory',
          {
            error: err instanceof Error ? err.message : String(err),
          }
        );
      }
    }

    // In-memory fallback
    if (cleanToken) {
      const inMem = inMemorySessions.get(cleanToken);
      if (inMem && inMem.expiresAt > now) {
        inMem.lastActiveAt = now;
        inMem.expiresAt = newExpiresAt;
        if (cleanFingerprint && !inMem.deviceFingerprint) {
          inMem.deviceFingerprint = cleanFingerprint;
          inMemoryFingerprints.set(cleanFingerprint, cleanToken);
        }
        return { session: inMem, isNew: false };
      }
    }

    if (cleanFingerprint) {
      const existingToken = inMemoryFingerprints.get(cleanFingerprint);
      if (existingToken) {
        const inMem = inMemorySessions.get(existingToken);
        if (inMem && inMem.expiresAt > now) {
          inMem.lastActiveAt = now;
          inMem.expiresAt = newExpiresAt;
          return { session: inMem, isNew: false };
        }
      }
    }

    const newToken = GuestSessionModel.generateSessionToken();
    const fallbackSession: GuestSessionData = {
      id: `mem_${Date.now()}`,
      sessionToken: newToken,
      deviceFingerprint: cleanFingerprint || null,
      cart: [],
      wishlist: [],
      lastActiveAt: now,
      expiresAt: newExpiresAt,
      createdAt: now,
    };
    inMemorySessions.set(newToken, fallbackSession);
    if (cleanFingerprint) {
      inMemoryFingerprints.set(cleanFingerprint, newToken);
    }

    return { session: fallbackSession, isNew: true };
  }

  /**
   * Save updated cart items to the guest session in PostgreSQL
   */
  public static async updateCart(
    sessionToken: string,
    cartItems: CartItem[],
    deviceFingerprint?: string
  ): Promise<GuestSessionData> {
    const now = new Date();
    const newExpiresAt = new Date(Date.now() + GUEST_SESSION_TTL_MS);

    if ((await isPrismaConnected()) && prisma.guestSession) {
      try {
        const updateData: Prisma.GuestSessionUpdateInput = {
          cartData: cartItems as unknown as Prisma.InputJsonValue,
          lastActiveAt: now,
          expiresAt: newExpiresAt,
        };

        const existing = await prisma.guestSession.findUnique({
          where: { sessionToken },
        });

        if (existing) {
          const updated = await prisma.guestSession.update({
            where: { sessionToken },
            data: updateData,
          });

          return {
            id: updated.id,
            sessionToken: updated.sessionToken,
            deviceFingerprint: updated.deviceFingerprint,
            cart: (updated.cartData as unknown as CartItem[]) || [],
            wishlist: (updated.wishlistData as unknown as WishlistItem[]) || [],
            lastActiveAt: updated.lastActiveAt,
            expiresAt: updated.expiresAt,
            createdAt: updated.createdAt,
          };
        }

        // If session didn't exist, create it
        const created = await prisma.guestSession.create({
          data: {
            sessionToken,
            deviceFingerprint: deviceFingerprint || null,
            cartData: cartItems as unknown as Prisma.InputJsonValue,
            wishlistData: [],
            lastActiveAt: now,
            expiresAt: newExpiresAt,
          },
        });

        return {
          id: created.id,
          sessionToken: created.sessionToken,
          deviceFingerprint: created.deviceFingerprint,
          cart: (created.cartData as unknown as CartItem[]) || [],
          wishlist: (created.wishlistData as unknown as WishlistItem[]) || [],
          lastActiveAt: created.lastActiveAt,
          expiresAt: created.expiresAt,
          createdAt: created.createdAt,
        };
      } catch (err) {
        logger.warn('Failed to update cart in Prisma guest session', {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    // In-memory fallback
    const session = inMemorySessions.get(sessionToken) || {
      id: `mem_${Date.now()}`,
      sessionToken,
      deviceFingerprint: deviceFingerprint || null,
      cart: [],
      wishlist: [],
      lastActiveAt: now,
      expiresAt: newExpiresAt,
      createdAt: now,
    };
    session.cart = cartItems;
    session.lastActiveAt = now;
    session.expiresAt = newExpiresAt;
    inMemorySessions.set(sessionToken, session);
    return session;
  }

  /**
   * Save updated wishlist items to the guest session in PostgreSQL
   */
  public static async updateWishlist(
    sessionToken: string,
    wishlistItems: WishlistItem[],
    deviceFingerprint?: string
  ): Promise<GuestSessionData> {
    const now = new Date();
    const newExpiresAt = new Date(Date.now() + GUEST_SESSION_TTL_MS);

    if ((await isPrismaConnected()) && prisma.guestSession) {
      try {
        const existing = await prisma.guestSession.findUnique({
          where: { sessionToken },
        });

        if (existing) {
          const updated = await prisma.guestSession.update({
            where: { sessionToken },
            data: {
              wishlistData: wishlistItems as unknown as Prisma.InputJsonValue,
              lastActiveAt: now,
              expiresAt: newExpiresAt,
            },
          });

          return {
            id: updated.id,
            sessionToken: updated.sessionToken,
            deviceFingerprint: updated.deviceFingerprint,
            cart: (updated.cartData as unknown as CartItem[]) || [],
            wishlist: (updated.wishlistData as unknown as WishlistItem[]) || [],
            lastActiveAt: updated.lastActiveAt,
            expiresAt: updated.expiresAt,
            createdAt: updated.createdAt,
          };
        }

        const created = await prisma.guestSession.create({
          data: {
            sessionToken,
            deviceFingerprint: deviceFingerprint || null,
            cartData: [],
            wishlistData: wishlistItems as unknown as Prisma.InputJsonValue,
            lastActiveAt: now,
            expiresAt: newExpiresAt,
          },
        });

        return {
          id: created.id,
          sessionToken: created.sessionToken,
          deviceFingerprint: created.deviceFingerprint,
          cart: (created.cartData as unknown as CartItem[]) || [],
          wishlist: (created.wishlistData as unknown as WishlistItem[]) || [],
          lastActiveAt: created.lastActiveAt,
          expiresAt: created.expiresAt,
          createdAt: created.createdAt,
        };
      } catch (err) {
        logger.warn('Failed to update wishlist in Prisma guest session', {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    // In-memory fallback
    const session = inMemorySessions.get(sessionToken) || {
      id: `mem_${Date.now()}`,
      sessionToken,
      deviceFingerprint: deviceFingerprint || null,
      cart: [],
      wishlist: [],
      lastActiveAt: now,
      expiresAt: newExpiresAt,
      createdAt: now,
    };
    session.wishlist = wishlistItems;
    session.lastActiveAt = now;
    session.expiresAt = newExpiresAt;
    inMemorySessions.set(sessionToken, session);
    return session;
  }

  /**
   * Cleanup job: Remove any guest session with >30 days of inactivity
   */
  public static async cleanupExpiredSessions(): Promise<{ deletedCount: number }> {
    const now = new Date();
    const cutoffDate = new Date(Date.now() - GUEST_SESSION_TTL_MS);
    let deletedCount = 0;

    if ((await isPrismaConnected()) && prisma.guestSession) {
      try {
        const result = await prisma.guestSession.deleteMany({
          where: {
            OR: [{ expiresAt: { lte: now } }, { lastActiveAt: { lte: cutoffDate } }],
          },
        });
        deletedCount = result.count;
        logger.info(`Cleaned up ${deletedCount} expired guest sessions from database.`);
      } catch (err) {
        logger.error('Failed to execute guest session cleanup in Prisma', undefined, {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    // Also purge in-memory sessions
    for (const [token, session] of inMemorySessions.entries()) {
      if (session.expiresAt <= now || session.lastActiveAt <= cutoffDate) {
        inMemorySessions.delete(token);
        deletedCount++;
      }
    }

    return { deletedCount };
  }
}
