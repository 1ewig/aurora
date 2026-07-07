/**
 * Aurora — src/app/(user)/profile/ProfileLayoutClient.tsx
 *
 * Client component for the profile layout shell with responsive sidebar.
 */

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter, usePathname } from "next/navigation";
import { useNavbarScroll } from "@/hooks/ui/useNavbarScroll";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";



/** Profile layout with desktop sidebar. */
export function ProfileLayoutClient({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const { navBg, navBorder, navBlur } = useNavbarScroll();

  const isProfileActive = pathname === "/profile";
  const isOrdersActive = pathname === "/profile/orders";

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-bg-primary">
      {/* Mobile Header Navbar */}
      <motion.header
        style={{
          backgroundColor: navBg,
          backdropFilter: navBlur,
          borderBottomColor: navBorder,
          borderBottomWidth: "1px",
          borderBottomStyle: "solid",
        }}
        className="lg:hidden flex items-center h-16 px-6 sticky top-0 z-40"
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

        {/* Right: Empty spacer to balance layout */}
        <div className="flex-1" />
      </motion.header>

      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden lg:flex w-64 lg:h-screen lg:sticky lg:top-0 border-r border-border-subtle bg-bg-secondary flex-col shrink-0">
        <ProfileSidebar />
      </aside>



      {/* Main content area */}
      <div className="flex-1 min-h-screen p-6 pb-28 sm:p-8 sm:pb-28 md:p-12 lg:p-16 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {children}
        </div>
      </div>

      {/* Floating Navigation Capsule for Mobile */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-bg-secondary/95 text-text-primary rounded-full backdrop-blur-md px-1.5 py-1.5 flex gap-1 shadow-xl border border-border-medium/60 w-auto max-w-[90vw]">
        <Link
          href="/profile"
          className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
            isProfileActive
              ? "bg-bg-ink text-text-inverted shadow-sm"
              : "text-text-secondary hover:text-text-primary hover:bg-bg-primary/50"
          }`}
        >
          Profile
        </Link>
        <Link
          href="/profile/orders"
          className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
            isOrdersActive
              ? "bg-bg-ink text-text-inverted shadow-sm"
              : "text-text-secondary hover:text-text-primary hover:bg-bg-primary/50"
          }`}
        >
          Orders
        </Link>
      </div>
    </div>
  );
}
