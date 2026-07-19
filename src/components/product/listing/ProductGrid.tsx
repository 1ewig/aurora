/**
 * Aurora — src/components/product/listing/ProductGrid.tsx
 *
 * Animated responsive product grid with staggered card entry.
 */
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "@/components/ui/ProductCard";
import { cardEnter } from "@/animations/variants";
import type { Product } from "@/data/products";

const aspectRatios = ["aspect-[3/4]", "aspect-[4/5]", "aspect-[2/3]", "aspect-[3/4]"];

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
}

/** Renders a responsive grid of ProductCards with staggered entrance animations and loading skeleton. */
export function ProductGrid({ products, isLoading }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 animate-pulse" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={`overflow-hidden rounded-[20px] bg-bg-secondary border border-transparent flex flex-col ${
              i % 4 === 1 || i % 4 === 2 ? "md:mt-8" : ""
            }`}
            style={{
              boxShadow:
                "0 2px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            {/* Image Placeholder */}
            <div className={`w-full bg-bg-primary ${aspectRatios[i % aspectRatios.length]}`} />

            {/* Info Placeholder */}
            <div className="p-5 space-y-3">
              {/* Category */}
              <div className="h-3 w-1/3 bg-bg-primary rounded" />
              {/* Name */}
              <div className="h-4 w-2/3 bg-bg-primary rounded" />
              {/* Price & Action */}
              <div className="mt-4 flex items-center justify-between">
                <div className="h-4 w-1/4 bg-bg-primary rounded" />
                <div className="h-3 w-1/5 bg-bg-primary rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!isLoading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-bg-secondary border border-border-subtle rounded-[24px] shadow-sm max-w-md mx-auto my-8">
        <div className="w-12 h-12 rounded-full bg-bg-primary flex items-center justify-center mb-4 text-text-secondary">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="font-sans font-semibold text-lg text-text-primary mb-1">No Products Found</h3>
        <p className="text-text-secondary text-sm max-w-xs leading-relaxed">
          We couldn't find any products matching your search terms or filters. Try adjusting your keyword search or clear the filter.
        </p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={products.map((p) => p.id).join(",")}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94], staggerChildren: 0.05 } as Record<string, unknown>,
          },
          exit: { opacity: 0, transition: { duration: 0.12 } },
        }}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
      >
        {products.map((product, i) => (
          <motion.div
            key={product.id}
            variants={cardEnter(i)}
            className={i % 4 === 1 || i % 4 === 2 ? "md:mt-8" : ""}
          >
            <ProductCard
              product={product}
              aspectRatio={aspectRatios[i % aspectRatios.length]}
            />
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
