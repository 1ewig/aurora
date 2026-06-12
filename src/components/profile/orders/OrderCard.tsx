"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { type Order } from "@/hooks/useOrders";
import { formatCurrency } from "@/utils/formatCurrency";
import { OrderDetailModal } from "./OrderDetailModal";

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const date = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setIsModalOpen(true)}
        className="bg-bg-secondary border border-border-subtle rounded-[20px] p-5 sm:p-6 shadow-sm cursor-pointer hover:border-text-primary hover:shadow-md transition-all duration-300 group"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-4 border-b border-border-subtle">
          <div>
            <p className="font-display font-bold text-lg tracking-wide uppercase">
              {order.orderNumber}
            </p>
            <p className="text-xs text-text-secondary mt-0.5">{date}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest font-semibold px-3 py-1 rounded-full bg-success/10 text-success border border-success/20">
              {order.status}
            </span>
            <span className="font-mono font-bold text-lg">{formatCurrency(order.total)}</span>
          </div>
        </div>

        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={`${item.id}-${item.size}`} className="flex gap-3">
              <div className="relative w-16 h-20 rounded-md bg-border-subtle overflow-hidden shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="64px"
                  className="object-cover object-top"
                />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <Link
                  href={`/products/${item.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-sm font-medium text-text-primary hover:text-accent-primary transition-colors truncate block"
                >
                  {item.name}
                </Link>
                <p className="text-xs text-text-secondary">
                  Size: {item.size} × Qty: {item.quantity}
                </p>
                <span className="font-mono text-sm font-medium text-text-primary block">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-border-subtle text-xs text-text-secondary flex justify-between items-center">
          <div>
            Shipped to {order.shippingAddress.firstName} {order.shippingAddress.lastName} &middot;{" "}
            {order.shippingAddress.city}, {order.shippingAddress.zipCode}
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-accent-primary opacity-0 group-hover:opacity-100 transition-opacity">
            View details &rarr;
          </span>
        </div>
      </motion.div>

      <OrderDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={order}
      />
    </>
  );
}
