/**
 * Aurora — src/app/(admin)/admin/users/page.tsx
 *
 * Admin users management page.
 */

import { UsersClient } from '@/components/admin/users/UsersClient';

/** Metadata for the admin users page. */
export const metadata = {
  title: 'Users | Admin | Aurora',
  description: 'Manage registered user accounts, sessions, and authentication methods.',
};

/** Admin users management page. */
export default function AdminUsersPage() {
  return <UsersClient />;
}
