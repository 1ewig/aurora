"use client";

import { useProductStore } from "@/stores/useProductStore";
import type { Product } from "@/data/products";

export function ProductDetailsTabs({ product }: { product: Product }) {
  const activeTab = useProductStore((s) => s.activeTabs[product.id]) || "details";
  const setActiveTab = useProductStore((s) => s.setActiveTab);

  return (
    <div className="border-t border-border-subtle pt-6">
      <div className="flex border-b border-border-subtle mb-4" role="tablist" aria-label="Product extra information tabs">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "details" ? "true" : "false"}
          onClick={() => setActiveTab(product.id, "details")}
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
          onClick={() => setActiveTab(product.id, "shipping")}
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
          <ul className="space-y-2 text-xs md:text-sm text-text-secondary list-disc pl-4">
            {product.details.map((detail, idx) => (
              <li key={idx}>{detail}</li>
            ))}
          </ul>
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
