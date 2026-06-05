"use client";

import { motion } from "framer-motion";
import { HydrationWrapper } from "@/app/hydration-wrapper";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/ui/CartDrawer";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { Button } from "@/components/ui/Button";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { fadeInUp, staggerContainer } from "@/animations/variants";

export default function StoryPage() {
  return (
    <HydrationWrapper>
      <ScrollProgress />
      <Navbar />
      <CartDrawer />
      <main id="main-content" tabIndex={-1} className="bg-bg-primary min-h-screen pt-28 pb-32">
        {/* Story Hero */}
        <section className="px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto py-12 md:py-20 text-center space-y-6">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <motion.div variants={fadeInUp}>
              <EyebrowLabel>The Hand & The Intent</EyebrowLabel>
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="font-sans font-black leading-tight tracking-[-0.03em] uppercase text-text-primary text-5xl md:text-7xl lg:text-8xl"
            >
              Our Story.
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-text-secondary font-display italic text-lg md:text-2xl max-w-2xl mx-auto"
            >
              "Clothing should carry intention. Not just in its making, but in the quiet way it asks you to move through the world."
            </motion.p>
          </motion.div>
        </section>

        {/* Philosophy section (mannequin image + copy) */}
        <section className="px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center py-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 relative aspect-[4/5] bg-border-subtle rounded-2xl overflow-hidden shadow-sm"
          >
            <OptimizedImage
              src="/images/designer.webp"
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
              Elena Voss founded Aurora on a simple yet profound premise: every design decision has a ripple effect. We believe that true luxury isn't about excess or ostentation. It is found in precision, in solitude, and in the choices made before a garment ever reaches the atelier floor.
            </motion.p>
            <motion.p variants={fadeInUp} className="text-text-secondary leading-relaxed text-sm md:text-base">
              Each piece starts as a silent draft. We sketch before the world wakes, stripping away the unnecessary until only the essential structure remains. The silhouette must drape cleanly, the shoulders must fall naturally, and the item must adapt to the wearer's life.
            </motion.p>
            <motion.blockquote variants={fadeInUp} className="border-l-2 border-accent-primary pl-6 font-display italic text-lg text-text-primary">
              "We do not create pieces to shout. We create them to belong."
            </motion.blockquote>
          </motion.div>
        </section>

        {/* Parallax Image Breakout */}
        <section className="my-20 relative h-[50vh] md:h-[60vh] bg-border-subtle overflow-hidden">
          <OptimizedImage
            src="/images/lookbook-3.webp"
            alt="Extrafine fabric detail view"
            className="w-full h-full object-cover object-center scale-105"
          />
          <div className="absolute inset-0 bg-bg-ink/25 backdrop-blur-[1px] flex items-center justify-center">
            <h2 className="text-text-inverted font-display font-black text-2xl md:text-5xl uppercase tracking-widest text-center px-4">
              Honest Craft. Eternal Wear.
            </h2>
          </div>
        </section>

        {/* The Atelier & Mills */}
        <section className="px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto py-12">
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
                The Historic Mills.
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-text-secondary leading-relaxed text-sm md:text-base">
                A garment is only as good as the fibers it's made from. We work exclusively with generational family-owned mills in Biella, Italy for our virgin wool blends, and heritage spinning ateliers in Scotland for Mongolian cashmere.
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
                  src="/images/lookbook-1.webp"
                  alt="Wool loom detail"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="relative aspect-[3/4] bg-border-subtle rounded-xl overflow-hidden mt-8">
                <OptimizedImage
                  src="/images/lookbook-2.webp"
                  alt="Cashmere folding"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
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
                    Shop the Collection →
                  </Button>
                </a>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
      <Footer />
    </HydrationWrapper>
  );
}
