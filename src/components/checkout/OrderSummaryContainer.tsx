"use client";

import { useCartStore } from "@/stores/useCartStore";
import { useOrderPricing } from "@/hooks/useOrderPricing";
import { OrderSummary } from "./OrderSummary";

export function OrderSummaryContainer() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.totalPrice());
  const { shipping, tax, total } = useOrderPricing(subtotal);

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
