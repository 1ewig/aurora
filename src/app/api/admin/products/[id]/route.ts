/**
 * Aurora — src/app/api/admin/products/[id]/route.ts
 *
 * PUT /api/admin/products/:id — updates a product with its images, sizes, and details.
 * DELETE /api/admin/products/:id — deletes a product and cleans up unused storage assets.
 * Admin-only endpoints with transactional DB operations.
 */

import { NextResponse } from 'next/server';
import { pool } from '@/utils/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { isAdmin } from '@/utils/auth';
import { createAdminClient } from '@insforge/sdk';
import { getStorageKeyFromUrl } from '@/utils/insforge';

const admin = createAdminClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL || '',
  apiKey: process.env.INSFORGE_API_KEY || ''
});

/** Deletes a storage object if no other product references it. */
async function deleteUnusedImage(client: any, url: string, productId: string) {
  const { rows } = await client.query(
    `SELECT COUNT(*) as count FROM (
      SELECT 1 FROM products WHERE image = $1 AND id <> $2
      UNION ALL
      SELECT 1 FROM product_images WHERE image_url = $1 AND product_id <> $2
    ) as usages`,
    [url, productId]
  );

  const count = parseInt(rows[0].count, 10);
  if (count === 0) {
    const storageKey = getStorageKeyFromUrl(url);
    if (storageKey) {
      try {
        await admin.storage.from('product-media').remove(storageKey);
      } catch (err) {
        console.warn(`Failed to delete storage key "${storageKey}":`, err);
      }
    }
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
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

    if (!slug || !name || !category || typeof price !== 'number' || !image || !altText || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows: productRows } = await client.query(
        'SELECT image FROM products WHERE id = $1',
        [id]
      );
      if (productRows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      const oldMainImage = productRows[0].image;

      const existingSlug = await client.query(
        'SELECT 1 FROM products WHERE slug = $1 AND id <> $2',
        [slug, id]
      );
      if (existingSlug.rows.length > 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Slug is already used by another product' }, { status: 400 });
      }

      const { rows: galleryRows } = await client.query(
        'SELECT image_url FROM product_images WHERE product_id = $1',
        [id]
      );
      const oldGalleryImages = galleryRows.map(r => r.image_url);

      if (image !== oldMainImage) {
        await deleteUnusedImage(client, oldMainImage, id);
      }
      for (const oldImg of oldGalleryImages) {
        if (!images.includes(oldImg)) {
          await deleteUnusedImage(client, oldImg, id);
        }
      }

      await client.query(
        `UPDATE products
         SET slug = $1, name = $2, category = $3, price = $4, badge = $5, image = $6, alt_text = $7, span = $8, aspect_ratio = $9, description = $10
         WHERE id = $11`,
        [slug, name, category, price, badge || null, image, altText, span || null, aspectRatio || null, description, id]
      );

      await client.query('DELETE FROM product_images WHERE product_id = $1', [id]);
      const allImageUrls = [image, ...images.filter((img: string) => img !== image)];
      for (const imgUrl of allImageUrls) {
        await client.query(
          'INSERT INTO product_images (product_id, image_url) VALUES ($1, $2)',
          [id, imgUrl]
        );
      }

      await client.query('DELETE FROM product_sizes WHERE product_id = $1', [id]);
      for (const sizeObj of sizes) {
        const stock = typeof sizeObj.stock === 'number' ? sizeObj.stock : 0;
        await client.query(
          'INSERT INTO product_sizes (product_id, size, stock) VALUES ($1, $2, $3)',
          [id, sizeObj.size, stock]
        );
      }

      await client.query('DELETE FROM product_details WHERE product_id = $1', [id]);
      for (const detailText of details) {
        await client.query(
          'INSERT INTO product_details (product_id, detail) VALUES ($1, $2)',
          [id, detailText]
        );
      }

      await client.query('COMMIT');
      return NextResponse.json({ success: true });
    } catch (dbErr) {
      await client.query('ROLLBACK');
      throw dbErr;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Failed to update product:', err);
    return NextResponse.json({ error: err.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows: productRows } = await client.query(
        'SELECT image FROM products WHERE id = $1',
        [id]
      );
      if (productRows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      const mainImage = productRows[0].image;
      const { rows: galleryRows } = await client.query(
        'SELECT image_url FROM product_images WHERE product_id = $1',
        [id]
      );
      const galleryImages = galleryRows.map(r => r.image_url);

      await deleteUnusedImage(client, mainImage, id);
      for (const img of galleryImages) {
        await deleteUnusedImage(client, img, id);
      }

      await client.query('DELETE FROM products WHERE id = $1', [id]);

      await client.query('COMMIT');
      return NextResponse.json({ success: true });
    } catch (dbErr) {
      await client.query('ROLLBACK');
      throw dbErr;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Failed to delete product:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete product' }, { status: 500 });
  }
}
