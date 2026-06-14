"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { type OrderData } from "@/stores/useAdminStore";

interface OrderDetailModalProps {
  order: OrderData | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (orderId: string, status: string) => void;
  updatingStatusId: string | null;
}

export function OrderDetailModal({
  order,
  isOpen,
  onClose,
  onStatusUpdate,
  updatingStatusId,
}: OrderDetailModalProps) {
  if (!order) return null;

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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-10 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/55 backdrop-blur-sm"
            onClick={onClose}
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
              onClick={onClose}
              className="absolute top-6 right-6 text-text-secondary hover:text-text-primary text-xl font-bold p-1 cursor-pointer"
            >
              ×
            </button>

            <div className="flex items-center gap-3 mb-6">
              <h2 className="font-display font-black text-2xl uppercase tracking-wider">
                Order Details
              </h2>
              <span className="font-mono text-lg text-text-secondary">({order.orderNumber})</span>
            </div>

            {/* Grid content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-border-subtle pb-8 mb-6">
              {/* Left Side: Order Items */}
              <div className="md:col-span-2 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary mb-3">
                  Order Items
                </h3>
                <div className="space-y-3">
                  {order.items.map((item) => (
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
                    <span className="font-semibold text-text-primary">${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Shipping</span>
                    <span className="font-semibold text-text-primary">
                      {order.shipping === 0 ? "Free" : `$${order.shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Tax (8%)</span>
                    <span className="font-semibold text-text-primary">${order.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border-subtle pt-2 text-sm font-bold">
                    <span className="text-text-primary">Total Price</span>
                    <span className="text-accent-primary">${order.total.toFixed(2)}</span>
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
                      <div>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</div>
                    </div>
                    <div>
                      <div className="font-bold text-text-primary">Address</div>
                      <div>{order.shippingAddress.addressLine1}</div>
                      {order.shippingAddress.addressLine2 && (
                        <div>{order.shippingAddress.addressLine2}</div>
                      )}
                      <div>
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-text-primary">Phone Number</div>
                      <div>{order.shippingAddress.phone}</div>
                    </div>
                    <div>
                      <div className="font-bold text-text-primary">Email Address</div>
                      <div>{order.shippingAddress.email}</div>
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
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-semibold border uppercase ${getStatusStyles(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      {order.status !== "shipped" && order.status !== "delivered" && order.status !== "cancelled" && (
                        <Button
                          disabled={updatingStatusId === order.id}
                          onClick={() => onStatusUpdate(order.id, "shipped")}
                          variant="filled"
                          size="sm"
                          className="text-[10px] py-2 px-3"
                        >
                          Mark Shipped
                        </Button>
                      )}
                      {order.status === "shipped" && (
                        <Button
                          disabled={updatingStatusId === order.id}
                          onClick={() => onStatusUpdate(order.id, "delivered")}
                          variant="gold"
                          size="sm"
                          className="text-[10px] py-2 px-3 col-span-2"
                        >
                          Mark Delivered
                        </Button>
                      )}
                      {order.status !== "cancelled" && order.status !== "delivered" && (
                        <button
                          disabled={updatingStatusId === order.id}
                          onClick={() => onStatusUpdate(order.id, "cancelled")}
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
              <Button onClick={onClose} variant="ghost" size="sm">
                Close Detail
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
