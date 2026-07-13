/**
 * Aurora — src/components/story/PhilosophySection.tsx
 *
 * Brand philosophy section with editorial image and core beliefs narrative.
 */

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { fadeInUp, staggerContainer } from "@/animations/variants";
import type { EditorialItem } from "@/data/editorial";

interface PhilosophySectionProps {
  content?: EditorialItem;
}

/** Brand philosophy section presenting the founding conviction, design ethos, and pull quote. */
export function PhilosophySection({ content }: PhilosophySectionProps) {
  const imageUrl = content?.imageUrl;
  const altText = content?.altText;
  const title = content?.title;
  const description = content?.description;

  return (
    <section className="px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center py-16">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="lg:col-span-6 relative aspect-[4/5] bg-border-subtle rounded-2xl overflow-hidden shadow-sm"
      >
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={altText ?? ""}
            fill
            quality={85}
            sizes="(max-width: 1023px) 100vw, 45vw"
            className="w-full h-full object-cover object-top"
            loading="lazy"
          />
        )}
      </motion.div>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-10% 0px" }}
        className="lg:col-span-6 space-y-6"
      >
        <motion.div variants={fadeInUp}>
          <h2 className="font-display font-black text-3xl md:text-4xl tracking-tight text-text-primary">
            {title}
          </h2>
        </motion.div>
        <motion.p variants={fadeInUp} className="text-text-secondary leading-relaxed text-sm md:text-base">
          {description}
        </motion.p>
        <motion.p variants={fadeInUp} className="text-text-secondary leading-relaxed text-sm md:text-base">
          Each piece starts as a silent draft. We sketch before the world wakes, stripping away the unnecessary until only the essential structure remains. The silhouette must drape cleanly, the shoulders must fall naturally, and the item must adapt to the wearer&apos;s life.
        </motion.p>
        <motion.blockquote variants={fadeInUp} className="border-l-2 border-accent-primary pl-6 font-display italic text-lg text-text-primary">
          &ldquo;We do not create pieces to shout. We create them to belong.&rdquo;
        </motion.blockquote>
      </motion.div>
    </section>
  );
}
