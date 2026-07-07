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
  slug: string;
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
  address: string;
  city: string;
  zipCode: string;
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
  isPaid: boolean;
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
  isPaid?: boolean;
  createdAt: string;
  firstName: string;
  lastName: string;
}
