import { useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { navLinks } from "@/data/navigation";
import { useCartStore } from "@/hooks/useCartStore";
import { navbarReveal, staggerContainer, menuItemVariant } from "@/animations/variants";

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
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
        <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[#C8A882] text-white text-[10px] flex items-center justify-center font-medium">
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
  const { scrollY } = useScroll();
  const toggleCart = useCartStore((s) => s.toggleCart);
  const items = useCartStore((s) => s.items);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  const navBg = useTransform(
    scrollY,
    [0, 80],
    ["rgba(247,247,245,0)", "rgba(247,247,245,0.92)"]
  );
  const navBorder = useTransform(
    scrollY,
    [0, 80],
    ["rgba(232,232,228,0)", "rgba(232,232,228,1)"]
  );
  const navBlur = useTransform(scrollY, [0, 80], ["blur(0px)", "blur(16px)"]);

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
            <a
              href="/"
              aria-label="Aurora — return to homepage"
              className="font-['Playfair_Display'] font-black text-xl tracking-[0.15em] uppercase text-[#111111] hover:text-[#C8A882] transition-colors"
            >
              Aurora
            </a>

            {/* Desktop Nav Links */}
            <ul
              role="list"
              className="hidden md:flex items-center gap-8 lg:gap-10"
            >
              {navLinks.map((link) => (
                <li key={link.href + link.label}>
                  <a
                    href={link.href}
                    className="text-sm font-medium text-[#111111] hover:text-[#C8A882] transition-colors tracking-wide"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Utility Icons */}
            <div className="flex items-center gap-3">
              <button
                aria-label="Search"
                className="p-2 rounded-full hover:bg-[#E8E8E4]/50 transition-colors text-[#111111]"
              >
                <SearchIcon />
              </button>
              <button
                aria-label={`Shopping bag, ${count} item${count !== 1 ? "s" : ""}`}
                onClick={toggleCart}
                className="p-2 rounded-full hover:bg-[#E8E8E4]/50 transition-colors text-[#111111]"
              >
                <BagIcon count={count} />
              </button>
              <button
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 rounded-full hover:bg-[#E8E8E4]/50 transition-colors text-[#111111]"
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
            className="fixed inset-0 z-[55] bg-[#0D0D0D] flex flex-col items-start justify-center px-10"
          >
            {/* Close button */}
            <button
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="absolute top-5 right-6 text-[#F7F7F5] p-2 text-2xl hover:text-[#C8A882] transition-colors"
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
                  <a
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="text-5xl font-black text-[#F7F7F5] hover:text-[#C8A882] transition-colors tracking-tight leading-none block"
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </motion.ul>

            <div className="mt-16">
              <p className="text-[#ABABAB] text-sm tracking-wide">
                SS 2025 Collection
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
