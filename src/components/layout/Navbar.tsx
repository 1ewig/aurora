"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { navLinks } from "@/data/navigation";
import { useCartStore } from "@/stores/useCartStore";
import { useNavbarScroll } from "@/hooks/useNavbarScroll";
import { navbarReveal, staggerContainer, menuItemVariant } from "@/animations/variants";
import { useAuthStore } from "@/stores/useAuthStore";

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}



function BagIcon({ count }: { count: number }) {
  return (
    <div className="relative">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-accent-primary text-white text-[10px] flex items-center justify-center font-medium">
          {count}
        </span>
      )}
    </div>
  );
}

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

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleCart = useCartStore((s) => s.toggleCart);
  const items = useCartStore((s) => s.items);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  const user = useAuthStore((s) => s.user);

  const profileHref = user ? "/profile" : "/login";

  const { navBg, navBorder, navBlur } = useNavbarScroll();
  return (
    <>
      <motion.header
        role="banner"
        variants={navbarReveal}
        initial="hidden"
        animate="visible"
        className="fixed top-0 inset-x-0 z-50"
      >
        <motion.div
          style={{
            backgroundColor: navBg,
            backdropFilter: navBlur,
            borderBottomColor: navBorder,
            borderBottomWidth: "1px",
            borderBottomStyle: "solid",
          }}
        >
          <nav
            aria-label="Main navigation"
            className="flex items-center justify-between h-16 md:h-20 px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto"
          >
            {/* Logo */}
            <Link
              href="/"
              aria-label="Aurora — return to homepage"
              className="font-display font-black text-xl tracking-[0.15em] uppercase text-text-primary hover:text-accent-primary transition-colors"
            >
              Aurora
            </Link>

            {/* Desktop Nav Links */}
            <ul
              role="list"
              className="hidden md:flex items-center gap-8 lg:gap-10"
            >
              {navLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-text-primary hover:text-accent-primary transition-colors tracking-wide"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Utility Icons */}
            <div className="flex items-center gap-3">
              <Link
                href={profileHref}
                aria-label={user ? "View Profile" : "Sign In / Sign Up"}
                className="p-2 rounded-full hover:bg-border-subtle/50 transition-colors text-text-primary flex items-center justify-center w-9 h-9"
              >
                <UserIcon />
              </Link>

              <button
                aria-label={`Shopping bag, ${count} item${count !== 1 ? "s" : ""}`}
                onClick={toggleCart}
                className="p-2 rounded-full hover:bg-border-subtle/50 transition-colors text-text-primary"
              >
                <BagIcon count={count} />
              </button>
              
              <button
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 rounded-full hover:bg-border-subtle/50 transition-colors text-text-primary"
              >
                <MenuIcon isOpen={menuOpen} />
              </button>
            </div>
          </nav>
        </motion.div>
      </motion.header>

      {/* Mobile Full-Screen Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={{
              hidden: { x: "100%", opacity: 0 },
              visible: { x: 0, opacity: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
              exit: { x: "100%", opacity: 0, transition: { duration: 0.4, ease: [0.55, 0.06, 0.68, 0.19] } },
            }}
            className="fixed inset-0 z-[55] bg-bg-ink flex flex-col items-start justify-center px-10"
          >
            {/* Close button */}
            <button
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="absolute top-5 right-6 text-text-inverted p-2 text-2xl hover:text-accent-primary transition-colors"
            >
              ✕
            </button>

            <motion.ul
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              role="list"
              className="space-y-6"
            >
              {navLinks.map((link) => (
                <motion.li key={link.label} variants={menuItemVariant}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="text-5xl font-black text-text-inverted hover:text-accent-primary transition-colors tracking-tight leading-none block"
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
              
              <motion.li variants={menuItemVariant}>
                <Link
                  href={profileHref}
                  onClick={() => setMenuOpen(false)}
                  className="text-5xl font-black text-text-inverted hover:text-accent-primary transition-colors tracking-tight leading-none block"
                >
                  {user ? "PROFILE" : "SIGN IN"}
                </Link>
              </motion.li>
            </motion.ul>

            <div className="mt-16">
              <p className="text-text-muted text-sm tracking-wide">
                SS 2026 Collection
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
