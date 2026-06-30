/**
 * Aurora — src/components/story/AtelierSection.tsx
 *
 * Atelier story section with editorial imagery and brand narrative about craftsmanship and mills.
 */

"use client";

import { motion } from "framer-motion";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { fadeInUp, staggerContainer } from "@/animations/variants";
import { getStorageUrl } from "@/utils/insforge";
import type { EditorialItem } from "@/data/editorial";

interface AtelierSectionProps {
  loomContent?: EditorialItem;
  foldingContent?: EditorialItem;
}

/** Atelier section detailing the brand's partnerships with historic family-owned mills. */
export function AtelierSection({ loomContent, foldingContent }: AtelierSectionProps) {
  const loomImg = loomContent?.imageUrl || getStorageUrl("/images/editorial/loom.webp");
  const loomAlt = loomContent?.altText || "Wool loom detail";
  const loomTitle = loomContent?.title || "The Historic Mills";
  const loomDesc = loomContent?.description || "A garment is only as good as the fibers it's made from. We work exclusively with generational family-owned mills in Biella, Italy for our virgin wool blends, and heritage spinning ateliers in Scotland for Mongolian cashmere.";

  const foldingImg = foldingContent?.imageUrl || getStorageUrl("/images/editorial/folding.webp");
  const foldingAlt = foldingContent?.altText || "Cashmere folding";

  return (
    <section className="px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="lg:col-span-5 space-y-6"
        >
          <motion.div variants={fadeInUp}>
            <EyebrowLabel>Origin Matters</EyebrowLabel>
          </motion.div>
          <motion.h2 variants={fadeInUp} className="font-sans font-black text-3xl md:text-4xl tracking-tight text-text-primary uppercase">
            {loomTitle}.
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-text-secondary leading-relaxed text-sm md:text-base">
            {loomDesc}
          </motion.p>
          <motion.p variants={fadeInUp} className="text-text-secondary leading-relaxed text-sm md:text-base">
            These partnerships are built on transparency, fair practice, and a mutual obsession with quality. By selecting fibers that are spun to retain their natural resiliency, our clothing grows softer with age and resists wear.
          </motion.p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-7 grid grid-cols-2 gap-4 md:gap-6 w-full"
        >
          <div className="relative aspect-[3/4] bg-border-subtle rounded-xl overflow-hidden">
            <OptimizedImage
              src={loomImg}
              alt={loomAlt}
              className="w-full h-full object-cover"
              sizes="(max-width: 1024px) 50vw, 30vw"
            />
          </div>
          <div className="relative aspect-[3/4] bg-border-subtle rounded-xl overflow-hidden mt-8">
            <OptimizedImage
              src={foldingImg}
              alt={foldingAlt}
              className="w-full h-full object-cover"
              sizes="(max-width: 1024px) 50vw, 30vw"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
