"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { type Order } from "@/hooks/queries";

import { formatCurrency } from "@/utils/formatCurrency";
import { useBodyScrollLock } from "@/hooks/ui/useBodyScrollLock";

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

export function OrderDetailModal({ isOpen, onClose, order }: OrderDetailModalProps) {
  useBodyScrollLock(isOpen);

  const date = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-border-subtle flex items-center justify-between">
              <div>
                <h3 className="font-display font-black uppercase text-lg tracking-wider text-text-primary">
                  Order Details
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Placed on {date}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close order details"
                className="p-1.5 hover:bg-bg-secondary rounded-full transition-colors cursor-pointer text-text-secondary"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Order Meta / Info */}
              <div className="flex items-center justify-between bg-bg-secondary border border-border-subtle p-4 rounded-xl">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary block">
                    Order Number
                  </span>
                  <span className="text-sm font-semibold text-text-primary uppercase mt-0.5 block">
                    {order.orderNumber}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary block">
                    Status
                  </span>
                  <span className="text-xs uppercase tracking-widest font-semibold px-2.5 py-0.5 rounded-full bg-success/10 text-success border border-success/20 inline-block mt-0.5">
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                  Items ordered
                </h4>
                <div className="divide-y divide-border-subtle border border-border-subtle rounded-xl overflow-hidden bg-white">
                  {order.items.map((item) => (
                    <div key={`${item.id}-${item.size}`} className="flex gap-4 p-4 hover:bg-bg-secondary/40 transition-colors">
                      <div className="relative w-14 h-18 rounded-md bg-border-subtle overflow-hidden shrink-0 border border-border-subtle">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="56px"
                          className="object-cover object-top"
                        />
                      </div>
                      <div className="min-w-0 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-xs font-semibold text-text-primary hover:text-accent-primary transition-colors truncate block">
                            {item.name}
                          </span>
                          <p className="text-[11px] text-text-secondary mt-0.5">
                            Size: {item.size} &middot; Qty: {item.quantity}
                          </p>
                        </div>
                        <span className="font-mono text-xs font-bold text-text-primary">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                  Delivery details
                </h4>
                <div className="border border-border-subtle rounded-xl p-4 text-xs text-text-secondary space-y-1 bg-bg-secondary/20">
                  <p className="font-semibold text-text-primary">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </p>
                  <p>{order.shippingAddress.address}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.zipCode}
                  </p>
                  <p className="pt-1 border-t border-border-subtle mt-2 text-[11px] text-text-muted">
                    Contact: {order.shippingAddress.email}
                  </p>
                </div>
              </div>

              {/* Price Calculation details */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                  Payment details
                </h4>
                <div className="border border-border-subtle rounded-xl p-4 bg-white space-y-2.5">
                  <div className="flex justify-between text-xs text-text-secondary">
                    <span>Subtotal</span>
                    <span className="font-mono">{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-text-secondary">
                    <span>Shipping</span>
                    <span className="font-mono">
                      {order.shipping === 0 ? "Free" : formatCurrency(order.shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-text-secondary">
                    <span>Sales Tax (8%)</span>
                    <span className="font-mono">{formatCurrency(order.tax)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-text-primary pt-2 border-t border-border-subtle">
                    <span>Total Paid</span>
                    <span className="font-mono">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-bg-secondary border-t border-border-subtle flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider border border-border-subtle hover:border-text-primary bg-white text-text-primary transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
