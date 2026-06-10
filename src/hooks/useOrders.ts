"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/useAuthStore";

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
    queryKey: ["orders"],
    queryFn: async () => {
      if (!user?.email) return [];

      const res = await fetch(`/api/orders?email=${encodeURIComponent(user.email)}`);
      if (!res.ok) {
        throw new Error("Failed to fetch orders");
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 2,
    enabled: !!user?.email,
  });
}
