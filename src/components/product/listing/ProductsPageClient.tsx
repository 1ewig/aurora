/**
 * Aurora — src/components/product/listing/ProductsPageClient.tsx
 *
 * Entry point for the main products listing page.
 */
"use client";

import { ProductListingClient } from "@/components/product/listing/ProductListingClient";

/** Renders the all-products listing page. */
export default function ProductsPageClient() {
  return <ProductListingClient initialCategory="All" />;
}

