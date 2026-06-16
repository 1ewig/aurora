"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useOrders } from "@/hooks/queries";

import { Button } from "@/components/ui/Button";
import { OrderCard } from "./OrderCard";

export function OrdersClient() {
  const { data: orders, isLoading, error } = useOrders();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Content area
  let mainContent;

  if (error) {
    mainContent = (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center bg-bg-secondary border border-border-subtle p-8 rounded-[24px] shadow-sm">
        <p className="text-error text-sm font-medium mb-4">
          Failed to load purchase history.
        </p>
        <Link href="/profile">
          <Button variant="ghost" size="sm">Back to Profile</Button>
        </Link>
      </div>
    );
  } else if (!orders || orders.length === 0) {
    mainContent = (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center bg-bg-secondary border border-border-subtle p-8 rounded-[24px] shadow-sm">
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
    );
  } else {
    mainContent = (
      <div className="space-y-4 sm:space-y-5">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6 sm:mb-8 lg:mb-12"
      >
        <h1 className="font-display font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl uppercase tracking-wider">
          Purchase History
        </h1>
        <p className="text-text-secondary text-xs sm:text-sm md:text-base mt-1 max-w-xl">
          A record of your past orders and shipments.
        </p>
      </motion.div>

      {mainContent}
    </>
  );
}
