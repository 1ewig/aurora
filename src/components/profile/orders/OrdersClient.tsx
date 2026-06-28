/**
 * Aurora — src/components/profile/orders/OrdersClient.tsx
 *
 * Purchase history page with loading, empty, and error states.
 */
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useOrders, type Order } from "@/hooks/queries";

import { Button } from "@/components/ui/Button";
import { OrderCard } from "./OrderCard";

/** Renders the purchase history page with order cards, handling loading, empty, and error states. */
export function OrdersClient() {
  const [page, setPage] = useState(0);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const { data, isLoading, error } = useOrders(page);

  useEffect(() => {
    if (data) {
      setAllOrders((prev) =>
        page === 0 ? data.orders : [...prev, ...data.orders]
      );
    }
  }, [data]);

  const hasMore = data ? allOrders.length < data.total : false;

  const handleLoadMore = () => setPage((p) => p + 1);

  if (isLoading && allOrders.length === 0) {
    return (
      <div className="animate-pulse space-y-4 sm:space-y-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-bg-secondary border border-border-subtle p-6 rounded-[20px] shadow-sm space-y-4"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-4 w-32 bg-bg-primary rounded" />
                <div className="h-3 w-24 bg-bg-primary rounded" />
              </div>
              <div className="h-6 w-20 bg-bg-primary rounded-full" />
            </div>
            <div className="h-px bg-border-subtle" />
            <div className="flex justify-between items-center">
              <div className="h-4 w-28 bg-bg-primary rounded" />
              <div className="h-4 w-20 bg-bg-primary rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  let mainContent;

  if (error && allOrders.length === 0) {
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
  } else if (allOrders.length === 0 && !isLoading) {
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
  } else if (allOrders.length > 0) {
    mainContent = (
      <div className="space-y-4 sm:space-y-5">
        {allOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
        {hasMore && (
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleLoadMore}
              variant="ghost"
              size="sm"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div
        className="mb-6 sm:mb-8 lg:mb-12"
      >
        <h1 className="font-display font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl uppercase tracking-wider">
          Purchase History
        </h1>
        <p className="text-text-secondary text-xs sm:text-sm md:text-base mt-1 max-w-xl">
          A record of your past orders and shipments.
        </p>
      </div>

      {mainContent}
    </>
  );
}
