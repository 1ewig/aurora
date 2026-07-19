/**
 * Aurora — src/app/(admin)/admin/users/loading.tsx
 *
 * Loading state for the admin users page. Renders UsersSkeleton
 * while the user list is being fetched by the client component.
 */

import { UsersSkeleton } from "@/components/admin/users/UsersSkeleton";

export default function AdminUsersLoading() {
  return <UsersSkeleton />;
}
