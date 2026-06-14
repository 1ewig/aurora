"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { isAdmin } from "@/utils/auth";

interface NavbarProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: { name?: string | null; email: string } | null;
  profile: { displayName: string } | null;
  onSignOutClick: () => void;
}

export function NavbarProfileMenu({
  isOpen,
  onClose,
  user,
  profile,
  onSignOutClick,
}: NavbarProfileMenuProps) {
  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="absolute right-0 mt-2 w-56 bg-bg-secondary border border-border-subtle rounded-[16px] shadow-lg py-4 px-5 z-50 flex flex-col gap-1 origin-top-right"
        >
          <div className="border-b border-border-subtle pb-3 mb-2">
            <p className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold mb-0.5">Logged in as</p>
            <p className="text-sm font-medium text-text-primary truncate">{profile?.displayName || user.name || user.email}</p>
          </div>
          {isAdmin(user.email) && (
            <Link
              href="/admin"
              onClick={onClose}
              className="text-xs font-semibold uppercase tracking-wider text-accent-vivid hover:text-accent-primary transition-colors py-2 flex items-center"
            >
              Admin Panel
            </Link>
          )}
          <Link
            href="/profile"
            onClick={onClose}
            className="text-xs font-semibold uppercase tracking-wider text-text-secondary hover:text-accent-primary transition-colors py-2 flex items-center"
          >
            Profile
          </Link>
          <Link
            href="/profile/orders"
            onClick={onClose}
            className="text-xs font-semibold uppercase tracking-wider text-text-secondary hover:text-accent-primary transition-colors py-2 flex items-center"
          >
            Orders
          </Link>

          <button
            onClick={() => {
              onClose();
              onSignOutClick();
            }}
            className="text-xs font-semibold uppercase tracking-wider text-error hover:text-red-700 transition-colors py-2 flex items-center w-full text-left cursor-pointer border-t border-border-subtle mt-2 pt-3"
          >
            Sign Out
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
