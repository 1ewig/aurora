import { useState, useMemo } from "react";
import { type OrderData } from "@/stores/useAdminStore";

export function useOrderProcessing(orders: OrderData[]) {
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
          o.shippingAddress.lastName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
      }),
    [orders, filterStatus, searchQuery]
  );

  return {
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    selectedOrder,
    setSelectedOrder,
    filteredOrders,
  };
}
