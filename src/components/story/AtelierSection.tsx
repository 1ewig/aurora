/**
 * Aurora — src/components/story/AtelierSection.tsx
 *
 * Atelier story section with editorial imagery and brand narrative about craftsmanship and mills.
 */

"use client";

import { motion } from "framer-motion";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import Image from "next/image";
import { fadeInUp, staggerContainer } from "@/animations/variants";
import type { EditorialItem } from "@/data/editorial";

interface AtelierSectionProps {
  loomContent?: EditorialItem;
  foldingContent?: EditorialItem;
}

/** Atelier section detailing the brand's partnerships with historic family-owned mills. */
export function AtelierSection({ loomContent, foldingContent }: AtelierSectionProps) {
  const loomImg = loomContent?.imageUrl;
  const loomAlt = loomContent?.altText;
  const loomTitle = loomContent?.title;
  const loomDesc = loomContent?.description;
  const foldingImg = foldingContent?.imageUrl;
  const foldingAlt = foldingContent?.altText;

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
            {loomImg && (
              <Image
                src={loomImg}
                alt={loomAlt ?? ""}
                fill
                quality={85}
                sizes="(max-width: 1024px) 50vw, 30vw"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="relative aspect-[3/4] bg-border-subtle rounded-xl overflow-hidden mt-8">
            {foldingImg && (
              <Image
                src={foldingImg}
                alt={foldingAlt ?? ""}
                fill
                quality={85}
                sizes="(max-width: 1024px) 50vw, 30vw"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
