import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/types/product';
import { ProductService, ProductFilterParams } from '../services/productService';

export function useProducts(initialParams: ProductFilterParams = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(
    async (params: ProductFilterParams = initialParams) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await ProductService.getProducts(params);
        setProducts(data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load products';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [initialParams]
  );

  useEffect(() => {
    fetchProducts(initialParams);
  }, []);

  return {
    products,
    isLoading,
    error,
    refetch: fetchProducts,
  };
}
