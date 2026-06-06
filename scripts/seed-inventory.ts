import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { heroProducts, featuredProducts, allProducts, Product } from '../src/data/products';

// Manual dotenv parser for .env.local
const dotenvPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(dotenvPath)) {
  const envConfig = fs.readFileSync(dotenvPath, 'utf-8');
  for (const line of envConfig.split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      value = value.trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value;
    }
  }
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Error: DATABASE_URL not found in .env.local");
  process.exit(1);
}

// Consolidate unique products by slug to avoid duplicates
const productMap = new Map<string, Product>();

const addProducts = (products: Product[]) => {
  products.forEach((p) => {
    if (productMap.has(p.slug)) {
      // Merge properties if needed, e.g. keep the non-hero ID if available (starting with 'p' or 'f' is better than 'h')
      const existing = productMap.get(p.slug)!;
      if (existing.id.startsWith('h') && !p.id.startsWith('h')) {
        productMap.set(p.slug, p);
      }
    } else {
      productMap.set(p.slug, p);
    }
  });
};

addProducts(heroProducts);
addProducts(featuredProducts);
addProducts(allProducts);

const uniqueProducts = Array.from(productMap.values());

const createTableQuery = `
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(50) PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  badge VARCHAR(50),
  image TEXT NOT NULL,
  images TEXT[] NOT NULL,
  alt_text TEXT NOT NULL,
  span VARCHAR(50),
  aspect_ratio VARCHAR(50),
  description TEXT NOT NULL,
  details TEXT[] NOT NULL,
  sizes VARCHAR(50)[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
`;

async function seed() {
  const client = new Client({ connectionString });
  console.log("Connecting to database...");
  await client.connect();
  console.log("Connected successfully.");

  console.log("Creating products table if not exists...");
  await client.query(createTableQuery);

  console.log("Truncating products table to avoid conflicts...");
  await client.query("TRUNCATE TABLE products;");

  console.log(`Inserting/Updating ${uniqueProducts.length} products...`);
  
  const insertQuery = `
    INSERT INTO products (
      id, slug, name, category, price, badge, image, images, alt_text, span, aspect_ratio, description, details, sizes
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
    )
    ON CONFLICT (id) DO UPDATE SET
      slug = EXCLUDED.slug,
      name = EXCLUDED.name,
      category = EXCLUDED.category,
      price = EXCLUDED.price,
      badge = EXCLUDED.badge,
      image = EXCLUDED.image,
      images = EXCLUDED.images,
      alt_text = EXCLUDED.alt_text,
      span = EXCLUDED.span,
      aspect_ratio = EXCLUDED.aspect_ratio,
      description = EXCLUDED.description,
      details = EXCLUDED.details,
      sizes = EXCLUDED.sizes;
  `;

  for (const product of uniqueProducts) {
    console.log(`Seeding product: ${product.name} (${product.id})`);
    await client.query(insertQuery, [
      product.id,
      product.slug,
      product.name,
      product.category,
      product.price,
      product.badge || null,
      product.image,
      product.images,
      product.altText,
      product.span || null,
      product.aspectRatio || null,
      product.description,
      product.details,
      product.sizes
    ]);
  }

  console.log("Database seeded successfully!");
  await client.end();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
