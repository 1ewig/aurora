/**
 * update-catalog.mts
 * ==================
 *
 * 1. Optimizes and converts JPG, JPEG, and PNG images from images-sources/ to WebP in public/images/
 * 2. Uploads all images recursively from public/images/ to InsForge Storage (across product-media,
 *    lookbook-media, and editorial-media buckets), deleting existing keys beforehand to force-overwrite.
 * 3. Connects to PostgreSQL and upserts products (updates existing, inserts new) from src/data/products.ts.
 * 4. Upserts/syncs lookbook_slides and editorial_content.
 *
 * Usage:
 *   npx tsx scripts/update-catalog.mts
 */

import { createAdminClient } from '@insforge/sdk';
import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Reads definitions
import { heroProducts, featuredProducts, allProducts, type Product } from '../src/data/products';
import { lookbookSlides } from '../src/data/lookbook';
import { editorialItems } from '../src/data/editorial';

// ════════════════════════════════════════════════════════
//  Credential loading
// ════════════════════════════════════════════════════════

const projectJsonPath = path.resolve(process.cwd(), '.insforge', 'project.json');
const dotenvPath = path.resolve(process.cwd(), '.env.local');

if (!fs.existsSync(projectJsonPath)) {
  console.error(
    "Error: .insforge/project.json not found.\n" +
    "Run `npx @insforge/cli create` or `npx @insforge/cli link` first."
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

// Deduplicate products
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
//  Buckets Configuration
// ════════════════════════════════════════════════════════

const BUCKETS = {
  products: 'product-media',
  lookbook: 'lookbook-media',
  editorial: 'editorial-media',
};

function getBucketAndKey(localRelPath: string): { bucket: string; storageKey: string } {
  if (localRelPath.startsWith('/images/lookbook/')) {
    return {
      bucket: BUCKETS.lookbook,
      storageKey: localRelPath.replace(/^\/images\/lookbook\//, ''),
    };
  } else if (localRelPath.startsWith('/images/editorial/')) {
    return {
      bucket: BUCKETS.editorial,
      storageKey: localRelPath.replace(/^\/images\/editorial\//, ''),
    };
  } else {
    const key = localRelPath.replace(/^\/images\//, '');
    return {
      bucket: BUCKETS.products,
      storageKey: key,
    };
  }
}

function buildStorageUrl(bucketName: string, bucketKey: string): string {
  const encodedKey = bucketKey.split('/').map(encodeURIComponent).join('%2F');
  return `${ossHost}/api/storage/buckets/${bucketName}/objects/${encodedKey}`;
}

// ════════════════════════════════════════════════════════
//  Storage Upload and Overwrite
// ════════════════════════════════════════════════════════

async function uploadAndOverwriteImage(
  admin: ReturnType<typeof createAdminClient>,
  localRelPath: string,
  existingKeys: Record<string, Set<string>>,
): Promise<string> {
  const fullPath = path.resolve(process.cwd(), 'public', localRelPath.replace(/^\//, ''));
  const { bucket, storageKey } = getBucketAndKey(localRelPath);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Local file not found: ${fullPath}`);
  }

  if (existingKeys[bucket]?.has(storageKey)) {
    console.log(`  Removing existing storage key from "${bucket}" to force overwrite: "${storageKey}"`);
    await admin.storage.from(bucket).remove(storageKey);
  }

  const buffer = fs.readFileSync(fullPath);
  const blob = new Blob([buffer], { type: 'image/webp' });

  console.log(`  Uploading to "${bucket}": "${storageKey}"`);
  const { data, error } = await admin.storage.from(bucket).upload(storageKey, blob);

  if (error) {
    console.warn(`  Warning: upload error for "${storageKey}" in "${bucket}", using fallback. Details:`, error.message);
    return buildStorageUrl(bucket, storageKey);
  }

  return data?.url || buildStorageUrl(bucket, storageKey);
}

// ════════════════════════════════════════════════════════
//  Main Run Loop
// ════════════════════════════════════════════════════════

async function run() {
  console.log("\n=== Phase 1: Running image optimization ===");
  execSync("node scripts/optimize-images.mjs", { stdio: "inherit" });

  console.log("\n=== Phase 2: Connecting to InsForge and fetching existing keys ===");
  const admin = createAdminClient({ baseUrl: ossHost, apiKey });
  const existingKeys: Record<string, Set<string>> = {};

  for (const bucketName of Object.values(BUCKETS)) {
    existingKeys[bucketName] = new Set<string>();
    try {
      const { data: listData } = await admin.storage.from(bucketName).list({ limit: 1000 });
      const objects = (listData as any)?.data || (listData as any)?.objects || [];
      for (const obj of objects) {
        existingKeys[bucketName].add(obj.key);
      }
    } catch (err: any) {
      console.warn(`Warning pre-populating keys for "${bucketName}": ${err.message || err}`);
    }
  }

  // Find all images under public/images
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

  const allLocalImages = getFilesRecursively(imagesDir, publicDir);
  console.log(`Found ${allLocalImages.length} local images to sync.`);

  const urlMap = new Map<string, string>();
  for (const imgPath of allLocalImages) {
    const url = await uploadAndOverwriteImage(admin, imgPath, existingKeys);
    urlMap.set(imgPath, url);
  }

  console.log("\n=== Phase 3: Connecting to database ===");
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  console.log("\n=== Phase 4: Syncing products and details ===");
  for (const product of uniqueProducts) {
    const imageUrl = urlMap.get(product.image) || product.image;
    console.log(`Syncing product: "${product.name}" (ID: ${product.id})`);

    const { rows } = await client.query('SELECT 1 FROM products WHERE id = $1', [product.id]);
    const exists = rows.length > 0;

    if (exists) {
      await client.query(
        `UPDATE products SET 
          slug = $1, name = $2, category = $3, price = $4, badge = $5, 
          image = $6, alt_text = $7, span = $8, aspect_ratio = $9, description = $10
        WHERE id = $11`,
        [
          product.slug, product.name, product.category, product.price, product.badge || null,
          imageUrl, product.altText, product.span || null, product.aspectRatio || null,
          product.description, product.id
        ]
      );
    } else {
      await client.query(
        `INSERT INTO products (
          id, slug, name, category, price, badge, image, alt_text, span, aspect_ratio, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          product.id, product.slug, product.name, product.category, product.price, product.badge || null,
          imageUrl, product.altText, product.span || null, product.aspectRatio || null, product.description
        ]
      );
    }

    await client.query('DELETE FROM product_images WHERE product_id = $1', [product.id]);
    await client.query('DELETE FROM product_sizes WHERE product_id = $1', [product.id]);
    await client.query('DELETE FROM product_details WHERE product_id = $1', [product.id]);

    const images = product.images?.map((p) => urlMap.get(p) || p) ?? [];
    const sizes = product.sizes ?? [];
    const details = product.details ?? [];

    if (images.length > 0) {
      const imgParams = images.map((_, i) => `($1, $${i + 2})`).join(', ');
      await client.query(
        `INSERT INTO product_images (product_id, image_url) VALUES ${imgParams}`,
        [product.id, ...images]
      );
    }

    if (sizes.length > 0) {
      const szParams: any[] = [product.id];
      const szPlaceholders = sizes.map((s) => {
        szParams.push(s, 10);
        return `($1, $${szParams.length - 1}, $${szParams.length})`;
      }).join(', ');
      await client.query(
        `INSERT INTO product_sizes (product_id, size, stock) VALUES ${szPlaceholders}`,
        szParams
      );
    }

    if (details.length > 0) {
      const detParams = details.map((_, i) => `($1, $${i + 2})`).join(', ');
      await client.query(
        `INSERT INTO product_details (product_id, detail) VALUES ${detParams}`,
        [product.id, ...details]
      );
    }
  }

  console.log("\n=== Phase 5: Syncing lookbook slides ===");
  for (const slide of lookbookSlides) {
    const imageUrl = urlMap.get(slide.originalImage) || slide.originalImage;
    console.log(`Syncing lookbook slide: ${slide.slideNumber}`);

    const { rows } = await client.query('SELECT 1 FROM lookbook_slides WHERE slide_number = $1', [slide.slideNumber]);
    const exists = rows.length > 0;

    if (exists) {
      await client.query(
        `UPDATE lookbook_slides SET original_image = $1, image_url = $2, alt_text = $3, tag = $4, title = $5, link = $6
         WHERE slide_number = $7`,
        [slide.originalImage, imageUrl, slide.altText, slide.tag || null, slide.title || null, slide.link || null, slide.slideNumber]
      );
    } else {
      await client.query(
        `INSERT INTO lookbook_slides (slide_number, original_image, image_url, alt_text, tag, title, link)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [slide.slideNumber, slide.originalImage, imageUrl, slide.altText, slide.tag || null, slide.title || null, slide.link || null]
      );
    }
  }

  console.log("\n=== Phase 6: Syncing editorial content ===");
  for (const item of editorialItems) {
    const imageUrl = urlMap.get(item.originalImage) || item.originalImage;
    console.log(`Syncing editorial item: "${item.id}"`);

    const { rows } = await client.query('SELECT 1 FROM editorial_content WHERE id = $1', [item.id]);
    const exists = rows.length > 0;

    if (exists) {
      await client.query(
        `UPDATE editorial_content SET original_image = $1, image_url = $2, alt_text = $3, title = $4, description = $5
         WHERE id = $6`,
        [item.originalImage, imageUrl, item.altText, item.title, item.description || null, item.id]
      );
    } else {
      await client.query(
        `INSERT INTO editorial_content (id, original_image, image_url, alt_text, title, description)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [item.id, item.originalImage, imageUrl, item.altText, item.title, item.description || null]
      );
    }
  }

  await client.end();
  console.log("\n=== Success! Catalog update complete. ===");
}

run().catch((err) => {
  console.error("Catalog update failed:", err);
  process.exit(1);
});
