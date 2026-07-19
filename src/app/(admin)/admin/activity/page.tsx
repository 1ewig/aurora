/**
 * Aurora — src/app/(admin)/admin/activity/page.tsx
 *
 * Admin activity / audit log page. Delegates to ActivityClient which
 * displays an audit trail of admin actions (user updates, product changes,
 * order status modifications) sourced from the database.
 *
 * robots: noindex — admin pages should not appear in search results.
 */

import { ActivityClient } from '@/components/admin/activity/ActivityClient';

export const metadata = {
  title: 'Activity | Admin | Aurora',
  description: 'Audit trail of admin actions.',
  robots: { index: false, follow: false },
};

export default function AdminActivityPage() {
  return <ActivityClient />;
}
