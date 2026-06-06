"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { ProductCard } from "@/components/ui/ProductCard";
import { Button } from "@/components/ui/Button";
import { useProductsQuery } from "@/hooks/queries";
import { staggerContainer, scaleIn } from "@/animations/variants";

export function FeaturedCollection() {
  const { data: products = [] } = useProductsQuery();
  const featured = products.filter((p) =>
    ["ivory-wool-overcoat", "ecru-linen-blazer", "champagne-silk-slip-dress"].includes(p.slug)
  );
  return (
    <section
      id="collection"
      aria-labelledby="collection-heading"
      className="py-32 px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <EyebrowLabel>Featured Collection</EyebrowLabel>
        <h2
          id="collection-heading"
          className="font-sans font-black leading-tight tracking-[-0.02em] mt-4 mb-16 text-text-primary"
          style={{ fontSize: "clamp(2.5rem, 5vw, 5.5rem)" }}
        >
          Curated For
          <br />
          <span className="text-accent-primary">The Rare Few.</span>
        </h2>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-10% 0px" }}
        role="list"
        className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6"
      >
        {featured.map((product) => (
          <motion.div
            key={product.id}
            variants={scaleIn}
            role="listitem"
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>

      <div className="flex justify-center mt-16">
        <Link href="/products">
          <Button
            variant="ghost"
            size="lg"
          >
            View Entire Collection →
          </Button>
        </Link>
      </div>
    </section>
  );
}
