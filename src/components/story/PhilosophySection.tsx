"use client";

import { motion } from "framer-motion";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { fadeInUp, staggerContainer } from "@/animations/variants";
import { getStorageUrl } from "@/utils/insforge";

export function PhilosophySection() {
  return (
    <section className="px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center py-12">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="lg:col-span-6 relative aspect-[4/5] bg-border-subtle rounded-2xl overflow-hidden shadow-sm"
      >
        <OptimizedImage
          src={getStorageUrl("/images/editorial/designer.webp")}
          alt="Creative director sketching designs in studio"
          className="w-full h-full object-cover object-top"
          loading="eager"
        />
      </motion.div>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-10% 0px" }}
        className="lg:col-span-6 space-y-6 lg:pl-6"
      >
        <motion.div variants={fadeInUp}>
          <h2 className="font-display font-black text-3xl md:text-4xl tracking-tight text-text-primary">
            The Conviction
          </h2>
        </motion.div>
        <motion.p variants={fadeInUp} className="text-text-secondary leading-relaxed text-sm md:text-base">
          Elena Voss founded Aurora on a simple yet profound premise: every design decision has a ripple effect. We believe that true luxury isn&apos;t about excess or ostentation. It is found in precision, in solitude, and in the choices made before a garment ever reaches the atelier floor.
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
