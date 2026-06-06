"use client";

import { ProductCard } from "@/components/ui/ProductCard";
import type { Product } from "@/data/products";

interface RelatedProductsProps {
  products: Product[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  return (
    <section aria-labelledby="related-heading" className="py-20 border-t border-border-subtle mt-20">
      <div className="max-w-[1400px] mx-auto">
        <h2 id="related-heading" className="font-display font-black text-2xl md:text-3xl tracking-tight text-text-primary mb-10">
          Related Pieces
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
