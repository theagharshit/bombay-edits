import { NextRequest } from 'next/server';
import { ProductModel, ProductQueryOptions } from '../models/productModel';
import { ApiResponse } from '../utils/apiResponse';
import { AppError } from '../middlewares/errorHandlerMiddleware';
import { RequestContext } from '../types/api';

export class ProductController {
  /**
   * Get all products with optional filters, search, and pagination
   * GET /api/products
   */
  public async getProducts(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    
    const options: ProductQueryOptions = {
      category: searchParams.get('category') || undefined,
      collection: searchParams.get('collection') || undefined,
      occasion: searchParams.get('occasion') || undefined,
      search: searchParams.get('q') || searchParams.get('search') || undefined,
      fabric: searchParams.get('fabric') || undefined,
      embroideryType: searchParams.get('embroideryType') || undefined,
      size: searchParams.get('size') || undefined,
      sort: (searchParams.get('sort') as ProductQueryOptions['sort']) || undefined,
      isNewArrival: searchParams.has('newArrival') ? searchParams.get('newArrival') === 'true' : undefined,
      isBestseller: searchParams.has('bestseller') ? searchParams.get('bestseller') === 'true' : undefined,
      minPrice: searchParams.has('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.has('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      page: searchParams.has('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.has('limit') ? Number(searchParams.get('limit')) : undefined,
    };

    const result = ProductModel.query(options);

    return ApiResponse.success(result.products, {
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  }

  /**
   * Get single product by slug
   * GET /api/products/[slug]
   */
  public async getProductBySlug(req: NextRequest, context: RequestContext) {
    const slug = context.params?.slug as string;
    if (!slug) {
      throw new AppError('Product slug parameter is required.', 400);
    }

    const product = ProductModel.findBySlug(slug);
    if (!product) {
      throw new AppError(`Product with slug "${slug}" not found.`, 404, 'PRODUCT_NOT_FOUND');
    }

    return ApiResponse.success(product);
  }

  /**
   * Check stock availability
   * GET /api/products/stock?id=...&size=...&qty=...
   */
  public async checkStock(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const productId = searchParams.get('id') || '';
    const size = searchParams.get('size') || '';
    const qty = Number(searchParams.get('qty') || 1);

    if (!productId || !size) {
      throw new AppError('Both product id and size are required to check stock.', 400);
    }

    const stockInfo = ProductModel.checkStock(productId, size, qty);
    return ApiResponse.success(stockInfo);
  }
}

export const productController = new ProductController();
