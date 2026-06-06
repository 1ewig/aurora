"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/hooks/useCartStore";
import { useProductStore } from "@/hooks/useProductStore";
import { formatCurrency } from "@/utils/formatCurrency";
import { ImageGallery } from "./ImageGallery";
import { SizeSelector } from "./SizeSelector";
import { RelatedProducts } from "./RelatedProducts";
import { Button } from "@/components/ui/Button";
import type { Product } from "@/data/products";
import { SizeGuideModal } from "./SizeGuideModal";

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
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
    <div className="pt-24 pb-16 px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-8 md:mb-12 text-xs font-semibold uppercase tracking-wider text-text-muted">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-text-primary transition-colors">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/products" className="hover:text-text-primary transition-colors">
              Shop
            </Link>
          </li>
          <li>/</li>
          <li>
            <span className="text-text-secondary">{product.category}</span>
          </li>
        </ol>
      </nav>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Left Side - Image Gallery */}
        <div className="lg:col-span-5">
          <ImageGallery images={product.images} altText={product.altText} />
        </div>

        {/* Right Side - Info & Purchasing */}
        <div className="lg:col-span-7 space-y-8 lg:sticky lg:top-24">
          <div className="space-y-4">
            {product.badge && (
              <span className="inline-block px-3 py-1 rounded-full bg-accent-secondary/50 text-[10px] font-bold uppercase tracking-wider text-accent-primary">
                {product.badge}
              </span>
            )}
            <p className="text-sm font-semibold uppercase tracking-widest text-text-secondary">
              {product.category}
            </p>
            <h1 className="font-display font-black text-3xl md:text-4xl lg:text-5xl tracking-tight text-text-primary">
              {product.name}
            </h1>
            <div className="flex items-baseline gap-4 mt-2">
              <span className="font-mono text-xl md:text-2xl font-semibold text-text-primary">
                {formatCurrency(product.price)}
              </span>
            </div>
          </div>

          <div className="border-t border-border-subtle pt-6">
            <p className="text-text-secondary leading-relaxed text-sm md:text-base">
              {product.description}
            </p>
          </div>

          {/* Size Selector */}
          <div className="border-t border-border-subtle pt-6">
            <SizeSelector
              sizes={product.sizes}
              selectedSize={selectedSize}
              onChange={(size) => setSelectedSize(product.id, size)}
              onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
            />
          </div>

          {/* CTA Buttons */}
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

          {/* Information Accordion/Tabs */}
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
        </div>
      </div>

      {/* Related Products Grid */}
      <RelatedProducts currentProduct={product} />

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        category={product.category}
      />
    </div>
  );
}
