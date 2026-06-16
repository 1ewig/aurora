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

async function fetchLookbookSlides(): Promise<any[]> {
  const response = await fetch('/api/lookbook');
  if (!response.ok) {
    throw new Error('Failed to fetch lookbook slides');
  }
  return response.json();
}

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

export function useOrders() {
  const user = useAuthStore((s) => s.user);

  return useQuery<Order[]>({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const res = await fetch(`/api/orders?userId=${encodeURIComponent(user.id)}`);
      if (!res.ok) {
        throw new Error("Failed to fetch orders");
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 2,
    enabled: !!user?.id,
  });
}



