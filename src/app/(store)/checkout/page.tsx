/**
 * Aurora — src/app/(store)/checkout/page.tsx
 *
 * Secure checkout page.
 */

import type { Metadata } from "next";
import CheckoutPageClient from "@/components/checkout/CheckoutPageClient";
import Script from "next/script";

/** Metadata for the checkout page. */
export const metadata: Metadata = {
  title: "Secure Checkout | Aurora",
  description: "Complete your order securely.",
  robots: {
    index: false,
    follow: false,
  },
};

/** Secure checkout page. */
export default function CheckoutPage() {
  return (
    <>
      <CheckoutPageClient />
      <Script
        src="https://app.lemonsqueezy.com/js/lemon.js"
        strategy="afterInteractive"
      />
    </>
  );
}

