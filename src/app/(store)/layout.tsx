/**
 * Aurora — src/app/(store)/layout.tsx
 *
 * Storefront layout (server component). Renders the persistent chrome
 * shared across all public store pages (landing, products, checkout, story):
 *
 *   <Navbar /> — top navigation bar with logo, links, and cart icon.
 *   <CartDrawerWrapper /> — slide-out cart panel (renders lazily when opened).
 *   {children} — the page content (landing, product listing, detail, checkout, etc.).
 *   <Footer /> — site footer with links and legal info.
 *
 * CartDrawerWrapper is a thin server-wrapper around the client CartDrawer
 * component that reads from useCartStore (Zustand, persisted to localStorage).
 */

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawerWrapper } from "@/components/ui/CartDrawerWrapper";

/** Store layout providing navbar, cart drawer, and footer to all store pages. */
export default function StoreLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Navbar />
      <CartDrawerWrapper />
      {children}
      <Footer />
    </>
  );
}
