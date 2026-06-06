import { useMemo } from "react";
import { heroProducts, allProducts, Product } from "@/data/products";

export function useRelatedProducts(currentProduct: Product) {
  return useMemo(() => {
    const combined = [...heroProducts, ...allProducts];

    const related = combined.filter(
      (p) => p.category === currentProduct.category && p.id !== currentProduct.id
    );

    if (related.length > 0) {
      return related.slice(0, 4);
    }

    return combined.filter((p) => p.id !== currentProduct.id).slice(0, 4);
  }, [currentProduct]);
}
