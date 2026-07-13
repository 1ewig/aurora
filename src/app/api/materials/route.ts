import { NextResponse } from "next/server";
import { pool } from "@/utils/db";
import { cacheLife, cacheTag } from "next/cache";

async function getMaterials() {
  'use cache';
  cacheLife({ stale: 300, revalidate: 300 });
  cacheTag('materials');

  const result = await pool.query(
    `SELECT id, name, source, original_image, image_url, description, properties
     FROM materials ORDER BY name ASC`
  );

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    source: row.source,
    image: row.image_url,
    description: row.description,
    properties: row.properties ?? [],
  }));
}

export async function GET() {
  try {
    const items = await getMaterials();
    return NextResponse.json(items);
  } catch (error) {
    console.error("Failed to fetch materials:", error);
    return NextResponse.json(
      { error: "Failed to fetch materials." },
      { status: 500 }
    );
  }
}
