import { useMemo } from "react";
import { useProductsQuery } from "@/hooks/queries";
import type { Product } from "@/data/products";

export function useFeaturedProducts(count = 3) {
  const { data: products = [], isLoading, error } = useProductsQuery();

  const featured = useMemo(() => {
    if (products.length === 0) return [];

    const len = products.length;
    // Deterministic daily index based on current day of month
    const day = new Date().getDate();
    const selected: Product[] = [];

    for (let i = 0; i < Math.min(count, len); i++) {
      // Pick dynamic items sequentially based on calendar date offsets
      const index = (day + i * 3) % len;
      selected.push(products[index]);
    }

    return selected;
  }, [products, count]);

  return {
    featured,
    isLoading,
    error,
  };
}
