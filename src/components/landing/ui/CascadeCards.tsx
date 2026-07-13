/**
 * Aurora — src/components/landing/ui/CascadeCards.tsx
 *
 * Animated cascading product card fan layout used in the hero section.
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cardCascade, getCardRotation } from "@/animations/variants";
import { formatCurrency } from "@/utils/formatCurrency";
import type { Product } from "@/data/products";

interface CascadeCardsProps {
  products: Product[];
}

const desktopPositions = [
  { left: "2%",  top: "70px",  zIndex: 10 },
  { left: "16%", top: "30px",  zIndex: 11 },
  { left: "30%", top: "0px",   zIndex: 20 },
  { left: "44%", top: "25px",  zIndex: 11 },
  { left: "58%", top: "65px",  zIndex: 10 },
];

const mobilePositions = [
  { left: "5%",  top: "40px",  zIndex: 10 },
  { left: "25%", top: "15px",  zIndex: 15 },
  { left: "45%", top: "0px",   zIndex: 20 },
];

/** Cascading card fan using products with staggered entry and hover animations. */
export function CascadeCards({ products }: CascadeCardsProps) {
  return (
    <>
      {/* Desktop: Full fan layout */}
      <div className="relative w-full max-w-[700px] mx-auto h-[360px] md:h-[440px] hidden md:block">
        {products.slice(0, 5).map((product, index) => {
          const pos = desktopPositions[index];
          const rotation = getCardRotation(index);
          const isPriority = index >= 1 && index <= 3;

          return (
            <motion.div
              key={product.id}
              variants={cardCascade(index)}
              initial="hidden"
              animate="visible"
              whileHover={{
                scale: 1.06,
                zIndex: 30,
                rotate: rotation * 0.4,
                y: -12,
                transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
              }}
              className="absolute rounded-[22px] overflow-hidden cursor-pointer group"
              style={{
                left: pos.left,
                top: pos.top,
                zIndex: pos.zIndex,
                rotate: rotation,
                width: "clamp(140px, 18vw, 210px)",
                height: "clamp(200px, 26vw, 300px)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.10)",
              }}
            >
              <Link href={`/products/${product.slug}`} className="block w-full h-full relative">
                <Image
                  src={product.image}
                  alt={product.altText}
                  fill
                  preload={isPriority}
                  quality={75}
                  sizes="(min-width: 768px) 18vw, 140px"
                  className="object-cover object-top animate-fade-in"
                />
                {/* Subtle bottom gradient (default state) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                
                {/* Full-card hover gradient overlay with Product Name & Price */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-350 flex flex-col justify-end p-4 text-left">
                  <span className="text-[9px] font-mono text-accent-primary uppercase tracking-[0.2em] mb-1 block">
                    Signature
                  </span>
                  <h4 className="text-white text-xs font-black uppercase tracking-wider line-clamp-1">
                    {product.name}
                  </h4>
                  <p className="text-white/85 text-[10px] font-mono mt-0.5">
                    {formatCurrency(product.price)}
                  </p>
                </div>

                {/* Subtle shimmer on front card */}
                {index === 2 && (
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
                )}
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Mobile: 3-card simplified stack */}
      <div className="relative w-full max-w-[340px] mx-auto h-[260px] md:hidden">
        {products.slice(0, 3).map((product, index) => {
          const pos = mobilePositions[index];
          const rotations = [-8, -2, 6];
          const rotation = rotations[index];

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 50, rotate: rotation - 4 }}
              animate={{ opacity: 1, y: 0, rotate: rotation }}
              transition={{
                duration: 0.8,
                delay: index * 0.12,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="absolute rounded-[18px] overflow-hidden group"
              style={{
                left: pos.left,
                top: pos.top,
                zIndex: pos.zIndex,
                width: "140px",
                height: "190px",
                boxShadow: "0 16px 40px rgba(0,0,0,0.16)",
              }}
            >
              <Link href={`/products/${product.slug}`} className="block w-full h-full relative">
                <Image
                  src={product.image}
                  alt={product.altText}
                  fill
                  quality={75}
                  sizes="(max-width: 768px) 18vw, 140px"
                  className="object-cover object-top"
                />
                {/* Subtle bottom gradient (default state) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                
                {/* Mobile Full-card hover gradient overlay with Product Name & Price */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-350 flex flex-col justify-end p-3 text-left">
                  <span className="text-[8px] font-mono text-accent-primary uppercase tracking-[0.15em] mb-0.5 block">
                    Signature
                  </span>
                  <h4 className="text-white text-[10px] font-black uppercase tracking-wide line-clamp-1">
                    {product.name}
                  </h4>
                  <p className="text-white/85 text-[9px] font-mono mt-0.5">
                    {formatCurrency(product.price)}
                  </p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}
