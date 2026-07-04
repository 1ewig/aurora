import { pool } from "@/utils/db";
import { cacheLife, cacheTag } from "next/cache";
import { MetadataRoute } from "next";

async function getSitemapProducts() {
  'use cache';
  cacheLife({ stale: 3600, revalidate: 3600 });
  cacheTag('products');
  const productRes = await pool.query(
    "SELECT slug, created_at FROM products ORDER BY created_at DESC"
  );
  return productRes.rows;
}

async function getSitemapCategories() {
  'use cache';
  cacheLife({ stale: 3600, revalidate: 3600 });
  cacheTag('categories');
  const categoryRes = await pool.query(
    "SELECT slug FROM categories ORDER BY name ASC"
  );
  return categoryRes.rows;
}

/** Dynamically generates sitemap.xml listing all product routes and static pages. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aurora-nu-three.vercel.app";

  let products: MetadataRoute.Sitemap = [];
  let categories: MetadataRoute.Sitemap = [];

  try {
    const productRows = await getSitemapProducts();
    products = productRows.map((row) => ({
      url: `${baseUrl}/products/${row.slug}`,
      lastModified: row.created_at ? new Date(row.created_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const categoryRows = await getSitemapCategories();
    categories = categoryRows.map((row) => ({
      url: `${baseUrl}/products/category/${row.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    }));
  } catch (error) {
    console.error("Failed to fetch products or categories for sitemap:", error);
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/products",
    "/story",
    "/login",
    "/register",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1.0,
  }));

  return [...staticRoutes, ...categories, ...products];
}
