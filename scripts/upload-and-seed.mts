/**
 * upload-and-seed.mts
 * ===================
 *
 * First-time setup / Wiping & Seeding script:
 * - Verifies and wipes/recreates the five storage buckets (product-media, lookbook-media, editorial-media, material-media, category-media)
 * - Drops and rebuilds all database tables (products, product_images, product_sizes, product_details, product_keywords, orders, processed_webhooks, product_reservations, lookbook_slides, editorial_content, hero_slides, categories)
 * - Recursively scans and uploads all local assets to storage
 * - Seeds all catalog, lookbook slides, editorial content, hero slides, and categories into the database
 *
 * Usage:
 *   npx tsx scripts/upload-and-seed.mts
 */

import { createAdminClient } from '@insforge/sdk';
import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Reads the static definitions.
import { heroProducts, featuredProducts, allProducts, type Product } from '../src/data/products';
import { lookbookSlides } from '../src/data/lookbook';
import { editorialItems } from '../src/data/editorial';
import { materials } from '../src/data/materials';
import { categoryDataList } from '../src/data/categories';

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
  materials: 'material-media',
  categories: 'category-media',
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
  } else if (localRelPath.startsWith('/images/materials/')) {
    return {
      bucket: BUCKETS.materials,
      storageKey: localRelPath.replace(/^\/images\/materials\//, ''),
    };
  } else if (localRelPath.startsWith('/images/categories/')) {
    return {
      bucket: BUCKETS.categories,
      storageKey: localRelPath.replace(/^\/images\/categories\//, ''),
    };
  } else {
    const key = localRelPath.replace(/^\/images\//, '');
    return {
      bucket: BUCKETS.products,
      storageKey: key,
    };
  }
}

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

function buildStorageUrl(bucketName: string, bucketKey: string): string {
  const encodedKey = bucketKey.split('/').map(encodeURIComponent).join('%2F');
  return `${ossHost}/api/storage/buckets/${bucketName}/objects/${encodedKey}`;
}

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
// ════════════════════════════════════════════════════════

type ImageResult = {
  url: string | null;
  status: 'uploaded' | 'exists' | 'fallback' | 'missing';
};

async function resolveImage(
  admin: ReturnType<typeof createAdminClient>,
  localRelPath: string,
  existingKeys: Record<string, Set<string>>,
): Promise<ImageResult> {
  const fullPath = path.resolve(
    process.cwd(),
    'public',
    localRelPath.replace(/^\//, ''),
  );

  if (!fs.existsSync(fullPath)) {
    return { url: null, status: 'missing' };
  }

  const { bucket, storageKey } = getBucketAndKey(localRelPath);

  if (existingKeys[bucket]?.has(storageKey)) {
    return { url: buildStorageUrl(bucket, storageKey), status: 'exists' };
  }

  const buffer = fs.readFileSync(fullPath);
  const mimeType = getMimeType(fullPath);

  try {
    const blob = new Blob([buffer], { type: mimeType });
    const { data, error } = await admin.storage
      .from(bucket)
      .upload(storageKey, blob);

    if (error) {
      return { url: buildStorageUrl(bucket, storageKey), status: 'fallback' };
    }

    const url = data?.url;
    if (!url) {
      return { url: buildStorageUrl(bucket, storageKey), status: 'fallback' };
    }

    return { url, status: 'uploaded' };
  } catch {
    return { url: buildStorageUrl(bucket, storageKey), status: 'fallback' };
  }
}

// ════════════════════════════════════════════════════════
//  Main Seeding Logic
// ════════════════════════════════════════════════════════

async function seed() {
  const catalogOnly = process.argv.includes('--catalog-only');
  if (catalogOnly) {
    console.log("\n=== Mode: Catalog-Only Seed (preserving orders and webhooks) ===\n");
  } else {
    console.log("\n=== Mode: Setup / Fresh seed (wipe & re-create all) ===\n");
  }

  console.log("Initializing InsForge admin client...");
  const admin = createAdminClient({ baseUrl: ossHost, apiKey });

  // Verify and prepare all five storage buckets

  const bucketsList = execSync(`npx @insforge/cli storage buckets`, { encoding: 'utf-8' });
  const existingKeys: Record<string, Set<string>> = {};

  for (const [key, bucketName] of Object.entries(BUCKETS)) {
    console.log(`Verifying storage bucket "${bucketName}"...`);
    let bucketExists = bucketsList.includes(bucketName);
    let hasData = false;

    if (bucketExists) {
      try {
        const { data: listData } = await admin.storage.from(bucketName).list({ limit: 1 });
        const objects = (listData as any)?.data || (listData as any)?.objects;
        if (objects && objects.length > 0) {
          hasData = true;
        }
      } catch (err: any) {
        console.warn(`Warning checking bucket "${bucketName}" status: ${err.message || err}`);
      }
    }

    if (!bucketExists) {
      console.log(`Bucket "${bucketName}" does not exist. Creating it...`);
      try {
        const createOut = execSync(`npx @insforge/cli storage create-bucket ${bucketName}`, { encoding: 'utf-8' });
        console.log(createOut);
      } catch (err: any) {
        console.error(`Failed to create bucket "${bucketName}" via CLI:`, err.message || err);
        process.exit(1);
      }
    } else if (hasData) {
      console.log(`Bucket "${bucketName}" has existing data. Wiping and recreating bucket...`);
      try {
        const deleteOut = execSync(`npx @insforge/cli storage delete-bucket ${bucketName}`, { input: 'y\n', encoding: 'utf-8' });
        console.log(deleteOut);
        const createOut = execSync(`npx @insforge/cli storage create-bucket ${bucketName}`, { encoding: 'utf-8' });
        console.log(createOut);
      } catch (err: any) {
        console.error(`Failed to recreate bucket "${bucketName}" via CLI:`, err.message || err);
        process.exit(1);
      }
    }

    // Populate existing keys
    existingKeys[bucketName] = new Set<string>();
    try {
      const { data: listData } = await admin.storage.from(bucketName).list({ limit: 1000 });
      const objects = (listData as any)?.data || (listData as any)?.objects || [];
      for (const obj of objects) {
        existingKeys[bucketName].add(obj.key);
      }
    } catch (err: any) {
      console.warn(`Warning pre-populating keys for bucket "${bucketName}": ${err.message || err}`);
    }
  }

  // Collect all unique image paths from data structures
  const allImagePaths = new Set<string>();

  // Add product images
  for (const product of uniqueProducts) {
    if (product.image) allImagePaths.add(product.image);
    for (const img of product.images || []) {
      allImagePaths.add(img);
    }
  }

  // Add lookbook images
  for (const slide of lookbookSlides) {
    allImagePaths.add(slide.originalImage);
  }

  // Add category images
  for (const cat of categoryDataList) {
    allImagePaths.add(cat.image);
  }

  // Add material images
  for (const mat of materials) {
    allImagePaths.add(mat.image);
  }

  // Add editorial images
  for (const item of editorialItems) {
    allImagePaths.add(item.originalImage);
  }

  // Scan directories for other public images
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

  console.log(`\nResolving ${allImagePaths.size} images across buckets...\n`);
  
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
        console.log(`  ✓ ${label} (uploaded)`);
        break;
      case 'exists':
        exists++;
        console.log(`  ○ ${label} (exists)`);
        break;
      case 'fallback':
        exists++;
        console.log(`  ○ ${label} (fallback)`);
        break;
      case 'missing':
        missing++;
        console.warn(`  ✗ ${label} (missing)`);
        break;
    }
  });

  console.log(`\nConnecting to database...`);
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  console.log("Dropping tables & executing create-tables.sql schema...");
  const tablesToDrop = [
    'product_images',
    'product_sizes',
    'product_details',
    'product_keywords',
    'products',
    'public.lookbook_slides',
    'public.editorial_content',
    'categories',
  ];
  if (!catalogOnly) {
    tablesToDrop.push('public.materials', 'public.orders', 'processed_webhooks', 'product_reservations');
  }
  const dropSql = tablesToDrop.map((t) => `DROP TABLE IF EXISTS ${t} CASCADE;`).join('\n');
  await client.query(dropSql);

  const schemaSql = fs.readFileSync(path.resolve(process.cwd(), 'scripts', 'create-tables.sql'), 'utf-8');
  await client.query(schemaSql);

  // ── Seeding Categories ──
  console.log(`Inserting ${categoryDataList.length} categories...`);
  for (const cat of categoryDataList) {
    const imageUrl = urlMap.get(cat.image) || cat.image;
    await client.query(
      `INSERT INTO categories (slug, name, image, description)
       VALUES ($1, $2, $3, $4)`,
      [cat.slug, cat.name, imageUrl, cat.description]
    );
  }

  // ── Seeding Products ──
  console.log(`Inserting ${uniqueProducts.length} products...`);
  for (const product of uniqueProducts) {
    const imageUrl = urlMap.get(product.image) || product.image;
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

    if (images.length > 0) {
      const imgParams = images.map((_, i) => `($1, $${i + 2})`).join(', ');
      await client.query(
        `INSERT INTO product_images (product_id, image_url) VALUES ${imgParams}`,
        [product.id, ...images],
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
        szParams,
      );
    }

    if (details.length > 0) {
      const detParams = details.map((_, i) => `($1, $${i + 2})`).join(', ');
      await client.query(
        `INSERT INTO product_details (product_id, detail) VALUES ${detParams}`,
        [product.id, ...details],
      );
    }

    // Collect/Generate keywords
    const keywordsSet = new Set<string>();

    // 1. Add manual keywords if defined
    if (product.keywords) {
      for (const kw of product.keywords) {
        if (kw?.trim()) {
          keywordsSet.add(kw.trim().toLowerCase());
        }
      }
    }

    // 2. Auto-generate keywords as fallback/additions:
    // Tokenize product name (filter out short words)
    const nameTokens = product.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .split(/\s+/);
    for (const t of nameTokens) {
      if (t.length > 2) keywordsSet.add(t);
    }

    // Add category as keyword
    if (product.category) {
      keywordsSet.add(product.category.toLowerCase());
    }

    // Extract interesting words from details list (e.g. fabric names)
    if (product.details) {
      for (const det of product.details) {
        const detTokens = det
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .split(/\s+/);
        for (const t of detTokens) {
          // Add common descriptive/material keywords
          if (['silk', 'wool', 'linen', 'cashmere', 'cotton', 'leather', 'denim', 'shearling', 'alpaca', 'mohair'].includes(t)) {
            keywordsSet.add(t);
          }
        }
      }
    }

    const keywords = Array.from(keywordsSet);
    if (keywords.length > 0) {
      const kwPlaceholders = keywords.map((_, i) => `($1, $${i + 2})`).join(', ');
      await client.query(
        `INSERT INTO product_keywords (product_id, keyword) VALUES ${kwPlaceholders} ON CONFLICT DO NOTHING`,
        [product.id, ...keywords]
      );
    }
  }

  // ── Seeding Lookbook Slides ──
  console.log("Seeding lookbook slides...");
  for (const slide of lookbookSlides) {
    const imageUrl = urlMap.get(slide.originalImage) || slide.originalImage;
    await client.query(
      `INSERT INTO lookbook_slides (slide_number, original_image, image_url, alt_text, tag, title, link)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [slide.slideNumber, slide.originalImage, imageUrl, slide.altText, slide.tag || null, slide.title || null, slide.link || null]
    );
  }

  // ── Seeding Editorial Content ──
  console.log("Seeding editorial content...");
  for (const item of editorialItems) {
    const imageUrl = urlMap.get(item.originalImage) || item.originalImage;
    await client.query(
      `INSERT INTO editorial_content (id, original_image, image_url, alt_text, title, description)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [item.id, item.originalImage, imageUrl, item.altText, item.title, item.description || null]
    );
  }

  // ── Seeding Materials ──
  console.log("Seeding materials...");
  for (const mat of materials) {
    const imageUrl = urlMap.get(mat.image) || mat.image;
    await client.query(
      `INSERT INTO materials (name, source, original_image, image_url, description, properties)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [mat.name, mat.source, mat.image, imageUrl, mat.description, mat.properties]
    );
  }

  await client.end();
  console.log("\n=== Seeding completed successfully. ===");
}

seed().catch((err) => {
  console.error("\nSeeding failed:", err);
  process.exit(1);
});
