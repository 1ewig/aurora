import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { testimonials } from "@/data/testimonials";

export function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [auto, setAuto] = useState(true);

  const next = () => {
    setAuto(false);
    setCurrent((c) => (c + 1) % testimonials.length);
  };

  const prev = () => {
    setAuto(false);
    setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    if (!auto) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [auto]);

  useEffect(() => {
    if (!auto) {
      const t = setTimeout(() => setAuto(true), 12000);
      return () => clearTimeout(t);
    }
  }, [auto]);

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
              className="italic leading-tight tracking-tight text-[#111111]"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(1.6rem, 3.5vw, 3.5rem)",
              }}
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
                <cite className="font-medium text-[#111111] not-italic block text-sm">
                  {t.name}, {t.location}
                </cite>
                <span className="text-[#ABABAB] text-xs">
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
            className="w-9 h-9 rounded-full border border-[#E8E8E4] flex items-center justify-center hover:border-[#111111] transition-colors text-sm"
          >
            ←
          </button>

          {/* Dots */}
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to testimonial ${i + 1}`}
                onClick={() => { setAuto(false); setCurrent(i); }}
                className={`h-[3px] rounded-full transition-all duration-300 ${
                  i === current ? "w-6 bg-[#111111]" : "w-2 bg-[#D0CFC9]"
                }`}
              />
            ))}
          </div>

          <button
            aria-label="Next testimonial"
            onClick={next}
            className="w-9 h-9 rounded-full border border-[#E8E8E4] flex items-center justify-center hover:border-[#111111] transition-colors text-sm"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
