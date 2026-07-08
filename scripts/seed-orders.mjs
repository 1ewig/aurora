/**
 * Aurora — scripts/seed-orders.mjs
 *
 * Seeds 25 dummy orders into the database for pagination testing.
 * Run: node scripts/seed-orders.mjs
 */

import pg from "pg";
import crypto from "crypto";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  idleTimeoutMillis: 5000,
});

const STATUSES = ["delivered", "delivered", "delivered", "delivered", "shipped", "shipped", "shipped", "pending", "pending", "cancelled"];

const ADDRESSES = [
  { email: "olivia.chen@example.com", firstName: "Olivia", lastName: "Chen", address: "245 Greene St", city: "New York", zipCode: "10003" },
  { email: "james.kimoto@example.com", firstName: "James", lastName: "Kimoto", address: "18 rue de Rivoli", city: "Paris", zipCode: "75001" },
  { email: "sarah.dupont@example.com", firstName: "Sarah", lastName: "Dupont", address: "10 Downing St", city: "London", zipCode: "SW1A 2AA" },
  { email: "hiro.tanaka@example.com", firstName: "Hiro", lastName: "Tanaka", address: "3-2-1 Marunouchi", city: "Tokyo", zipCode: "100-0005" },
];

function randomHex(length) {
  return crypto.randomBytes(Math.ceil(length / 2)).toString("hex").slice(0, length).toUpperCase();
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

function formatDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(randomInt(8, 22), randomInt(0, 59), randomInt(0, 59), 0);
  return d.toISOString();
}

async function seedOrders() {
  console.log("Fetching products...");
  const productResult = await pool.query("SELECT id, slug, name, price::numeric, image FROM products");
  const products = productResult.rows.map((r) => ({
    ...r,
    price: Number(r.price),
  }));

  if (products.length === 0) {
    console.error("No products found. Seed the catalog first.");
    await pool.end();
    process.exit(1);
  }

  console.log(`Found ${products.length} products. Generating 25 orders...`);

  const SIZES = ["XS", "S", "M", "L", "XL"];

  const orders = [];
  for (let i = 0; i < 25; i++) {
    const address = pickRandom(ADDRESSES);
    const status = pickRandom(STATUSES);
    const itemCount = randomInt(1, 3);
    const usedIds = new Set();
    const items = [];

    for (let j = 0; j < itemCount; j++) {
      let product;
      let attempts = 0;
      do {
        product = pickRandom(products);
        attempts++;
      } while (usedIds.has(product.id) && attempts < 10);
      usedIds.add(product.id);

      const qty = randomInt(1, 2);
      items.push({
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        size: pickRandom(SIZES),
        image: product.image,
        quantity: qty,
      });
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal >= 500 ? 0 : 15;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = Math.round((subtotal + shipping + tax) * 100) / 100;

    const orderNumber = `AUR-${randomHex(8)}`;
    const isPaid = status !== "cancelled";
    const daysAgo = randomInt(1, 60);

    orders.push({
      orderNumber,
      items: JSON.stringify(items),
      subtotal,
      shipping,
      tax,
      total,
      shippingAddress: JSON.stringify(address),
      status,
      isPaid,
      createdAt: formatDate(daysAgo),
    });
  }

  console.log("Inserting orders...");
  let inserted = 0;
  let skipped = 0;

  for (const order of orders) {
    try {
      await pool.query(
        `INSERT INTO orders (order_number, items, subtotal, shipping, tax, total, shipping_address, status, is_paid, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          order.orderNumber,
          order.items,
          order.subtotal,
          order.shipping,
          order.tax,
          order.total,
          order.shippingAddress,
          order.status,
          order.isPaid,
          order.createdAt,
        ]
      );
      inserted++;
    } catch (err) {
      if (err.code === "23505" && err.constraint?.includes("order_number")) {
        skipped++;
      } else {
        console.error(`Error inserting order ${order.orderNumber}:`, err.message);
      }
    }
  }

  console.log(`Done. Inserted: ${inserted}, Skipped (duplicates): ${skipped}`);

  const countResult = await pool.query("SELECT COUNT(*)::int as count FROM orders");
  console.log(`Total orders in DB: ${countResult.rows[0].count}`);

  await pool.end();
}

seedOrders().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
