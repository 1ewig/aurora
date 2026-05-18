import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { ProductCard } from "@/components/ui/ProductCard";
import { allProducts } from "@/data/products";
import { scaleIn } from "@/animations/variants";

const filters = ["All", "Outerwear", "Knitwear", "Trousers", "Accessories", "Dresses"];

const aspectRatios = ["aspect-[3/4]", "aspect-[4/5]", "aspect-[2/3]", "aspect-[3/4]"];

export function ProductGrid() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered =
    activeFilter === "All"
      ? allProducts
      : allProducts.filter((p) => p.filter === activeFilter);

  return (
    <section
      id="all-products"
      aria-labelledby="products-heading"
      className="py-32 px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <EyebrowLabel>All Pieces</EyebrowLabel>
          <h2
            id="products-heading"
            className="font-['Inter'] font-black leading-tight tracking-[-0.02em] mt-4 text-[#111111]"
            style={{ fontSize: "clamp(2.5rem, 5vw, 5.5rem)" }}
          >
            The Full
            <br />
            Collection.
          </h2>
        </motion.div>

        {/* Filter Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          role="group"
          aria-label="Filter collection"
          className="flex flex-wrap gap-2 md:gap-3"
        >
          {filters.map((filter) => (
            <button
              key={filter}
              aria-pressed={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2 rounded-full text-sm font-medium border transition-all duration-300 ${
                activeFilter === filter
                  ? "bg-[#0D0D0D] text-[#F7F7F5] border-[#0D0D0D]"
                  : "bg-transparent text-[#6B6B6B] border-[#D0CFC9] hover:border-[#111111] hover:text-[#111111]"
              }`}
            >
              {filter}
            </button>
          ))}
        </motion.div>
      </div>

      <motion.div layout className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <AnimatePresence mode="popLayout">
          {filtered.map((product, i) => (
            <motion.div
              key={product.id}
              layout
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
              transition={{ delay: i * 0.05 }}
              className={i % 4 === 1 || i % 4 === 2 ? "md:mt-8" : ""}
            >
              <ProductCard
                product={product}
                aspectRatio={aspectRatios[i % aspectRatios.length]}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
