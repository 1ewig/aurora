/**
 * Aurora — src/hooks/queries.ts
 *
 * TanStack React Query hooks for products, lookbook, editorial, and orders.
 * Centralized data-fetching layer with caching and optimistic initial data.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Product } from '@/data/products';
import { useAuthStore } from '@/stores/useAuthStore';


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
  });
}

/** Returns a deterministic "featured" subset using the current day as a seed. */
export function useFeaturedProductsQuery(count = 3) {
  return useQuery({
    queryKey: ['products', 'All'],
    queryFn: () => fetchProducts(),
    select: (products) => {
      if (!products || products.length === 0) return [];
      const len = products.length;
      const day = new Date().getDate();
      const selected: Product[] = [];
      for (let i = 0; i < Math.min(count, len); i++) {
        const index = (day + i * 3) % len;
        selected.push(products[index]);
      }
      return selected;
    },
  });
}

/** Returns up to 4 related products from the same category. */
export function useRelatedProductsQuery(currentProduct: Product) {
  return useQuery({
    queryKey: ['products', 'All'],
    queryFn: () => fetchProducts(),
    select: (dbProducts) => {
      if (!dbProducts || dbProducts.length === 0) return [];
      const related = dbProducts.filter(
        (p) => p.category === currentProduct.category && p.slug !== currentProduct.slug
      );

      if (related.length > 0) {
        return related.slice(0, 4);
      }

      return dbProducts.filter((p) => p.slug !== currentProduct.slug).slice(0, 4);
    },
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
    staleTime: 0,
    initialData: () => {
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

async function fetchLookbookSlides(): Promise<any[]> {
  const response = await fetch('/api/lookbook');
  if (!response.ok) {
    throw new Error('Failed to fetch lookbook slides');
  }
  return response.json();
}

/** Fetches lookbook slides for the homepage slider. */
export function useLookbookQuery() {
  return useQuery({
    queryKey: ['lookbook'],
    queryFn: fetchLookbookSlides,
  });
}

async function fetchEditorialContent(): Promise<any[]> {
  const response = await fetch('/api/editorial');
  if (!response.ok) {
    throw new Error('Failed to fetch editorial content');
  }
  return response.json();
}

/** Fetches editorial content for the brand story page. */
export function useEditorialQuery() {
  return useQuery({
    queryKey: ['editorial'],
    queryFn: fetchEditorialContent,
  });
}

export interface OrderItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
  category: string;
}

export interface Order {
  id: string;
  userId: string | null;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    email: string;
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    zipCode: string;
  };
  status: string;
  createdAt: string;
}

/** Fetches the current user's orders with pagination. */
export function useOrders(page = 0, limit = 50) {
  const user = useAuthStore((s) => s.user);

  return useQuery<{ orders: Order[]; total: number }>({
    queryKey: ["orders", user?.id, page],
    queryFn: async () => {
      if (!user?.id) return { orders: [], total: 0 };

      const offset = page * limit;
      const res = await fetch(`/api/orders?limit=${limit}&offset=${offset}`);
      if (!res.ok) {
        throw new Error("Failed to fetch orders");
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 2,
    enabled: !!user?.id,
  });
}

export interface CategoryMetadata {
  slug: string;
  name: string;
  image: string;
  description: string;
}

async function fetchCategories(): Promise<CategoryMetadata[]> {
  const response = await fetch('/api/categories');
  if (!response.ok) {
    throw new Error('Failed to fetch categories list');
  }
  return response.json();
}

async function fetchDailyCategories(): Promise<CategoryMetadata[]> {
  const response = await fetch('/api/categories/daily');
  if (!response.ok) {
    throw new Error('Failed to fetch daily categories');
  }
  return response.json();
}

/** Fetches all categories with metadata dynamically from DB. */
export function useCategoriesQuery() {
  return useQuery<CategoryMetadata[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 10,
  });
}

/** Fetches 3 daily rotating categories deterministically. */
export function useDailyCategoriesQuery() {
  return useQuery<CategoryMetadata[]>({
    queryKey: ["categories", "daily"],
    queryFn: fetchDailyCategories,
    staleTime: 1000 * 60 * 30,
  });
}



