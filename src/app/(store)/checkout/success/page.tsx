/**
 * Aurora — src/app/(store)/checkout/success/page.tsx
 *
 * Checkout success confirmation page (Server Component).
 * Resolves static SEO metadata and delegates client interactivity to CheckoutSuccessClient.
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
    <main id="main-content" tabIndex={-1} className="pt-28 pb-32">
      <div className="px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto">
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
