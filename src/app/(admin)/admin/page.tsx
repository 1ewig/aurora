/**
 * Aurora — src/app/(admin)/admin/page.tsx
 *
 * Admin root page. Immediately redirects to /admin/dashboard since there
 * is no standalone admin index. This ensures visitors to /admin land on
 * the dashboard rather than seeing a blank page.
 *
 * Using redirect() from next/navigation (server-side) rather than client-side
 * router.push to avoid a flash of content before the redirect fires.
 */

import { redirect } from 'next/navigation';

export default function AdminPage() {
  redirect('/admin/dashboard');
}
