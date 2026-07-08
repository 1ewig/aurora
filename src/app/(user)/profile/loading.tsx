/**
 * Aurora — src/app/(user)/profile/loading.tsx
 *
 * Loading skeleton for the profile settings page.
 */

import { ProfileSkeleton } from "@/components/profile/ProfileSkeleton";

export default function ProfileLoading() {
  return (
    <div className="animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-6 sm:mb-8 lg:mb-12 space-y-3">
        <div className="h-10 w-64 bg-bg-secondary rounded" />
        <div className="h-4 w-80 bg-bg-secondary rounded" />
      </div>

      <ProfileSkeleton />
    </div>
  );
}
