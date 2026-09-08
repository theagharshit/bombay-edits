import { NextRequest, NextResponse } from 'next/server';
import { healthController } from '@/backend/controllers/healthController';
import { withMiddlewares } from '@/backend/middlewares';

export const dynamic = 'force-dynamic';

/**
 * GET /health - Top-level system & database health check
 */
export const GET = withMiddlewares(healthController.getHealth.bind(healthController));

/**
 * HEAD /health - Lightweight liveness probe for uptime monitors and load balancers
 */
export async function HEAD(_req: NextRequest) {
  return new NextResponse(null, { status: 200 });
}
