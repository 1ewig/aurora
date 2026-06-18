/**
 * Aurora — src/app/(store)/products/page.tsx
 *
 * All-products listing page.
 */

import type { Metadata } from "next";
import ProductsPageClient from "@/components/product/listing/ProductsPageClient";

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
  return <ProductsPageClient />;
}

