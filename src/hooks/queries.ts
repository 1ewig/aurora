/**
 * Aurora — src/hooks/queries.ts
 *
 * TanStack React Query hooks for products, lookbook, editorial, and orders.
 * Centralized data-fetching layer with caching and optimistic initial data.
 */

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import type { Product } from '@/data/products';
import { useAuthStore } from '@/stores/useAuthStore';
import type {
  DashboardMetrics,
  RecentOrder,
  OrderData,
  ProductData,
} from '@/stores/useAdminStore';


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

// ── Admin queries ──────────────────────────────────────────────────────

/** Fetches admin dashboard metrics and recent orders. */
export function useAdminDashboardQuery() {
  return useQuery<{ metrics: DashboardMetrics; recentOrders: RecentOrder[] }>({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/admin/dashboard');
      if (!res.ok) throw new Error('Failed to load dashboard metrics');
      return res.json();
    },
  });
}

export interface AdminPaginatedProductsResponse {
  products: ProductData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedOrdersResponse {
  orders: OrderData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminUserRow {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  role: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  accounts: Array<{ id: string; providerId: string; createdAt: string }>;
  sessionCount: number;
  lastSessionAt: string | null;
}

export interface PaginatedUsersResponse {
  users: AdminUserRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface AdminProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

interface AdminOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

interface AdminUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  verified?: string;
  sortBy?: string;
  sortDir?: string;
}

/** Fetches paginated products for inventory management. */
export function useAdminProductsQuery(params: AdminProductsParams = {}) {
  return useQuery({
    queryKey: ['admin', 'products', params],
    queryFn: async (): Promise<AdminPaginatedProductsResponse> => {
      const sp = new URLSearchParams();
      if (params.page) sp.set('page', String(params.page));
      if (params.limit) sp.set('limit', String(params.limit));
      if (params.search) sp.set('search', params.search);
      if (params.category) sp.set('category', params.category);
      const qs = sp.toString();
      const res = await fetch(`/api/admin/products${qs ? `?${qs}` : ''}`);
      if (!res.ok) throw new Error('Failed to load products');
      return res.json();
    },
    placeholderData: keepPreviousData,
  });
}

/** Fetches paginated orders for admin order processing. */
export function useAdminOrdersQuery(params: AdminOrdersParams = {}) {
  return useQuery({
    queryKey: ['admin', 'orders', params],
    queryFn: async (): Promise<PaginatedOrdersResponse> => {
      const sp = new URLSearchParams();
      if (params.page) sp.set('page', String(params.page));
      if (params.limit) sp.set('limit', String(params.limit));
      if (params.search) sp.set('search', params.search);
      if (params.status && params.status !== 'all') sp.set('status', params.status);
      const qs = sp.toString();
      const res = await fetch(`/api/admin/orders${qs ? `?${qs}` : ''}`);
      if (!res.ok) throw new Error('Failed to load orders');
      return res.json();
    },
    placeholderData: keepPreviousData,
  });
}

/** Fetches paginated users for admin user management. */
export function useAdminUsersQuery(params: AdminUsersParams = {}) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: async (): Promise<PaginatedUsersResponse> => {
      const sp = new URLSearchParams();
      if (params.page) sp.set('page', String(params.page));
      if (params.limit) sp.set('limit', String(params.limit));
      if (params.search) sp.set('search', params.search);
      if (params.verified) sp.set('verified', params.verified);
      if (params.sortBy) sp.set('sortBy', params.sortBy);
      if (params.sortDir) sp.set('sortDir', params.sortDir);
      const qs = sp.toString();
      const res = await fetch(`/api/admin/users${qs ? `?${qs}` : ''}`);
      if (!res.ok) throw new Error('Failed to load users');
      return res.json();
    },
    placeholderData: keepPreviousData,
  });
}

/** Fetches sessions for a specific user (admin user detail modal). */
export function useAdminUserSessionsQuery(userId: string | null) {
  return useQuery({
    queryKey: ['admin', 'users', userId, 'sessions'],
    queryFn: async () => {
      if (!userId) return [];
      const res = await fetch(`/api/admin/users/${userId}?include=sessions`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.sessions || [];
    },
    enabled: !!userId,
  });
}

// ── Admin mutations ────────────────────────────────────────────────────

/** Updates an order's status, then invalidates orders + dashboard. */
export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP error ${res.status}`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

/** Creates or updates a product, then invalidates the product list. */
export function useSaveProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ product, id }: { product: Partial<ProductData>; id?: string }) => {
      const url = id ? `/api/admin/products/${id}` : "/api/admin/products";
      const method = id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save product");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });
}

/** Deletes a product, then invalidates the product list. */
export function useDeleteProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete product");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });
}

/** Toggles a user's email verification status. */
export function useToggleUserVerifyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, emailVerified }: { userId: string; emailVerified: boolean }) => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailVerified }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

/** Updates a user's role. */
export function useUpdateUserRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update role");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

/** Deletes a user. */
export function useDeleteUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

