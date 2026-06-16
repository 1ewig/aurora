import { UsersClient } from '@/components/admin/users/UsersClient';

export const metadata = {
  title: 'Users | Admin | Aurora',
  description: 'Manage registered user accounts, sessions, and authentication methods.',
};

export default function AdminUsersPage() {
  return <UsersClient />;
}
