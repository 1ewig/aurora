/**
 * Aurora — src/app/(user)/profile/orders/page.tsx
 *
 * Purchase history page listing past customer orders.
 */

import type { Metadata } from "next";
import { OrdersClient } from "@/components/profile/orders/OrdersClient";

/** Metadata for the orders/purchase history page. */
export const metadata: Metadata = {
  title: "Purchase History — Aurora",
  description: "View your past orders and purchase history.",
  robots: {
    index: false,
    follow: false,
  },
};

/** Orders / purchase history page. */
export default function OrdersPage() {
  return <OrdersClient />;
}
