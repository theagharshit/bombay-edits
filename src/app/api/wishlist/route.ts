import { wishlistController } from '@/backend/controllers';
import { withMiddlewares } from '@/backend/middlewares';

/**
 * GET    /api/wishlist - Get wishlist items for user
 * POST   /api/wishlist - Add/toggle wishlist item
 * DELETE /api/wishlist - Remove item or clear wishlist
 */
export const GET = withMiddlewares(wishlistController.getWishlist.bind(wishlistController));
export const POST = withMiddlewares(
  wishlistController.handleWishlistAction.bind(wishlistController)
);
export const DELETE = withMiddlewares(wishlistController.removeWishlist.bind(wishlistController));
