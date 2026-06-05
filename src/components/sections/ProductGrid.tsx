import { motion, AnimatePresence } from "framer-motion";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { ProductCard } from "@/components/ui/ProductCard";
import { useProductFilter } from "@/hooks/useProductFilter";
import { cardEnter } from "@/animations/variants";
import { springSmooth } from "@/animations/transitions";

const aspectRatios = ["aspect-[3/4]", "aspect-[4/5]", "aspect-[2/3]", "aspect-[3/4]"];

export function ProductGrid() {
  const { activeCategory, setActiveCategory, filtered, categories } = useProductFilter();

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
            className="font-sans font-black leading-tight tracking-[-0.02em] mt-4 text-[#111111]"
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
          {categories.map((category) => (
            <motion.button
              key={category}
              aria-pressed={activeCategory === category}
              onClick={() => setActiveCategory(category)}
              layout
              transition={springSmooth}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className={`px-5 py-2 rounded-full text-sm font-medium border transition-colors duration-300 ${
                activeCategory === category
                  ? "bg-[#0D0D0D] text-[#F7F7F5] border-[#0D0D0D]"
                  : "bg-transparent text-[#6B6B6B] border-[#D0CFC9] hover:border-[#111111] hover:text-[#111111]"
              }`}
            >
              {category}
            </motion.button>
          ))}
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94], staggerChildren: 0.07 } as Record<string, unknown>,
            },
            exit: { opacity: 0, transition: { duration: 0.12 } },
          }}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5"
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
    </section>
  );
}
