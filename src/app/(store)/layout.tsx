/**
 * Aurora — src/app/(store)/layout.tsx
 *
 * Store layout wrapping product and landing pages with navbar, cart drawer, and footer.
 */

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/ui/CartDrawer";

/** Store layout providing navbar, cart drawer, and footer to all store pages. */
export default function StoreLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Navbar />
      <CartDrawer />
      {children}
      <Footer />
    </>
  );
}
