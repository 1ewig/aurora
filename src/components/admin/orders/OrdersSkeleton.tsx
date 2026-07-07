export function OrdersSkeleton() {
  return (
    <div className="space-y-8 pb-12 animate-pulse">
      {/* AdminHeaderPanel Skeleton */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border-subtle pb-6">
        <div className="space-y-2">
          <div className="h-10 w-80 bg-bg-secondary rounded" />
          <div className="h-4 w-56 bg-bg-secondary rounded" />
        </div>
      </div>

      {/* Filter Bar Skeleton */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="h-12 w-full sm:max-w-md bg-bg-secondary rounded-full" />
        <div className="h-12 w-44 bg-bg-secondary rounded-full" />
        <div className="h-12 w-28 bg-bg-secondary rounded-full" />
      </div>

      {/* Table Skeleton */}
      <div className="overflow-x-auto border border-border-subtle rounded-[24px] bg-bg-secondary shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border-subtle bg-bg-primary/50">
              {["Order #", "Date", "Customer", "Items count", "Total Price", "Payment", "Fulfillment", "Actions"].map(
                (h) => (
                  <th key={h} className="px-6 py-4">
                    <div className="h-3 w-16 bg-bg-secondary rounded" />
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td className="px-6 py-4">
                  <div className="h-4 w-28 bg-bg-primary rounded font-mono" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-3 w-24 bg-bg-primary rounded" />
                </td>
                <td className="px-6 py-4 space-y-1.5">
                  <div className="h-4 w-32 bg-bg-primary rounded" />
                  <div className="h-3 w-40 bg-bg-primary rounded" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-12 bg-bg-primary rounded" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-16 bg-bg-primary rounded" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-5 w-14 bg-bg-primary rounded-full" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-5 w-18 bg-bg-primary rounded-full" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-8 w-28 bg-bg-primary rounded-full" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
