import { NextResponse } from 'next/server';
import { pool } from '@/utils/db';

export async function GET() {
  try {
    const query = 'SELECT id, original_image, image_url, alt_text, title, description FROM editorial_content';
    const result = await pool.query(query);

    const items = result.rows.map((row) => ({
      id: row.id,
      originalImage: row.original_image,
      imageUrl: row.image_url,
      altText: row.alt_text,
      title: row.title,
      description: row.description,
    }));

    return NextResponse.json(items);
  } catch (error) {
    console.error("Database query for editorial content failed:", error);
    return NextResponse.json(
      { error: 'Failed to fetch editorial content. Please try again later.' },
      { status: 500 }
    );
  }
}
