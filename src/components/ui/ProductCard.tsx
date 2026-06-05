"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/formatCurrency";
import { useCartStore } from "@/hooks/useCartStore";
import { cardImageReveal } from "@/animations/variants";
import type { Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
  aspectRatio?: string;
}

function BagIconSmall() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
      />
    </svg>
  );
}

export function ProductCard({ product, aspectRatio = "aspect-[3/4]" }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const items = useCartStore((s) => s.items);
  const inCart = items.some((i) => i.id === product.id);
  const [justAdded, setJustAdded] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => clearTimeout(addedTimer.current);
  }, []);

  const handleToggleCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inCart) {
      removeItem(product.id, "M");
    } else {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        size: "M",
        image: product.image,
        category: product.category,
      });
    }
    setJustAdded(true);
    clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <article aria-label={`${product.name} — ${formatCurrency(product.price)}`}>
      <div
        className="relative overflow-hidden rounded-[20px] bg-white cursor-pointer"
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
        <div className="p-4 md:p-5">
          <h3 className="font-medium text-text-primary text-base leading-snug">
            {product.name}
          </h3>
          <p className="text-text-secondary text-sm mt-1">{product.category}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="font-mono font-medium text-text-primary text-sm">
              {formatCurrency(product.price)}
            </span>
            <motion.button
              aria-label={inCart ? `Remove ${product.name} from bag` : `Add ${product.name} to bag`}
              onClick={handleToggleCart}
              whileTap={{ scale: 0.9 }}
              animate={
                justAdded
                  ? { scale: [1, 1.25, 1], transition: { duration: 0.4 } }
                  : inCart ? { scale: [1, 1.15, 1], transition: { duration: 0.3 } } : {}
              }
              className={`p-2 rounded-full transition-all duration-300 ${
                inCart
                  ? "border border-text-primary bg-bg-primary text-text-primary"
                  : "hover:bg-bg-primary text-text-primary"
              }`}
            >
              <BagIconSmall />
            </motion.button>
          </div>
        </div>
      </div>
    </article>
  );
}
