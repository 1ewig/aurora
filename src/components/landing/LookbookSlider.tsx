/**
 * Aurora — src/components/landing/LookbookSlider.tsx
 *
 * Full-screen lookbook carousel with animated slide transitions and dot navigation.
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { useCarousel } from "@/hooks/ui/useCarousel";
import { getStorageUrl } from "@/utils/insforge";
import { useLookbookQuery } from "@/hooks/queries";
import Link from "next/link";

/** Full-screen lookbook carousel with auto-advance, prev/next controls, and dot navigation. */
export function LookbookSlider() {
  const { data: dbSlides = [] } = useLookbookQuery();

  const fallbackSlides = [
    {
      imageUrl: getStorageUrl("/images/lookbook/lookbook-1.webp"),
      altText: "Woman in tailored cream overcoat walking through European cobblestone street at golden hour",
      title: "Look 01 — The Overcoat",
    },
    {
      imageUrl: getStorageUrl("/images/lookbook/lookbook-2.webp"),
      altText: "Female model in all-white minimalist look in brutalist concrete architecture",
      title: "Look 02 — The White Study",
    },
    {
      imageUrl: getStorageUrl("/images/lookbook/lookbook-3.webp"),
      altText: "Model in earth-tone outfit in a mid-century modern interior",
      title: "Look 03 — The Interior",
    },
    {
      imageUrl: getStorageUrl("/images/lookbook/lookbook-4.webp"),
      altText: "Solitary figure in charcoal coat in a misty forest at dawn",
      title: "Look 04 — The Drift",
    },
    {
      imageUrl: getStorageUrl("/images/lookbook/lookbook-5.webp"),
      altText: "Model in structured black blazer on rooftop at blue hour",
      title: "Look 05 — Blue Hour",
    },
    {
      imageUrl: getStorageUrl("/images/lookbook/lookbook-6.webp"),
      altText: "Model in champagne slip dress in gallery-white studio space",
      title: "Look 06 — The Studio",
    },
  ];

  const slides = dbSlides.length > 0 ? dbSlides : fallbackSlides;

  const { current, direction, next, prev, goTo } = useCarousel({
    length: slides.length,
    interval: 6000,
    autoResumeDelay: 10000,
  });


  return (
    <section
      id="lookbook"
      aria-labelledby="lookbook-heading"
      aria-roledescription="carousel"
      className="relative w-full overflow-hidden bg-bg-ink"
    >
      <h2 id="lookbook-heading" className="sr-only">
        Lookbook — Aurora SS 2026
      </h2>

      {/* Slide Container */}
      <div className="relative aspect-[4/5] md:aspect-[16/9]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.figure
            key={current}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
            aria-label={`Look ${current + 1} of ${slides.length}`}
            className="absolute inset-0"
          >
            <OptimizedImage
              src={slides[current].imageUrl}
              alt={slides[current].altText}
              className="w-full h-full object-cover object-center"
            />

            {/* Gradient scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            {/* Caption */}
            <figcaption className="absolute bottom-8 right-8 text-white/70 text-xs tracking-[0.15em] uppercase font-mono">
              {slides[current].title} / {current + 1} of {slides.length}
            </figcaption>

            {/* Watch button overlay */}
            <div className="absolute bottom-8 left-8">
              {slides[current].link ? (
                <Link href={slides[current].link} className="inline-block">
                  <button className="px-5 py-2 rounded-full border border-white/50 text-white text-sm font-medium backdrop-blur-sm bg-white/10 hover:bg-white/20 transition-colors cursor-pointer">
                    Shop Look
                  </button>
                </Link>
              ) : (
                <button className="px-5 py-2 rounded-full border border-white/50 text-white text-sm font-medium backdrop-blur-sm bg-white/10 hover:bg-white/20 transition-colors">
                  Watch
                </button>
              )}
            </div>
          </motion.figure>
        </AnimatePresence>

        {/* Prev/Next Controls */}
        <button
          aria-label="Previous slide"
          onClick={prev}
          className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 border border-white/30 text-white backdrop-blur-sm hover:bg-white/20 transition-colors flex items-center justify-center z-10"
        >
          ←
        </button>
        <button
          aria-label="Next slide"
          onClick={next}
          className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 border border-white/30 text-white backdrop-blur-sm hover:bg-white/20 transition-colors flex items-center justify-center z-10"
        >
          →
        </button>
      </div>

      {/* Dot Indicators */}
      <div
        role="tablist"
        aria-label="Lookbook slides"
        className="flex justify-center gap-2 py-5"
      >
        {slides.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === current}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => goTo(i)}
            className={`h-[3px] rounded-full transition-all duration-300 ${
              i === current
                ? "w-6 bg-accent-primary"
                : "w-2 bg-white/30"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
