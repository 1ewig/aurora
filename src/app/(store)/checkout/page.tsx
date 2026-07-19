/**
 * Aurora — src/app/(store)/checkout/page.tsx
 *
 * Checkout page (server component). Delegates the full checkout UI to
 * CheckoutPageClient (a container) and loads the Lemon Squeezy overlay
 * JS SDK after the page becomes interactive.
 *
 * The lemon.js script is loaded with strategy="afterInteractive" so it
 * does not block First Paint or LCP. It enables the Lemon Squeezy
 * Checkout overlay modal that opens after the user submits the form.
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
      {/*
        Lemon Squeezy overlay JS — loaded after user interaction to avoid
        blocking the checkout form's initial render and interactivity.
      */}
      <Script
        src="https://app.lemonsqueezy.com/js/lemon.js"
        strategy="afterInteractive"
      />
    </>
  );
}

