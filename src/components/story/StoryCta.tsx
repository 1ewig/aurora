"use client";

import { motion } from "framer-motion";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { Button } from "@/components/ui/Button";

export function StoryCta() {
  return (
    <section className="px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto pt-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-bg-ink text-text-inverted rounded-[2rem] py-16 px-8 md:px-16 text-center space-y-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div
            className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[70%] h-[70%] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(200,168,130,0.4) 0%, transparent 70%)",
            }}
          />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <EyebrowLabel className="text-accent-primary">Explore Aurora</EyebrowLabel>
          <h2 className="font-display font-black text-3xl md:text-5xl tracking-tight leading-tight">
            Curated For The Intended.
          </h2>
          <p className="text-text-muted text-sm md:text-base max-w-md mx-auto leading-relaxed">
            Step inside our complete library of premium outercoats, cashmeres, and accessories designed for longevity.
          </p>
          <div className="pt-4 flex justify-center">
            <a href="/products">
              <Button variant="gold" size="lg" className="px-10">
                Shop the Collection &rarr;
              </Button>
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
