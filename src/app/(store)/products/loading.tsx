/**
 * Aurora — src/app/(store)/products/loading.tsx
 *
 * Loading skeleton for the products listing page.
 */

const aspectRatios = ["aspect-[3/4]", "aspect-[4/5]", "aspect-[2/3]", "aspect-[3/4]"];

import { ScrollToTop } from "@/components/ui/ScrollToTop";

export default function ProductsLoading() {
  return (
    <main className="pt-32 md:pt-36 pb-32">
      <ScrollToTop />
      <div className="px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="space-y-3">
            <div className="h-4 w-20 bg-bg-secondary rounded" />
            <div className="h-10 w-48 bg-bg-secondary rounded" />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input Skeleton */}
            <div className="h-12 w-full md:w-80 bg-bg-secondary rounded-full" />
            {/* Filter Button Skeleton */}
            <div className="w-12 h-12 bg-bg-secondary rounded-full" />
          </div>
        </div>

        {/* Product Grid Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`flex flex-col space-y-4 ${i % 4 === 1 || i % 4 === 2 ? "md:mt-8" : ""}`}>
              <div className={`w-full bg-bg-secondary rounded-[20px] ${aspectRatios[i % aspectRatios.length]}`} />
              <div className="space-y-2 px-2">
                <div className="h-4 w-2/3 bg-bg-secondary rounded" />
                <div className="h-3 w-1/3 bg-bg-secondary rounded" />
                <div className="h-4 w-1/4 bg-bg-secondary rounded mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
