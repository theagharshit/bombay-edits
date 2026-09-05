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

// If globalThis.prismaGlobal was cached before new models (like guestSession) were added, recreate it
if (globalThis.prismaGlobal && !('guestSession' in globalThis.prismaGlobal)) {
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
let lastCheckTime = 0;

/**
 * Check if Prisma can connect to the PostgreSQL database
 */
export async function isPrismaConnected(): Promise<boolean> {
  // If DATABASE_URL environment variable is not defined, avoid Prisma invocation
  if (!process.env.DATABASE_URL) {
    return false;
  }

  const now = Date.now();
  if (isConnectedCache !== null && now - lastCheckTime < 5000) {
    return isConnectedCache;
  }

  try {
    // Quick ping query
    await prisma.$queryRaw`SELECT 1`;
    isConnectedCache = true;
    lastCheckTime = now;
    return true;
  } catch {
    isConnectedCache = false;
    lastCheckTime = now;
    return false;
  }
}
