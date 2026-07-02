/**
 * Aurora — src/app/api/categories/daily/route.ts
 *
 * GET /api/categories/daily — returns 3 daily rotating categories
 * selected deterministically using the current day of the year.
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
    const allCategories = await getCachedCategories();
    
    if (allCategories.length === 0) {
      return NextResponse.json([]);
    }

    // Deterministic day of the year calculation
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    // Pick 3 categories deterministically (safe even if there are less than 3 total)
    const countToPick = Math.min(3, allCategories.length);
    const selected = [];
    const chosenIndices = new Set<number>();

    for (let i = 0; i < allCategories.length; i++) {
      const index = (dayOfYear + i) % allCategories.length;
      if (!chosenIndices.has(index)) {
        selected.push(allCategories[index]);
        chosenIndices.add(index);
      }
      if (selected.length >= countToPick) {
        break;
      }
    }

    return NextResponse.json(selected);
  } catch (error) {
    console.error("Failed to fetch daily categories:", error);
    return NextResponse.json(
      { error: 'Failed to fetch daily categories' },
      { status: 500 }
    );
  }
}
