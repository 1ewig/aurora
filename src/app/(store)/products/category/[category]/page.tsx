/**
 * Aurora — src/app/(store)/products/category/[category]/page.tsx
 *
 * Category-based product listing page.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { pool } from "@/utils/db";
import { ProductListingClient } from "@/components/product/listing/ProductListingClient";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

/** Dynamically resolves category name from DB with request-scoped caching. */
const getCategoryName = cache(async (slug: string) => {
  try {
    const result = await pool.query(
      "SELECT name FROM categories WHERE LOWER(slug) = LOWER($1)",
      [slug]
    );
    return result.rows[0]?.name || null;
  } catch (error) {
    console.error("Failed to query category name:", error);
    return null;
  }
});

/** Generate metadata based on the category slug. */
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryName = await getCategoryName(category) || "Collection";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aurora-nu-three.vercel.app";
  const title = `${categoryName} | Aurora`;
  const description = `Discover our collection of premium ${categoryName.toLowerCase()} designed for the considered wardrobe.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${baseUrl}/products/category/${category}`,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

/** Category product listing page. */
export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const categoryName = await getCategoryName(category);

  if (!categoryName) {
    notFound();
  }

  return <ProductListingClient initialCategory={categoryName} />;
}

