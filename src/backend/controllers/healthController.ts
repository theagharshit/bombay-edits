import { NextRequest } from 'next/server';
import { prisma, isPrismaConnected } from '../db/prisma';
import { ApiResponse } from '../utils/apiResponse';

export class HealthController {
  /**
   * Health check endpoint returning Prisma ORM, PostgreSQL database connectivity, and normalized entity counts
   * GET /api/health
   */
  public async getHealth(req: NextRequest) {
    const startTime = performance.now();
    const dbConnected = await isPrismaConnected();
    let dbLatencyMs: number | null = null;
    let counts: Record<string, number> = {};

    if (dbConnected) {
      try {
        const pingStart = performance.now();
        await prisma.$queryRaw`SELECT 1`;
        dbLatencyMs = Math.round(performance.now() - pingStart);

        const [
          productsCount,
          categoriesCount,
          collectionsCount,
          occasionsCount,
          coloursCount,
          fabricsCount,
          subscribersCount,
          contactsCount,
          ordersCount,
        ] = await Promise.all([
          prisma.product.count(),
          prisma.category.count(),
          prisma.collection.count(),
          prisma.occasion.count(),
          prisma.colour.count(),
          prisma.fabric.count(),
          prisma.newsletterSubscriber.count(),
          prisma.contactSubmission.count(),
          prisma.order.count(),
        ]);

        counts = {
          products: productsCount,
          categories: categoriesCount,
          collections: collectionsCount,
          occasions: occasionsCount,
          colours: coloursCount,
          fabrics: fabricsCount,
          subscribers: subscribersCount,
          contacts: contactsCount,
          orders: ordersCount,
        };
      } catch {
        // Continue with empty counts if schema not yet migrated
      }
    }

    const totalDuration = Math.round(performance.now() - startTime);

    return ApiResponse.success({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        engine: 'PostgreSQL',
        orm: 'Prisma 6',
        connected: dbConnected,
        latencyMs: dbLatencyMs,
        normalisedEntities: counts,
      },
      durationMs: totalDuration,
    });
  }
}

export const healthController = new HealthController();
