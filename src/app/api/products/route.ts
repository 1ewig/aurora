/**
 * Aurora — src/app/api/products/route.ts
 *
 * GET /api/products — returns all products, optionally filtered by category.
 * Maps snake_case DB columns to camelCase for the frontend.
 */

import { NextResponse } from 'next/server';
import { pool } from '@/utils/db';
import { cacheLife, cacheTag } from 'next/cache';

const fetchProductsList = async (
  category: string | null,
  pageParam: string | null,
  limitParam: string | null,
  search: string | null,
  sortBy: string | null
) => {
  if (pageParam !== null) {
    const page = Math.max(1, parseInt(pageParam, 10) || 1);
    const limit = Math.max(1, parseInt(limitParam || '12', 10) || 12);
    const offset = (page - 1) * limit;

    const whereClauses: string[] = [];
    const params: string[] = [];

    if (category && category !== 'All') {
      params.push(category);
      whereClauses.push(`category = $${params.length}`);
    }

    if (search && search.trim() !== '') {
      params.push(`%${search.trim()}%`);
      whereClauses.push(`(
        name ILIKE $${params.length} OR 
        description ILIKE $${params.length} OR 
        EXISTS (
          SELECT 1 FROM product_keywords pk 
          WHERE pk.product_id = products.id AND pk.keyword ILIKE $${params.length}
        )
      )`);
    }

    const whereSql = whereClauses.length > 0 ? ` WHERE ${whereClauses.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) as count FROM products${whereSql}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count, 10);

    let dataQuery = `SELECT id, slug, name, category, price, badge, image, alt_text, span, aspect_ratio, description FROM products${whereSql}`;

    if (sortBy === 'price-asc') {
      dataQuery += ' ORDER BY price ASC, name ASC';
    } else if (sortBy === 'price-desc') {
      dataQuery += ' ORDER BY price DESC, name ASC';
    } else if (sortBy === 'name-asc') {
      dataQuery += ' ORDER BY name ASC';
    } else if (sortBy === 'name-desc') {
      dataQuery += ' ORDER BY name DESC';
    } else {
      dataQuery += ' ORDER BY name ASC';
    }

    const limitIdx = params.length + 1;
    const offsetIdx = params.length + 2;
    dataQuery += ` LIMIT $${limitIdx} OFFSET $${offsetIdx}`;

    const queryParams = [...params, limit.toString(), offset.toString()];
    const dataResult = await pool.query(dataQuery, queryParams);

    const products = dataResult.rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      category: row.category,
      price: Number(row.price),
      badge: row.badge,
      image: row.image,
      altText: row.alt_text,
      span: row.span,
      aspectRatio: row.aspect_ratio,
      description: row.description,
    }));

    return { products, total };
  }

  let query = 'SELECT id, slug, name, category, price, badge, image, alt_text, span, aspect_ratio, description FROM products';
  let params: string[] = [];

  if (category && category !== 'All') {
    query += ' WHERE category = $1';
    params.push(category);
  }

  query += ' ORDER BY name ASC';

  const result = await pool.query(query, params);

  const products = result.rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    badge: row.badge,
    image: row.image,
      altText: row.alt_text,
      span: row.span,
      aspectRatio: row.aspect_ratio,
      description: row.description,
  }));


  return { products, total: products.length };
};

async function getCachedProducts(
  category: string | null,
  pageParam: string | null,
  limitParam: string | null,
  search: string | null,
  sortBy: string | null
) {
  'use cache';
  cacheLife({ stale: 300, revalidate: 300 });
  cacheTag('products');
  return fetchProductsList(category, pageParam, limitParam, search, sortBy);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy');

    const result = await getCachedProducts(category, pageParam, limitParam, search, sortBy);

    if (pageParam !== null) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result.products);
    }
  } catch (error) {
    console.error("Database query failed:", error);
    return NextResponse.json(
      { error: 'Failed to fetch products. Please try again later.' },
      { status: 500 }
    );
  }
}
