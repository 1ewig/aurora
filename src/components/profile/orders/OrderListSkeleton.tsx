/**
 * Aurora — src/components/profile/orders/OrderListSkeleton.tsx
 *
 * Loading skeleton for the purchase history order list.
 * Shared between the page-level loading.tsx and the client-side loading state.
 */

export function OrderListSkeleton() {
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
