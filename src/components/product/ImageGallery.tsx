"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { cn } from "@/utils/cn";

interface ImageGalleryProps {
  images: string[];
  altText: string;
}

export function ImageGallery({ images, altText }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // If there are no additional images, degrade gracefully to a single image
  const galleryImages = images && images.length > 0 ? images : ["/images/hero-product-1.webp"];

  return (
    <div className="flex flex-col gap-4 lg:gap-6 w-full">
      {/* Main Image View */}
      <div className="relative aspect-[3/4] w-full bg-border-subtle overflow-hidden rounded-lg">
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
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Thumbnails */}
      {galleryImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1" role="tablist" aria-label="Product image gallery options">
          {galleryImages.map((image, idx) => {
            const isActive = activeIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                role="tab"
                aria-selected={isActive ? "true" : "false"}
                onClick={() => setActiveIndex(idx)}
                className={cn(
                  "relative w-20 aspect-[3/4] bg-border-subtle rounded-md overflow-hidden flex-shrink-0 cursor-pointer border-2 transition-all duration-300",
                  isActive ? "border-accent-primary" : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <OptimizedImage
                  src={image}
                  alt={`${altText} thumbnail - view ${idx + 1}`}
                  className="object-cover w-full h-full"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
