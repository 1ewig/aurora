/**
 * Aurora — src/components/landing/DesignerStory.tsx
 *
 * Designer story section with parallax image and brand narrative about the founder.
 */

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import Image from "next/image";
import { staggerContainer, fadeInUp } from "@/animations/variants";

interface DesignerStoryProps {
  imageUrl?: string;
}

/** Designer story section showcasing the founder and brand philosophy with parallax scrolling imagery. */
export function DesignerStory({ imageUrl }: DesignerStoryProps) {
  return (
    <section
      id="story"
      aria-labelledby="story-heading"
      className="grid grid-cols-1 lg:grid-cols-2 min-h-[90vh] bg-bg-primary"
    >
      {/* Text Column */}
      <motion.div
        className="flex flex-col justify-center items-center lg:items-start text-center lg:text-left px-8 md:px-12 xl:px-20 py-20 bg-bg-primary lg:order-first"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-15% 0px" }}
      >
        <motion.div variants={fadeInUp}>
          <EyebrowLabel>The Hand Behind Aurora</EyebrowLabel>
        </motion.div>

        <motion.h2
          id="story-heading"
          variants={fadeInUp}
          className="font-sans font-black leading-tight tracking-[-0.02em] mt-5 text-text-primary"
          style={{ fontSize: "clamp(2rem, 4vw, 4.5rem)" }}
        >
          Every Stitch
          <br />
          <span className="text-accent-primary">Is A Decision.</span>
        </motion.h2>

        <motion.p
          variants={fadeInUp}
          className="text-text-secondary leading-relaxed mt-8 max-w-lg text-base font-light"
        >
          Aurora was born from a single conviction: that clothing should carry
          intention. Not just in its making, but in the quiet way it asks you
          to move through the world.
        </motion.p>

        <motion.p
          variants={fadeInUp}
          className="text-text-secondary leading-relaxed mt-4 max-w-lg text-base font-light"
        >
          Each collection begins in silence — sketched before dawn, refined
          over months. We partner with heritage mills that have operated for
          generations, choosing noble materials that age with grace, produced
          in quantities small enough to remain truly yours.
        </motion.p>

        <motion.div
          variants={fadeInUp}
          className="mt-10 border-t border-border-subtle pt-8 w-full"
        >
          <p className="font-display text-lg text-text-primary italic">
            — Elena Voss
          </p>
          <p className="text-text-muted text-sm mt-1">
            Founder & Creative Director, Aurora
          </p>
        </motion.div>
      </motion.div>

      {/* Image Column */}
      <div className="relative overflow-hidden aspect-square lg:aspect-auto lg:h-auto lg:order-last min-h-[400px] lg:min-h-0">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt="Aurora's creative director photographed in her design studio, examining fabric swatches"
              fill
              quality={85}
              sizes="(max-width: 1023px) 100vw, 50vw"
              className="w-full h-full object-cover object-top"
              loading="lazy"
            />
          )}
        </div>
        {/* Warm color overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "rgba(200,168,130,0.08)",
            mixBlendMode: "multiply",
          }}
        />
        {/* Read The Full Story button overlay on bottom right */}
        <div className="absolute bottom-8 right-8 z-20">
          <Link href="/story">
            <button className="px-5 py-2 rounded-full border border-white/50 text-white text-sm font-medium backdrop-blur-sm bg-white/10 hover:bg-white/20 transition-colors cursor-pointer">
              Read The Full Story →
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
