/**
 * Aurora — src/components/landing/SignaturePieces.tsx
 *
 * Displays a curated grid of the brand's signature pieces, matched with the main product grid styling.
 */

"use client";

import { motion } from "framer-motion";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { ProductCard } from "@/components/ui/ProductCard";
import { cardEnter, fadeInUp, staggerContainer } from "@/animations/variants";
import { heroProducts } from "@/data/products";

const aspectRatios = ["aspect-[3/4]", "aspect-[4/5]", "aspect-[2/3]", "aspect-[3/4]"];

// Select 3 signature products from the hero products catalog
const signatureProducts = [
  heroProducts[0], // Ivory Wool Overcoat
  heroProducts[1], // Camel Cashmere Turtleneck
  heroProducts[2], // Ecru Linen Blazer
];

export function SignaturePieces() {
  return (
    <section
      id="signature-pieces"
      aria-labelledby="signature-heading"
      className="py-32 px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto bg-bg-primary border-t border-border-subtle"
    >
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mb-16 text-center md:text-left md:flex md:items-end md:justify-between"
      >
        <div>
          <EyebrowLabel>The Foundation</EyebrowLabel>
          <h2
            id="signature-heading"
            className="font-sans font-black leading-tight tracking-[-0.02em] mt-4 text-text-primary"
            style={{ fontSize: "clamp(2.5rem, 5vw, 5.5rem)" }}
          >
            Signature Pieces.
          </h2>
        </div>
        <p className="text-text-secondary font-light text-sm md:text-base max-w-sm mt-4 md:mt-0 leading-relaxed text-center md:text-left">
          Core wardrobe elements designed in silence, manufactured in limited
          batches, and crafted to endure.
        </p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-10% 0px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
      >
        {signatureProducts.map((product, i) => (
          <motion.div
            key={product.id}
            variants={cardEnter(i)}
            className={i % 3 === 1 ? "md:mt-8" : ""}
          >
            <ProductCard
              product={product}
              aspectRatio={aspectRatios[i % aspectRatios.length]}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
