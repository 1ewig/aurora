"use client";

import { heroProducts, allProducts, Product } from "@/data/products";
import { ProductCard } from "@/components/ui/ProductCard";

interface RelatedProductsProps {
  currentProduct: Product;
}

export function RelatedProducts({ currentProduct }: RelatedProductsProps) {
  // Combine all unique products to find matching category items
  const combined = [...heroProducts, ...allProducts];

  // Filter for matching category, excluding the active product
  const related = combined
    .filter((p) => p.category === currentProduct.category && p.id !== currentProduct.id)
    .slice(0, 4);

  if (related.length === 0) {
    // If no exact category matches, fallback to showing any other premium pieces
    const fallback = combined.filter((p) => p.id !== currentProduct.id).slice(0, 4);
    related.push(...fallback);
  }

  return (
    <section aria-labelledby="related-heading" className="py-20 border-t border-border-subtle mt-20">
      <div className="max-w-[1400px] mx-auto">
        <h2 id="related-heading" className="font-display font-black text-2xl md:text-3xl tracking-tight text-text-primary mb-10">
          Related Pieces
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {related.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
