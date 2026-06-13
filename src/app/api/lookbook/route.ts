import { NextResponse } from 'next/server';
import { pool } from '@/utils/db';

export async function GET() {
  try {
    const query = 'SELECT id, slide_number, original_image, image_url, alt_text, tag, title, link FROM lookbook_slides ORDER BY slide_number ASC';
    const result = await pool.query(query);

    const slides = result.rows.map((row) => ({
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
      { error: 'Failed to fetch lookbook slides. Please try again later.' },
      { status: 500 }
    );
  }
}
