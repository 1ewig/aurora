import { NextResponse } from 'next/server';
import { pool } from '@/utils/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Fetch the base product record first
    const result = await pool.query('SELECT * FROM products WHERE slug = $1', [slug]);
    const row = result.rows[0];

    if (!row) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const productId = row.id;

    // Fetch related details from normalized tables in parallel
    const [imagesRes, sizesRes, detailsRes] = await Promise.all([
      pool.query('SELECT image_url FROM product_images WHERE product_id = $1 ORDER BY id', [productId]),
      pool.query('SELECT size, stock FROM product_sizes WHERE product_id = $1 ORDER BY id', [productId]),
      pool.query('SELECT detail FROM product_details WHERE product_id = $1 ORDER BY id', [productId]),
    ]);

    const product = {
      id: row.id,
      slug: row.slug,
      name: row.name,
      category: row.category,
      price: Number(row.price),
      badge: row.badge,
      image: row.image,
      images: imagesRes.rows.map((r) => r.image_url),
      altText: row.alt_text,
      span: row.span,
      aspectRatio: row.aspect_ratio,
      description: row.description,
      details: detailsRes.rows.map((r) => r.detail),
      sizes: sizesRes.rows.map((r) => r.size),
    };

    return NextResponse.json(product);
  } catch (error) {
    console.error("Failed to fetch product details:", error);
    return NextResponse.json(
      { error: 'Failed to fetch product details' },
      { status: 500 }
    );
  }
}
