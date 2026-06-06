import { NextResponse } from 'next/server';
import { pool } from '@/utils/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let query = 'SELECT * FROM products';
    let params: string[] = [];

    if (category && category !== 'All') {
      query += ' WHERE category = $1';
      params.push(category);
    }

    // Sort by created_at or name for consistency
    query += ' ORDER BY name ASC';

    const result = await pool.query(query, params);

    // Map database fields to matching camelCase interface properties
    const products = result.rows.map((row) => ({
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
    }));

    return NextResponse.json(products);
  } catch (error) {
    console.error("Database query failed:", error);
    // Generic error message returned to client to avoid SQL detail leaks
    return NextResponse.json(
      { error: 'Failed to fetch products. Please try again later.' },
      { status: 500 }
    );
  }
}
