import { addressController } from '@/backend/controllers';
import { withMiddlewares } from '@/backend/middlewares';

/**
 * GET /api/addresses - List all saved addresses
 * POST /api/addresses - Create a new address
 */
export const GET = withMiddlewares(addressController.getAddresses.bind(addressController));
export const POST = withMiddlewares(addressController.createAddress.bind(addressController));
