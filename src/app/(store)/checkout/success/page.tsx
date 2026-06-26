/**
 * Aurora — src/app/(store)/checkout/success/page.tsx
 *
 * Checkout success confirmation page.
 */

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/stores/useCartStore";
import { Button } from "@/components/ui/Button";

export default function CheckoutSuccessPage() {
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    // Clear cart on mount to ensure user's cart is empty after checkout success redirection
    clearCart();
  }, [clearCart]);

  return (
    <main id="main-content" tabIndex={-1} className="pt-28 pb-32">
      <div className="px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto">
        <div className="max-w-xl mx-auto text-center py-12 px-6 md:px-8 bg-white rounded-2xl border border-border-subtle shadow-sm space-y-6">
          <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          <h1 className="font-display font-black text-3xl tracking-tight text-text-primary uppercase">
            Order Received
          </h1>

          <p className="text-text-secondary max-w-md mx-auto text-sm md:text-base leading-relaxed">
            Thank you for your purchase! Your payment was successfully processed. We are preparing your order and a confirmation email will be sent to you shortly.
          </p>

          <div className="bg-bg-primary py-4 px-6 rounded-lg max-w-xs mx-auto border border-border-subtle font-mono text-sm space-y-1">
            <span className="text-text-muted text-xs uppercase tracking-wider block">Fulfillment Status</span>
            <span className="text-text-primary font-bold">Processing</span>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/products">
              <Button variant="filled" size="md">
                Continue Shopping
              </Button>
            </Link>
            <Link href="/profile/orders">
              <Button variant="ghost" size="md">
                View My Orders
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
