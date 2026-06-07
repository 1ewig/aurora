import type { Metadata } from "next";
import CheckoutPageClient from "@/components/checkout/CheckoutPageClient";

export const metadata: Metadata = {
  title: "Secure Checkout | Aurora",
  description: "Complete your order securely.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}

