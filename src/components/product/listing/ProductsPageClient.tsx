/**
 * Aurora — src/components/product/listing/ProductsPageClient.tsx
 *
 * Entry point for the main products listing page.
 */
"use client";

import { ProductListing } from "@/components/product/listing/ProductListing";

/** Renders the all-products listing page. */
export default function ProductsPageClient() {
  return <ProductListing initialCategory="All" />;
}

