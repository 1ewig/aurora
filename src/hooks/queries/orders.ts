import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/useAuthStore';

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
