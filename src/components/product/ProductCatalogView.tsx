"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "@/components/ui/ProductCard";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { heroProducts, allProducts, categories } from "@/data/products";
import { cardEnter } from "@/animations/variants";

const aspectRatios = ["aspect-[3/4]", "aspect-[4/5]", "aspect-[2/3]", "aspect-[3/4]"];

const categorySlugMap: Record<string, string> = {
  All: "",
  Outerwear: "outerwear",
  Knitwear: "knitwear",
  Trousers: "trousers",
  Dresses: "dresses",
  Accessories: "accessories",
};

interface ProductCatalogViewProps {
  initialCategory: string;
}

export function ProductCatalogView({ initialCategory }: ProductCatalogViewProps) {
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  // Sync state if initialCategory changes from back/forward routing actions
  useEffect(() => {
    setActiveCategory(initialCategory);
  }, [initialCategory]);

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

  const handleCategoryChange = (categoryName: string) => {
    setActiveCategory(categoryName);
    
    // Update browser URL without triggering a full page reload or component unmount
    const slug = categorySlugMap[categoryName];
    const newUrl = slug ? `/products/category/${slug}` : "/products";
    window.history.pushState(null, "", newUrl);
  };

  return (
    <main id="main-content" tabIndex={-1} className="pt-28 pb-32">
      <div className="px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <EyebrowLabel>Atelier Catalog</EyebrowLabel>
            <h1
              id="products-heading"
              className="font-sans font-black leading-tight tracking-[-0.02em] mt-4 text-text-primary uppercase"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
            >
              {activeCategory === "All" ? "Shop All" : activeCategory}
              <br />
              Pieces.
            </h1>
          </div>

          {/* Filter Pills */}
          <div
            role="group"
            aria-label="Filter catalog"
            className="flex flex-wrap gap-2 md:gap-3"
          >
            {allCategories.map((category) => {
              const isSelected = category === activeCategory;
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => handleCategoryChange(category)}
                  className="relative px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider border transition-colors duration-300 cursor-pointer overflow-hidden select-none outline-none focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2"
                >
                  {/* Backdrop animation for selected tab */}
                  {isSelected && (
                    <motion.div
                      layoutId="activeTabBackground"
                      className="absolute inset-0 bg-bg-ink"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span
                    className={`relative z-10 transition-colors duration-300 ${
                      isSelected ? "text-text-inverted" : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {category}
                  </span>
                </button>
              );
            })}
          </div>
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
  );
}
