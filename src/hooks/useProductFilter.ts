import { useState, useMemo } from "react";
import { allProducts, categories } from "@/data/products";

export function useProductFilter() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filtered = useMemo(
    () =>
      activeCategory === "All"
        ? allProducts
        : allProducts.filter((p) => p.category === activeCategory),
    [activeCategory],
  );

  return {
    activeCategory,
    setActiveCategory,
    filtered,
    categories: ["All", ...categories] as const,
  };
}
