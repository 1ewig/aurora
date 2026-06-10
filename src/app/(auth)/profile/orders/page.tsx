import type { Metadata } from "next";
import { OrdersClient } from "@/components/profile/OrdersClient";

export const metadata: Metadata = {
  title: "Purchase History — Aurora",
  description: "View your past orders and purchase history.",
};

export default function OrdersPage() {
  return <OrdersClient />;
}
