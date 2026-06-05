"use client";

import { useScroll, useTransform, motion } from "framer-motion";
import { CascadeCards } from "@/components/ui/CascadeCards";

import { Button } from "@/components/ui/Button";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { heroProducts } from "@/data/products";

export function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, -100]);

  return (
    <section
      id="hero"
      aria-labelledby="hero-headline"
      className="relative flex flex-col items-center justify-center min-h-screen pt-20 pb-16 overflow-hidden bg-[#F7F7F5]"
    >
      {/* Ambient background gradient blobs */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[60vh] rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(ellipse, rgba(200,168,130,0.35) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[40vw] h-[40vh] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(ellipse, rgba(200,168,130,0.4) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      <motion.div
        style={{ y }}
        className="relative z-10 flex flex-col items-center text-center w-full max-w-6xl mx-auto px-6"
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <EyebrowLabel>SS 2025 Collection</EyebrowLabel>
        </motion.div>

        {/* H1 Headline */}
        <h1
          id="hero-headline"
          className="font-sans font-black leading-none tracking-[-0.04em] mt-6 text-[#111111] w-full"
          style={{ fontSize: "clamp(3rem, 9vw, 9rem)" }}
        >
          <AnimatedText delay={0.2}>
            <span className="block">Wear What</span>
          </AnimatedText>
          <AnimatedText delay={0.35}>
            <span className="block">The World</span>
          </AnimatedText>
          <AnimatedText delay={0.5}>
            <span className="block" style={{ color: "#C8A882" }}>
              Whispers.
            </span>
          </AnimatedText>
        </h1>

        {/* Cascade Cards — positioned relative to create space */}
        <div className="relative w-full mt-12 md:mt-14">
          <CascadeCards products={heroProducts} />
        </div>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-[#6B6B6B] text-base md:text-lg font-light max-w-sm md:max-w-md mt-10 md:mt-8 leading-relaxed"
        >
          Singular pieces for the considered wardrobe. Designed in solitude.
          Worn with intention.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-col sm:flex-row gap-4 mt-8"
        >
          <Button
            variant="filled"
            size="lg"
            onClick={() => {
              document
                .getElementById("collection")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Shop the Collection
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={() => {
              document
                .getElementById("story")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Read the Story →
          </Button>
        </motion.div>
      </motion.div>


    </section>
  );
}
