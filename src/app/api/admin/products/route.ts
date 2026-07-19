/**
 * Aurora — src/app/api/admin/products/route.ts
 *
 * GET  /api/admin/products — paginated admin product listing with nested
 *       images, sizes, and details (uses json_agg subqueries).
 * POST /api/admin/products — creates a new product in a transaction:
 *       inserts base row + related images/sizes/details, checks for
 *       duplicate ID/slug, invalidates cache tags, and logs an audit entry.
 *
 * Both endpoints require admin role (requireAdmin).
 */

import { NextResponse } from 'next/server';
import { pool, withTransaction } from '@/utils/db';
import { requireAdmin } from '@/utils/admin';
import { logAudit } from '@/utils/audit';
import { revalidateTag } from 'next/cache';
import { rethrowIfDynamicServerError } from '@/utils/errors';

export async function GET(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20));
    const offset = (page - 1) * limit;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    /*
     * Build dynamic WHERE clause with parameterized queries.
     * paramIndex tracks the $N position for pg parameter binding,
     * incremented per condition to avoid collisions.
     */
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`p.name ILIKE $${paramIndex++}`);
      params.push(`%${search}%`);
    }

    if (category) {
      conditions.push(`p.category = $${paramIndex++}`);
      params.push(category);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    /*
     * Single-roundtrip query using json_agg subqueries to consolidate
     * related rows (images, sizes, details) into JSON arrays.
     * COUNT(*) OVER() provides total count without a separate query.
     */
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
        ) as details,
        COUNT(*) OVER() AS total
      FROM products p
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `, [...params, limit, offset]);

    const total = result.rows.length > 0 ? Number(result.rows[0].total) : 0;
    const products = result.rows.map(row => ({
      ...row,
      price: Number(row.price),
    }));

    return NextResponse.json({
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    rethrowIfDynamicServerError(err);
    console.error('Failed to list products:', err);
    return NextResponse.json({ error: 'Failed to list products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

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

    return await withTransaction(async (client) => {
      // Check for duplicate ID or slug before attempting insert
      const existingProduct = await client.query(
        'SELECT 1 FROM products WHERE id = $1 OR slug = $2',
        [id, slug]
      );
      if (existingProduct.rows.length > 0) {
        return NextResponse.json({ error: 'Product with this ID or slug already exists' }, { status: 400 });
      }

      // Insert the base product row
      await client.query(
        `INSERT INTO products (
          id, slug, name, category, price, badge, image, alt_text, span, aspect_ratio, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [id, slug, name, category, price, badge || null, image, altText, span || null, aspectRatio || null, description]
      );

      // Insert related gallery images
      for (const imgUrl of images) {
        await client.query(
          'INSERT INTO product_images (product_id, image_url) VALUES ($1, $2)',
          [id, imgUrl]
        );
      }

      // Insert size/stock variants
      for (const sizeObj of sizes) {
        const stock = typeof sizeObj.stock === 'number' ? sizeObj.stock : 0;
        await client.query(
          'INSERT INTO product_sizes (product_id, size, stock) VALUES ($1, $2, $3)',
          [id, sizeObj.size, stock]
        );
      }

      // Insert detail bullets
      for (const detailText of details) {
        await client.query(
          'INSERT INTO product_details (product_id, detail) VALUES ($1, $2)',
          [id, detailText]
        );
      }

      /*
       * Invalidate cached product and landing data so the storefront
       * picks up the new product on next request.
       */
      revalidateTag('products', { expire: 0 });
      revalidateTag('landing', { expire: 0 });

      const { user } = await requireAdmin();
      await logAudit({
        adminId: user.id,
        adminEmail: user.email,
        action: 'product.create',
        targetType: 'product',
        targetId: id,
        metadata: { slug, name },
      });

      return NextResponse.json({ success: true, id });
    });
  } catch (err: any) {
    rethrowIfDynamicServerError(err);
    console.error('Failed to create product:', err);
    return NextResponse.json({ error: err.message || 'Failed to create product' }, { status: 500 });
  }
}
