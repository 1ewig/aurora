"use client";

import { motion, AnimatePresence } from "framer-motion";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { useCarousel } from "@/hooks/useCarousel";

const slides = [
  {
    src: "/images/lookbook/lookbook-1.webp",
    alt: "Woman in tailored cream overcoat walking through European cobblestone street at golden hour",
    caption: "Look 01 — The Overcoat",
  },
  {
    src: "/images/lookbook/lookbook-2.webp",
    alt: "Female model in all-white minimalist look in brutalist concrete architecture",
    caption: "Look 02 — The White Study",
  },
  {
    src: "/images/lookbook/lookbook-3.webp",
    alt: "Model in earth-tone outfit in a mid-century modern interior",
    caption: "Look 03 — The Interior",
  },
  {
    src: "/images/lookbook/lookbook-4.webp",
    alt: "Solitary figure in charcoal coat in a misty forest at dawn",
    caption: "Look 04 — The Drift",
  },
  {
    src: "/images/lookbook/lookbook-5.webp",
    alt: "Model in structured black blazer on rooftop at blue hour",
    caption: "Look 05 — Blue Hour",
  },
  {
    src: "/images/lookbook/lookbook-6.webp",
    alt: "Model in champagne slip dress in gallery-white studio space",
    caption: "Look 06 — The Studio",
  },
];

export function LookbookSlider() {
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
        Lookbook — Aurora SS 2025
      </h2>

      {/* Slide Container */}
      <div className="relative aspect-[4/5] md:aspect-[16/9] lg:aspect-[21/9]">
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
              src={slides[current].src}
              alt={slides[current].alt}
              className="w-full h-full object-cover object-center"
            />

            {/* Gradient scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            {/* Caption */}
            <figcaption className="absolute bottom-8 right-8 text-white/70 text-xs tracking-[0.15em] uppercase font-mono">
              {slides[current].caption} / {current + 1} of {slides.length}
            </figcaption>

            {/* Watch button overlay */}
            <div className="absolute bottom-8 left-8">
              <button className="px-5 py-2 rounded-full border border-white/50 text-white text-sm font-medium backdrop-blur-sm bg-white/10 hover:bg-white/20 transition-colors">
                Watch
              </button>
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
