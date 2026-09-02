import { orderController } from '@/backend/controllers';
import { withMiddlewares } from '@/backend/middlewares';

/**
 * GET /api/orders/[id] - Get order by ID or order number
 */
export const GET = withMiddlewares(orderController.getOrderById.bind(orderController));
