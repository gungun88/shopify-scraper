import { useCallback, useEffect, useState } from 'react';
import { ApiError, Product, productsApi } from '../api/client';

export interface UseProductsResult {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  setPage: (page: number) => void;
  refresh: () => void;
}

export function useProducts(initialPage = 1, pageSize = 20): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPageState] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await productsApi.list(page, pageSize);
      setProducts(data.items);
      setTotal(data.total);
    } catch (error) {
      setError(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Failed to load products',
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, refreshTick]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const setPage = useCallback((nextPage: number) => {
    setPageState(nextPage);
  }, []);

  const refresh = useCallback(() => {
    setRefreshTick((current) => current + 1);
  }, []);

  return {
    products,
    total,
    page,
    pageSize,
    totalPages: pageSize > 0 ? Math.ceil(total / pageSize) : 0,
    isLoading,
    error,
    setPage,
    refresh,
  };
}
