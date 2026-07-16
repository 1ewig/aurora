/**
 * Aurora — src/app/api/categories/route.ts
 *
 * GET /api/categories — returns all categories with their metadata
 * (name, slug, image, description) from the database.
 */

import { NextResponse } from 'next/server';
import { pool } from '@/utils/db';
import { cacheLife, cacheTag } from 'next/cache';
import { rethrowIfDynamicServerError } from '@/utils/errors';

const fetchCategoriesFromDb = async () => {
  const result = await pool.query(`
    SELECT slug, name, image, description
    FROM categories
    ORDER BY name ASC
  `);
  return result.rows;
};

export async function getCachedCategories() {
  'use cache';
  cacheLife({ stale: 300, revalidate: 300 });
  cacheTag('categories', 'products');
  return fetchCategoriesFromDb();
}

export async function GET() {
  try {
    const categories = await getCachedCategories();
    return NextResponse.json(categories);
  } catch (error) {
    rethrowIfDynamicServerError(error);
    console.error("Failed to fetch categories list:", error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
