import { notFound } from "next/navigation";
import { pool } from "@/utils/db";
import { ProductDetail } from "@/components/product/detail/ProductDetail";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  try {
    const result = await pool.query('SELECT * FROM products WHERE slug = $1', [slug]);
    const row = result.rows[0];

    if (!row) {
      notFound();
    }

    const product = {
      id: row.id,
      slug: row.slug,
      name: row.name,
      category: row.category,
      price: Number(row.price),
      badge: row.badge,
      image: row.image,
      images: row.images,
      altText: row.alt_text,
      span: row.span,
      aspectRatio: row.aspect_ratio,
      description: row.description,
      details: row.details,
      sizes: row.sizes,
    };

    return (
      <main id="main-content" tabIndex={-1}>
        <ProductDetail product={product} />
      </main>
    );
  } catch (error) {
    console.error("Failed to load product page details:", error);
    notFound();
  }
}
