import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ],
  });

  (client as any).$on('query', (e: { query: string; params: string; duration: number }) => {
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`[PRISMA] ${e.duration}ms: ${e.query.slice(0, 100)}`);
    }
  });

  (client as any).$on('error', (e: { message: string; target?: string }) => {
    logger.error(`[PRISMA ERROR] ${e.message}`, undefined, { target: e.target });
  });

  return client;
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
