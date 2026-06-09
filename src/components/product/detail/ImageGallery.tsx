"use client";

import { motion, AnimatePresence } from "framer-motion";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { getStorageUrl } from "@/utils/insforge";

interface ImageGalleryProps {
  images?: string[];
  altText: string;
}

export function ImageGallery({ images, altText }: ImageGalleryProps) {
  const activeIndex = 0;

  // If there are no additional images, degrade gracefully to a single image
  const galleryImages = images && images.length > 0 ? images : [getStorageUrl("/images/products/hero-product-1.webp")];

  return (
    <div className="flex flex-col gap-4 lg:gap-6 w-full">
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
    </div>
  );
}
