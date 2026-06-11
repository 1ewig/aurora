"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { useNavbarScroll } from "@/hooks/useNavbarScroll";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";

function MenuIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="w-5 h-4 flex flex-col justify-between">
      <motion.span
        animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.3 }}
        className="block h-[1.5px] bg-current origin-left"
      />
      <motion.span
        animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="block h-[1.5px] bg-current"
      />
      <motion.span
        animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.3 }}
        className="block h-[1.5px] bg-current origin-left"
      />
    </div>
  );
}

export function ProfileLayoutClient({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { navBg, navBorder, navBlur } = useNavbarScroll();

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
        className="lg:hidden flex items-center justify-between h-16 px-6 sticky top-0 z-40"
      >
        <Link
          href="/"
          className="font-display font-black text-xl tracking-[0.15em] uppercase text-text-primary hover:text-accent-primary transition-colors"
        >
          Aurora
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          className="p-2 -mr-2 rounded-full hover:bg-border-subtle/50 text-text-primary transition-colors cursor-pointer w-9 h-9 flex items-center justify-center"
        >
          <MenuIcon isOpen={mobileOpen} />
        </button>
      </motion.header>

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
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 right-0 w-72 max-w-[85vw] bg-bg-secondary border-l border-border-subtle z-50 flex flex-col"
            >
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
