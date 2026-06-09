/**
 * delete-product.mts
 * ==================
 *
 * Deletes a product from the Aurora database by ID.
 * Due to the ON DELETE CASCADE constraints, this automatically removes
 * all related entries in product_images, product_sizes, and product_details.
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

const productId = process.argv[2];

if (!productId) {
  console.error("Error: Please provide a product ID.\nUsage: npx tsx scripts/delete-product.mts <product_id>");
  process.exit(1);
}

// ════════════════════════════════════════════════════════
//  Credential loading
// ════════════════════════════════════════════════════════

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

async function run() {
  console.log(`Connecting to database...`);
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  console.log(`Checking if product "${productId}" exists...`);
  const { rows } = await client.query('SELECT name, id FROM products WHERE id = $1', [productId]);

  if (rows.length === 0) {
    console.error(`Error: Product with ID "${productId}" not found in the database.`);
    await client.end();
    process.exit(1);
  }

  const productName = rows[0].name;
  console.log(`Deleting product: "${productName}" (ID: ${productId})...`);

  const res = await client.query('DELETE FROM products WHERE id = $1', [productId]);
  
  if (res.rowCount && res.rowCount > 0) {
    console.log(`\n=== Success! Product "${productName}" (ID: ${productId}) has been wiped from the database. ===`);
  } else {
    console.log(`\nNo rows were deleted.`);
  }

  await client.end();
}

run().catch((err) => {
  console.error("\nDeletion failed:", err);
  process.exit(1);
});
