/**
 * Aurora — src/app/(admin)/admin/loading.tsx
 *
 * Loading state for the admin dashboard. Renders DashboardSkeleton
 * (a pulsing placeholder matching the dashboard layout) while the
 * dashboard data is being fetched by the client component.
 */

import { DashboardSkeleton } from "@/components/admin/dashboard/DashboardSkeleton";

export default function AdminDashboardLoading() {
  return <DashboardSkeleton />;
}
