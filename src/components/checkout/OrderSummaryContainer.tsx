"use client";

import { useCartStore } from "@/stores/useCartStore";
import { calculateOrderPricing } from "@/utils/pricing";
import { OrderSummary } from "./OrderSummary";

export function OrderSummaryContainer() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.totalPrice());
  const { shipping, tax, total } = calculateOrderPricing(subtotal);

  if (items.length === 0) return null;

  return (
    <OrderSummary
      items={items}
      subtotal={subtotal}
      shipping={shipping}
      tax={tax}
      total={total}
    />
  );
}
