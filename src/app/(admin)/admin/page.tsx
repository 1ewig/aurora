/**
 * Aurora — src/app/(admin)/admin/page.tsx
 *
 * Admin dashboard page.
 */

import { DashboardClient } from '@/components/admin/dashboard/DashboardClient';

/** Metadata for the admin dashboard page. */
export const metadata = {
  title: 'Dashboard | Admin | Aurora',
  description: 'Aurora administrative panel.',
};

/** Admin dashboard page. */
export default function AdminDashboardPage() {
  return <DashboardClient />;
}
