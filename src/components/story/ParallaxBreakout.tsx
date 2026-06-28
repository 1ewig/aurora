/**
 * Aurora — src/components/story/ParallaxBreakout.tsx
 *
 * Full-width breakout section with editorial background image and overlay brand tagline.
 */

"use client";

import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { getStorageUrl } from "@/utils/insforge";
import { useLookbookQuery } from "@/hooks/queries";

/** Full-width breakout section with editorial background image and centered brand tagline. */
export function ParallaxBreakout() {
  const { data: dbSlides = [] } = useLookbookQuery();
  const slide3 = dbSlides.find(s => s.slideNumber === 3);
  const src = slide3?.imageUrl || getStorageUrl("/images/lookbook/lookbook-3.webp");
  const alt = slide3?.altText || "Extrafine fabric detail view";

  return (
    <section className="py-16 relative h-[70vh] md:h-[85vh] bg-border-subtle overflow-hidden">
      <OptimizedImage
        src={src}
        alt={alt}
        className="w-full h-full object-cover object-center scale-105"
      />
      <div className="absolute inset-0 bg-bg-ink/25 backdrop-blur-[1px] flex items-center justify-center">
        <h2 className="text-text-inverted font-display font-black text-2xl md:text-5xl uppercase tracking-widest text-center px-4">
          Honest Craft. Eternal Wear.
        </h2>
      </div>
    </section>
  );
}
