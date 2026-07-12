/**
 * Aurora — src/components/landing/SignaturePieces.tsx
 *
 * Curated grid of the brand's signature pieces, featuring detailed textile notes
 * and direct Buy Now purchase capabilities.
 */

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { useCartStore } from "@/stores/useCartStore";
import { formatCurrency } from "@/utils/formatCurrency";
import { cardEnter, fadeInUp, staggerContainer } from "@/animations/variants";
import { heroProducts } from "@/data/products";

const aspectRatios = ["aspect-[3/4]", "aspect-[4/5]", "aspect-[2/3]", "aspect-[3/4]"];

// Curated signature products
const signatureProducts = [
  heroProducts[0], // Ivory Wool Overcoat
  heroProducts[1], // Camel Cashmere Turtleneck
  heroProducts[2], // Ecru Linen Blazer
];

// Luxury textile origins and batch runs
const signatureDetails: Record<string, { fabric: string; run: string }> = {
  "ivory-wool-overcoat": {
    fabric: "100% Fine Italian Virgin Wool",
    run: "Batch of 50"
  },
  "camel-cashmere-turtleneck": {
    fabric: "100% Grade-A Mongolian Cashmere",
    run: "Batch of 40"
  },
  "ecru-linen-blazer": {
    fabric: "100% Premium French Flax Linen",
    run: "Batch of 75"
  }
};

export function SignaturePieces() {
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const handleBuyNow = (product: typeof heroProducts[0]) => {
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      size: "M", // default size for immediate buy
      image: product.image,
      category: product.category,
    });
    openCart();
  };

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
        {signatureProducts.map((product, i) => {
          const details = signatureDetails[product.slug] || { fabric: "Noble Fiber Blend", run: "Limited Batch" };
          return (
            <motion.div
              key={product.id}
              variants={cardEnter(i)}
              className={`flex flex-col h-full bg-white rounded-[24px] overflow-hidden border border-border-subtle hover:shadow-xl transition-[box-shadow,border-color] duration-500 hover:border-accent-primary/20 ${
                i % 3 === 1 ? "md:mt-8" : ""
              }`}
            >
              {/* Product Image Area */}
              <div className="relative aspect-[3/4] overflow-hidden bg-bg-secondary group">
                <Link href={`/products/${product.slug}`} className="block w-full h-full">
                  <Image
                    src={product.image}
                    alt={product.altText}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-top transition-transform duration-[1000ms] ease-out group-hover:scale-105"
                    quality={90}
                  />
                  {/* Subtle hover overlay */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>

                {/* Batch Limit Badge */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-border-subtle shadow-sm">
                  <span className="text-[9px] font-bold tracking-widest text-text-primary uppercase font-mono">
                    {details.run}
                  </span>
                </div>
              </div>

              {/* Product Info Section */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="mb-2">
                  <span className="text-[10px] tracking-widest text-accent-primary uppercase font-mono font-medium block mb-1">
                    {product.category}
                  </span>
                  <h3 className="font-sans font-black text-lg text-text-primary tracking-tight">
                    <Link href={`/products/${product.slug}`} className="hover:text-accent-primary transition-colors">
                      {product.name}
                    </Link>
                  </h3>
                </div>

                <p className="text-text-muted text-[11px] font-mono uppercase tracking-wider mb-4">
                  {details.fabric}
                </p>

                <div className="mt-auto pt-4 border-t border-border-subtle flex items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-text-muted font-mono leading-none mb-1">Price</span>
                    <span className="font-mono font-bold text-text-primary text-base">
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleBuyNow(product)}
                    className="px-6 py-3 rounded-full bg-bg-ink hover:bg-accent-primary text-white text-xs font-semibold uppercase tracking-widest transition-all duration-300 active:scale-[0.96] hover:shadow-md cursor-pointer"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
