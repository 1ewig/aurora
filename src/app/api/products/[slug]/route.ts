/**
 * Aurora — src/app/api/products/[slug]/route.ts
 *
 * GET /api/products/:slug — returns full product details including
 * images, sizes, and description in a single query.
 */

import { NextResponse } from 'next/server';
import { pool } from '@/utils/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Fetch base product and all nested relationships in a single query
    const result = await pool.query(`
      SELECT 
        p.id, 
        p.slug, 
        p.name, 
        p.category, 
        p.price, 
        p.badge, 
        p.image, 
        p.alt_text as "altText", 
        p.span, 
        p.aspect_ratio as "aspectRatio", 
        p.description,
        (
          SELECT COALESCE(json_agg(image_url ORDER BY id), '[]'::json)
          FROM product_images
          WHERE product_id = p.id
        ) as images,
        (
          SELECT COALESCE(json_agg(size ORDER BY id), '[]'::json)
          FROM product_sizes
          WHERE product_id = p.id
        ) as sizes,
        (
          SELECT COALESCE(json_agg(detail ORDER BY id), '[]'::json)
          FROM product_details
          WHERE product_id = p.id
        ) as details
      FROM products p
      WHERE p.slug = $1
    `, [slug]);

    const row = result.rows[0];

    if (!row) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
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
      altText: row.altText,
      span: row.span,
      aspectRatio: row.aspectRatio,
      description: row.description,
      details: row.details,
      sizes: row.sizes,
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
