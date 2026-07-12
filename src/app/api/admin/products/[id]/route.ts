/**
 * Aurora — src/app/api/admin/products/[id]/route.ts
 *
 * PUT /api/admin/products/:id — updates a product with its images, sizes, and details.
 * DELETE /api/admin/products/:id — deletes a product and cleans up unused storage assets.
 * Admin-only endpoints with transactional DB operations.
 */

import { NextResponse } from 'next/server';
import { withTransaction } from '@/utils/db';
import { requireAdmin } from '@/utils/admin';
import { logAudit } from '@/utils/audit';
import { createAdminClient } from '@insforge/sdk';
import { getStorageKeyFromUrl } from '@/utils/insforge';
import { revalidateTag } from 'next/cache';

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

  const count = rows && rows[0] ? parseInt(rows[0].count, 10) : 0;
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
    const { error } = await requireAdmin();
    if (error) return error;

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

    return await withTransaction(async (client) => {
      const { rows: productRows } = await client.query(
        'SELECT slug, name, category, price, badge, image, alt_text, span, aspect_ratio, description FROM products WHERE id = $1',
        [id]
      );
      if (productRows.length === 0) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      const oldProduct = productRows[0];
      const oldMainImage = oldProduct.image;

      const existingSlug = await client.query(
        'SELECT 1 FROM products WHERE slug = $1 AND id <> $2',
        [slug, id]
      );
      if (existingSlug.rows.length > 0) {
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

      revalidateTag('products', { expire: 0 });

      const { user } = await requireAdmin();
      const changes: Record<string, { from: any; to: any }> = {};
      const fields = ['slug', 'name', 'category', 'price', 'badge', 'image', 'alt_text', 'span', 'aspect_ratio', 'description'] as const;
      const newVals = { slug, name, category, price, badge, image, altText, span, aspectRatio, description };
      const fieldMap: Record<string, string> = { altText: 'alt_text', span: 'span', aspectRatio: 'aspect_ratio' };
      for (const f of fields) {
        const oldVal = oldProduct[f];
        const newVal = f in fieldMap ? newVals[fieldMap[f] as keyof typeof newVals] : newVals[f as keyof typeof newVals];
        if (String(oldVal) !== String(newVal)) {
          changes[f] = { from: oldVal, to: newVal };
        }
      }
      await logAudit({
        adminId: user.id,
        adminEmail: user.email,
        action: 'product.update',
        targetType: 'product',
        targetId: id,
        metadata: { slug, name, changes },
      });

      return NextResponse.json({ success: true });
    });
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
    const { error } = await requireAdmin();
    if (error) return error;

    return await withTransaction(async (client) => {
      const { rows: productRows } = await client.query(
        'SELECT image, name, slug FROM products WHERE id = $1',
        [id]
      );
      if (productRows.length === 0) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      const { image: mainImage, name: productName, slug: productSlug } = productRows[0];
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

      revalidateTag('products', { expire: 0 });

      const { user } = await requireAdmin();
      await logAudit({
        adminId: user.id,
        adminEmail: user.email,
        action: 'product.delete',
        targetType: 'product',
        targetId: id,
        metadata: { slug: productSlug, name: productName },
      });

      return NextResponse.json({ success: true });
    });
  } catch (err: any) {
    console.error('Failed to delete product:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete product' }, { status: 500 });
  }
}
