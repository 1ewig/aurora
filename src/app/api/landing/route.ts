/**
 * Aurora — src/app/api/landing/route.ts
 *
 * GET /api/landing — returns aggregated homepage data:
 * featured products, lookbook slides, material highlights, testimonials,
 * and category metadata. Uses Next.js `use cache` for ISR with 60s stale TTL.
 */

import { NextResponse } from "next/server";
import { pool } from "@/utils/db";
import { cacheLife, cacheTag } from "next/cache";
import { rethrowIfDynamicServerError } from "@/utils/errors";

export async function getLandingData() {
  'use cache';
  cacheLife({ stale: 60, revalidate: 60 });
  cacheTag('landing');

  const [products, categories, lookbook, editorial, materials] = await Promise.all([
    pool.query(
      `SELECT id, slug, name, category, price, badge, image, alt_text, span, aspect_ratio, description
       FROM products ORDER BY name ASC`
    ),
    pool.query(
      `SELECT slug, name, image, description
       FROM categories ORDER BY name ASC`
    ),
    pool.query(
      `SELECT id, slide_number, original_image, image_url, alt_text, tag, title, link
       FROM lookbook_slides ORDER BY slide_number ASC`
    ),
    pool.query(
      `SELECT id, original_image, image_url, alt_text, title, description
       FROM editorial_content`
    ),
    pool.query(
      `SELECT id, name, source, image_url, description, properties
       FROM materials ORDER BY name ASC`
    ),
  ]);

  return {
    products: products.rows.map((row) => ({
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
    })),
    categories: categories.rows,
    lookbook: lookbook.rows.map((row) => ({
      id: row.id,
      slideNumber: row.slide_number,
      originalImage: row.original_image,
      imageUrl: row.image_url,
      altText: row.alt_text,
      tag: row.tag,
      title: row.title,
      link: row.link,
    })),
    editorial: editorial.rows.map((row) => ({
      id: row.id,
      originalImage: row.original_image,
      imageUrl: row.image_url,
      altText: row.alt_text,
      title: row.title,
      description: row.description,
    })),
    materials: materials.rows.map((row) => ({
      id: row.id,
      name: row.name,
      source: row.source,
      image: row.image_url,
      description: row.description,
      properties: row.properties ?? [],
    })),
    serverDay: new Date().getDate(),
  };
}

export async function GET() {
  try {
    return NextResponse.json(await getLandingData());
  } catch (error) {
    rethrowIfDynamicServerError(error);
    console.error("Failed to fetch landing data:", error);
    return NextResponse.json(
      { error: "Failed to fetch landing data." },
      { status: 500 }
    );
  }
}
