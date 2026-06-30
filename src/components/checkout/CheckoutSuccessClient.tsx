/**
 * Aurora — src/components/checkout/CheckoutSuccessClient.tsx
 *
 * Client container bridging useCheckoutSuccess hook and the presentational UI elements.
 */

"use client";

import Link from "next/link";
import { useCheckoutSuccess } from "@/hooks/useCheckoutSuccess";
import { Button } from "@/components/ui/Button";
import { CheckoutSuccess } from "./CheckoutSuccess";

export function CheckoutSuccessClient() {
  const { orderData, isLoaded, user } = useCheckoutSuccess();

  if (!isLoaded) {
    return null;
  }

  if (orderData) {
    return (
      <div className="space-y-12">
        <div className="border-b border-border-subtle pb-8">
          <h1 className="font-display font-black text-3xl md:text-4xl tracking-tight text-text-primary uppercase">
            Order Confirmation
          </h1>
        </div>
        <CheckoutSuccess
          orderNumber={orderData.orderNumber}
          email={orderData.email}
          cardNumber={orderData.cardNumber}
          maskedCardNumber={orderData.maskedCardNumber}
          items={orderData.items}
          subtotal={orderData.subtotal}
          shipping={orderData.shipping}
          tax={orderData.tax}
          total={orderData.total}
        />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto text-center py-12 px-6 md:px-8 bg-white rounded-2xl border border-border-subtle shadow-sm space-y-6">
      <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="w-8 h-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>

      <h2 className="font-display font-black text-3xl tracking-tight text-text-primary uppercase">
        No Active Order Found
      </h2>

      <p className="text-text-secondary max-w-md mx-auto text-sm md:text-base leading-relaxed">
        We couldn't locate any recent checkout session details. If you just placed an order, please check your email inbox for a confirmation receipt.
      </p>

      <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Link href="/products">
          <Button variant="filled" size="md">
            Continue Shopping
          </Button>
        </Link>
        {user ? (
          <Link href="/profile/orders">
            <Button variant="ghost" size="md">
              View My Orders
            </Button>
          </Link>
        ) : (
          <Link href="/login">
            <Button variant="ghost" size="md">
              Login / View Orders
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
