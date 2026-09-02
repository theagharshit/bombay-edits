import { productController } from '@/backend/controllers';
import { withMiddlewares } from '@/backend/middlewares';

/**
 * GET /api/products - Query & filter products
 */
export const GET = withMiddlewares(productController.getProducts.bind(productController));
