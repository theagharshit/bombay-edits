import { healthController } from '@/backend/controllers/healthController';
import { withMiddlewares } from '@/backend/middlewares';

/**
 * GET /api/health - Database & system health status
 */
export const GET = withMiddlewares(healthController.getHealth.bind(healthController));
