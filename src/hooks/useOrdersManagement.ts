"use client";

import { useState, useMemo } from "react";
import type { OrderData } from "@/stores/useAdminStore";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  useAdminOrdersQuery,
  useUpdateOrderStatusMutation,
} from "@/hooks/queries";

export function useOrdersManagement() {
  const { data: orders = [], isLoading, isFetching, error, refetch } = useAdminOrdersQuery();
  const updateMutation = useUpdateOrderStatusMutation();
  const isAdmin = useAuthStore((s) => s.user?.isAdmin ?? false);

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  const filteredOrders = useMemo(
    () =>
      orders.filter((o) => {
        const matchesStatus = filterStatus === "all" || o.status === filterStatus;
        const matchesSearch =
          o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.shippingAddress.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.shippingAddress.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.shippingAddress.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (o.shippingAddress.zipCode || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (o.shippingAddress.address || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (o.shippingAddress.city || "").toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
      }),
    [orders, filterStatus, searchQuery]
  );

  const updateOrderStatus = (orderId: string, status: string) =>
    updateMutation.mutateAsync({ orderId, status });

  return {
    orders,
    filteredOrders,
    loading: isLoading || isFetching,
    error: error?.message ?? null,
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    selectedOrder,
    setSelectedOrder,
    updateOrderStatus,
    isAdmin,
    fetchOrders: refetch,
  };
}
