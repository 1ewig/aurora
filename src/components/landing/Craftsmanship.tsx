/**
 * Aurora — src/components/landing/Craftsmanship.tsx
 *
 * Craftsmanship & Sourcing Transparency landing page section.
 * Features a two-column layout with trust details on the left and an editorial craftsmanship image on the right.
 */

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
        {/* Left Column: Title + 3 Cards */}
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <EyebrowLabel>Proven Quality</EyebrowLabel>
            <h2
              id="craftsmanship-heading"
              className="font-sans font-black leading-tight tracking-[-0.02em] mt-4 mb-12 text-text-primary"
              style={{ fontSize: "clamp(2.5rem, 4.5vw, 4.5rem)" }}
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
            className="flex flex-col gap-10 mt-8"
          >
            {transparencyItems.map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="flex flex-col justify-start border-l-2 border-accent-primary/20 pl-6 hover:border-accent-primary transition-colors duration-300"
              >
                <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-accent-primary mb-2 block">
                  {item.label}
                </span>
                <h3 className="font-sans font-black text-lg text-text-primary mb-3 tracking-wide">
                  {item.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed font-light max-w-xl">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Right Column: Visual Close-up */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="lg:col-span-5 relative aspect-[3/4] w-full max-w-md mx-auto lg:max-w-none rounded-[32px] overflow-hidden"
          style={{
            boxShadow: "0 24px 70px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.08)"
          }}
        >
          <Image
            src="/images/materials/craftsmanship-detail.png"
            alt="Artisan hands carefully hand-stitching the notch lapel of a tailored coat in a luxury studio workshop"
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover object-center transition-transform duration-1000 hover:scale-105"
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
}
