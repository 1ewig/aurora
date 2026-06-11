"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";

export function ProfileLayoutClient({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

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
      <header className="lg:hidden flex items-center justify-between h-16 px-6 border-b border-border-subtle bg-bg-secondary sticky top-0 z-40">
        <Link
          href="/"
          className="font-display font-black text-lg tracking-[0.15em] uppercase text-text-primary hover:text-accent-primary transition-colors"
        >
          Aurora
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="p-2 -mr-2 rounded-full hover:bg-border-subtle/50 text-text-primary transition-colors cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </header>

      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden lg:flex w-64 lg:h-screen lg:sticky lg:top-0 border-r border-border-subtle bg-bg-secondary flex-col shrink-0">
        <ProfileSidebar />
      </aside>

      {/* Mobile Drawer Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/40 z-50 backdrop-blur-xs"
            />
            {/* Slide-out Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-bg-secondary border-r border-border-subtle z-50 flex flex-col"
            >
              {/* Drawer Close Button Header */}
              <div className="flex justify-end p-4 border-b border-border-subtle bg-bg-secondary">
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="p-2 rounded-full hover:bg-border-subtle/50 text-text-primary transition-colors cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto">
                <ProfileSidebar onClose={() => setMobileOpen(false)} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex-1 min-h-screen p-6 sm:p-8 md:p-12 lg:p-16 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
