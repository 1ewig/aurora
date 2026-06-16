/**
 * Aurora — src/components/product/detail/ProductActions.tsx
 *
 * Add-to-bag and buy-now action buttons with size selection.
 */
"use client";

import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/useCartStore";
import { useProductStore } from "@/stores/useProductStore";
import { SizeSelector } from "./SizeSelector";
import { Button } from "@/components/ui/Button";
import type { Product } from "@/data/products";

/** Renders size selector and add-to-bag / buy-now action buttons. */
export function ProductActions({ product }: { product: Product }) {
  const router = useRouter();

  const selectedSize = useProductStore((s) => s.selectedSizes[product.id]) || product.sizes?.[0] || "M";
  const setSelectedSize = useProductStore((s) => s.setSelectedSize);
  const setIsSizeGuideOpen = useProductStore((s) => s.setSizeGuideOpen);

  const addItem = useCartStore((s) => s.addItem);
  const isInCart = useCartStore((s) =>
    s.items.some((item) => item.id === product.id && item.size === selectedSize)
  );

  const handleAddToBag = () => {
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      size: selectedSize,
      image: product.image,
      category: product.category,
    });
  };

  const handleBuyNow = () => {
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      size: selectedSize,
      image: product.image,
      category: product.category,
    });
    router.push("/checkout");
  };

  return (
    <div className="space-y-6 border-t border-border-subtle pt-6">
      <SizeSelector
        sizes={product.sizes || []}
        selectedSize={selectedSize}
        onChange={(size) => setSelectedSize(product.id, size)}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
      />

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          variant="ghost"
          size="lg"
          fullWidth
          onClick={handleAddToBag}
          disabled={isInCart}
          className="py-4 font-semibold uppercase tracking-wider text-xs disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isInCart ? "Added!" : "Add to Bag"}
        </Button>
        <Button
          variant="filled"
          size="lg"
          fullWidth
          onClick={handleBuyNow}
          className="py-4 font-semibold uppercase tracking-wider text-xs"
        >
          Buy Now
        </Button>
      </div>
    </div>
  );
}
