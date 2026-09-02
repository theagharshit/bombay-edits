import { orderController } from '@/backend/controllers';
import { withMiddlewares } from '@/backend/middlewares';

/**
 * POST /api/orders - Place / create new order
 */
export const POST = withMiddlewares(orderController.createOrder.bind(orderController));
