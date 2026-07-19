/**
 * Aurora — src/app/(store)/checkout/success/page.tsx
 *
 * Post-checkout confirmation page. Shown after Lemon Squeezy redirects
 * the user following a successful payment.
 *
 * Wraps CheckoutSuccessClient in a <Suspense> boundary because the client
 * component uses useSearchParams() (via the checkout-success hook) to read
 * the ls_order_id from the URL query string. Without Suspense, Next.js
 * would de-optimize the entire page to client-side rendering.
 *
 * Static metadata is exported at build time; dynamic order details are
 * fetched client-side after mount.
 */

import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutSuccessClient } from "@/components/checkout/CheckoutSuccessClient";

export const metadata: Metadata = {
  title: "Order Confirmation | Aurora",
  description: "Your order details and confirmation status.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutSuccessPage() {
  return (
    <main id="main-content" tabIndex={-1} className="pt-32 md:pt-36 pb-32">
      <div className="px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto">
        {/*
          Suspense is required here because CheckoutSuccessClient calls
          useSearchParams() to read ls_order_id from the callback URL.
          Next.js requires a Suspense boundary around any component
          that uses searchParams to allow the page to remain server-rendered.
        */}
        <Suspense fallback={
          <div className="max-w-xl mx-auto text-center py-12 px-6 md:px-8 bg-white rounded-2xl border border-border-subtle shadow-sm">
            <p className="text-text-secondary text-sm">Loading order details...</p>
          </div>
        }>
          <CheckoutSuccessClient />
        </Suspense>
      </div>
    </main>
  );
}
