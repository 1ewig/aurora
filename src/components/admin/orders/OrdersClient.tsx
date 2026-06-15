"use client";

import { useEffect } from "react";
import { useAdminStore } from "@/stores/useAdminStore";
import { useOrderProcessing } from "@/hooks/useOrderProcessing";
import { AdminHeaderPanel } from "@/components/ui/AdminHeaderPanel";
import { OrdersTable } from "./OrdersTable";
import { OrderDetailModal } from "./OrderDetailModal";

export function OrdersClient() {
  const orders = useAdminStore((s) => s.orders);
  const loading = useAdminStore((s) => s.loading);
  const error = useAdminStore((s) => s.error);
  const fetchOrders = useAdminStore((s) => s.fetchOrders);
  const updateOrderStatus = useAdminStore((s) => s.updateOrderStatus);

  // Setup hook for order details, filters, and searches
  const orderHook = useOrderProcessing(orders);

  // Load orders on component mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="space-y-8 pb-12">
      {loading && orders.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-text-secondary text-sm">
          Loading orders database...
        </div>
      ) : error ? (
        <div className="p-8 text-center text-error border border-border-subtle rounded-2xl bg-white">
          {error}
        </div>
      ) : (
        <>
          <AdminHeaderPanel
            title="Order Processing"
            description="Fulfill pending purchases and process order statuses."
          />

          {/* Orders list table */}
          <OrdersTable
            orders={orderHook.filteredOrders}
            filterStatus={orderHook.filterStatus}
            onFilterStatusChange={orderHook.setFilterStatus}
            searchQuery={orderHook.searchQuery}
            onSearchChange={orderHook.setSearchQuery}
            onViewDetailsClick={orderHook.setSelectedOrder}
            onStatusUpdate={updateOrderStatus}
            updatingStatusId={loading ? "updating" : null}
          />

          {/* Detailed order modal details */}
          <OrderDetailModal
            isOpen={!!orderHook.selectedOrder}
            onClose={() => orderHook.setSelectedOrder(null)}
            order={orderHook.selectedOrder}
            onStatusUpdate={updateOrderStatus}
            updatingStatusId={loading ? "updating" : null}
          />
        </>
      )}
    </div>
  );
}
