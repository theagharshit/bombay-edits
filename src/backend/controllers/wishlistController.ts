import { NextRequest } from 'next/server';
import { WishlistModel } from '../models/wishlistModel';
import { ApiResponse } from '../utils/apiResponse';
import { Validator } from '../middlewares/validatorMiddleware';
import { logger } from '../utils/logger';
import { RequestContext } from '../types/api';

export class WishlistController {
  /**
   * Resolve user identifier from query params or headers
   */
  private getUserIdentifier(req: NextRequest): string {
    const searchParams = req.nextUrl?.searchParams || new URL(req.url).searchParams;
    const queryId = searchParams.get('userIdentifier') || searchParams.get('userId');
    if (queryId) return queryId;

    const headerId = req.headers.get('x-user-identifier') || req.headers.get('x-session-id');
    if (headerId) return headerId;

    return 'guest';
  }

  /**
   * Get wishlist items
   * GET /api/v1/wishlist or GET /api/wishlist
   */
  public async getWishlist(req: NextRequest) {
    const userIdentifier = this.getUserIdentifier(req);
    const items = await WishlistModel.getWishlist(userIdentifier);

    return ApiResponse.success(
      {
        items,
        count: items.length,
        userIdentifier,
      },
      { status: 200 }
    );
  }

  /**
   * Add, remove or toggle item in wishlist
   * POST /api/v1/wishlist or POST /api/wishlist
   */
  public async handleWishlistAction(req: NextRequest, context: RequestContext) {
    const body = await req.json();
    const { productId, action = 'toggle', userIdentifier: bodyUserIdentifier } = body;
    const userIdentifier = bodyUserIdentifier || this.getUserIdentifier(req);

    if (action === 'clear') {
      await WishlistModel.clearWishlist(userIdentifier);
      return ApiResponse.success(
        { items: [], count: 0, wishlisted: false },
        { status: 200, message: 'Wishlist cleared' }
      );
    }

    Validator.requireFields(body, ['productId']);

    logger.info(`Wishlist action '${action}' for product ${productId}`, {
      userIdentifier,
      requestId: context.requestId,
    });

    if (action === 'add') {
      const items = await WishlistModel.addToWishlist(productId, userIdentifier);
      return ApiResponse.success({ wishlisted: true, items, count: items.length }, { status: 200 });
    }

    if (action === 'remove') {
      const items = await WishlistModel.removeFromWishlist(productId, userIdentifier);
      return ApiResponse.success(
        { wishlisted: false, items, count: items.length },
        { status: 200 }
      );
    }

    // Default action: toggle
    const { wishlisted, items } = await WishlistModel.toggleWishlist(productId, userIdentifier);

    return ApiResponse.success(
      {
        wishlisted,
        items,
        count: items.length,
      },
      {
        message: wishlisted ? 'Added to wishlist' : 'Removed from wishlist',
        status: 200,
      }
    );
  }

  /**
   * Delete wishlist item or clear all
   * DELETE /api/v1/wishlist or DELETE /api/wishlist
   */
  public async removeWishlist(req: NextRequest) {
    const userIdentifier = this.getUserIdentifier(req);
    const searchParams = req.nextUrl.searchParams;
    const productId = searchParams.get('productId');
    const clearAll = searchParams.get('all') === 'true';

    if (clearAll) {
      await WishlistModel.clearWishlist(userIdentifier);
      return ApiResponse.success(
        { items: [], count: 0 },
        { message: 'Wishlist cleared', status: 200 }
      );
    }

    if (!productId) {
      return ApiResponse.error('productId query parameter is required for deletion', {
        status: 400,
      });
    }

    const items = await WishlistModel.removeFromWishlist(productId, userIdentifier);
    return ApiResponse.success({ items, count: items.length }, { status: 200 });
  }
}

export const wishlistController = new WishlistController();
