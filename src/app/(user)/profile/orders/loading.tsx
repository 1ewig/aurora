/**
 * Aurora — src/app/(user)/profile/orders/loading.tsx
 *
 * Loading skeleton for the purchase history page.
 */

export default function OrdersLoading() {
  return (
    <div className="animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-6 sm:mb-8 lg:mb-12 space-y-3">
        <div className="h-10 w-72 bg-bg-secondary rounded" />
        <div className="h-4 w-64 bg-bg-secondary rounded" />
      </div>

      {/* Order Cards Skeleton */}
      <div className="space-y-4 sm:space-y-5">
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
    </div>
  );
}
