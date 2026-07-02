/**
 * Aurora — src/hooks/useOrdersManagement.ts
 *
 * Consolidates fetching, state management, search query filtering,
 * and order updates for the admin order processing panel.
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { useAdminStore, type OrderData } from "@/stores/useAdminStore";
import { useAuthStore } from "@/stores/useAuthStore";

export function useOrdersManagement() {
  const orders = useAdminStore((s) => s.orders);
  const loading = useAdminStore((s) => s.loading);
  const error = useAdminStore((s) => s.error);
  const fetchOrders = useAdminStore((s) => s.fetchOrders);
  const updateOrderStatus = useAdminStore((s) => s.updateOrderStatus);
  const isAdmin = useAuthStore((s) => s.user?.isAdmin ?? false);

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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

  return {
    orders,
    filteredOrders,
    loading,
    error,
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    selectedOrder,
    setSelectedOrder,
    updateOrderStatus,
    isAdmin,
  };
}
