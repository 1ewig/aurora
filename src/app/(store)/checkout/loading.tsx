/**
 * Aurora — src/app/(store)/checkout/loading.tsx
 *
 * Loading state for the checkout page. Renders a skeleton layout
 * mimicking the two-column checkout form (order summary on the left,
 * form fields on the right) with animated pulse placeholders.
 * Also includes ScrollToTop for accessibility during navigation.
 */

import { ScrollToTop } from "@/components/ui/ScrollToTop";

export default function CheckoutLoading() {
  return (
    <main className="pt-32 md:pt-36 pb-32 animate-pulse">
      <ScrollToTop />
      <div className="px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto">
        {/* Title Skeleton */}
        <div className="border-b border-border-subtle pb-8 mb-12">
          <div className="h-10 w-64 bg-bg-secondary rounded" />
        </div>

        {/* 2-Column Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left: Order Summary Skeleton */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            <div className="h-6 w-40 bg-bg-secondary rounded" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="h-20 w-16 bg-bg-secondary rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-bg-secondary rounded" />
                  <div className="h-3 w-20 bg-bg-secondary rounded" />
                  <div className="h-4 w-16 bg-bg-secondary rounded" />
                </div>
              </div>
            ))}
            <div className="border-t border-border-subtle pt-4 mt-4 space-y-2">
              <div className="flex justify-between">
                <div className="h-4 w-20 bg-bg-secondary rounded" />
                <div className="h-4 w-16 bg-bg-secondary rounded" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-20 bg-bg-secondary rounded" />
                <div className="h-4 w-16 bg-bg-secondary rounded" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-12 bg-bg-secondary rounded" />
                <div className="h-4 w-16 bg-bg-secondary rounded" />
              </div>
              <div className="flex justify-between border-t border-border-subtle pt-2">
                <div className="h-6 w-16 bg-bg-secondary rounded" />
                <div className="h-6 w-24 bg-bg-secondary rounded" />
              </div>
            </div>
          </div>

          {/* Right: Checkout Form Skeleton */}
          <div className="lg:col-span-7 space-y-6">
            <div className="h-6 w-24 bg-bg-secondary rounded" />
            <div className="h-12 w-full bg-bg-secondary rounded-md" />
            <div className="h-6 w-32 bg-bg-secondary rounded pt-4" />
            <div className="flex gap-4">
              <div className="h-12 w-1/2 bg-bg-secondary rounded-md" />
              <div className="h-12 w-1/2 bg-bg-secondary rounded-md" />
            </div>
            <div className="h-12 w-full bg-bg-secondary rounded-md" />
            <div className="flex gap-4">
              <div className="h-12 w-2/3 bg-bg-secondary rounded-md" />
              <div className="h-12 w-1/3 bg-bg-secondary rounded-md" />
            </div>
            <div className="h-14 w-full bg-bg-secondary rounded-full mt-6" />
          </div>
        </div>
      </div>
    </main>
  );
}
