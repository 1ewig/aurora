"use client";

import { type OrderData } from "@/stores/useAdminStore";
import { OrderStatusBadge } from "@/components/ui/OrderStatusBadge";

interface OrdersTableProps {
  orders: OrderData[];
  filterStatus: string;
  onFilterStatusChange: (val: string) => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onViewDetailsClick: (order: OrderData) => void;
  onStatusUpdate: (orderId: string, status: string) => void;
  updatingStatusId: string | null;
}

export function OrdersTable({
  orders,
  filterStatus,
  onFilterStatusChange,
  searchQuery,
  onSearchChange,
  onViewDetailsClick,
  onStatusUpdate,
  updatingStatusId,
}: OrdersTableProps) {
  return (
    <div className="space-y-8">

      {/* Filter and Search Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {["all", "pending", "confirmed", "shipped", "delivered", "cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => onFilterStatusChange(status)}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all border cursor-pointer ${
                filterStatus === status
                  ? "bg-bg-ink text-text-inverted border-bg-ink"
                  : "bg-bg-secondary text-text-secondary border-border-subtle hover:border-border-medium"
              }`}
            >
              {status === "all" ? "All Orders" : status}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search order #, email, customer name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full md:max-w-md px-5 py-3 bg-bg-secondary border border-border-medium rounded-full text-sm focus:border-accent-primary focus:outline-none transition-colors"
        />
      </div>

      {/* Orders Table */}
      {orders.length === 0 ? (
        <div className="p-20 text-center text-text-secondary text-sm border border-border-subtle rounded-2xl bg-white">
          No orders found matching the filter criteria.
        </div>
      ) : (
        <div className="overflow-x-auto border border-border-subtle rounded-[24px] bg-bg-secondary shadow-sm">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-bg-primary/50 uppercase tracking-wider text-[10px] font-semibold text-text-secondary">
                <th className="px-6 py-4">Order #</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Items count</th>
                <th className="px-6 py-4">Total Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {orders.map((o) => {
                const totalItems = o.items.reduce((sum, item) => sum + item.quantity, 0);
                const orderDate = new Date(o.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <tr key={o.id} className="hover:bg-bg-primary/25 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-text-primary">
                      {o.orderNumber}
                    </td>
                    <td className="px-6 py-4 text-text-secondary text-xs">
                      {orderDate}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-text-primary">
                        {o.shippingAddress.firstName} {o.shippingAddress.lastName}
                      </div>
                      <div className="text-xs text-text-muted mt-0.5 flex items-center gap-1.5">
                        <span>{o.shippingAddress.email}</span>
                        <span className={`px-1.5 py-0.2 rounded-[4px] text-[8px] font-semibold uppercase ${
                          o.userId ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-gray-100 text-gray-500 border border-gray-200"
                        }`}>
                          {o.userId ? "Member" : "Guest"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {totalItems} item{totalItems !== 1 ? "s" : ""}
                    </td>
                    <td className="px-6 py-4 font-semibold text-text-primary">
                      ${o.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => onViewDetailsClick(o)}
                          className="px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-text-primary hover:text-accent-primary transition-colors cursor-pointer"
                        >
                          View Details
                        </button>
                        <select
                          disabled={updatingStatusId === o.id}
                          value={o.status}
                          onChange={(e) => onStatusUpdate(o.id, e.target.value)}
                          className="px-2 py-1 bg-bg-primary border border-border-medium rounded-lg text-xs font-medium focus:outline-none focus:border-accent-primary"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
