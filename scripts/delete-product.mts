/**
 * delete-product.mts
 * ==================
 *
 * Deletes a product from the Aurora database by ID, and deletes any of its
 * associated images from InsForge Storage if they are not used by other products.
 *
 * ── Usage ───────────────────────────────────────────────
 *
 *   npx tsx scripts/delete-product.mts <product_id>
 *
 * ── Example ─────────────────────────────────────────────
 *
 *   npx tsx scripts/delete-product.mts p15
 */

import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { createAdminClient } from '@insforge/sdk';

const productId = process.argv[2];

if (!productId) {
  console.error("Error: Please provide a product ID.\nUsage: npx tsx scripts/delete-product.mts <product_id>");
  process.exit(1);
}

// ════════════════════════════════════════════════════════
//  Credential loading
// ════════════════════════════════════════════════════════

const projectJsonPath = path.resolve(process.cwd(), '.insforge', 'project.json');
const dotenvPath = path.resolve(process.cwd(), '.env.local');

if (!fs.existsSync(projectJsonPath)) {
  console.error("Error: .insforge/project.json not found.");
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

const BUCKET = 'product-media';

// Helper to extract the storage key from an InsForge storage URL or local path
function getStorageKeyFromUrl(url: string): string | null {
  if (!url) return null;
  
  const prefix = '/api/storage/buckets/product-media/objects/';
  const index = url.indexOf(prefix);
  if (index !== -1) {
    const encodedKey = url.substring(index + prefix.length).split('?')[0];
    try {
      return decodeURIComponent(encodedKey);
    } catch {
      return encodedKey;
    }
  }
  
  if (url.startsWith('/images/')) {
    return url.replace(/^\/images\//, '');
  }
  
  return null;
}

async function run() {
  const admin = createAdminClient({ baseUrl: ossHost, apiKey });

  console.log(`Connecting to database...`);
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  console.log(`Checking if product "${productId}" exists...`);
  const { rows: productRows } = await client.query(
    'SELECT name, id, image FROM products WHERE id = $1', 
    [productId]
  );

  if (productRows.length === 0) {
    console.error(`Error: Product with ID "${productId}" not found in the database.`);
    await client.end();
    process.exit(1);
  }

  const productName = productRows[0].name;
  const mainImageUrl = productRows[0].image;

  // 1. Gather all associated image URLs (main image + gallery images)
  const imageUrls = new Set<string>();
  if (mainImageUrl) {
    imageUrls.add(mainImageUrl);
  }

  const { rows: galleryRows } = await client.query(
    'SELECT image_url FROM product_images WHERE product_id = $1',
    [productId]
  );
  for (const row of galleryRows) {
    if (row.image_url) {
      imageUrls.add(row.image_url);
    }
  }

  // 2. Filter and delete images from InsForge Storage if they are not used by other products
  console.log(`Checking storage usage for ${imageUrls.size} asset(s)...`);
  for (const url of imageUrls) {
    const { rows: usageRows } = await client.query(
      `SELECT COUNT(*) as count FROM (
        SELECT 1 FROM products WHERE image = $1 AND id <> $2
        UNION ALL
        SELECT 1 FROM product_images WHERE image_url = $1 AND product_id <> $2
      ) as usages`,
      [url, productId]
    );

    const count = parseInt(usageRows[0].count, 10);
    if (count === 0) {
      const storageKey = getStorageKeyFromUrl(url);
      if (storageKey) {
        console.log(`  Deleting unused storage key: "${storageKey}"...`);
        const { error } = await admin.storage.from(BUCKET).remove(storageKey);
        if (error) {
          console.warn(`  Warning: failed to delete "${storageKey}" from storage:`, error.message);
        } else {
          console.log(`  ✓ Wiped from storage.`);
        }
      }
    } else {
      console.log(`  Skipping storage deletion for "${url}" (used by ${count} other product(s)).`);
    }
  }

  // 3. Delete the product from the database (foreign key cascade handles sizes, gallery list, details)
  console.log(`Deleting product: "${productName}" (ID: ${productId}) from database...`);
  const res = await client.query('DELETE FROM products WHERE id = $1', [productId]);
  
  if (res.rowCount && res.rowCount > 0) {
    console.log(`\n=== Success! Product "${productName}" (ID: ${productId}) and its unused media have been wiped. ===`);
  } else {
    console.log(`\nNo rows were deleted.`);
  }

  await client.end();
}

run().catch((err) => {
  console.error("\nDeletion failed:", err);
  process.exit(1);
});
