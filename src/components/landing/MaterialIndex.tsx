/**
 * Aurora — src/components/landing/MaterialIndex.tsx
 *
 * Fabric & Materials index page section showcasing high-end luxury textiles with macro close-ups.
 */

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { fadeInUp, scaleIn, staggerContainer } from "@/animations/variants";

interface MaterialItem {
  name: string;
  source: string;
  description: string;
  image: string;
  properties: string[];
}

const materials: MaterialItem[] = [
  {
    name: "Italian Wool",
    source: "Biella, Italy",
    description: "Sourced from historic, solar-powered family mills, offering structural weight, natural resilience, and deep heat retention.",
    image: "/images/materials/wool-macro.png",
    properties: ["100% Virgin Wool", "Naturally Repellent", "Zero Synthetics"],
  },
  {
    name: "Grade-A Cashmere",
    source: "Mongolian Highlands / Scottish Mills",
    description: "Combines raw Mongolian undercoat down with heritage Scottish spinning, achieving cloud-like softness and high thermal efficiency.",
    image: "/images/materials/cashmere-macro.png",
    properties: ["Organic Spun", "12-Gauge Density", "Exceptionally Soft"],
  },
  {
    name: "Mulberry Silk",
    source: "Lyon, France",
    description: "Heavyweight 19mm mulberry silk cut on the bias to move fluidly like liquid. Reflects ambient light with a refined, deep luster.",
    image: "/images/materials/silk-macro.png",
    properties: ["100% Mulberry Silk", "19 Momme Weight", "Bias-cut Fluidity"],
  },
];

export function MaterialIndex() {
  return (
    <section
      id="materials-index"
      aria-labelledby="materials-heading"
      className="py-20 px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto bg-bg-primary"
    >
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mb-16 text-center md:text-left md:flex md:items-end md:justify-between"
      >
        <div>
          <EyebrowLabel>Tactile Luxury</EyebrowLabel>
          <h2
            id="materials-heading"
            className="font-sans font-black leading-tight tracking-[-0.02em] mt-4 text-text-primary"
            style={{ fontSize: "clamp(2.5rem, 5vw, 5.5rem)" }}
          >
            The Fabric Index.
          </h2>
        </div>
        <p className="text-text-secondary font-light text-sm md:text-base max-w-sm mt-4 md:mt-0 leading-relaxed text-center md:text-left">
          We justify our pricing through touch and longevity. Every piece is defined by the noble fiber from which it was spun.
        </p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-10% 0px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {materials.map((material) => (
          <motion.article
            key={material.name}
            variants={scaleIn}
            className="group flex flex-col h-full bg-white rounded-[24px] overflow-hidden border border-border-subtle hover:shadow-lg transition-[box-shadow,border-color] duration-300"
          >
            {/* Macro Image Wrapper */}
            <div className="relative aspect-square overflow-hidden bg-bg-secondary">
              <Image
                src={material.image}
                alt={`Macro texture close-up of ${material.name}`}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                quality={90}
              />
              <div className="absolute inset-0 bg-black/5 group-hover:opacity-0 transition-opacity duration-300" />
            </div>

            {/* Description Card */}
            <div className="p-6 flex flex-col flex-grow">
              <div className="mb-3">
                <span className="text-[10px] font-mono text-accent-primary uppercase tracking-widest block mb-1">
                  {material.source}
                </span>
                <h3 className="font-sans font-black text-xl text-text-primary tracking-tight">
                  {material.name}
                </h3>
              </div>
              <p className="text-text-secondary text-sm font-light leading-relaxed mb-6">
                {material.description}
              </p>
              <div className="mt-auto pt-4 border-t border-border-subtle">
                <ul className="flex flex-wrap gap-2">
                  {material.properties.map((prop) => (
                    <li
                      key={prop}
                      className="text-[10px] font-mono bg-bg-secondary text-text-muted px-2.5 py-1 rounded-full"
                    >
                      {prop}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}
