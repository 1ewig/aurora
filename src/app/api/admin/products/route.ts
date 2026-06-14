import { NextResponse } from 'next/server';
import { pool } from '@/utils/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { isAdmin } from '@/utils/auth';

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
          SELECT COALESCE(json_agg(json_build_object('size', size, 'stock', stock) ORDER BY id), '[]'::json)
          FROM product_sizes
          WHERE product_id = p.id
        ) as sizes,
        (
          SELECT COALESCE(json_agg(detail ORDER BY id), '[]'::json)
          FROM product_details
          WHERE product_id = p.id
        ) as details
      FROM products p
      ORDER BY p.created_at DESC
    `);

    const products = result.rows.map(row => ({
      ...row,
      price: Number(row.price),
    }));

    return NextResponse.json(products);
  } catch (err) {
    console.error('Failed to list products:', err);
    return NextResponse.json({ error: 'Failed to list products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      slug,
      name,
      category,
      price,
      badge,
      image,
      altText,
      span,
      aspectRatio,
      description,
      images = [],
      sizes = [],
      details = [],
    } = body;

    if (!id || !slug || !name || !category || typeof price !== 'number' || !image || !altText || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const existingProduct = await client.query(
        'SELECT 1 FROM products WHERE id = $1 OR slug = $2',
        [id, slug]
      );
      if (existingProduct.rows.length > 0) {
        return NextResponse.json({ error: 'Product with this ID or slug already exists' }, { status: 400 });
      }

      await client.query(
        `INSERT INTO products (
          id, slug, name, category, price, badge, image, alt_text, span, aspect_ratio, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [id, slug, name, category, price, badge || null, image, altText, span || null, aspectRatio || null, description]
      );

      for (const imgUrl of images) {
        await client.query(
          'INSERT INTO product_images (product_id, image_url) VALUES ($1, $2)',
          [id, imgUrl]
        );
      }

      for (const sizeObj of sizes) {
        const stock = typeof sizeObj.stock === 'number' ? sizeObj.stock : 0;
        await client.query(
          'INSERT INTO product_sizes (product_id, size, stock) VALUES ($1, $2, $3)',
          [id, sizeObj.size, stock]
        );
      }

      for (const detailText of details) {
        await client.query(
          'INSERT INTO product_details (product_id, detail) VALUES ($1, $2)',
          [id, detailText]
        );
      }

      await client.query('COMMIT');
      return NextResponse.json({ success: true, id });
    } catch (dbErr) {
      await client.query('ROLLBACK');
      throw dbErr;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Failed to create product:', err);
    return NextResponse.json({ error: err.message || 'Failed to create product' }, { status: 500 });
  }
}
