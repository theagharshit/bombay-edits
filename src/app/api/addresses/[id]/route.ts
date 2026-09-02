import { addressController } from '@/backend/controllers';
import { withMiddlewares } from '@/backend/middlewares';

/**
 * GET /api/addresses/[id] - Get single address
 * PATCH /api/addresses/[id] - Update address details
 * DELETE /api/addresses/[id] - Remove address
 */
export const GET = withMiddlewares(addressController.getAddressById.bind(addressController));
export const PATCH = withMiddlewares(addressController.updateAddress.bind(addressController));
export const PUT = withMiddlewares(addressController.updateAddress.bind(addressController));
export const DELETE = withMiddlewares(addressController.deleteAddress.bind(addressController));
