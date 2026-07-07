/**
 * Aurora — src/components/landing/Craftsmanship.tsx
 *
 * Craftsmanship & Sourcing Transparency landing page section.
 */

"use client";

import { motion } from "framer-motion";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { staggerContainer, fadeInUp } from "@/animations/variants";

export function Craftsmanship() {
  const transparencyItems = [
    {
      title: "Generational Materials",
      description: "We source our raw materials from historic, solar-powered family mills in Biella, Italy and heritage spinning ateliers in Scotland, prioritizing natural resilience and grace over time.",
      label: "Materials"
    },
    {
      title: "Artisanal Construction",
      description: "Every coat and blazer is tailored in small Italian and Portuguese ateliers, featuring bound inside seams, hand-rolled hems, and heavy-duty reinforced pocket stitching.",
      label: "Artisanry"
    },
    {
      title: "Deliberate Scarcity",
      description: "We produce only 50 to 100 units of each style to eliminate textile excess. Scarcity is our design standard — meaning your piece remains uniquely yours.",
      label: "Scarcity"
    }
  ];

  return (
    <section
      id="craftsmanship"
      aria-labelledby="craftsmanship-heading"
      className="py-32 px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto border-t border-border-subtle bg-bg-primary"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <EyebrowLabel>Proven Quality</EyebrowLabel>
        <h2
          id="craftsmanship-heading"
          className="font-sans font-black leading-tight tracking-[-0.02em] mt-4 mb-16 text-text-primary"
          style={{ fontSize: "clamp(2.5rem, 5vw, 5.5rem)" }}
        >
          Sourcing &amp; Construction
          <br />
          <span className="text-accent-primary">Without Compromise.</span>
        </h2>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-10% 0px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 mt-8"
      >
        {transparencyItems.map((item, index) => (
          <motion.div
            key={index}
            variants={fadeInUp}
            className="flex flex-col justify-start"
          >
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent-primary mb-3 block">
              {item.label}
            </span>
            <h3 className="font-sans font-black text-xl text-text-primary mb-4 tracking-wide">
              {item.title}
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed font-light">
              {item.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
