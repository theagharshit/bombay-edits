import { NextRequest } from 'next/server';
import { CollectionModel } from '../models/collectionModel';
import { ApiResponse } from '../utils/apiResponse';
import { AppError } from '../middlewares/errorHandlerMiddleware';
import { RequestContext } from '../types/api';

export class CollectionController {
  /**
   * Get all categories, collections, and occasions
   * GET /api/collections
   */
  public async getAllCollections(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const type = searchParams.get('type');

    if (type === 'categories') {
      return ApiResponse.success(CollectionModel.getAllCategories());
    }
    if (type === 'occasions') {
      return ApiResponse.success(CollectionModel.getAllOccasions());
    }
    if (type === 'collections') {
      return ApiResponse.success(CollectionModel.getAllCollections());
    }

    return ApiResponse.success({
      categories: CollectionModel.getAllCategories(),
      collections: CollectionModel.getAllCollections(),
      occasions: CollectionModel.getAllOccasions(),
    });
  }

  /**
   * Get category by slug
   * GET /api/collections/category/[slug]
   */
  public async getCategoryBySlug(req: NextRequest, context: RequestContext) {
    const slug = context.params?.slug as string;
    const category = CollectionModel.getCategoryBySlug(slug);
    if (!category) {
      throw new AppError(`Category "${slug}" not found.`, 404);
    }
    return ApiResponse.success(category);
  }

  /**
   * Get collection by slug
   * GET /api/collections/[slug]
   */
  public async getCollectionBySlug(req: NextRequest, context: RequestContext) {
    const slug = context.params?.slug as string;
    const collection = CollectionModel.getCollectionBySlug(slug);
    if (!collection) {
      throw new AppError(`Collection "${slug}" not found.`, 404);
    }
    return ApiResponse.success(collection);
  }
}

export const collectionController = new CollectionController();
