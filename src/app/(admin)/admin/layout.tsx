/**
 * Aurora — src/app/(admin)/admin/layout.tsx
 *
 * Admin layout with sidebar navigation.
 * Auth guard is enforced server-side via middleware (proxy.ts).
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
