/**
 * Aurora — src/app/(user)/profile/orders/loading.tsx
 *
 * Loading skeleton for the purchase history page.
 */

import { OrderListSkeleton } from "@/components/profile/orders/OrderListSkeleton";

export default function OrdersLoading() {
  return (
    <div className="animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-6 sm:mb-8 lg:mb-12 space-y-3">
        <div className="h-10 w-72 bg-bg-secondary rounded" />
        <div className="h-4 w-64 bg-bg-secondary rounded" />
      </div>

      <OrderListSkeleton />
    </div>
  );
}
