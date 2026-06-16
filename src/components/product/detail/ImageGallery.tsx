/**
 * Aurora — src/components/product/detail/ImageGallery.tsx
 *
 * Product image gallery with main viewer and thumbnail row.
 */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { getStorageUrl } from "@/utils/insforge";
import { cn } from "@/utils/cn";

interface ImageGalleryProps {
  images?: string[];
  altText: string;
}

/** Renders a main product image with animated transitions and thumbnail selectors. */
export function ImageGallery({ images, altText }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // If there are no additional images, degrade gracefully to a single image
  const galleryImages = images && images.length > 0 ? images : [getStorageUrl("/images/products/hero-product-1.webp")];

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Main Image View */}
      <div className="relative aspect-square w-full bg-border-subtle overflow-hidden rounded-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            <OptimizedImage
              src={galleryImages[activeIndex]}
              alt={`${altText} - view ${activeIndex + 1}`}
              className="object-cover w-full h-full"
              loading="eager"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Thumbnails Row */}
      {galleryImages.length > 1 && (
        <div className="flex flex-wrap gap-2.5" role="tablist" aria-label="Product image gallery">
          {galleryImages.map((img, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={idx}
                type="button"
                role="tab"
                aria-selected={isActive ? "true" : "false"}
                onClick={() => setActiveIndex(idx)}
                className={cn(
                  "relative w-16 h-16 rounded-md overflow-hidden border-2 bg-border-subtle transition-all duration-300 cursor-pointer flex-shrink-0 select-none",
                  isActive
                    ? "border-bg-ink opacity-100"
                    : "border-transparent opacity-65 hover:opacity-100 hover:border-border-medium"
                )}
                aria-label={`View image ${idx + 1}`}
              >
                <OptimizedImage
                  src={img}
                  alt={`${altText} - thumbnail ${idx + 1}`}
                  className="object-cover w-full h-full"
                  sizes="64px"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

