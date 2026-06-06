"use client";

import { useState } from "react";
import { useCartStore } from "@/stores/useCartStore";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { OrderSummaryContainer } from "@/components/checkout/OrderSummaryContainer";
import { CartEmptyState } from "@/components/checkout/CartEmptyState";

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const [hasOrdered, setHasOrdered] = useState(false);

  if (!hasOrdered && items.length === 0) {
    return (
      <main id="main-content" tabIndex={-1} className="pt-28 pb-32">
        <div className="px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto">
          <div className="border-b border-border-subtle pb-8 mb-12">
            <h1 className="font-display font-black text-3xl md:text-4xl tracking-tight text-text-primary uppercase">
              Secure Checkout
            </h1>
          </div>
          <CartEmptyState />
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" tabIndex={-1} className="pt-28 pb-32">
      <div className="px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto">
        <div className="border-b border-border-subtle pb-8 mb-12">
          <h1 className="font-display font-black text-3xl md:text-4xl tracking-tight text-text-primary uppercase">
            Secure Checkout
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-7">
            <CheckoutForm onOrderPlaced={() => setHasOrdered(true)} />
          </div>
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <OrderSummaryContainer />
          </div>
        </div>
      </div>
    </main>
  );
}
