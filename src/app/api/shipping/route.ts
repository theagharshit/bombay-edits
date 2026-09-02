import { shippingController } from '@/backend/controllers';
import { withMiddlewares } from '@/backend/middlewares';

/**
 * GET  /api/shipping - Get shipping rates & currency configs
 * POST /api/shipping - Calculate shipping for zone & subtotal
 */
export const GET = withMiddlewares(shippingController.getShippingRates.bind(shippingController));
export const POST = withMiddlewares(
  shippingController.calculateShippingCost.bind(shippingController)
);
