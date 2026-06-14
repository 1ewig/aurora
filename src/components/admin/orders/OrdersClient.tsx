"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  size: string;
  image: string;
  quantity: number;
}

interface ShippingAddress {
  email: string;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
}

interface OrderData {
  id: string;
  userId: string | null;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: ShippingAddress;
  status: 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export function OrdersClient() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Detailed Modal State
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // Fetch orders
  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) throw new Error("Failed to load orders");
      const data = await res.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  // Update order status
  async function handleStatusUpdate(orderId: string, newStatus: string) {
    setUpdatingStatusId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");
      
      // Update state local list
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o))
      );
      
      // Update modal view if currently open
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, status: newStatus as any } : null);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingStatusId(null);
    }
  }

  // Filters and search logic
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = filterStatus === "all" || o.status === filterStatus;
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shippingAddress.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shippingAddress.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shippingAddress.lastName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Helper for status badge styling
  function getStatusStyles(status: string) {
    const styles: Record<string, string> = {
      confirmed: "bg-amber-50 text-amber-700 border-amber-200",
      shipped: "bg-blue-50 text-blue-700 border-blue-200",
      delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
      cancelled: "bg-gray-100 text-gray-500 border-gray-300",
    };
    return styles[status] || "bg-gray-50 text-gray-700 border-gray-200";
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border-subtle pb-6">
        <div>
          <h1 className="font-display font-black text-3xl uppercase tracking-wider text-text-primary">
            Order Processing
          </h1>
          <p className="text-text-secondary text-sm">
            Fulfill pending purchases and process order statuses.
          </p>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {["all", "confirmed", "shipped", "delivered", "cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
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
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:max-w-md px-5 py-3 bg-bg-secondary border border-border-medium rounded-full text-sm focus:border-accent-primary focus:outline-none transition-colors"
        />
      </div>

      {/* Orders List Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-text-secondary text-sm">
          Loading orders database...
        </div>
      ) : error ? (
        <div className="p-8 text-center text-error border border-border-subtle rounded-2xl bg-white">
          {error}
        </div>
      ) : filteredOrders.length === 0 ? (
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
              {filteredOrders.map((o) => {
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
                      <span className={`px-2.5 py-1 rounded text-[10px] font-semibold border uppercase ${getStatusStyles(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-text-primary hover:text-accent-primary transition-colors cursor-pointer"
                        >
                          View Details
                        </button>
                        <select
                          disabled={updatingStatusId === o.id}
                          value={o.status}
                          onChange={(e) => handleStatusUpdate(o.id, e.target.value)}
                          className="px-2 py-1 bg-bg-primary border border-border-medium rounded-lg text-xs font-medium focus:outline-none focus:border-accent-primary"
                        >
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

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-10 flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/55 backdrop-blur-sm"
              onClick={() => setSelectedOrder(null)}
            />

            {/* Dialog Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-4xl bg-bg-secondary border border-border-subtle rounded-[24px] shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[85vh]"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedOrder(null)}
                className="absolute top-6 right-6 text-text-secondary hover:text-text-primary text-xl font-bold p-1 cursor-pointer"
              >
                ×
              </button>

              <div className="flex items-center gap-3 mb-6">
                <h2 className="font-display font-black text-2xl uppercase tracking-wider">
                  Order Details
                </h2>
                <span className="font-mono text-lg text-text-secondary">({selectedOrder.orderNumber})</span>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-border-subtle pb-8 mb-6">
                {/* Left Side: Order Items */}
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary mb-3">
                    Order Items
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id + item.size}
                        className="flex gap-4 bg-bg-primary/20 p-3 rounded-2xl border border-border-subtle"
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-16 object-cover rounded-[8px] border border-border-subtle"
                          />
                        ) : (
                          <div className="w-12 h-16 bg-bg-primary rounded-[8px]" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-text-primary text-sm truncate">{item.name}</h4>
                          <div className="text-xs text-text-muted mt-1 flex gap-3">
                            <span>Size: {item.size}</span>
                            <span>Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-text-primary text-sm">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                          <div className="text-[10px] text-text-muted mt-0.5">
                            (${item.price} each)
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary math */}
                  <div className="border border-border-subtle rounded-2xl p-4 space-y-2.5 bg-bg-primary/10 text-xs">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Subtotal</span>
                      <span className="font-semibold text-text-primary">${selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Shipping</span>
                      <span className="font-semibold text-text-primary">
                        {selectedOrder.shipping === 0 ? "Free" : `$${selectedOrder.shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Tax (8%)</span>
                      <span className="font-semibold text-text-primary">${selectedOrder.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-border-subtle pt-2 text-sm font-bold">
                      <span className="text-text-primary">Total Price</span>
                      <span className="text-accent-primary">${selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Shipping Customer */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary mb-3">
                      Shipping Details
                    </h3>
                    <div className="bg-bg-primary/20 p-4 border border-border-subtle rounded-2xl space-y-3 text-xs leading-relaxed text-text-secondary">
                      <div>
                        <div className="font-bold text-text-primary">Customer Name</div>
                        <div>{selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}</div>
                      </div>
                      <div>
                        <div className="font-bold text-text-primary">Address</div>
                        <div>{selectedOrder.shippingAddress.addressLine1}</div>
                        {selectedOrder.shippingAddress.addressLine2 && (
                          <div>{selectedOrder.shippingAddress.addressLine2}</div>
                        )}
                        <div>
                          {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-text-primary">Phone Number</div>
                        <div>{selectedOrder.shippingAddress.phone}</div>
                      </div>
                      <div>
                        <div className="font-bold text-text-primary">Email Address</div>
                        <div>{selectedOrder.shippingAddress.email}</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions status panel */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary mb-3">
                      Modify Status
                    </h3>
                    <div className="border border-border-subtle p-4 rounded-2xl space-y-3 bg-bg-primary/10">
                      <div className="text-xs flex items-center justify-between">
                        <span className="text-text-secondary">Current Status:</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border uppercase ${getStatusStyles(selectedOrder.status)}`}>
                          {selectedOrder.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        {selectedOrder.status !== "shipped" && selectedOrder.status !== "delivered" && selectedOrder.status !== "cancelled" && (
                          <Button
                            onClick={() => handleStatusUpdate(selectedOrder.id, "shipped")}
                            variant="filled"
                            size="sm"
                            className="text-[10px] py-2 px-3"
                          >
                            Mark Shipped
                          </Button>
                        )}
                        {selectedOrder.status === "shipped" && (
                          <Button
                            onClick={() => handleStatusUpdate(selectedOrder.id, "delivered")}
                            variant="gold"
                            size="sm"
                            className="text-[10px] py-2 px-3 col-span-2"
                          >
                            Mark Delivered
                          </Button>
                        )}
                        {selectedOrder.status !== "cancelled" && selectedOrder.status !== "delivered" && (
                          <button
                            onClick={() => handleStatusUpdate(selectedOrder.id, "cancelled")}
                            className="px-3 py-2 border border-error text-error text-[10px] font-semibold rounded-full hover:bg-error hover:text-white transition-colors cursor-pointer"
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal controls */}
              <div className="flex justify-end pt-4">
                <Button onClick={() => setSelectedOrder(null)} variant="ghost" size="sm">
                  Close Detail
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
