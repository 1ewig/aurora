/**
 * upload-and-seed.mts
 * ===================
 *
 * Uploads product images to InsForge Storage and seeds the Aurora database.
 *
 * ── Usage ───────────────────────────────────────────────
 *
 *   First-time deploy (fresh project, empty DB, no images):
 *     npx tsx scripts/upload-and-seed.mts --fresh
 *
 *   Adding new products later (existing DB, skip duplicates):
 *     npx tsx scripts/upload-and-seed.mts
 *
 * ── Modes ───────────────────────────────────────────────
 *
 *   --fresh (flag):
 *     - Drops and recreates all 4 tables (products, product_images,
 *       product_sizes, product_details)
 *     - Uploads every image to the product-media bucket via the SDK
 *     - Inserts ALL products from src/data/products.ts
 *
 *   Additive (default, no flag):
 *     - Skips table creation (tables must already exist)
 *     - Skips ALL SDK uploads — constructs storage URLs directly
 *       (images were uploaded during the --fresh run)
 *     - Queries existing slugs from the DB upfront
 *     - Inserts only products whose slug is new (skips duplicates)
 *     - Appends related data (images, sizes, details) ONLY for
 *       newly inserted products
 *     - Safe to run repeatedly — existing data is never touched
 */

import { createAdminClient } from '@insforge/sdk';
import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Reads the static product definitions from src/data/products.ts.
// To add new products, edit that file, then run this script without --fresh.
import { heroProducts, featuredProducts, allProducts, type Product } from '../src/data/products';

const isFresh = process.argv.includes('--fresh');

// ════════════════════════════════════════════════════════
//  Credential loading
// ════════════════════════════════════════════════════════

const projectJsonPath = path.resolve(process.cwd(), '.insforge', 'project.json');
const dotenvPath = path.resolve(process.cwd(), '.env.local');

if (!fs.existsSync(projectJsonPath)) {
  console.error(
    "Error: .insforge/project.json not found.\n" +
    "Run `npx @insforge/cli create` (new project) or `npx @insforge/cli link` (existing project) first."
  );
  process.exit(1);
}

const projectJson = JSON.parse(fs.readFileSync(projectJsonPath, 'utf-8'));
const ossHost: string = projectJson.oss_host;
const apiKey: string = projectJson.api_key;

if (fs.existsSync(dotenvPath)) {
  const envConfig = fs.readFileSync(dotenvPath, 'utf-8');
  for (const line of envConfig.split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      value = value.trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("Error: DATABASE_URL not found in .env.local");
  process.exit(1);
}

// ════════════════════════════════════════════════════════
//  Product deduplication
//  heroProducts, featuredProducts, and allProducts share
//  some slugs. This merges them, preferring non-hero IDs
//  (hero entries have less metadata like span/aspectRatio).
// ════════════════════════════════════════════════════════

const productMap = new Map<string, Product>();

function addProducts(products: Product[]) {
  for (const p of products) {
    const existing = productMap.get(p.slug);
    if (existing) {
      if (existing.id.startsWith('h') && !p.id.startsWith('h')) {
        productMap.set(p.slug, p);
      }
    } else {
      productMap.set(p.slug, p);
    }
  }
}

addProducts(heroProducts);
addProducts(featuredProducts);
addProducts(allProducts);

const uniqueProducts = Array.from(productMap.values());

// ════════════════════════════════════════════════════════
//  Helpers
// ════════════════════════════════════════════════════════

const BUCKET = 'product-media';

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mime: Record<string, string> = {
    '.webp': 'image/webp',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.gif': 'image/gif',
  };
  return mime[ext] || 'application/octet-stream';
}

/** Build a deterministic storage URL from a bucket key. */
function buildStorageUrl(bucketKey: string): string {
  const encodedKey = bucketKey.split('/').map(encodeURIComponent).join('%2F');
  return `${ossHost}/api/storage/buckets/product-media/objects/${encodedKey}`;
}

/**
 * Process items in fixed-size batches with Promise.allSettled.
 * Each batch runs up to `concurrency` items in parallel.
 * Useful for HTTP calls where too much concurrency overwhelms the server.
 */
async function eachBatch<T>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<void>,
) {
  for (let i = 0; i < items.length; i += concurrency) {
    await Promise.allSettled(items.slice(i, i + concurrency).map(fn));
  }
}

// ════════════════════════════════════════════════════════
//  Image resolution
//  Returns the URL and a status string for logging.
//
//  In fresh mode (shouldUpload = true):
//    Tries the SDK upload. If the file already exists or
//    any error occurs, falls back to the constructed URL.
//
//  In additive mode (shouldUpload = false):
//    Skips the SDK entirely — just constructs the URL.
//    Images were already uploaded during the --fresh run.
// ════════════════════════════════════════════════════════

type ImageResult = {
  url: string | null;
  status: 'uploaded' | 'exists' | 'fallback' | 'missing';
};

async function resolveImage(
  admin: ReturnType<typeof createAdminClient>,
  localRelPath: string,
  existingKeys: Set<string>,
): Promise<ImageResult> {
  const fullPath = path.resolve(
    process.cwd(),
    'public',
    localRelPath.replace(/^\//, ''),
  );

  if (!fs.existsSync(fullPath)) {
    return { url: null, status: 'missing' };
  }

  const storageKey = localRelPath.replace(/^\/images\//, '');

  if (existingKeys.has(storageKey)) {
    return { url: buildStorageUrl(storageKey), status: 'exists' };
  }

  const buffer = fs.readFileSync(fullPath);
  const mimeType = getMimeType(fullPath);

  try {
    const blob = new Blob([buffer], { type: mimeType });
    const { data, error } = await admin.storage
      .from(BUCKET)
      .upload(storageKey, blob);

    if (error) {
      return { url: buildStorageUrl(storageKey), status: 'fallback',  };
    }

    const url = data?.url;
    if (!url) {
      return { url: buildStorageUrl(storageKey), status: 'fallback' };
    }

    return { url, status: 'uploaded' };
  } catch {
    return { url: buildStorageUrl(storageKey), status: 'fallback' };
  }
}

// ════════════════════════════════════════════════════════
//  Main
// ════════════════════════════════════════════════════════

async function seed() {
  console.log(`\n=== Mode: ${isFresh ? '--fresh (wipe & re-seed)' : 'additive (new products only)'} ===\n`);

  // ── 1. Admin client ──

  console.log("Initializing InsForge admin client...");
  const admin = createAdminClient({ baseUrl: ossHost, apiKey });

  // ── 1b. Verify and prepare storage bucket ──
  console.log(`Verifying storage bucket "${BUCKET}"...`);
  let bucketExists = false;
  let hasData = false;

  try {
    const bucketsList = execSync(`npx @insforge/cli storage buckets`, { encoding: 'utf-8' });
    bucketExists = bucketsList.includes(BUCKET);
    
    if (bucketExists) {
      const { data: listData } = await admin.storage.from(BUCKET).list({ limit: 1 });
      const objects = (listData as any)?.data || (listData as any)?.objects;
      if (objects && objects.length > 0) {
        hasData = true;
      }
    }
  } catch (err: any) {
    console.warn(`Warning checking bucket status: ${err.message || err}`);
    bucketExists = false;
  }

  if (!bucketExists) {
    console.log(`Bucket "${BUCKET}" does not exist. Creating it...`);
    try {
      const createOut = execSync(`npx @insforge/cli storage create-bucket ${BUCKET}`, { encoding: 'utf-8' });
      console.log(createOut);
      console.log(`Successfully created bucket "${BUCKET}".`);
    } catch (err: any) {
      console.error(`Failed to create bucket "${BUCKET}" via CLI:`, err.message || err);
      process.exit(1);
    }
  } else if (isFresh && hasData) {
    console.log(`Bucket "${BUCKET}" has existing data. Wiping and recreating bucket...`);
    try {
      const deleteOut = execSync(`npx @insforge/cli storage delete-bucket ${BUCKET}`, { input: 'y\n', encoding: 'utf-8' });
      console.log(deleteOut);
      const createOut = execSync(`npx @insforge/cli storage create-bucket ${BUCKET}`, { encoding: 'utf-8' });
      console.log(createOut);
      console.log(`Successfully wiped and recreated bucket "${BUCKET}".`);
    } catch (err: any) {
      console.error(`Failed to recreate bucket "${BUCKET}" via CLI:`, err.message || err);
      process.exit(1);
    }
  } else {
    console.log(`Bucket "${BUCKET}" is ready.`);
  }

  // ── 2. Collect all unique image paths ──

  const allImagePaths = new Set<string>();

  // Collect all files from public/images recursively
  const publicDir = path.resolve(process.cwd(), 'public');
  const imagesDir = path.resolve(publicDir, 'images');

  function getFilesRecursively(dir: string, baseDir: string): string[] {
    let results: string[] = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const filePath = path.resolve(dir, file);
      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        results = results.concat(getFilesRecursively(filePath, baseDir));
      } else {
        const ext = path.extname(filePath).toLowerCase();
        if (['.webp', '.jpg', '.jpeg', '.png', '.svg', '.gif'].includes(ext)) {
          const rel = path.relative(baseDir, filePath);
          const normalized = '/' + rel.replace(/\\/g, '/');
          results.push(normalized);
        }
      }
    }
    return results;
  }

  const scannedImages = getFilesRecursively(imagesDir, publicDir);
  for (const img of scannedImages) {
    allImagePaths.add(img);
  }

  for (const product of uniqueProducts) {
    if (product.image) allImagePaths.add(product.image);
    for (const img of product.images || []) {
      allImagePaths.add(img);
    }
  }

  // ── 3. Resolve image URLs ──

  console.time(`  Images (${allImagePaths.size} files)`);

  console.log(`\nResolving ${allImagePaths.size} images (bucket: "${BUCKET}")...\n`);
  
  const existingKeys = new Set<string>();
  if (bucketExists) {
    try {
      const { data: listData } = await admin.storage.from(BUCKET).list({ limit: 1000 });
      const objects = (listData as any)?.data || (listData as any)?.objects || [];
      for (const obj of objects) {
        existingKeys.add(obj.key);
      }
    } catch (err: any) {
      console.warn(`Warning pre-populating existing keys: ${err.message || err}`);
    }
  }

  const urlMap = new Map<string, string>();

  let uploaded = 0;
  let exists = 0;
  let missing = 0;

  await eachBatch(Array.from(allImagePaths), 5, async (localPath) => {
    const { url, status } = await resolveImage(admin, localPath, existingKeys);
    const label = localPath.replace(/^\/images\//, '');

    if (url) {
      urlMap.set(localPath, url);
    }

    switch (status) {
      case 'uploaded':
        uploaded++;
        console.log(`  ✓ ${label}`);
        break;
      case 'exists':
        exists++;
        console.log(`  ○ ${label}`);
        break;
      case 'fallback':
        exists++;
        console.log(`  ○ ${label}`);
        break;
      case 'missing':
        missing++;
        console.warn(`  ✗ ${label}`);
        break;
    }
  });

  console.timeEnd(`  Images (${allImagePaths.size} files)`);

  if (isFresh) {
    console.log(`  → ${uploaded} uploaded, ${missing} missing\n`);
  } else {
    console.log(`  → ${exists} resolved from bucket, ${missing} missing\n`);
  }

  // ── 4. Connect to the database ──

  console.time('  Database connect');
  console.log("Connecting to database...");
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  console.timeEnd('  Database connect');

  // ── 5. Create or verify tables ──

  console.time('  Table setup');

  if (isFresh) {
    console.log("Creating tables (fresh)...");
    await client.query(`
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
    `);
  } else {
    const { rows } = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    const tableNames = rows.map((r: any) => r.table_name);
    const needed = ['products', 'product_images', 'product_sizes', 'product_details'];
    const missingTables = needed.filter((t) => !tableNames.includes(t));
    if (missingTables.length > 0) {
      console.error(
        `Error: tables [${missingTables.join(', ')}] don't exist.\n` +
        `Run with --fresh to create them, or run scripts/create-tables.sql manually.`
      );
      await client.end();
      process.exit(1);
    }
  }

  console.timeEnd('  Table setup');

  // ── 6. Determine which products to insert ──

  console.time('  Data insertion');

  let existingSlugs = new Set<string>();

  if (!isFresh) {
    const { rows } = await client.query('SELECT slug FROM products');
    existingSlugs = new Set(rows.map((r: any) => r.slug));
  }

  const toInsert = isFresh
    ? uniqueProducts
    : uniqueProducts.filter((p) => !existingSlugs.has(p.slug));

  const skipped = uniqueProducts.length - toInsert.length;

  if (toInsert.length === 0) {
    console.log("\nNo new products to insert. Everything is up to date.");
    console.timeEnd('  Data insertion');
    await client.end();
    return;
  }

  console.log(
    isFresh
      ? `\nInserting all ${toInsert.length} products...\n`
      : `\nInserting ${toInsert.length} new product(s) (${skipped} already exist)...\n`
  );

  // ── 7. Insert products + related data ──

  let totalImages = 0;
  let totalSizes = 0;
  let totalDetails = 0;

  for (const product of toInsert) {
    const imageUrl = urlMap.get(product.image) || product.image;

    console.log(`  ${product.name}`);
    console.log(`    ID: ${product.id}  |  Category: ${product.category}`);

    await client.query(
      `INSERT INTO products (
        id, slug, name, category, price, badge, image, alt_text, span, aspect_ratio, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        product.id, product.slug, product.name, product.category, product.price,
        product.badge || null, imageUrl, product.altText,
        product.span || null, product.aspectRatio || null, product.description,
      ],
    );

    const images = product.images?.map((p) => urlMap.get(p) || p) ?? [];
    const sizes = product.sizes ?? [];
    const details = product.details ?? [];

    // Multi-row INSERT for gallery images
    if (images.length > 0) {
      const imgParams = images.map((_, i) => `($1, $${i + 2})`).join(', ');
      await client.query(
        `INSERT INTO product_images (product_id, image_url) VALUES ${imgParams}`,
        [product.id, ...images],
      );
    }

    // Multi-row INSERT for sizes (product_id reused as $1, each size+stock pair gets its own slot)
    if (sizes.length > 0) {
      const szParams: any[] = [product.id];
      const szPlaceholders = sizes.map((s) => {
        szParams.push(s, 10);
        return `($1, $${szParams.length - 1}, $${szParams.length})`;
      }).join(', ');
      await client.query(
        `INSERT INTO product_sizes (product_id, size, stock) VALUES ${szPlaceholders}`,
        szParams,
      );
    }

    // Multi-row INSERT for details
    if (details.length > 0) {
      const detParams = details.map((_, i) => `($1, $${i + 2})`).join(', ');
      await client.query(
        `INSERT INTO product_details (product_id, detail) VALUES ${detParams}`,
        [product.id, ...details],
      );
    }

    totalImages += images.length;
    totalSizes += sizes.length;
    totalDetails += details.length;

    console.log(`    → ${images.length} gallery images, ${sizes.length} sizes, ${details.length} details\n`);
  }

  console.timeEnd('  Data insertion');

  // ── 8. Summary ──

  const productWord = toInsert.length === 1 ? 'product' : 'products';

  if (isFresh) {
    console.log(`\n=== Done! ${toInsert.length} ${productWord} seeded into fresh tables. ===`);
  } else {
    console.log(
      `\n=== Done! ${toInsert.length} new ${productWord} added. ` +
      `${skipped} already existed and were left untouched. ===`
    );
  }
  console.log(
    `    Total: ${totalImages} gallery images, ${totalSizes} sizes, ${totalDetails} details\n`
  );

  await client.end();
}

seed().catch((err) => {
  console.error("\nSeeding failed:", err);
  process.exit(1);
});
