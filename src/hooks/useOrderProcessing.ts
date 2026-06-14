import { useState } from "react";
import { type OrderData } from "@/stores/useAdminStore";

export function useOrderProcessing() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  return {
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    selectedOrder,
    setSelectedOrder,
  };
}
