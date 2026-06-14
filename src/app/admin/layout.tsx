"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { isAdmin } from "@/utils/auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || !isAdmin(user.email))) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center text-sm text-text-secondary">
        Authenticating administrative session...
      </div>
    );
  }

  if (!user || !isAdmin(user.email)) {
    return null;
  }

  const navItems = [
    { label: "Dashboard", href: "/admin", matchExact: true },
    { label: "Inventory", href: "/admin/products" },
    { label: "Orders", href: "/admin/orders" },
  ];

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col md:flex-row">
      {/* Sidebar Panel */}
      <aside className="w-full md:w-64 bg-bg-secondary border-b md:border-b-0 md:border-r border-border-subtle p-6 flex flex-col gap-8 md:fixed md:top-0 md:bottom-0 md:left-0 z-30">
        <div>
          <Link
            href="/"
            className="font-display font-black text-xl tracking-[0.15em] uppercase text-text-primary hover:text-accent-primary transition-colors"
          >
            Aurora
          </Link>
          <div className="text-[9px] font-bold uppercase tracking-wider text-accent-vivid mt-1 px-0.5">
            Admin Management
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          {navItems.map((item) => {
            const isActive = item.matchExact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all flex-shrink-0 flex items-center ${
                  isActive
                    ? "text-text-primary bg-bg-primary border border-border-subtle"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-primary/40"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="active-indicator"
                    className="absolute inset-y-1.5 left-2.5 w-1 rounded-full bg-accent-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className={isActive ? "pl-2" : ""}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User context footer */}
        <div className="hidden md:block mt-auto border-t border-border-subtle pt-4 text-xs text-text-secondary">
          <div className="font-semibold text-text-primary truncate">
            {user.email}
          </div>
          <div className="mt-2">
            <Link
              href="/"
              className="text-[10px] font-bold uppercase tracking-wider text-accent-primary hover:underline"
            >
              Exit to site
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 md:pl-72 p-6 md:p-12 lg:p-16 max-w-[1400px]">
        {children}
      </main>
    </div>
  );
}
