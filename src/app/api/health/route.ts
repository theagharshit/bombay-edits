import { healthController } from '@/backend/controllers/healthController';
import { withMiddlewares } from '@/backend/middlewares';

export const dynamic = 'force-dynamic';

/**
 * GET /api/health - Database & system health status
 */
export const GET = withMiddlewares(healthController.getHealth.bind(healthController));

/**
 * HEAD /api/health - Lightweight liveness probe
 */
export async function HEAD() {
  return new Response(null, { status: 200 });
}
