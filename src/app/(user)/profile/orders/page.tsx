/**
 * Aurora — src/app/(user)/profile/orders/page.tsx
 *
 * User purchase history page (server component). Delegates to OrdersClient
 * which fetches the authenticated user's past orders via useOrders() hook
 * (GET /api/orders) and renders them in a paginated list.
 *
 * Auth is guaranteed by the parent (user)/layout.tsx gate.
 * robots: noindex — user account pages should not appear in search results.
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
