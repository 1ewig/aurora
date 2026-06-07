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

const createTablesQuery = `
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS product_sizes CASCADE;
DROP TABLE IF EXISTS product_details CASCADE;
DROP TABLE IF EXISTS products CASCADE;

CREATE TABLE products (
  id VARCHAR(50) PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  badge VARCHAR(50),
  image TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  span VARCHAR(50),
  aspect_ratio VARCHAR(50),
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE product_images (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL
);

CREATE TABLE product_sizes (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
  size VARCHAR(50) NOT NULL,
  stock INT NOT NULL DEFAULT 10,
  UNIQUE(product_id, size)
);

CREATE TABLE product_details (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
  detail TEXT NOT NULL
);
`;

async function seed() {
  const client = new Client({ connectionString });
  console.log("Connecting to database...");
  await client.connect();
  console.log("Connected successfully.");

  console.log("Creating normalized tables...");
  await client.query(createTablesQuery);

  console.log(`Inserting/Updating ${uniqueProducts.length} products...`);
  
  const insertProductQuery = `
    INSERT INTO products (
      id, slug, name, category, price, badge, image, alt_text, span, aspect_ratio, description
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
    )
  `;

  const insertImageQuery = `
    INSERT INTO product_images (product_id, image_url) VALUES ($1, $2)
  `;

  const insertSizeQuery = `
    INSERT INTO product_sizes (product_id, size, stock) VALUES ($1, $2, $3)
  `;

  const insertDetailQuery = `
    INSERT INTO product_details (product_id, detail) VALUES ($1, $2)
  `;

  for (const product of uniqueProducts) {
    console.log(`Seeding product: ${product.name} (${product.id})`);
    
    // 1. Insert product base
    await client.query(insertProductQuery, [
      product.id,
      product.slug,
      product.name,
      product.category,
      product.price,
      product.badge || null,
      product.image,
      product.altText,
      product.span || null,
      product.aspectRatio || null,
      product.description
    ]);

    // 2. Insert product images
    if (product.images && product.images.length > 0) {
      for (const imgUrl of product.images) {
        await client.query(insertImageQuery, [product.id, imgUrl]);
      }
    }

    // 3. Insert product sizes (default stock to 10)
    if (product.sizes && product.sizes.length > 0) {
      for (const size of product.sizes) {
        await client.query(insertSizeQuery, [product.id, size, 10]);
      }
    }

    // 4. Insert product details (bullet points)
    if (product.details && product.details.length > 0) {
      for (const detail of product.details) {
        await client.query(insertDetailQuery, [product.id, detail]);
      }
    }
  }

  console.log("Database seeded successfully with normalized relations!");
  await client.end();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
