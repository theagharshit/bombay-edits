import { ApiClient } from './apiClient';
import { Product } from '@/types/product';

export interface ProductFilterParams {
  category?: string;
  collection?: string;
  occasion?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export class ProductService {
  public static async getProducts(params: ProductFilterParams = {}): Promise<Product[]> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.set(key, String(value));
      }
    });

    const queryString = query.toString();
    const endpoint = `/api/products${queryString ? `?${queryString}` : ''}`;
    return ApiClient.get<Product[]>(endpoint);
  }

  public static async getProductBySlug(slug: string): Promise<Product> {
    return ApiClient.get<Product>(`/api/products/${slug}`);
  }

  public static async checkStock(productId: string, size: string, quantity = 1): Promise<{
    inStock: boolean;
    availableQuantity: number;
    isMadeToOrder: boolean;
  }> {
    return ApiClient.get(`/api/products/stock?id=${productId}&size=${size}&qty=${quantity}`);
  }
}
