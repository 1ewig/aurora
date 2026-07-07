/**
 * Aurora — src/app/(admin)/admin/page.tsx
 *
 * Admin page root redirecting to /admin/dashboard.
 */

import { redirect } from 'next/navigation';

export default function AdminPage() {
  redirect('/admin/dashboard');
}
