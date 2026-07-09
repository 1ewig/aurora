/**
 * Aurora — src/components/story/StoryHero.tsx
 *
 * Story page hero with eyebrow label, large title, and brand pull quote.
 */

"use client";

import { motion } from "framer-motion";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { fadeInUp, staggerContainer } from "@/animations/variants";

/** Story page hero section introducing the brand narrative with a title and pull quote. */
export function StoryHero() {
  return (
    <section className="px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto pt-36 pb-12 md:pt-40 md:pb-20 text-center space-y-6">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={fadeInUp}>
          <EyebrowLabel>The Hand & The Intent</EyebrowLabel>
        </motion.div>
        <motion.h1
          variants={fadeInUp}
          className="font-sans font-black leading-tight tracking-[-0.03em] uppercase text-text-primary text-5xl md:text-7xl lg:text-8xl"
        >
          Our Story.
        </motion.h1>
        <motion.p
          variants={fadeInUp}
          className="text-text-secondary font-display italic text-lg md:text-2xl max-w-2xl mx-auto"
        >
          &ldquo;Clothing should carry intention. Not just in its making, but in the quiet way it asks you to move through the world.&rdquo;
        </motion.p>
      </motion.div>
    </section>
  );
}
