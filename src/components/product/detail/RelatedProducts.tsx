/**
 * Aurora — src/components/product/detail/RelatedProducts.tsx
 *
 * Displays a grid of related product cards based on the current product.
 */
"use client";

import { ProductCard } from "@/components/ui/ProductCard";
import { useRelatedProductsQuery } from "@/hooks/queries";
import type { Product } from "@/data/products";

interface RelatedProductsProps {
  product: Product;
}

/** Renders a grid of related product cards, fetching them via the related products query. */
export function RelatedProducts({ product }: RelatedProductsProps) {
  const { data: products = [] } = useRelatedProductsQuery(product);

  return (
    <section aria-labelledby="related-heading" className="py-20 border-t border-border-subtle mt-20">
      <div className="max-w-[1400px] mx-auto">
        <h2 id="related-heading" className="font-display font-black text-2xl md:text-3xl tracking-tight text-text-primary mb-10">
          Related Pieces
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {products.slice(0, 4).map((relatedProduct) => (
            <ProductCard key={relatedProduct.id} product={relatedProduct} />
          ))}
        </div>
      </div>
    </section>
  );
}
