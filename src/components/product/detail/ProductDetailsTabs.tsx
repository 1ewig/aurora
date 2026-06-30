/**
 * Aurora — src/components/product/detail/ProductDetailsTabs.tsx
 *
 * Tabbed section for product details and shipping/returns info.
 */
"use client";

import type { Product } from "@/data/products";

interface ProductDetailsTabsProps {
  product: Product;
  activeTab: string;
  onTabChange: (tab: "details" | "shipping") => void;
}

/** Renders tabbed content toggling between product details and shipping/returns information. */
export function ProductDetailsTabs({ product, activeTab, onTabChange }: ProductDetailsTabsProps) {
  return (
    <div className="border-t border-border-subtle pt-6">
      <div className="flex border-b border-border-subtle mb-4" role="tablist" aria-label="Product extra information tabs">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "details" ? "true" : "false"}
          onClick={() => onTabChange("details")}
          className={`pb-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all mr-6 cursor-pointer ${
            activeTab === "details"
              ? "border-text-primary text-text-primary"
              : "border-transparent text-text-muted hover:text-text-secondary"
          }`}
        >
          Details & Fit
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "shipping" ? "true" : "false"}
          onClick={() => onTabChange("shipping")}
          className={`pb-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "shipping"
              ? "border-text-primary text-text-primary"
              : "border-transparent text-text-muted hover:text-text-secondary"
          }`}
        >
          Shipping & Returns
        </button>
      </div>

      <div className="min-h-[120px]">
        {activeTab === "details" ? (
          (!product.details || product.details.length === 0) ? (
            <div className="space-y-2.5 animate-pulse" aria-hidden="true">
              <div className="h-3.5 bg-bg-secondary rounded w-2/3" />
              <div className="h-3.5 bg-bg-secondary rounded w-1/2" />
              <div className="h-3.5 bg-bg-secondary rounded w-3/4" />
              <div className="h-3.5 bg-bg-secondary rounded w-2/5" />
            </div>
          ) : (
            <ul className="space-y-2 text-xs md:text-sm text-text-secondary list-disc pl-4">
              {product.details.map((detail, idx) => (
                <li key={idx}>{detail}</li>
              ))}
            </ul>
          )
        ) : (
          <div className="text-xs md:text-sm text-text-secondary space-y-2 leading-relaxed">
            <p>
              Enjoy complimentary express shipping on all orders over $500. Orders are prepared
              and shipped within 1-2 business days.
            </p>
            <p>
              Returns are accepted within 14 days of delivery. Items must be returned in their original,
              unworn condition with all designer tags attached.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
