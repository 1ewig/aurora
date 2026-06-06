import { useState, useMemo, useEffect } from "react";
import { allProducts, heroProducts, categories } from "@/data/products";

interface UseProductFilterOptions {
  initialCategory?: string;
  includeHero?: boolean;
  onCategoryChange?: (category: string) => void;
}

export function useProductFilter(options: UseProductFilterOptions = {}) {
  const {
    initialCategory = "All",
    includeHero = false,
    onCategoryChange,
  } = options;

  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);

  useEffect(() => {
    setActiveCategory(initialCategory);
  }, [initialCategory]);

  const combined = useMemo(
    () => (includeHero ? [...heroProducts, ...allProducts] : allProducts),
    [includeHero]
  );

  const filtered = useMemo(
    () =>
      activeCategory === "All"
        ? combined
        : combined.filter((p) => p.category === activeCategory),
    [activeCategory, combined]
  );

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    onCategoryChange?.(category);
  };

  return {
    activeCategory,
    setActiveCategory,
    handleCategoryChange,
    filtered,
    categories: ["All", ...categories] as const,
  };
}
