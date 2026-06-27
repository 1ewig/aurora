/**
 * Aurora — src/components/ui/ProductCard.tsx
 *
 * Product card with image reveal animation, badge, category, and price.
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/formatCurrency";
import { cardImageReveal } from "@/animations/variants";
import type { Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
  aspectRatio?: string;
}

/** Product card with image reveal, badge overlay, and price display. */
export function ProductCard({ product, aspectRatio = "aspect-[3/4]" }: ProductCardProps) {
  return (
    <article aria-label={`${product.name} — ${formatCurrency(product.price)}`}>
      <Link href={`/products/${product.slug}`} className="block">
        <div
          className="relative overflow-hidden rounded-[20px] bg-white cursor-pointer group transition-all duration-300 border border-transparent hover:border-accent-primary"
          style={{
            boxShadow:
              "0 2px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          {/* Product Image */}
          <div className={cn("relative overflow-hidden", aspectRatio)}>
            <motion.div
              className="relative w-full h-full"
              variants={cardImageReveal}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.06 }}
              transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <Image
                src={product.image}
                alt={product.altText}
                fill
                quality={100}
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover object-top"
              />
            </motion.div>

            {/* Badge */}
            {product.badge && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white text-xs font-medium tracking-wide text-text-primary">
                {product.badge}
              </span>
            )}
          </div>

          {/* Product Info */}
          <div className="p-5">
            <p className="text-xs tracking-widest text-text-muted uppercase mb-1.5 font-medium">
              {product.category}
            </p>
            <h3 className="font-sans font-medium text-text-primary text-base leading-snug group-hover:text-accent-primary transition-colors">
              {product.name}
            </h3>
            <div className="mt-4 flex items-center justify-between">
              <span className="font-mono font-semibold text-text-primary text-sm">
                {formatCurrency(product.price)}
              </span>
              <span className="text-xs text-text-muted font-medium opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 transform -translate-x-1 flex items-center gap-1">
                View <span className="text-accent-primary">→</span>
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
