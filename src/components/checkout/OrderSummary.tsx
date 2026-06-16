/**
 * Aurora — src/components/checkout/OrderSummary.tsx
 *
 * Presentational component that lists cart items with images, quantities, and
 * prices alongside a full pricing breakdown (subtotal, shipping, tax, total).
 */
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/utils/formatCurrency";
import type { CartItem } from "@/stores/useCartStore";

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

/** Order summary sidebar — item list, quantities, and pricing breakdown. */
export function OrderSummary({ items, subtotal, shipping, tax, total }: OrderSummaryProps) {
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
          <li key={`${item.id}-${item.size}`} className="py-4 flex gap-4">
            <Link href={`/products/${item.slug}`} className="relative w-16 h-20 bg-border-subtle rounded-md overflow-hidden flex-shrink-0">
              <Image
                src={item.image}
                alt={`${item.name} in size ${item.size}`}
                fill
                sizes="64px"
                className="object-cover object-top"
              />
            </Link>
            <div className="flex-1 min-w-0 space-y-1">
              <Link
                href={`/products/${item.slug}`}
                className="font-medium text-text-primary text-sm truncate hover:text-accent-primary transition-colors block"
              >
                {item.name}
              </Link>
              <p className="text-text-secondary text-xs">Size: {item.size} × Qty: {item.quantity}</p>
              <span className="font-mono text-sm font-medium text-text-primary block">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </div>
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
