/**
 * Aurora — src/app/(store)/products/category/[category]/page.tsx
 *
 * Category-filtered product listing page (server component).
 * Resolves the URL slug to a DB category name, then passes it to
 * ProductListingClient (which fetches filtered products via React Query).
 *
 * Uses Next.js 16's 'use cache' directive to cache the category slug→name
 * mapping for 5 minutes with the 'categories' cache tag, so invalidating
 * categories in the admin panel also busts this cache.
 *
 * Triggers a 404 (notFound()) if the slug does not match any category,
 * rather than rendering an empty listing.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cacheLife, cacheTag } from "next/cache";
import { pool } from "@/utils/db";
import { ProductListingClient } from "@/components/product/listing/ProductListingClient";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

/**
 * Resolves a URL category slug to the human-readable category name from
 * the database. Uses 'use cache' so this query (which runs per-request
 * in generateMetadata AND in the page body) is served from the data
 * cache after the first call within the 5-minute window.
 *
 * cacheTag('categories') ties this cache entry to the categories tag,
 * so admin updates to categories invalidate cached lookups.
 */
async function getCategoryName(slug: string) {
  'use cache';
  cacheLife({ stale: 300, revalidate: 300 });
  cacheTag('categories');
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
}

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

  /*
   * Unknown category slugs render a 404 (not a fallback or empty listing)
   * so crawlers and users know the URL doesn't exist.
   */
  if (!categoryName) {
    notFound();
  }

  return <ProductListingClient initialCategory={categoryName} />;
}

