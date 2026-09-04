import { orderController } from '@/backend/controllers';
import { withMiddlewares } from '@/backend/middlewares';

/**
 * POST /api/orders/seed - Seed sample orders into database
 */
export const POST = withMiddlewares(orderController.seedOrders.bind(orderController));
