"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HydrationWrapper } from "@/app/hydration-wrapper";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/ui/CartDrawer";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { ProductCard } from "@/components/ui/ProductCard";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { heroProducts, allProducts, categories } from "@/data/products";
import { cardEnter } from "@/animations/variants";
import { springSmooth } from "@/animations/transitions";

const aspectRatios = ["aspect-[3/4]", "aspect-[4/5]", "aspect-[2/3]", "aspect-[3/4]"];

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Combine unique products for complete shop catalog
  const combinedProducts = useMemo(() => {
    return [...heroProducts, ...allProducts];
  }, []);

  const filtered = useMemo(() => {
    if (activeCategory === "All") {
      return combinedProducts;
    }
    return combinedProducts.filter((p) => p.category === activeCategory);
  }, [activeCategory, combinedProducts]);

  const allCategories = ["All", ...categories];

  return (
    <HydrationWrapper>
      <ScrollProgress />
      <Navbar />
      <CartDrawer />
      <main id="main-content" tabIndex={-1} className="bg-bg-primary min-h-screen pt-28 pb-32">
        <div className="px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <EyebrowLabel>Atelier Catalog</EyebrowLabel>
              <h1
                id="products-heading"
                className="font-sans font-black leading-tight tracking-[-0.02em] mt-4 text-text-primary uppercase"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
              >
                Shop All
                <br />
                Pieces.
              </h1>
            </motion.div>

            {/* Filter Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              role="group"
              aria-label="Filter catalog"
              className="flex flex-wrap gap-2 md:gap-3"
            >
              {allCategories.map((category) => (
                <motion.button
                  key={category}
                  aria-pressed={activeCategory === category}
                  onClick={() => setActiveCategory(category)}
                  layout
                  transition={springSmooth}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider border transition-colors duration-300 cursor-pointer ${
                    activeCategory === category
                      ? "bg-bg-ink text-text-inverted border-bg-ink"
                      : "bg-transparent text-text-secondary border-border-medium hover:border-text-primary hover:text-text-primary"
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </motion.div>
          </div>

          {/* Product Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94], staggerChildren: 0.05 } as Record<string, unknown>,
                },
                exit: { opacity: 0, transition: { duration: 0.12 } },
              }}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
            >
              {filtered.map((product, i) => (
                <motion.div
                  key={product.id}
                  variants={cardEnter(i)}
                  className={i % 4 === 1 || i % 4 === 2 ? "md:mt-8" : ""}
                >
                  <ProductCard
                    product={product}
                    aspectRatio={aspectRatios[i % aspectRatios.length]}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </HydrationWrapper>
  );
}
