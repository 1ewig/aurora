"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { Button } from "@/components/ui/Button";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { staggerContainer, fadeInUp } from "@/animations/variants";

export function DesignerStory() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section
      id="story"
      aria-labelledby="story-heading"
      className="grid grid-cols-1 lg:grid-cols-2 min-h-[90vh] bg-[#F7F7F5]"
      ref={ref}
    >
      {/* Image Column */}
      <div className="relative overflow-hidden aspect-square lg:aspect-auto lg:h-auto">
        <motion.div
          className="absolute inset-0 w-full h-full"
          style={{ y: imageY }}
        >
          <OptimizedImage
            src="/images/designer.jpg"
            alt="Aurora's creative director photographed in her design studio, examining fabric swatches"
            className="w-full h-full object-cover object-top"
            loading="eager"
          />
        </motion.div>
        {/* Warm color overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "rgba(200,168,130,0.08)",
            mixBlendMode: "multiply",
          }}
        />
      </div>

      {/* Text Column */}
      <motion.div
        className="flex flex-col justify-center px-8 md:px-12 xl:px-20 py-20 bg-[#F7F7F5]"
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
          className="font-sans font-black leading-tight tracking-[-0.02em] mt-5 text-[#111111]"
          style={{ fontSize: "clamp(2rem, 4vw, 4.5rem)" }}
        >
          Every Stitch
          <br />
          <span style={{ color: "#C8A882" }}>Is A Decision.</span>
        </motion.h2>

        <motion.p
          variants={fadeInUp}
          className="text-[#6B6B6B] leading-relaxed mt-8 max-w-lg text-base"
        >
          Aurora was born from a single conviction: that clothing should carry
          intention. Not just in its making, but in the quiet way it asks you
          to move through the world.
        </motion.p>

        <motion.p
          variants={fadeInUp}
          className="text-[#6B6B6B] leading-relaxed mt-4 max-w-lg text-base"
        >
          Each collection begins in silence — sketched before dawn, refined
          over months. The result is never rushed. The result is never obvious.
          It simply is what it needs to be.
        </motion.p>

        <motion.p
          variants={fadeInUp}
          className="text-[#6B6B6B] leading-relaxed mt-4 max-w-lg text-base"
        >
          We work with mills that have operated for generations. We choose
          materials that age with grace. And we produce in quantities small
          enough to mean something.
        </motion.p>

        <motion.div
          variants={fadeInUp}
          className="mt-10 border-t border-[#E8E8E4] pt-8"
        >
          <p className="font-display text-lg text-[#111111] italic">
            — Elena Voss
          </p>
          <p className="text-[#ABABAB] text-sm mt-1">
            Founder & Creative Director, Aurora
          </p>
        </motion.div>

        <motion.div variants={fadeInUp} className="mt-8">
          <Button variant="ghost">Read The Full Story →</Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
