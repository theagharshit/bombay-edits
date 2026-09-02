import { productController } from '@/backend/controllers';
import { withMiddlewares } from '@/backend/middlewares';

/**
 * GET /api/products/stock - Check product stock by size
 */
export const GET = withMiddlewares(productController.checkStock.bind(productController));
