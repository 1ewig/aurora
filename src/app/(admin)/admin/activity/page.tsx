import { ActivityClient } from '@/components/admin/activity/ActivityClient';

export const metadata = {
  title: 'Activity | Admin | Aurora',
  description: 'Audit trail of admin actions.',
  robots: { index: false, follow: false },
};

export default function AdminActivityPage() {
  return <ActivityClient />;
}
