/**
 * Aurora — src/components/admin/inventory/InventorySkeleton.tsx
 *
 * Loading skeleton representation of the admin inventory catalog management table.
 */

export function InventorySkeleton() {
  return (
    <div className="space-y-8 pb-12 animate-pulse">
      {/* AdminHeaderPanel Skeleton */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border-subtle pb-6">
        <div className="space-y-2">
          <div className="h-10 w-80 bg-bg-secondary rounded" />
          <div className="h-4 w-56 bg-bg-secondary rounded" />
        </div>
        <div className="h-10 w-36 bg-bg-secondary rounded-full" />
      </div>

      {/* Table Skeleton */}
      <div className="overflow-x-auto border border-border-subtle rounded-[24px] bg-bg-secondary shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border-subtle bg-bg-primary/50">
              {["Image", "ID", "Name", "Category", "Price", "Stock levels", "Actions"].map((h) => (
                <th key={h} className="px-6 py-4">
                  <div className="h-3 w-16 bg-bg-secondary rounded" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td className="px-6 py-4">
                  <div className="w-12 h-16 bg-bg-primary rounded-[8px]" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-20 bg-bg-primary rounded font-mono" />
                </td>
                <td className="px-6 py-4 space-y-1.5">
                  <div className="h-4 w-36 bg-bg-primary rounded" />
                  <div className="h-3 w-24 bg-bg-primary rounded" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-24 bg-bg-primary rounded" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-16 bg-bg-primary rounded" />
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="h-6 w-12 bg-bg-primary rounded" />
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="h-8 w-16 bg-bg-primary rounded-full inline-block" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
