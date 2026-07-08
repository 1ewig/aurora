/**
 * Aurora — src/app/(store)/products/[slug]/loading.tsx
 *
 * Loading skeleton for the product details page.
 */

import { ScrollToTop } from "@/components/ui/ScrollToTop";

export default function ProductDetailsLoading() {
  return (
    <main className="pt-32 md:pt-36 pb-16 px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto animate-pulse">
      <ScrollToTop />
      {/* Breadcrumb Skeleton */}
      <div className="h-4 w-48 bg-bg-secondary rounded mb-8" />

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Left Column (Gallery) */}
        <div className="lg:col-span-5">
          <div className="aspect-square w-full bg-bg-secondary rounded-lg" />
        </div>

        {/* Right Column (Info) */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-4">
            <div className="h-4 w-24 bg-bg-secondary rounded" />
            <div className="h-10 w-3/4 bg-bg-secondary rounded" />
            <div className="h-6 w-32 bg-bg-secondary rounded" />
          </div>
          <div className="h-32 w-full bg-bg-secondary rounded" />
          <div className="h-14 w-full bg-bg-secondary rounded-full" />
          <div className="h-28 w-full bg-bg-secondary rounded" />
        </div>
      </div>
    </main>
  );
}
