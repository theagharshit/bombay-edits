import { orderController } from '@/backend/controllers';
import { withMiddlewares } from '@/backend/middlewares';

/**
 * GET /api/orders - Get purchase history / orders list
 * POST /api/orders - Place / create new order
 */
export const GET = withMiddlewares(orderController.getOrders.bind(orderController));
export const POST = withMiddlewares(orderController.createOrder.bind(orderController));
