/**
 * Aurora — src/app/(admin)/admin/layout.tsx
 *
 * Admin panel layout (server component). Wraps all admin sub-pages
 * (dashboard, inventory, orders, users) in the AdminLayoutClient shell
 * which provides the sidebar navigation and role-based gating.
 *
 * Auth guard is enforced both here (via AdminLayoutClient's internal
 * role check) and at the middleware level (src/proxy.ts) which redirects
 * unauthenticated users before they reach this layout.
 *
 * robots metadata blocks search indexing for all admin routes.
 */

import type { Metadata } from "next";
import { AdminLayoutClient } from "./AdminLayoutClient";

/** Metadata for the admin layout. Prevent search indexing. */
export const metadata: Metadata = {
  title: "Admin Panel — Aurora",
  description: "Manage system dashboard metrics, inventory, orders, and user permissions.",
  robots: {
    index: false,
    follow: false,
  },
};

/** Server component layout that exports metadata and renders the client shell. */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
