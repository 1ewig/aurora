import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import type { Product } from '@/data/products';

async function fetchProducts(category?: string): Promise<Product[]> {
  const url = category && category !== 'All' 
    ? `/api/products?category=${encodeURIComponent(category)}`
    : '/api/products';
    
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}

/** Fetches all products, optionally filtered by category. */
export function useProductsQuery(category?: string) {
  return useQuery({
    queryKey: ['products', category || 'All'],
    queryFn: () => fetchProducts(category),
    staleTime: 1000 * 60 * 5,
  });
}

export interface PaginatedProductsParams {
  category?: string;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
}

export interface PaginatedProductsResponse {
  products: Product[];
  total: number;
}

async function fetchPaginatedProducts({
  category,
  page = 1,
  limit = 12,
  search,
  sortBy,
}: PaginatedProductsParams): Promise<PaginatedProductsResponse> {
  const params = new URLSearchParams();
  if (category && category !== 'All') params.append('category', category);
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  if (search && search.trim() !== '') params.append('search', search);
  if (sortBy) params.append('sortBy', sortBy);

  const response = await fetch(`/api/products?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch paginated products');
  }
  return response.json();
}

/** Fetches a paginated, filtered, and sorted subset of products from the server. */
export function usePaginatedProductsQuery(params: PaginatedProductsParams) {
  return useQuery<PaginatedProductsResponse>({
    queryKey: ['products', 'paginated', params],
    queryFn: () => fetchPaginatedProducts(params),
    staleTime: 300_000,
    gcTime: 300_000,
  });
}

/** Returns a deterministic "featured" subset using the current day as a seed. */
export function useFeaturedProductsQuery(count = 3) {
  const selectFn = useCallback((products: Product[]) => {
    if (!products || products.length === 0) return [];
    const len = products.length;
    const day = new Date().getDate();
    const selected: Product[] = [];
    for (let i = 0; i < Math.min(count, len); i++) {
      const index = (day + i * 3) % len;
      selected.push(products[index]);
    }
    return selected;
  }, [count]);

  return useQuery({
    queryKey: ['products', 'featured', count],
    queryFn: () => fetchProducts(),
    select: selectFn,
    staleTime: 1000 * 60 * 5,
  });
}

/** Returns up to 4 related products from the same category. */
export function useRelatedProductsQuery(currentProduct?: Product) {
  const selectFn = useCallback((dbProducts: Product[]) => {
    if (!dbProducts || dbProducts.length === 0 || !currentProduct) return [];
    const related = dbProducts.filter(
      (p) => p.category === currentProduct.category && p.slug !== currentProduct.slug
    );

    if (related.length > 0) {
      return related.slice(0, 4);
    }

    return dbProducts.filter((p) => p.slug !== currentProduct.slug).slice(0, 4);
  }, [currentProduct]);

  return useQuery({
    queryKey: ['products', 'related', currentProduct?.category, currentProduct?.slug],
    queryFn: () => fetchProducts(),
    enabled: !!currentProduct,
    select: selectFn,
    staleTime: 1000 * 60 * 5,
  });
}

async function fetchProductDetails(slug: string): Promise<Product> {
  const response = await fetch(`/api/products/${encodeURIComponent(slug)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch product details');
  }
  return response.json();
}

/** Fetches a single product by slug with initial data from cached product list. */
export function useProductDetailsQuery(slug: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProductDetails(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
    placeholderData: () => {
      const cachedQueries = queryClient.getQueriesData<any>({ queryKey: ['products'] });
      for (const [, data] of cachedQueries) {
        if (data) {
          const list = Array.isArray(data)
            ? data
            : (data && typeof data === 'object' && Array.isArray(data.products) ? data.products : null);

          if (list) {
            const product = list.find((p: any) => p.slug === slug);
            if (product) {
              return {
                ...product,
                images: product.images || [product.image],
                description: product.description || '',
                details: product.details || [],
                sizes: product.sizes || [],
              };
            }
          }
        }
      }
      return undefined;
    },
  });
}
