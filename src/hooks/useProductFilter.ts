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
  const [sortBy, setSortBy] = useState<string>("featured");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    setActiveCategory(initialCategory);
  }, [initialCategory]);

  const { data: dbProducts = [], isLoading } = useProductsQuery();

  const filtered = useMemo(() => {
    let result = activeCategory === "All"
      ? [...dbProducts]
      : dbProducts.filter((p) => p.category === activeCategory);

    // Apply search query filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    if (sortBy === "price-asc") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "name-desc") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }
    return result;
  }, [activeCategory, dbProducts, sortBy, searchQuery]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    onCategoryChange?.(category);
  };

  return {
    activeCategory,
    setActiveCategory,
    handleCategoryChange,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    filtered,
    isLoading,
    categories: ["All", ...categories] as const,
  };
}
