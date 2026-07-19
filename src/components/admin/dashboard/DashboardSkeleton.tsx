/**
 * Aurora — src/components/admin/dashboard/DashboardSkeleton.tsx
 *
 * Loading skeleton representation of the main admin dashboard page, mirroring
 * the metrics grid, recent orders log, and quick tasks panel.
 */

export function DashboardSkeleton() {
  return (
    <div className="space-y-10 pb-12 animate-pulse">
      {/* AdminHeaderPanel Skeleton */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border-subtle pb-6">
        <div className="space-y-2">
          <div className="h-10 w-80 bg-bg-secondary rounded" />
          <div className="h-4 w-56 bg-bg-secondary rounded" />
        </div>
      </div>

      {/* Metrics Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-bg-secondary border border-border-subtle rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-bg-primary rounded-xl">
              <div className="w-6 h-6 bg-bg-secondary rounded" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="h-3 w-24 bg-bg-primary rounded" />
              <div className="h-8 w-32 bg-bg-primary rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders + Task Menu Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-6 w-40 bg-bg-secondary rounded" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-bg-secondary rounded-xl border border-border-subtle p-4 flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-4 w-48 bg-bg-primary rounded" />
                <div className="h-3 w-32 bg-bg-primary rounded" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-16 bg-bg-primary rounded-full" />
                <div className="h-4 w-24 bg-bg-primary rounded" />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="h-6 w-32 bg-bg-secondary rounded" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-11 bg-bg-secondary rounded-full border border-border-subtle" />
          ))}
        </div>
      </div>
    </div>
  );
}
