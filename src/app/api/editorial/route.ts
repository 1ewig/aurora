/**
 * Aurora — src/app/api/editorial/route.ts
 *
 * GET /api/editorial — returns editorial content for the brand story page.
 */

import { NextResponse } from 'next/server';
import { cacheLife, cacheTag } from 'next/cache';
import { pool } from '@/utils/db';
import { rethrowIfDynamicServerError } from '@/utils/errors';

async function getEditorialContent() {
  'use cache';
  cacheLife({ stale: 600, revalidate: 600 });
  cacheTag('editorial');
  const query = 'SELECT id, original_image, image_url, alt_text, title, description FROM editorial_content';
  const result = await pool.query(query);

  return result.rows.map((row) => ({
    id: row.id,
    originalImage: row.original_image,
    imageUrl: row.image_url,
    altText: row.alt_text,
    title: row.title,
    description: row.description,
  }));
}

export async function GET() {
  try {
    const items = await getEditorialContent();
    return NextResponse.json(items);
  } catch (error) {
    rethrowIfDynamicServerError(error);
    console.error('Failed to fetch editorial content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch editorial content. Please try again later.' },
      { status: 500 }
    );
  }
}
