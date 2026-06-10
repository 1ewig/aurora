"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useOrders, type Order } from "@/hooks/useOrders";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/utils/formatCurrency";

function OrderCard({ order }: { order: Order }) {
  const date = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-secondary border border-border-subtle rounded-[20px] p-5 sm:p-6 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-4 border-b border-border-subtle">
        <div>
          <p className="font-display font-bold text-lg tracking-wide uppercase">
            {order.orderNumber}
          </p>
          <p className="text-xs text-text-secondary mt-0.5">{date}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-widest font-semibold px-3 py-1 rounded-full bg-success/10 text-success border border-success/20">
            {order.status}
          </span>
          <span className="font-mono font-bold text-lg">{formatCurrency(order.total)}</span>
        </div>
      </div>

      <div className="space-y-3">
        {order.items.map((item) => (
          <div key={`${item.id}-${item.size}`} className="flex items-center gap-3">
            <div className="relative w-12 h-14 sm:w-14 sm:h-16 rounded-md bg-border-subtle overflow-hidden shrink-0">
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="56px"
                className="object-cover object-top"
              />
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/products/${item.slug}`}
                className="text-sm font-medium text-text-primary hover:text-accent-primary transition-colors truncate block"
              >
                {item.name}
              </Link>
              <p className="text-[11px] text-text-secondary">
                Size: {item.size} &middot; Qty: {item.quantity} &middot;{" "}
                {formatCurrency(item.price)} each
              </p>
            </div>
            <span className="font-mono text-sm font-medium text-text-primary shrink-0">
              {formatCurrency(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-border-subtle text-[11px] text-text-secondary">
        Shipped to {order.shippingAddress.firstName} {order.shippingAddress.lastName} &middot;{" "}
        {order.shippingAddress.city}, {order.shippingAddress.zipCode}
      </div>
    </motion.div>
  );
}

export function OrdersClient() {
  const { data: orders, isLoading, error } = useOrders();

  if (isLoading) {
    return (
      <main className="min-h-screen bg-bg-primary px-4 sm:px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-bg-primary px-4 sm:px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <p className="text-error text-sm font-medium mb-4">
            Failed to load purchase history.
          </p>
          <Link href="/profile">
            <Button variant="ghost" size="sm">Back to Profile</Button>
          </Link>
        </div>
      </main>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <main className="min-h-screen bg-bg-primary px-4 sm:px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-16 h-16 rounded-full bg-border-subtle flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8 text-text-muted">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <h2 className="font-display font-bold text-2xl uppercase tracking-wide mb-2">
            No Orders Yet
          </h2>
          <p className="text-text-secondary text-sm max-w-xs mb-6">
            You haven&apos;t placed any orders yet. Browse the collection and find something that speaks to you.
          </p>
          <Link href="/products">
            <Button variant="filled" size="md">Shop the Collection</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg-primary px-4 sm:px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto">
      <div className="pt-6 sm:pt-8 md:pt-12 lg:pt-16 mb-6 sm:mb-8 lg:mb-12">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-text-secondary hover:text-text-primary transition-colors font-medium mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 sm:w-4 sm:h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Profile
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="font-display font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl uppercase tracking-wider">
            Purchase History
          </h1>
          <p className="text-text-secondary text-xs sm:text-sm md:text-base mt-1 max-w-xl">
            A record of your past orders and shipments.
          </p>
        </motion.div>
      </div>

      <div className="space-y-4 sm:space-y-5 pb-16 sm:pb-20 max-w-3xl">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </main>
  );
}
