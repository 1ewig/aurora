/**
 * Aurora — src/components/landing/PressClientNotes.tsx
 *
 * Press mentions and verified client reviews section, replacing the legacy testimonials component
 * with a high-end luxury editorial style.
 */

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { fadeInUp, scaleIn, staggerContainer } from "@/animations/variants";

interface PressMention {
  publication: string;
  quote: string;
}

interface ClientNote {
  quote: string;
  client: string;
  location: string;
  productName: string;
  productSlug: string;
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

const clientNotes: ClientNote[] = [
  {
    quote: "The Ivory Wool Overcoat has a drape that is unmatched. It feels substantial yet incredibly soft. A lifetime piece.",
    client: "Sarah K.",
    location: "New York",
    productName: "Ivory Wool Overcoat",
    productSlug: "ivory-wool-overcoat",
  },
  {
    quote: "Deliberate scarcity makes each purchase feel personal. The linen blazer has become my summer second skin.",
    client: "Julian M.",
    location: "London",
    productName: "Ecru Linen Blazer",
    productSlug: "ecru-linen-blazer",
  },
  {
    quote: "Spun in Scotland and knitted to perfection. The camel cashmere turtleneck is exceptionally warm and cloud-soft.",
    client: "Sofia R.",
    location: "Milan",
    productName: "Camel Cashmere Turtleneck",
    productSlug: "camel-cashmere-turtleneck",
  },
];

export function PressClientNotes() {
  return (
    <section
      id="press-notes"
      aria-labelledby="press-notes-heading"
      className="py-32 bg-white overflow-hidden border-t border-border-subtle"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
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
          className="grid grid-cols-1 lg:grid-cols-3 gap-12 pb-20 border-b border-border-subtle"
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

        {/* Client Notes Section */}
        <div className="mt-20">
          <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-text-muted text-center mb-12">
            Verified Client Observations
          </h3>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10% 0px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16"
          >
            {clientNotes.map((note, idx) => (
              <motion.article
                key={idx}
                variants={scaleIn}
                className="flex flex-col h-full bg-bg-secondary p-8 rounded-[24px] border border-border-subtle"
              >
                <blockquote className="flex-grow flex flex-col">
                  <p className="text-text-primary text-sm md:text-base font-light leading-relaxed mb-8 italic flex-grow">
                    “ {note.quote} ”
                  </p>
                  
                  <footer className="mt-auto pt-6 border-t border-border-subtle/50 flex flex-col gap-2">
                    <div className="flex justify-between items-baseline">
                      <cite className="font-semibold text-text-primary not-italic text-sm">
                        {note.client}
                      </cite>
                      <span className="text-text-muted text-xs font-light">
                        {note.location}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                        Verified Purchase
                      </span>
                      <Link 
                        href={`/products/${note.productSlug}`}
                        className="text-[10px] font-mono uppercase tracking-wider text-accent-primary hover:underline"
                      >
                        {note.productName} →
                      </Link>
                    </div>
                  </footer>
                </blockquote>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
