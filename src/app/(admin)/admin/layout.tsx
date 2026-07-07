/**
 * Aurora — src/app/(admin)/admin/layout.tsx
 *
 * Admin layout with sidebar navigation.
 * Auth guard is enforced server-side via middleware (proxy.ts).
 */

"use client";

import { AdminSidebar } from "@/components/ui/AdminSidebar";

/** Admin layout rendering sidebar and page content. */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-1 md:ml-64 p-6 md:p-12 lg:p-16 max-w-[1400px]">
        {children}
      </main>
    </div>
  );
}
