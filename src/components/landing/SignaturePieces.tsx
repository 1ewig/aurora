/**
 * Aurora — src/components/landing/SignaturePieces.tsx
 *
 * Displays a curated grid of the brand's signature pieces, bridging editorial
 * design and immediate shoppability.
 */

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { scaleIn, staggerContainer } from "@/animations/variants";
import { formatCurrency } from "@/utils/formatCurrency";

interface SignatureProduct {
  slug: string;
  name: string;
  price: number;
  image: string;
  fabric: string;
  limitText: string;
}

const signatureProducts: SignatureProduct[] = [
  {
    slug: "ivory-wool-overcoat",
    name: "Ivory Wool Overcoat",
    price: 1290,
    image: "/images/products/ivory-wool-overcoat.webp",
    fabric: "100% Fine Italian Virgin Wool",
    limitText: "Limited run of 50 units",
  },
  {
    slug: "camel-cashmere-turtleneck",
    name: "Camel Cashmere Turtleneck",
    price: 485,
    image: "/images/products/camel-cashmere-turtleneck.webp",
    fabric: "100% Grade-A Mongolian Cashmere",
    limitText: "Atelier exclusive — no restocks",
  },
  {
    slug: "ecru-linen-blazer",
    name: "Ecru Linen Blazer",
    price: 890,
    image: "/images/products/ecru-linen-blazer.webp",
    fabric: "100% Premium French Flax Linen",
    limitText: "Limited run of 75 units",
  },
  {
    slug: "champagne-silk-slip-dress",
    name: "Champagne Silk Slip Dress",
    price: 720,
    image: "/images/products/champagne-silk-slip-dress.webp",
    fabric: "19mm Heavyweight Mulberry Silk",
    limitText: "Few remaining",
  },
];

export function SignaturePieces() {
  return (
    <section
      id="signature-pieces"
      aria-labelledby="signature-heading"
      className="py-32 px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto bg-bg-primary border-t border-border-subtle"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
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
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 lg:gap-8"
      >
        {signatureProducts.map((product) => (
          <motion.article
            key={product.slug}
            variants={scaleIn}
            className="group flex flex-col h-full bg-white rounded-[24px] overflow-hidden border border-border-subtle transition-[box-shadow,border-color] duration-500 hover:shadow-xl hover:border-accent-primary/30"
          >
            <Link href={`/products/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden bg-bg-secondary">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover object-center transition-transform duration-[1000ms] ease-out group-hover:scale-105"
                quality={90}
              />
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              
              {/* Batch Limit Badge */}
              <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/40">
                <span className="text-[10px] font-semibold tracking-wider text-text-primary uppercase font-mono">
                  {product.limitText}
                </span>
              </div>
            </Link>

            <div className="p-6 flex flex-col flex-grow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-sans font-black text-lg text-text-primary tracking-tight">
                  <Link href={`/products/${product.slug}`} className="hover:text-accent-primary transition-colors">
                    {product.name}
                  </Link>
                </h3>
                <span className="font-mono text-sm text-text-primary font-medium ml-2">
                  {formatCurrency(product.price)}
                </span>
              </div>
              
              <p className="text-text-muted text-xs font-mono uppercase tracking-wider mb-6">
                {product.fabric}
              </p>

              <div className="mt-auto">
                <Link href={`/products/${product.slug}`}>
                  <button className="w-full py-3.5 rounded-full bg-bg-ink hover:bg-accent-primary text-white text-xs font-semibold uppercase tracking-widest transition-all duration-300 active:scale-[0.98] cursor-pointer">
                    Shop Piece →
                  </button>
                </Link>
              </div>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}
