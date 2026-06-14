import { create } from "zustand";

export interface SizeStock {
  size: string;
  stock: number;
}

export interface ProductData {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  badge: string | null;
  image: string;
  altText: string;
  span: string | null;
  aspectRatio: string | null;
  description: string;
  images: string[];
  sizes: SizeStock[];
  details: string[];
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  size: string;
  image: string;
  quantity: number;
}

export interface ShippingAddress {
  email: string;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
}

export interface OrderData {
  id: string;
  userId: string | null;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: ShippingAddress;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
}

export interface DashboardMetrics {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  pendingCount: number;
  shippedCount: number;
  lowStockCount: number;
}

export interface RecentOrder {
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
  firstName: string;
  lastName: string;
}

interface AdminState {
  products: ProductData[];
  orders: OrderData[];
  metrics: DashboardMetrics | null;
  recentOrders: RecentOrder[];
  loading: boolean;
  error: string | null;
  
  clearError: () => void;
  fetchDashboard: () => Promise<void>;
  fetchProducts: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
  saveProduct: (product: Partial<ProductData>, id?: string) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  products: [],
  orders: [],
  metrics: null,
  recentOrders: [],
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchDashboard: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/admin/dashboard");
      if (!res.ok) throw new Error("Failed to load dashboard metrics");
      const data = await res.json();
      set({ metrics: data.metrics, recentOrders: data.recentOrders, loading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to load metrics", loading: false });
    }
  },

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/admin/products");
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      set({ products: data, loading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to load products", loading: false });
    }
  },

  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) throw new Error("Failed to load orders");
      const data = await res.json();
      set({ orders: data, loading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to load orders", loading: false });
    }
  },

  updateOrderStatus: async (orderId, status) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update order status");

      set((state) => ({
        orders: state.orders.map((o) => (o.id === orderId ? { ...o, status: status as any } : o)),
        recentOrders: state.recentOrders.map((o) => (o.orderNumber === data.order?.order_number ? { ...o, status } : o)),
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || "Failed to update order status", loading: false });
      throw err;
    }
  },

  saveProduct: async (product, id) => {
    set({ loading: true, error: null });
    try {
      const url = id ? `/api/admin/products/${id}` : "/api/admin/products";
      const method = id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save product");
      
      set({ loading: false });
      await get().fetchProducts();
    } catch (err: any) {
      set({ error: err.message || "Failed to save product", loading: false });
      throw err;
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete product");

      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || "Failed to delete product", loading: false });
      throw err;
    }
  },
}));
