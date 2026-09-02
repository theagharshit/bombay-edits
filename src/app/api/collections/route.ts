import { collectionController } from '@/backend/controllers';
import { withMiddlewares } from '@/backend/middlewares';

/**
 * GET /api/collections - Get categories, collections, and occasions
 */
export const GET = withMiddlewares(
  collectionController.getAllCollections.bind(collectionController)
);
