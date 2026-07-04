import { NextResponse } from "next/server";
import { pool } from "@/utils/db";
import { cacheLife, cacheTag } from "next/cache";

const fetchLookbookSlides = async () => {
  const result = await pool.query(
    `SELECT id, slide_number, original_image, image_url, alt_text, tag, title, link
     FROM lookbook_slides
     ORDER BY slide_number ASC`
  );
  return result.rows;
};

async function getCachedLookbookSlides() {
  'use cache';
  cacheLife({ stale: 300, revalidate: 300 });
  cacheTag('lookbook');
  return fetchLookbookSlides();
}

export async function GET() {
  try {
    const rows = await getCachedLookbookSlides();

    const slides = rows.map((row) => ({
      id: row.id,
      slideNumber: row.slide_number,
      originalImage: row.original_image,
      imageUrl: row.image_url,
      altText: row.alt_text,
      tag: row.tag,
      title: row.title,
      link: row.link,
    }));

    return NextResponse.json(slides);
  } catch (error) {
    console.error("Database query for lookbook slides failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch lookbook slides. Please try again later." },
      { status: 500 }
    );
  }
}
