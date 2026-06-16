/**
 * Aurora — src/components/landing/Testimonials.tsx
 *
 * Customer testimonial carousel with quote rotations and navigation controls.
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { useCarousel } from "@/hooks/ui/useCarousel";
import { testimonials } from "@/data/testimonials";

/** Testimonial carousel displaying customer quotes with auto-advance, prev/next, and dot navigation. */
export function Testimonials() {
  const { current, next, prev, goTo } = useCarousel({
    length: testimonials.length,
    autoResumeDelay: 12000,
  });

  const t = testimonials[current];

  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      aria-roledescription="testimonial carousel"
      className="py-32 bg-white"
    >
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <EyebrowLabel>Worn &amp; Loved</EyebrowLabel>
        </motion.div>

        <h2 id="testimonials-heading" className="sr-only">
          Customer Testimonials
        </h2>

        <AnimatePresence mode="wait">
          <motion.blockquote
            key={t.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            cite={t.source}
            className="mt-12"
          >
            <p
              className="font-display italic leading-tight tracking-tight text-text-primary"
              style={{ fontSize: "clamp(1.6rem, 3.5vw, 3.5rem)" }}
            >
              ❝ {t.quote} ❞
            </p>

            <footer className="mt-10 flex flex-col items-center gap-3">
              {/* Avatar with initials */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                style={{ backgroundColor: t.color }}
              >
                {t.initials}
              </div>
              <div>
                <cite className="font-medium text-text-primary not-italic block text-sm">
                  {t.name}, {t.location}
                </cite>
                <span className="text-text-muted text-xs">
                  Verified Customer
                </span>
              </div>
            </footer>
          </motion.blockquote>
        </AnimatePresence>

        {/* Controls */}
        <div
          className="flex items-center justify-center gap-6 mt-12"
          role="group"
          aria-label="Testimonial controls"
        >
          <button
            aria-label="Previous testimonial"
            onClick={prev}
            className="w-9 h-9 rounded-full border border-border-subtle flex items-center justify-center hover:border-text-primary transition-colors text-sm"
          >
            ←
          </button>

          {/* Dots */}
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to testimonial ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-[3px] rounded-full transition-all duration-300 ${
                  i === current ? "w-6 bg-text-primary" : "w-2 bg-border-medium"
                }`}
              />
            ))}
          </div>

          <button
            aria-label="Next testimonial"
            onClick={next}
            className="w-9 h-9 rounded-full border border-border-subtle flex items-center justify-center hover:border-text-primary transition-colors text-sm"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
