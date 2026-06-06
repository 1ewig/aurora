import { useMemo } from "react";
import { useProductsQuery } from "@/hooks/queries";
import type { Product } from "@/data/products";

export function useRelatedProducts(currentProduct: Product) {
  const { data: dbProducts = [] } = useProductsQuery();

  return useMemo(() => {
    const related = dbProducts.filter(
      (p) => p.category === currentProduct.category && p.slug !== currentProduct.slug
    );

    if (related.length > 0) {
      return related.slice(0, 4);
    }

    return dbProducts.filter((p) => p.slug !== currentProduct.slug).slice(0, 4);
  }, [currentProduct, dbProducts]);
}
