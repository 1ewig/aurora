/**
 * Aurora — src/components/landing/PressClientNotes.tsx
 *
 * Press mentions and verified client reviews section, replacing the legacy testimonials component
 * with a high-end luxury editorial style.
 */

"use client";

import { motion } from "framer-motion";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { fadeInUp, scaleIn, staggerContainer } from "@/animations/variants";

interface PressMention {
  publication: string;
  quote: string;
}

const pressMentions: PressMention[] = [
  {
    publication: "MONO Journal",
    quote: "A masterclass in quiet restraint. Aurora is defining the modern silhouette.",
  },
  {
    publication: "Atelier Review",
    quote: "Exceptional materials sourced with transparency, tailored to perfection.",
  },
  {
    publication: "The Wardrobe Index",
    quote: "In a world of excessive noise, Aurora represents a welcome silence.",
  },
];

export function PressClientNotes() {
  return (
    <section
      id="press-notes"
      aria-labelledby="press-notes-heading"
      className="py-20 bg-white overflow-hidden border-t border-border-subtle"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
        
        {/* Section Header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <EyebrowLabel>Credibility &amp; Proof</EyebrowLabel>
          <h2 id="press-notes-heading" className="sr-only">
            Press Mentions and Client Reviews
          </h2>
          <p
            className="font-sans font-black leading-tight tracking-[-0.02em] mt-4 text-text-primary text-center"
            style={{ fontSize: "clamp(2rem, 4.5vw, 4.5rem)" }}
          >
            Seen In &amp; Client Notes.
          </p>
        </motion.div>

        {/* Press Mentions Strip */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10% 0px" }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-12"
        >
          {pressMentions.map((press, idx) => (
            <motion.div
              key={idx}
              variants={scaleIn}
              className="text-center lg:text-left px-4 lg:px-0 flex flex-col justify-between"
            >
              <p className="font-display italic text-lg md:text-xl text-text-secondary leading-relaxed mb-6">
                “ {press.quote} ”
              </p>
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-accent-primary">
                {press.publication}
              </span>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
