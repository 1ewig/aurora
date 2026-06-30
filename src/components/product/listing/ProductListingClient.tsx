/**
 * Aurora — src/components/product/listing/ProductListingClient.tsx
 *
 * Client that calls useProductFilter and manages filter drawer state,
 * then passes resolved data to the presentational ProductListing.
 */
"use client";

import { useState } from "react";
import { useProductFilter } from "@/hooks/useProductFilter";
import { ProductListing } from "./ProductListing";

interface ProductListingClientProps {
  initialCategory?: string;
}

/** Client bridging the product filter hook to the presentational listing component. */
export function ProductListingClient({ initialCategory = "All" }: ProductListingClientProps) {
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const filter = useProductFilter({ initialCategory });

  return (
    <ProductListing
      {...filter}
      isFilterDrawerOpen={isFilterDrawerOpen}
      onOpenFilterDrawer={() => setIsFilterDrawerOpen(true)}
      onCloseFilterDrawer={() => setIsFilterDrawerOpen(false)}
    />
  );
}
