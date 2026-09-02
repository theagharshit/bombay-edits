import { addressController } from '@/backend/controllers';
import { withMiddlewares } from '@/backend/middlewares';

/**
 * PATCH /api/addresses/[id]/default - Set address as primary default
 * POST /api/addresses/[id]/default - Alternative trigger for setting default
 */
export const PATCH = withMiddlewares(addressController.setDefaultAddress.bind(addressController));
export const POST = withMiddlewares(addressController.setDefaultAddress.bind(addressController));
