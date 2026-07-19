/**
 * Aurora — src/app/(store)/products/page.tsx
 *
 * All-products listing page (server component). Delegates to
 * ProductListingClient with initialCategory="All", which displays
 * the full catalog with pagination, search, sort, and category filters.
 *
 * Metadata includes Open Graph and Twitter card tags for social sharing.
 * Filter state (page, sortBy, search) is synced to URL query params
 * by the useProductFilter hook for bookmarkable URLs.
 */

import type { Metadata } from "next";
import { ProductListingClient } from "@/components/product/listing/ProductListingClient";

/** Metadata for the all-products listing page. */
export const metadata: Metadata = {
  title: "All Products",
  description: "Explore our collection of premium, consciously designed clothing pieces.",
  openGraph: {
    title: "All Products | Aurora",
    description: "Explore our collection of premium, consciously designed clothing pieces.",
    type: "website",
    url: "https://aurora-nu-three.vercel.app/products",
  },
  twitter: {
    card: "summary",
    title: "All Products | Aurora",
    description: "Explore our collection of premium, consciously designed clothing pieces.",
  },
};

/** Products listing page. */
export default function ProductsPage() {
  return <ProductListingClient initialCategory="All" />;
}

