/**
 * Aurora — src/components/landing/MarqueeBar.tsx
 *
 * Infinite horizontal scrolling marquee bar showcasing brand keywords.
 */

"use client";

import { motion } from "framer-motion";

const marqueeItems = [
  "Aurora",
  "SS 2026",
  "Designed in Solitude",
  "Limited Editions",
  "Crafted with Intention",
  "Worn Thoughtfully",
  "New Collection",
  "Free Returns",
];

/** Infinite-scroll marquee bar animating brand keywords horizontally. */
export function MarqueeBar() {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className="overflow-hidden bg-bg-ink py-5 cursor-default group"
    >
      <div className="flex whitespace-nowrap group-hover:[animation-play-state:paused]">
        <motion.div
          className="flex whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {[...Array(2)].map((_, i) => (
            <span
              key={i}
              className="flex items-center text-sm font-medium tracking-[0.12em] uppercase text-text-inverted"
            >
              {marqueeItems.map((item, j) => (
                <span key={`${i}-${j}`} className="flex items-center">
                  <span className="px-8 inline-block">{item}</span>
                  <span className="text-accent-primary text-base">✦</span>
                </span>
              ))}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
