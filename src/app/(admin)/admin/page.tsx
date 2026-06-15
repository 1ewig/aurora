import { DashboardClient } from '@/components/admin/dashboard/DashboardClient';

export const metadata = {
  title: 'Dashboard | Admin | Aurora',
  description: 'Aurora administrative panel.',
};

export default function AdminDashboardPage() {
  return <DashboardClient />;
}
