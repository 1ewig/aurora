import { pool } from "@/utils/db";
import { ProductDetailClient } from "@/components/product/detail/ProductDetailClient";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

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

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  return <ProductDetailClient slug={slug} />;
}
