/**
 * Aurora — src/app/api/categories/route.ts
 *
 * GET /api/categories — returns all categories with their metadata
 * (name, slug, image, description) from the database.
 */

import { NextResponse } from 'next/server';
import { pool } from '@/utils/db';
import { unstable_cache } from 'next/cache';

const fetchCategoriesFromDb = async () => {
  const result = await pool.query(`
    SELECT slug, name, image, description
    FROM categories
    ORDER BY name ASC
  `);
  return result.rows;
};

const getCachedCategories = unstable_cache(
  async () => {
    return fetchCategoriesFromDb();
  },
  ['all-categories-list'],
  { revalidate: 300, tags: ['categories', 'products'] }
);

export async function GET() {
  try {
    const categories = await getCachedCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Failed to fetch categories list:", error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
