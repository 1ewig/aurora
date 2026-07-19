/**
 * Aurora — src/hooks/useOrdersManagement.ts
 *
 * Admin order management hook: list, filter, paginate, and update order status.
 * Wraps TanStack Query mutations with local UI state for tracking in-flight updates.
 */

"use client";

import { useState } from "react";
import type { OrderData } from "@/stores/useAdminStore";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  useAdminOrdersQuery,
  useUpdateOrderStatusMutation,
} from "@/hooks/queries";

export function useOrdersManagement(page: number, search: string, filterStatus: string) {
  const { data, isLoading, isFetching, error, refetch } = useAdminOrdersQuery({
    page,
    limit: 20,
    search,
    status: filterStatus === 'all' ? undefined : filterStatus,
  });
  const updateMutation = useUpdateOrderStatusMutation();
  const isAdmin = useAuthStore((s) => s.user?.isAdmin ?? false);

  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  const updateOrderStatus = (orderId: string, status: string) =>
    updateMutation.mutateAsync({ orderId, status });

  return {
    orders: data?.orders ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    loading: isLoading || isFetching,
    error: error?.message ?? null,
    selectedOrder,
    setSelectedOrder,
    updateOrderStatus,
    isAdmin,
    fetchOrders: refetch,
  };
}
