/**
 * Aurora — src/app/(store)/products/[slug]/page.tsx
 *
 * Individual product detail page with dynamic metadata from the database.
 */

import { pool } from "@/utils/db";
import { ProductDetailClient } from "@/components/product/detail/ProductDetailClient";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Generate dynamic metadata based on the product slug. */
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  try {
    const result = await pool.query('SELECT name, description FROM products WHERE slug = $1', [slug]);
    const product = result.rows[0];
    if (!product) {
      return {};
    }
    return {
      title: `${product.name} | Aurora`,
      description: product.description,
    };
  } catch (error) {
    console.error("Failed to generate metadata:", error);
    return {};
  }
}

/** Product detail page for a single product identified by slug. */
export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  return <ProductDetailClient slug={slug} />;
}
