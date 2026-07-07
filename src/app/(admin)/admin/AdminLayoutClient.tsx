/**
 * Aurora — src/app/(admin)/admin/AdminLayoutClient.tsx
 *
 * Client component layout wrapper for admin panel pages.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useNavbarScroll } from "@/hooks/ui/useNavbarScroll";
import { AdminSidebar } from "@/components/ui/AdminSidebar";

export function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { navBg, navBorder, navBlur } = useNavbarScroll();

  const isDashboardActive = pathname === "/admin";
  const isInventoryActive = pathname.startsWith("/admin/inventory");
  const isOrdersActive = pathname.startsWith("/admin/orders");
  const isUsersActive = pathname.startsWith("/admin/users");

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col md:flex-row">
      {/* Mobile Header Navbar */}
      <motion.header
        style={{
          backgroundColor: navBg,
          backdropFilter: navBlur,
          borderBottomColor: navBorder,
          borderBottomWidth: "1px",
          borderBottomStyle: "solid",
        }}
        className="md:hidden flex items-center h-16 px-6 sticky top-0 z-40 w-full"
      >
        {/* Left: Go Home */}
        <div className="flex-1 flex justify-start">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Home
          </Link>
        </div>

        {/* Center: Brand */}
        <div className="flex-none">
          <Link
            href="/"
            className="font-display font-black text-xl tracking-[0.15em] uppercase text-text-primary hover:text-accent-primary transition-colors"
          >
            Aurora
          </Link>
        </div>

        {/* Right: Empty spacer */}
        <div className="flex-1" />
      </motion.header>

      {/* Desktop Sidebar (hidden on mobile) */}
      <AdminSidebar />

      {/* Main content area */}
      <main className="flex-1 md:ml-64 p-6 pb-28 md:p-12 lg:p-16 max-w-[1400px]">
        {children}
      </main>

      {/* Floating Navigation Capsule for Mobile */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-bg-secondary/95 text-text-primary rounded-full backdrop-blur-md px-1.5 py-1.5 flex gap-1 shadow-xl border border-border-medium/60 w-auto max-w-[95vw]">
        <Link
          href="/admin"
          className={`px-3.5 py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
            isDashboardActive
              ? "bg-bg-ink text-text-inverted shadow-sm"
              : "text-text-secondary hover:text-text-primary hover:bg-bg-primary/50"
          }`}
        >
          Dashboard
        </Link>
        <Link
          href="/admin/inventory"
          className={`px-3.5 py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
            isInventoryActive
              ? "bg-bg-ink text-text-inverted shadow-sm"
              : "text-text-secondary hover:text-text-primary hover:bg-bg-primary/50"
          }`}
        >
          Inventory
        </Link>
        <Link
          href="/admin/orders"
          className={`px-3.5 py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
            isOrdersActive
              ? "bg-bg-ink text-text-inverted shadow-sm"
              : "text-text-secondary hover:text-text-primary hover:bg-bg-primary/50"
          }`}
        >
          Orders
        </Link>
        <Link
          href="/admin/users"
          className={`px-3.5 py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
            isUsersActive
              ? "bg-bg-ink text-text-inverted shadow-sm"
              : "text-text-secondary hover:text-text-primary hover:bg-bg-primary/50"
          }`}
        >
          Users
        </Link>
      </div>
    </div>
  );
}
