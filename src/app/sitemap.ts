import { pool } from "@/utils/db";
import { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

/** Dynamically generates sitemap.xml listing all product routes and static pages. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aurora-nu-three.vercel.app";

  let products: MetadataRoute.Sitemap = [];
  let categories: MetadataRoute.Sitemap = [];

  try {
    const productRes = await pool.query(
      "SELECT slug, created_at FROM products ORDER BY created_at DESC"
    );
    products = productRes.rows.map((row) => ({
      url: `${baseUrl}/products/${row.slug}`,
      lastModified: row.created_at ? new Date(row.created_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const categoryRes = await pool.query(
      "SELECT slug FROM categories ORDER BY name ASC"
    );
    categories = categoryRes.rows.map((row) => ({
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
