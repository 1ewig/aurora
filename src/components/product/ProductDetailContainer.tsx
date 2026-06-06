"use client";

import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/useCartStore";
import { useProductStore } from "@/stores/useProductStore";
import { ProductDetail } from "./ProductDetail";
import type { Product } from "@/data/products";

interface ProductDetailContainerProps {
  product: Product;
}

export function ProductDetailContainer({ product }: ProductDetailContainerProps) {
  const router = useRouter();

  const selectedSize = useProductStore((s) => s.selectedSizes[product.id]) || product.sizes[0] || "M";
  const setSelectedSize = useProductStore((s) => s.setSelectedSize);
  const activeTab = useProductStore((s) => s.activeTabs[product.id]) || "details";
  const setActiveTab = useProductStore((s) => s.setActiveTab);
  const isSizeGuideOpen = useProductStore((s) => s.isSizeGuideOpen);
  const setIsSizeGuideOpen = useProductStore((s) => s.setSizeGuideOpen);

  const addItem = useCartStore((s) => s.addItem);
  const isInCart = useCartStore((s) =>
    s.items.some((item) => item.id === product.id && item.size === selectedSize)
  );

  const handleAddToBag = () => {
    addItem({
      id: product.id,
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
      name: product.name,
      price: product.price,
      size: selectedSize,
      image: product.image,
      category: product.category,
    });
    router.push("/checkout");
  };

  return (
    <ProductDetail
      product={product}
      selectedSize={selectedSize}
      onSizeChange={(size) => setSelectedSize(product.id, size)}
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(product.id, tab)}
      isSizeGuideOpen={isSizeGuideOpen}
      onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
      onCloseSizeGuide={() => setIsSizeGuideOpen(false)}
      isInCart={isInCart}
      onAddToBag={handleAddToBag}
      onBuyNow={handleBuyNow}
    />
  );
}
