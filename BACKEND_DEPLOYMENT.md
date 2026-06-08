# Backend Deployment Guide

This guide walks you through deploying the Aurora backend to a **new** InsForge project from scratch — no existing data to migrate, just a fresh start.

---

## Prerequisites

- **Node.js 18+** and **npm** installed
- An **InsForge account** — sign up at [insforge.dev](https://insforge.dev)
- This project cloned to your machine

---

## Step 1 — Install dependencies

```bash
npm install
```

---

## Step 2 — Authenticate with InsForge

```bash
npx @insforge/cli login
```

This opens a browser window to log in via OAuth. After success, return to the terminal.

Verify you're authenticated:

```bash
npx @insforge/cli whoami
```

---

## Step 3 — Create a new InsForge project

```bash
npx @insforge/cli create
```

Follow the interactive prompts:
- **Project name**: `Aurora` (or your preferred name)
- **Region**: `us-east` (or closest to your audience)
- **Org**: Select your personal org

> This auto-generates `.insforge/project.json` with the new project's credentials (API key, base URL, etc.). **Never commit this file to version control.**

After creation, verify:

```bash
npx @insforge/cli current
```

You should see your project name and user email.

---

## Step 4 — Retrieve credentials

Get the **anon key** (public, used by the frontend SDK):

```bash
npx @insforge/cli secrets get ANON_KEY
```

Get the **database connection string** — open the InsForge Dashboard, navigate to your project, and find the **Database** section. Look for the PostgreSQL connection string (it looks like `postgresql://username:password@host:port/database?sslmode=require`).

You now have three values:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_INSFORGE_URL` | `.insforge/project.json` → `oss_host` |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | `npx @insforge/cli secrets get ANON_KEY` |
| `NEXT_PUBLIC_INSFORGE_API_KEY` | `.insforge/project.json` → `api_key` |
| `DATABASE_URL` | InsForge Dashboard → Database section |

---

## Step 5 — Create the storage bucket

The app stores product images in a bucket called `product-media`:

```bash
npx @insforge/cli storage create-bucket product-media
```

> This bucket is **public** by default, which allows images to be viewed without authentication.

Verify the bucket exists:

```bash
npx @insforge/cli storage buckets
```

---

## Step 6 — Create database tables

There are two ways to do this — pick one.

### Option A — Via the InsForge Dashboard (recommended for first-time users)

1. Open the InsForge Dashboard
2. Go to your project → **SQL Editor** (or **Database** → **Query**)
3. Copy the entire contents of `scripts/create-tables.sql`
4. Paste and run

### Option B — Via the CLI

```bash
npx @insforge/cli db query "$(cat scripts/create-tables.sql)"
```

This creates 4 tables:
- `products` — base product info (name, price, slug, etc.)
- `product_images` — multiple images per product
- `product_sizes` — available sizes with stock counts
- `product_details` — bullet-point detail lists

---

## Step 7 — Configure environment variables

Copy the example env file:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and fill in the credentials from Step 4:

```env
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

NEXT_PUBLIC_INSFORGE_URL="https://your-appkey.us-east.insforge.app"
NEXT_PUBLIC_INSFORGE_ANON_KEY="your-anon-key"
```

> The `DATABASE_URL` must use `sslmode=require` (InsForge requires it).

---

## Step 8 — Upload images and seed the database

For a **first-time deploy**, run with the `--fresh` flag:

```bash
npx tsx scripts/upload-and-seed.mts --fresh
```

This does:
1. Creates all 4 database tables (drops any existing data first)
2. Uploads every referenced image from `public/images/` to the `product-media` bucket
3. Inserts all 14 products with their real uploaded image URLs
4. Inserts sizes, details, and additional gallery images

You'll see output like:

```
Mode: --fresh (wipe & re-seed)

Initializing admin client...

Uploading 21 unique images to bucket "product-media"...

  ✓ products/hero-product-1.webp
  ✓ products/hero-product-2.webp
  ✓ lookbook/lookbook-1.webp
  ...

Images: 21 uploaded/skipped, 0 failed

Connecting to database...
Connected.

Creating tables (fresh)...

Seeding product: Ivory Wool Overcoat (f1)
Seeding product: Camel Cashmere Turtleneck (h2)
...

Done! 14 products seeded into fresh tables.
```

---

## Adding more products later

When you add new products to `src/data/products.ts`, run the script **without** `--fresh`:

```bash
npx tsx scripts/upload-and-seed.mts
```

In this mode (additive, the default):
- **Tables are never dropped** — existing products stay untouched
- **Images are only uploaded if new** — existing files in the bucket are skipped
- **Only new slugs are inserted** — products whose `slug` already exists in the DB are skipped
- **Related data** (images, sizes, details) is only added for newly inserted products

Safe to run repeatedly — if nothing is new, it reports "No new products to insert" and exits.

---

## Step 9 — Verify the setup

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and check:
- The home page loads with product images
- The **Shop All** page shows products
- Clicking a product shows its detail page
- Images are loading (check the network tab — they should come from your InsForge storage URL)

---

## Step 10 — Build for production

```bash
npm run build
```

If you're deploying to Vercel or another platform, set the same three environment variables there:
- `NEXT_PUBLIC_INSFORGE_URL`
- `NEXT_PUBLIC_INSFORGE_ANON_KEY`
- `DATABASE_URL`

---

## Summary of files created/modified during setup

| Action | File |
|---|---|
| Auto-generated by `npx @insforge/cli create` | `.insforge/project.json` |
| You create manually | `.env.local` (from `.env.example`) |
| Run via dashboard or CLI | `scripts/create-tables.sql` |
| Run via `npx tsx` | `scripts/upload-and-seed.mts` (`--fresh` for first-time, no flag for later additions) |

Everything else is committed to the repository and ready to use.

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| `insforge: command not found` | CLI not installed | Use `npx @insforge/cli ...` (no global install needed) |
| `DATABASE_URL not found` | `.env.local` missing or misconfigured | Copy `.env.example` → `.env.local` and fill in the values |
| `relation "products" does not exist` | Tables not created | Run `scripts/create-tables.sql` (Step 6) |
| `bucket product-media does not exist` | Bucket not created | Run `npx @insforge/cli storage create-bucket product-media` (Step 5) |
| Images show as broken | Bucket is private | Buckets are public by default, but verify: if private, re-create with `npx @insforge/cli storage delete-bucket product-media` then `npx @insforge/cli storage create-bucket product-media` |
| Build fails with type errors | Check for missing types | Run `npm install` again |
