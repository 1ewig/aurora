/**
 * Aurora — src/app/(user)/profile/loading.tsx
 *
 * Loading skeleton for the profile settings page.
 */

export default function ProfileLoading() {
  return (
    <div className="animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-6 sm:mb-8 lg:mb-12 space-y-3">
        <div className="h-10 w-64 bg-bg-secondary rounded" />
        <div className="h-4 w-80 bg-bg-secondary rounded" />
      </div>

      {/* Form Card Skeleton */}
      <div className="bg-bg-secondary border border-border-subtle p-5 sm:p-6 md:p-8 lg:p-10 rounded-[20px] sm:rounded-[24px] shadow-sm">
        <div className="h-6 w-40 bg-bg-primary rounded mb-6 pb-4 border-b border-border-subtle" />
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-3 w-24 bg-bg-primary rounded" />
            <div className="h-12 w-full bg-bg-primary rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-24 bg-bg-primary rounded" />
            <div className="h-12 w-full bg-bg-primary rounded-full" />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <div className="h-12 w-full bg-bg-primary rounded-full flex-1" />
            <div className="h-12 w-full bg-bg-primary rounded-full flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
