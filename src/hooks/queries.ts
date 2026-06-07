import { useQuery, useQueryClient } from '@tanstack/react-query';
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

export function useProductsQuery(category?: string) {
  return useQuery({
    queryKey: ['products', category || 'All'],
    queryFn: () => fetchProducts(category),
  });
}

async function fetchProductDetails(slug: string): Promise<Product> {
  const response = await fetch(`/api/products/${encodeURIComponent(slug)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch product details');
  }
  return response.json();
}

export function useProductDetailsQuery(slug: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProductDetails(slug),
    enabled: !!slug,
    staleTime: 0, // Force background refetch to fetch complete details on mount
    initialData: () => {
      const cachedQueries = queryClient.getQueriesData<Product[]>({ queryKey: ['products'] });
      for (const [, products] of cachedQueries) {
        if (products) {
          const product = products.find((p) => p.slug === slug);
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
      return undefined;
    },
  });
}

