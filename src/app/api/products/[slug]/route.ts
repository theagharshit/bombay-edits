import { productController } from '@/backend/controllers';
import { withMiddlewares } from '@/backend/middlewares';

/**
 * GET /api/products/[slug] - Get product by slug
 */
export const GET = withMiddlewares(productController.getProductBySlug.bind(productController));
