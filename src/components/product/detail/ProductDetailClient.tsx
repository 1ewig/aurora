/**
 * Aurora — src/components/product/detail/ProductDetailClient.tsx
 *
 * Main client component for the product detail page; orchestrates sub-components.
 */
"use client";

import { notFound } from "next/navigation";
import { useProductDetailsQuery } from "@/hooks/queries";
import { useProductStore } from "@/stores/useProductStore";
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
  const { data: product, isLoading, error } = useProductDetailsQuery(slug);
  const isSizeGuideOpen = useProductStore((s) => s.isSizeGuideOpen);
  const setSizeGuideOpen = useProductStore((s) => s.setSizeGuideOpen);

  if (isLoading) {
    return (
      <main className="pt-24 pb-16 px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto animate-pulse">
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

  return (
    <main id="main-content" tabIndex={-1} className="pt-24 pb-16 px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto">
      {/* Breadcrumbs */}
      <Breadcrumbs category={product.category} />

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Left Side - Image Gallery */}
        <div className="lg:col-span-5">
          <ImageGallery images={product.images} altText={product.altText} />
        </div>

        {/* Right Side - Info & Purchasing */}
        <div className="lg:col-span-7 space-y-8 lg:sticky lg:top-24">
          <ProductInfo product={product} />
          <ProductActions product={product} />
          <ProductDetailsTabs product={product} />
        </div>
      </div>

      {/* Related Products Grid */}
      <RelatedProducts product={product} />

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        category={product.category}
      />
    </main>
  );
}
