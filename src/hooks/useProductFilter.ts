import { useState, useMemo, useEffect } from "react";
import { useProductsQuery } from "@/hooks/queries";
import { categories } from "@/data/products";

interface UseProductFilterOptions {
  initialCategory?: string;
  includeHero?: boolean;
  onCategoryChange?: (category: string) => void;
}

export function useProductFilter(options: UseProductFilterOptions = {}) {
  const {
    initialCategory = "All",
    onCategoryChange,
  } = options;

  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);

  useEffect(() => {
    setActiveCategory(initialCategory);
  }, [initialCategory]);

  const { data: dbProducts = [], isLoading } = useProductsQuery();

  const filtered = useMemo(
    () =>
      activeCategory === "All"
        ? dbProducts
        : dbProducts.filter((p) => p.category === activeCategory),
    [activeCategory, dbProducts]
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
    isLoading,
    categories: ["All", ...categories] as const,
  };
}
