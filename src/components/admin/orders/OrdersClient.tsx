/**
 * Aurora — src/components/admin/orders/OrdersClient.tsx
 *
 * Orders management page — hosts table + detail modal, delegates logic to hook.
 */

"use client";

import { AdminHeaderPanel } from "@/components/ui/AdminHeaderPanel";
import { OrdersTable } from "./OrdersTable";
import { OrderDetailModal } from "./OrderDetailModal";
import { OrdersSkeleton } from "./OrdersSkeleton";
import { useOrdersManagement } from "@/hooks/useOrdersManagement";

/** Orders management page — fetches, filters, and displays orders. */
export function OrdersClient() {
  const {
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
    fetchOrders,
  } = useOrdersManagement();

  return (
    <div className="space-y-8 pb-12">
      {loading && orders.length === 0 ? (
        <OrdersSkeleton />
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
            orders={filteredOrders}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onViewDetailsClick={setSelectedOrder}
            onRefresh={fetchOrders}
            loading={loading}
          />

          {/* Detailed order modal details */}
          <OrderDetailModal
            isOpen={!!selectedOrder}
            onClose={() => setSelectedOrder(null)}
            order={selectedOrder ? (orders.find((o) => o.id === selectedOrder.id) || selectedOrder) : null}
            onStatusUpdate={updateOrderStatus}
            updatingStatusId={loading && selectedOrder ? selectedOrder.id : null}
            isAdmin={isAdmin}
          />
        </>
      )}
    </div>
  );
}
