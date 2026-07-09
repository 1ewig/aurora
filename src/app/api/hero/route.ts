import { NextResponse } from "next/server";
import { pool } from "@/utils/db";
import { cacheLife, cacheTag } from "next/cache";

const fetchHeroSlides = async () => {
  const result = await pool.query(
    `SELECT id, slide_number, original_image, image_url, alt_text, title, link
     FROM hero_slides
     ORDER BY slide_number ASC`
  );
  return result.rows;
};

async function getCachedHeroSlides() {
  'use cache';
  cacheLife({ stale: 300, revalidate: 300 });
  cacheTag('hero');
  return fetchHeroSlides();
}

export async function GET() {
  try {
    const rows = await getCachedHeroSlides();

    const slides = rows.map((row) => ({
      id: row.id,
      slideNumber: row.slide_number,
      originalImage: row.original_image,
      imageUrl: row.image_url,
      altText: row.alt_text,
      title: row.title,
      link: row.link,
    }));

    return NextResponse.json(slides);
  } catch (error) {
    console.error("Database query for hero slides failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch hero slides. Please try again later." },
      { status: 500 }
    );
  }
}
