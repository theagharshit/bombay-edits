import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

function getPrismaConstructor(): typeof PrismaClient {
  let Client = PrismaClient;
  if (process.env.NODE_ENV !== 'production') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dummy = new (Client as any)();
      if (!('guestSession' in dummy)) {
        if (typeof require !== 'undefined' && require.cache) {
          Object.keys(require.cache).forEach((key) => {
            if (key.includes('@prisma') || key.includes('.prisma')) {
              delete require.cache[key];
            }
          });
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          Client = require('@prisma/client').PrismaClient;
        }
      }
    } catch {
      // ignore
    }
  }
  return Client;
}

function createPrismaClient(): PrismaClient {
  if (typeof window !== 'undefined' || process.env.NEXT_RUNTIME === 'edge') {
    return new Proxy({} as PrismaClient, {
      get(_target, prop) {
        if (prop === '$on' || prop === '$connect' || prop === '$disconnect') {
          return () => {};
        }
        return () => {
          throw new Error(
            `PrismaClient cannot be executed in browser or Edge runtime (accessed property: ${String(prop)})`
          );
        };
      },
    });
  }

  const Client = getPrismaConstructor();
  const client = new Client({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ],
  });

  // Attach structured event listeners
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (client as any).$on('query', (e: { query: string; params: string; duration: number }) => {
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`[PRISMA] ${e.duration}ms: ${e.query.slice(0, 100)}`);
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (client as any).$on('error', (e: { message: string; target?: string }) => {
    logger.error(`[PRISMA ERROR] ${e.message}`, undefined, { target: e.target });
  });

  return client;
}

// If globalThis.prismaGlobal was cached before new models (like cartItem) were added, recreate it
if (
  typeof window === 'undefined' &&
  process.env.NEXT_RUNTIME !== 'edge' &&
  globalThis.prismaGlobal &&
  (!('guestSession' in globalThis.prismaGlobal) || !('cartItem' in globalThis.prismaGlobal))
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis.prismaGlobal as any).$disconnect?.();
  } catch {
    // ignore
  }
  globalThis.prismaGlobal = undefined;
}

export const prisma = globalThis.prismaGlobal ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

let isConnectedCache: boolean | null = null;
let inFlightPingPromise: Promise<boolean> | null = null;

/**
 * Check if Prisma can connect to the PostgreSQL database.
 * Deduplicates concurrent in-flight checks and caches successful connection
 * to prevent redundant ~250ms roundtrip SELECT 1 pings on every request.
 */
export async function isPrismaConnected(): Promise<boolean> {
  // If DATABASE_URL environment variable is not defined, avoid Prisma invocation
  if (!process.env.DATABASE_URL) {
    return false;
  }

  // Once connected, trust the Prisma connection pool rather than querying SELECT 1
  if (isConnectedCache === true) {
    return true;
  }

  // Deduplicate in-flight checks to prevent stampeding concurrent requests
  if (inFlightPingPromise) {
    return inFlightPingPromise;
  }

  inFlightPingPromise = (async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      isConnectedCache = true;
      return true;
    } catch (err) {
      logger.warn('Prisma database ping failed', { error: err });
      isConnectedCache = false;
      // Allow quick retry after 3 seconds if cold start caused temporary failure
      setTimeout(() => {
        isConnectedCache = null;
      }, 3000);
      return false;
    } finally {
      inFlightPingPromise = null;
    }
  })();

  return inFlightPingPromise;
}

export function resetPrismaConnectionCache(): void {
  isConnectedCache = null;
  inFlightPingPromise = null;
}
