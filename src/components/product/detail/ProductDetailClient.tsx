/**
 * Aurora — src/components/product/detail/ProductDetailClient.tsx
 *
 * Main client component for the product detail page; orchestrates sub-components.
 */
"use client";

import { notFound, useRouter } from "next/navigation";
import { useProductDetailsQuery, useRelatedProductsQuery } from "@/hooks/queries";
import { useProductStore } from "@/stores/useProductStore";
import { useCartStore } from "@/stores/useCartStore";
import { Breadcrumbs } from "./Breadcrumbs";
import { ImageGallery } from "./ImageGallery";
import { ProductInfo } from "./ProductInfo";
import { ProductActions } from "./ProductActions";
import { ProductDetailsTabs } from "./ProductDetailsTabs";
import { RelatedProducts } from "./RelatedProducts";
import { SizeGuideModal } from "./SizeGuideModal";

interface ProductDetailClientProps {
  slug: string;
}

/** Renders the product detail page layout with gallery, info, actions, tabs, and related products. */
export function ProductDetailClient({ slug }: ProductDetailClientProps) {
  const router = useRouter();
  const { data: product, isLoading, error } = useProductDetailsQuery(slug);
  const { data: relatedProducts = [] } = useRelatedProductsQuery(product);

  const isSizeGuideOpen = useProductStore((s) => s.isSizeGuideOpen);
  const setSizeGuideOpen = useProductStore((s) => s.setSizeGuideOpen);
  const selectedSizes = useProductStore((s) => s.selectedSizes);
  const setSelectedSize = useProductStore((s) => s.setSelectedSize);
  const activeTabs = useProductStore((s) => s.activeTabs);
  const setActiveTab = useProductStore((s) => s.setActiveTab);
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);

  if (isLoading) {
    return (
      <main className="pt-32 md:pt-36 pb-16 px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto animate-pulse">
        {/* Breadcrumb Skeleton */}
        <div className="h-4 w-48 bg-bg-secondary rounded mb-8" />

        {/* Main Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left Column (Gallery) */}
          <div className="lg:col-span-5">
            <div className="aspect-square w-full bg-bg-secondary rounded-lg" />
          </div>

          {/* Right Column (Info) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <div className="h-4 w-24 bg-bg-secondary rounded" />
              <div className="h-10 w-3/4 bg-bg-secondary rounded" />
              <div className="h-6 w-32 bg-bg-secondary rounded" />
            </div>
            <div className="h-32 w-full bg-bg-secondary rounded" />
            <div className="h-14 w-full bg-bg-secondary rounded-full" />
            <div className="h-28 w-full bg-bg-secondary rounded" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    notFound();
  }

  const selectedSize = selectedSizes[product.id] || product.sizes?.[0] || "M";
  const isInCart = cartItems.some(
    (item) => item.id === product.id && item.size === selectedSize
  );
  const activeTab = activeTabs[product.id] || "details";

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
    if (!isInCart) {
      addItem({
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        size: selectedSize,
        image: product.image,
        category: product.category,
      });
    }
    router.push("/checkout");
  };

  return (
    <main id="main-content" tabIndex={-1} className="pt-32 md:pt-36 pb-16 px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto">
      {/* Breadcrumbs */}
      <Breadcrumbs category={product.category} />

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Left Side - Image Gallery */}
        <div className="lg:col-span-5">
          <ImageGallery images={product.images} altText={product.altText} />
        </div>

        {/* Right Side - Info & Purchasing */}
        <div className="lg:col-span-7 space-y-8 lg:sticky lg:top-32">
          <ProductInfo product={product} />
          <ProductActions
            product={product}
            selectedSize={selectedSize}
            isInCart={isInCart}
            onAddToBag={handleAddToBag}
            onBuyNow={handleBuyNow}
            onSizeChange={(size) => setSelectedSize(product.id, size)}
            onOpenSizeGuide={() => setSizeGuideOpen(true)}
          />
          <ProductDetailsTabs
            product={product}
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(product.id, tab)}
          />
        </div>
      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && <RelatedProducts products={relatedProducts} />}

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        category={product.category}
      />
    </main>
  );
}
