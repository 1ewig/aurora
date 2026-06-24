/**
 * Aurora — src/components/landing/LookbookSlider.tsx
 *
 * Full-screen lookbook carousel with Embla, autoplay, prev/next, and dot navigation.
 */

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { getStorageUrl } from "@/utils/insforge";
import { useLookbookQuery } from "@/hooks/queries";
import Link from "next/link";

/** Full-screen lookbook carousel with auto-advance and dot navigation. */
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
  ];

  const slides = dbSlides.length > 0 ? dbSlides.slice(0, 5) : fallbackSlides;

  const autoplay = useMemo(
    () => Autoplay({ delay: 6000, stopOnInteraction: true }),
    []
  );

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [autoplay]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scheduleResume = useCallback(() => {
    clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      autoplay.play();
    }, 10000);
  }, [autoplay]);

  useEffect(() => {
    return () => clearTimeout(resumeTimerRef.current);
  }, []);

  const scrollTo = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
      scheduleResume();
    },
    [emblaApi, scheduleResume]
  );

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

      <div className="relative aspect-[4/5] md:aspect-[16/9]">
        {/* Embla viewport */}
        <div ref={emblaRef} className="overflow-hidden h-full">
          <div className="flex h-full">
            {slides.map((slide, i) => (
              <figure
                key={i}
                className="relative flex-[0_0_100%] min-w-0 h-full"
                aria-label={`Look ${i + 1} of ${slides.length}`}
              >
                <OptimizedImage
                  src={slide.imageUrl}
                  alt={slide.altText}
                  className="w-full h-full object-cover object-center"
                />

                {/* Gradient scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                {/* Caption */}
                <figcaption className="absolute bottom-8 right-8 text-white/70 text-xs tracking-[0.15em] uppercase font-mono">
                  {slide.title ?? `Look 0${i + 1}`} / {i + 1} of {slides.length}
                </figcaption>

                {/* Watch/shop button overlay */}
                <div className="absolute bottom-16 right-8">
                  {slide.link ? (
                    <Link href={slide.link} className="inline-block">
                      <button className="px-5 py-2 rounded-full border border-white/50 text-white text-sm font-medium backdrop-blur-sm bg-white/10 hover:bg-white/20 transition-colors cursor-pointer">
                        Shop Now
                      </button>
                    </Link>
                  ) : (
                    <button className="px-5 py-2 rounded-full border border-white/50 text-white text-sm font-medium backdrop-blur-sm bg-white/10 hover:bg-white/20 transition-colors">
                      Watch
                    </button>
                  )}
                </div>
              </figure>
            ))}
          </div>
        </div>

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
            aria-selected={i === selectedIndex}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => scrollTo(i)}
            className={`h-[3px] rounded-full transition-all duration-300 ${
              i === selectedIndex
                ? "w-6 bg-accent-primary"
                : "w-2 bg-white/30"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
