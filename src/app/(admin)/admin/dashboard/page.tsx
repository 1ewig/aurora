/**
 * Aurora — src/app/(admin)/admin/dashboard/page.tsx
 *
 * Admin dashboard (server page). Delegates to DashboardClient which
 * fetches metrics (total sales, order counts, low-stock alerts, recent
 * orders) via useAdminDashboardQuery and renders the stats grid.
 *
 * robots: noindex to prevent search crawling of admin pages.
 */

import { DashboardClient } from '@/components/admin/dashboard/DashboardClient';

/** Metadata for the admin dashboard page. */
export const metadata = {
  title: 'Dashboard | Admin | Aurora',
  description: 'Aurora administrative panel.',
  robots: {
    index: false,
    follow: false,
  },
};

/** Admin dashboard page. */
export default function AdminDashboardPage() {
  return <DashboardClient />;
}
