/**
 * update-catalog.mts
 * ==================
 *
 * All-rounder catalog management script.
 * Can sync full catalog, add new products, modify existing products, or delete products interactively.
 * Auto-synchronizes local src/data/products.ts and updates the InsForge database/storage.
 *
 * Usage:
 *   npx tsx scripts/update-catalog.mts
 */

import { createAdminClient } from '@insforge/sdk';
import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import readline from 'readline';

// Reads definitions
import { heroProducts, featuredProducts, allProducts, type Product } from '../src/data/products';
import { lookbookSlides } from '../src/data/lookbook';
import { editorialItems } from '../src/data/editorial';

// ════════════════════════════════════════════════════════
//  Interactive Input Helpers
// ════════════════════════════════════════════════════════

function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => rl.question(query, (ans) => {
    rl.close();
    resolve(ans.trim());
  }));
}

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

// ════════════════════════════════════════════════════════
//  Serialization helper to sync src/data/products.ts
// ════════════════════════════════════════════════════════

function serializeProduct(p: Product): string {
  return `  {
    id: ${JSON.stringify(p.id)},
    slug: ${JSON.stringify(p.slug)},
    name: ${JSON.stringify(p.name)},
    category: ${JSON.stringify(p.category)},
    price: ${p.price},
    ${p.badge ? `badge: ${JSON.stringify(p.badge)},` : ''}
    image: ${JSON.stringify(p.image)},
    images: ${JSON.stringify(p.images || [p.image])},
    altText: ${JSON.stringify(p.altText)},
    ${p.span ? `span: ${JSON.stringify(p.span)},` : ''}
    ${p.aspectRatio ? `aspectRatio: ${JSON.stringify(p.aspectRatio)},` : ''}
    ${p.description ? `description: ${JSON.stringify(p.description)},` : ''}
    ${p.details ? `details: ${JSON.stringify(p.details)},` : ''}
    sizes: ${JSON.stringify(p.sizes || [])},
  }`;
}

function saveProductsLocal(hero: Product[], featured: Product[], all: Product[]) {
  const filePath = path.resolve(process.cwd(), 'src', 'data', 'products.ts');
  const content = `export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  badge?: string;
  image: string;
  images?: string[];
  altText: string;
  span?: string;
  aspectRatio?: string;
  description?: string;
  details?: string[];
  sizes?: string[];
}

export const categories = [
  "Outerwear",
  "Knitwear",
  "Trousers",
  "Dresses",
  "Accessories",
] as const;

export type Category = (typeof categories)[number];

const sizeOptions = {
  apparel: ["XS", "S", "M", "L", "XL"],
  accessories: ["One Size"],
};

export const heroProducts: Product[] = [
${hero.map(serializeProduct).join(',\n')}
];

export const featuredProducts: Product[] = [
${featured.map(serializeProduct).join(',\n')}
];

export const allProducts: Product[] = [
${all.map(serializeProduct).join(',\n')}
];
`;
  fs.writeFileSync(filePath, content, 'utf-8');
}

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
    const key = localRelPath.replace(/^\/images\/(products\/)?/, '');
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
    console.warn(`  Warning: Local file not found: ${fullPath}. Database will use raw path placeholder.`);
    return buildStorageUrl(bucket, storageKey);
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
//  Operations
// ════════════════════════════════════════════════════════

async function getExistingKeys(admin: ReturnType<typeof createAdminClient>): Promise<Record<string, Set<string>>> {
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
  return existingKeys;
}

async function uploadCatalogImages(admin: ReturnType<typeof createAdminClient>, productsList: Product[]) {
  const existingKeys = await getExistingKeys(admin);
  const urlMap = new Map<string, string>();

  // Gather unique image paths
  const imagePaths = new Set<string>();
  for (const p of productsList) {
    if (p.image) imagePaths.add(p.image);
    if (p.images) {
      for (const img of p.images) {
        imagePaths.add(img);
      }
    }
  }

  console.log(`Syncing ${imagePaths.size} product media assets...`);
  for (const imgPath of imagePaths) {
    const url = await uploadAndOverwriteImage(admin, imgPath, existingKeys);
    urlMap.set(imgPath, url);
  }
  return urlMap;
}

async function syncProductToDb(client: Client, product: Product, urlMap: Map<string, string>) {
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

// ════════════════════════════════════════════════════════
//  Interactive Actions
// ════════════════════════════════════════════════════════

async function addProductInteractively() {
  console.log("\n--- ADD NEW PRODUCT ---");
  const id = await askQuestion("Enter unique Product ID (e.g. p15): ");
  if (!id) {
    console.error("ID cannot be empty.");
    return;
  }
  const allMerged = [...allProducts, ...heroProducts, ...featuredProducts];
  if (allMerged.some(p => p.id === id)) {
    console.error(`A product with ID "${id}" already exists.`);
    return;
  }

  const name = await askQuestion("Enter Product Name: ");
  if (!name) {
    console.error("Name cannot be empty.");
    return;
  }

  const defaultSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const slugInput = await askQuestion(`Enter Slug [Default: ${defaultSlug}]: `);
  const slug = slugInput || defaultSlug;

  console.log("Categories:\n1. Outerwear\n2. Knitwear\n3. Trousers\n4. Dresses\n5. Accessories");
  const catChoice = await askQuestion("Select Category (1-5): ");
  let category = "Outerwear";
  if (catChoice === "2") category = "Knitwear";
  else if (catChoice === "3") category = "Trousers";
  else if (catChoice === "4") category = "Dresses";
  else if (catChoice === "5") category = "Accessories";

  const priceInput = await askQuestion("Enter Price (number, e.g. 450): ");
  const price = parseFloat(priceInput) || 0;

  const badge = await askQuestion("Enter Badge (optional, e.g. New / Limited): ");

  const defaultImg = `/images/products/${slug}.webp`;
  const imgInput = await askQuestion(`Enter Main Image Path [Default: ${defaultImg}]: `);
  const image = imgInput || defaultImg;

  const altText = await askQuestion("Enter Alt Text: ") || name;
  const description = await askQuestion("Enter Description: ");

  const detailsInput = await askQuestion("Enter Details (comma-separated): ");
  const details = detailsInput ? detailsInput.split(',').map(s => s.trim()) : [];

  console.log("Sizes Option:\n1. Apparel (XS, S, M, L, XL)\n2. Accessories (One Size)\n3. Custom (comma-separated)");
  const sizeChoice = await askQuestion("Select sizes type (1-3): ");
  let sizes: string[] = [];
  if (sizeChoice === "2") {
    sizes = ["One Size"];
  } else if (sizeChoice === "3") {
    const customSizes = await askQuestion("Enter custom sizes (comma-separated): ");
    sizes = customSizes.split(',').map(s => s.trim());
  } else {
    sizes = ["XS", "S", "M", "L", "XL"];
  }

  const addToHero = (await askQuestion("Add to Hero Carousel? (y/N): ")).toLowerCase() === 'y';
  const addToFeatured = (await askQuestion("Add to Featured Grid? (y/N): ")).toLowerCase() === 'y';

  const newProduct: Product = {
    id, slug, name, category, price,
    ...(badge ? { badge } : {}),
    image,
    images: [image],
    altText,
    ...(description ? { description } : {}),
    ...(details.length > 0 ? { details } : {}),
    sizes,
  };

  // Add to in-memory arrays
  allProducts.push(newProduct);
  if (addToHero) heroProducts.push(newProduct);
  if (addToFeatured) featuredProducts.push(newProduct);

  // 1. Save locally
  saveProductsLocal(heroProducts, featuredProducts, allProducts);
  console.log(`\nSuccessfully updated local definition in src/data/products.ts.`);

  // 2. Sync to DB & Storage
  console.log("\nSyncing changes to Database & Storage...");
  const admin = createAdminClient({ baseUrl: ossHost, apiKey });
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  const urlMap = await uploadCatalogImages(admin, [newProduct]);
  await syncProductToDb(client, newProduct, urlMap);

  await client.end();
  console.log("\nProduct successfully added to Local Files, InsForge Storage, and Database!");
}

async function modifyProductInteractively() {
  console.log("\n--- MODIFY PRODUCT ---");
  const allMerged = Array.from(new Map([...allProducts, ...heroProducts, ...featuredProducts].map(p => [p.id, p])).values());
  
  if (allMerged.length === 0) {
    console.log("No products available to modify.");
    return;
  }

  console.log("Available Products:");
  allMerged.forEach((p, idx) => {
    console.log(`  [${idx + 1}] ID: ${p.id} | ${p.name} (${p.category})`);
  });

  const choiceInput = await askQuestion(`Select a product to modify (1-${allMerged.length}): `);
  const choiceIdx = parseInt(choiceInput) - 1;
  if (isNaN(choiceIdx) || choiceIdx < 0 || choiceIdx >= allMerged.length) {
    console.error("Invalid choice.");
    return;
  }

  const target = allMerged[choiceIdx];
  console.log(`\nModifying: ${target.name} (${target.id})`);

  const name = await askQuestion(`Enter New Name [Current: ${target.name}]: `) || target.name;
  const slug = await askQuestion(`Enter New Slug [Current: ${target.slug}]: `) || target.slug;
  
  console.log(`Categories:\n1. Outerwear\n2. Knitwear\n3. Trousers\n4. Dresses\n5. Accessories`);
  const catChoice = await askQuestion(`Select Category (1-5) [Current: ${target.category}]: `);
  let category = target.category;
  if (catChoice === "1") category = "Outerwear";
  else if (catChoice === "2") category = "Knitwear";
  else if (catChoice === "3") category = "Trousers";
  else if (catChoice === "4") category = "Dresses";
  else if (catChoice === "5") category = "Accessories";

  const priceInput = await askQuestion(`Enter Price [Current: ${target.price}]: `);
  const price = priceInput ? parseFloat(priceInput) : target.price;

  const badge = await askQuestion(`Enter Badge [Current: ${target.badge || 'None'}]: `) || target.badge;
  const image = await askQuestion(`Enter Image Path [Current: ${target.image}]: `) || target.image;
  const altText = await askQuestion(`Enter Alt Text [Current: ${target.altText}]: `) || target.altText;
  const description = await askQuestion(`Enter Description [Current: ${target.description || 'None'}]: `) || target.description;

  const detailsInput = await askQuestion(`Enter Details (comma-separated) [Current: ${target.details?.join(', ') || 'None'}]: `);
  const details = detailsInput ? detailsInput.split(',').map(s => s.trim()) : target.details;

  const customSizes = await askQuestion(`Enter Sizes (comma-separated) [Current: ${target.sizes?.join(', ') || 'None'}]: `);
  const sizes = customSizes ? customSizes.split(',').map(s => s.trim()) : target.sizes;

  const updatedProduct: Product = {
    ...target,
    name, slug, category, price,
    ...(badge ? { badge } : {}),
    image,
    images: [image],
    altText,
    ...(description ? { description } : {}),
    ...(details && details.length > 0 ? { details } : {}),
    sizes,
  };

  // Update in-memory lists
  const updateList = (list: Product[]) => {
    const idx = list.findIndex(p => p.id === target.id);
    if (idx !== -1) list[idx] = updatedProduct;
  };
  updateList(allProducts);
  updateList(heroProducts);
  updateList(featuredProducts);

  // 1. Save locally
  saveProductsLocal(heroProducts, featuredProducts, allProducts);
  console.log(`\nSuccessfully updated local definition in src/data/products.ts.`);

  // 2. Sync to DB & Storage
  console.log("\nSyncing modifications to Database & Storage...");
  const admin = createAdminClient({ baseUrl: ossHost, apiKey });
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  const urlMap = await uploadCatalogImages(admin, [updatedProduct]);
  await syncProductToDb(client, updatedProduct, urlMap);

  await client.end();
  console.log("\nProduct successfully modified locally and synced to remote!");
}

async function deleteProductInteractively() {
  console.log("\n--- DELETE PRODUCT ---");
  const allMerged = Array.from(new Map([...allProducts, ...heroProducts, ...featuredProducts].map(p => [p.id, p])).values());

  if (allMerged.length === 0) {
    console.log("No products available to delete.");
    return;
  }

  console.log("Available Products:");
  allMerged.forEach((p, idx) => {
    console.log(`  [${idx + 1}] ID: ${p.id} | ${p.name} (${p.category})`);
  });

  const choiceInput = await askQuestion(`Select product to DELETE (1-${allMerged.length}): `);
  const choiceIdx = parseInt(choiceInput) - 1;
  if (isNaN(choiceIdx) || choiceIdx < 0 || choiceIdx >= allMerged.length) {
    console.error("Invalid choice.");
    return;
  }

  const target = allMerged[choiceIdx];
  const confirm = await askQuestion(`Are you sure you want to delete ${target.name} (${target.id})? (y/N): `);
  if (confirm.toLowerCase() !== 'y') {
    console.log("Deletion cancelled.");
    return;
  }

  // Remove from arrays
  const filterList = (list: Product[]) => list.filter(p => p.id !== target.id);
  const newAll = filterList(allProducts);
  const newHero = filterList(heroProducts);
  const newFeatured = filterList(featuredProducts);

  // 1. Save locally
  saveProductsLocal(newHero, newFeatured, newAll);
  console.log(`\nSuccessfully deleted from local definition file.`);

  // 2. Delete from DB
  console.log("\nDeleting product from Database...");
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  
  await client.query('DELETE FROM products WHERE id = $1', [target.id]);
  await client.end();
  
  console.log("\nProduct successfully deleted from database and local data!");
}

async function runSyncCatalog() {
  console.log("\n=== Operation: Full Catalog Sync ===");
  const admin = createAdminClient({ baseUrl: ossHost, apiKey });

  // Gather unique products
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

  const urlMap = await uploadCatalogImages(admin, uniqueProducts);

  console.log("\n=== Phase 2: Connecting to database ===");
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  console.log("\n=== Phase 3: Syncing products and details ===");
  for (const product of uniqueProducts) {
    await syncProductToDb(client, product, urlMap);
  }

  console.log("\n=== Phase 4: Syncing lookbook slides ===");
  const existingKeys = await getExistingKeys(admin);
  for (const slide of lookbookSlides) {
    const imageUrl = await uploadAndOverwriteImage(admin, slide.originalImage, existingKeys);
    console.log(`Syncing lookbook slide: ${slide.slideNumber}`);

    const { rows } = await client.query('SELECT 1 FROM lookbook_slides WHERE slide_number = $1', [slide.slideNumber]);
    if (rows.length > 0) {
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

  console.log("\n=== Phase 5: Syncing editorial content ===");
  for (const item of editorialItems) {
    const imageUrl = await uploadAndOverwriteImage(admin, item.originalImage, existingKeys);
    console.log(`Syncing editorial item: "${item.id}"`);

    const { rows } = await client.query('SELECT 1 FROM editorial_content WHERE id = $1', [item.id]);
    if (rows.length > 0) {
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
  console.log("\n=== Success! Full Catalog update complete. ===");
}

// ════════════════════════════════════════════════════════
//  Main Run Menu
// ════════════════════════════════════════════════════════

async function main() {
  console.log("=========================================");
  console.log("  AURORA INTERACTIVE CATALOG MANAGER     ");
  console.log("=========================================");
  console.log("Choose the operation to perform:");
  console.log("  1. Sync full catalog from files to Database & Storage");
  console.log("  2. Add a new product interactively");
  console.log("  3. Modify an existing product interactively");
  console.log("  4. Delete a product interactively");
  console.log("  5. Exit");

  const choice = await askQuestion("\nEnter option (1-5): ");
  if (choice === "1") {
    await runSyncCatalog();
  } else if (choice === "2") {
    await addProductInteractively();
  } else if (choice === "3") {
    await modifyProductInteractively();
  } else if (choice === "4") {
    await deleteProductInteractively();
  } else {
    console.log("Exiting.");
  }
}

main().catch((err) => {
  console.error("Operation failed:", err);
  process.exit(1);
});
