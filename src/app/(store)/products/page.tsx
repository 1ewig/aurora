import type { Metadata } from "next";
import ProductsPageClient from "@/components/product/listing/ProductsPageClient";

export const metadata: Metadata = {
  title: "All Products | Aurora",
  description: "Explore our collection of premium, consciously designed clothing pieces.",
};

export default function ProductsPage() {
  return <ProductsPageClient />;
}

