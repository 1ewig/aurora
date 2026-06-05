"use client";

import Image from "next/image";
import { useCartStore } from "@/hooks/useCartStore";
import { formatCurrency } from "@/utils/formatCurrency";

export function OrderSummary() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.totalPrice());

  // Luxury billing: Free shipping over $500, otherwise $25 flat express rate
  const shipping = subtotal > 500 || subtotal === 0 ? 0 : 25;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="bg-bg-secondary p-8 rounded-2xl border border-border-subtle text-center space-y-4">
        <p className="text-text-secondary font-medium">Your shopping bag is empty.</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-secondary p-6 md:p-8 rounded-2xl border border-border-subtle space-y-6">
      <h2 className="font-display font-black text-xl tracking-tight text-text-primary border-b border-border-subtle pb-4">
        Order Summary
      </h2>

      {/* Cart Items List */}
      <ul role="list" className="divide-y divide-border-subtle max-h-[350px] overflow-y-auto pr-2">
        {items.map((item) => (
          <li key={`${item.id}-${item.size}`} className="py-4 flex gap-4 items-center">
            <div className="relative w-16 h-20 bg-border-subtle rounded-md overflow-hidden flex-shrink-0">
              <Image
                src={item.image}
                alt={`${item.name} in size ${item.size}`}
                fill
                sizes="64px"
                className="object-cover object-top"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-text-primary text-sm truncate">{item.name}</h3>
              <p className="text-text-secondary text-xs mt-0.5">Size: {item.size} × Qty: {item.quantity}</p>
            </div>
            <span className="font-mono text-sm font-medium text-text-primary">
              {formatCurrency(item.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      {/* Pricing Breakdown */}
      <div className="border-t border-border-subtle pt-6 space-y-3">
        <div className="flex justify-between text-sm text-text-secondary">
          <span>Subtotal</span>
          <span className="font-mono">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-text-secondary">
          <span>Express Shipping</span>
          <span className="font-mono">
            {shipping === 0 ? "Complimentary" : formatCurrency(shipping)}
          </span>
        </div>
        <div className="flex justify-between text-sm text-text-secondary">
          <span>Estimated Tax (8%)</span>
          <span className="font-mono">{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between font-semibold text-text-primary text-base border-t border-border-subtle pt-4">
          <span>Total</span>
          <span className="font-mono text-lg">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
