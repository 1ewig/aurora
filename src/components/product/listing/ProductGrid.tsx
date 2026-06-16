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
          <div key={i} className={`flex flex-col space-y-4 ${i % 4 === 1 || i % 4 === 2 ? "md:mt-8" : ""}`}>
            <div className={`w-full bg-bg-secondary rounded-[20px] ${aspectRatios[i % aspectRatios.length]}`} />
            <div className="space-y-2 px-2">
              <div className="h-4 w-2/3 bg-bg-secondary rounded" />
              <div className="h-3 w-1/3 bg-bg-secondary rounded" />
              <div className="h-4 w-1/4 bg-bg-secondary rounded mt-2" />
            </div>
          </div>
        ))}
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
