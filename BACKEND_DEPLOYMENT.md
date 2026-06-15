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

You now have these values:

| Variable | Where to find it |
|---|---|
| `DATABASE_URL` | InsForge Dashboard → Database section |
| `NEXT_PUBLIC_INSFORGE_URL` | `.insforge/project.json` → `oss_host` |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | `npx @insforge/cli secrets get ANON_KEY` |
| `INSFORGE_API_KEY` | `.insforge/project.json` → `api_key` |
| `INSFORGE_JWT_SECRET` | `npx @insforge/cli secrets get JWT_SECRET` |
| `BETTER_AUTH_SECRET` | Generate: `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | `http://localhost:3000` (dev) or production URL |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Same as `BETTER_AUTH_URL` |
| `NEXT_PUBLIC_ADMIN_EMAILS` | Comma-separated admin email addresses |

---

## Step 5 — Create the storage buckets (Automated)

The application stores assets in three public buckets: `product-media`, `lookbook-media`, and `editorial-media`.

> [!NOTE]
> This step is fully automated. The seeding script in **Step 7** automatically checks if these buckets exist. If they do not, it creates them and sets them to public. If they do, it wipes them clean to prevent duplicate files. You can skip this entirely.

---

## Step 6 — Create database tables (Automated)

> [!NOTE]
> This step is fully automated. The setup script in **Step 7** automatically loads [`scripts/create-tables.sql`](file:///c:/Users/moshu%20moshu/Desktop/aurora/scripts/create-tables.sql), drops any existing tables, and builds the database schema from scratch. You do not need to run this manually.


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
NEXT_PUBLIC_INSFORGE_ANON_KEY="your-public-anon-key"
INSFORGE_API_KEY="your-admin-service-key"

BETTER_AUTH_SECRET="your-base64-secret"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"

INSFORGE_JWT_SECRET="your-insforge-jwt-secret"
NEXT_PUBLIC_ADMIN_EMAILS="admin@example.com"
```

> The `DATABASE_URL` must use `sslmode=require` (InsForge requires it).

---

## Step 8 — Upload images and seed the database

For a **first-time setup or clean reset**, run the seeding script:

```bash
npx tsx scripts/upload-and-seed.mts
```

This performs a completely automated setup and seeding:
1. **Multi-Bucket Verification & Wipe**: Checks and prepares three buckets: `product-media`, `lookbook-media`, and `editorial-media`. If missing, it creates them. If they exist with data, it wipes them to prevent name collisions.
2. **Recursive Image Scan & Route**: Uploads all local assets recursively to their corresponding storage buckets (`/images/lookbook/*` -> `lookbook-media`, `/images/editorial/*` -> `editorial-media`, and products -> `product-media`).
3. **Database Schema Creation**: Automatically drops existing tables and executes [`scripts/create-tables.sql`](file:///c:/Users/moshu%20moshu/Desktop/aurora/scripts/create-tables.sql) to build the database from scratch.
4. **Better Auth Tables**: Creates the `better_auth` schema with `user`, `session`, `account`, and `verification` tables (isolated from PostgREST — only accessible via direct Postgres connection).
5. **Data Seeding**: Seeds all products, gallery image relations, sizes, detail bullets, lookbook slides, and editorial content.

---

## Adding more products or updating content later

To add new products, update existing descriptions, or replace lookbook/editorial images without wiping your database (preserving orders and user accounts), run the update catalog script:

```bash
npx tsx scripts/update-catalog.mts
```

In this mode:
- **Tables are never dropped** — existing user profiles and orders are preserved.
- **Data is updated/inserted (upserted)** — updates existing records and inserts new ones.
- **Images are force-overwritten** — deletes existing keys in storage before uploading new versions, ensuring lookbook/editorial image updates are instantly replaced.

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

If you're deploying to Vercel or another platform, set these environment variables there:
- `DATABASE_URL`
- `NEXT_PUBLIC_INSFORGE_URL`
- `NEXT_PUBLIC_INSFORGE_ANON_KEY`
- `INSFORGE_API_KEY`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `NEXT_PUBLIC_BETTER_AUTH_URL`
- `INSFORGE_JWT_SECRET`
- `NEXT_PUBLIC_ADMIN_EMAILS`

---

## Summary of files created/modified during setup

| Action | File |
|---|---|
| Auto-generated by `npx @insforge/cli create` | `.insforge/project.json` |
| You create manually | `.env.local` (from `.env.example`) |
| Handled automatically | `scripts/create-tables.sql` (schema definitions) |
| Setup and clean seed script | `scripts/upload-and-seed.mts` |
| Catalog update script | `scripts/update-catalog.mts` |

Everything else is committed to the repository and ready to use.

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| `insforge: command not found` | CLI not installed | Use `npx @insforge/cli ...` (no global install needed) |
| `DATABASE_URL not found` | `.env.local` missing or misconfigured | Copy `.env.example` → `.env.local` and fill in the values |
| Auth redirects to login loop | `BETTER_AUTH_URL` or `NEXT_PUBLIC_BETTER_AUTH_URL` mismatch | Ensure both match your deployment URL exactly (no trailing slash) |
| Session invalidated on re-deploy | `BETTER_AUTH_SECRET` changed between deploys | Keep the same secret across all environments |
| `relation "better_auth.user" does not exist` | BA tables not created | Run `npx tsx scripts/upload-and-seed.mts` to seed the full schema |
| `relation "products" does not exist` | Tables not created | Run `npx tsx scripts/upload-and-seed.mts` to automatically build schema |
| `bucket product-media does not exist` | Bucket not created | Run `npx tsx scripts/upload-and-seed.mts` to automatically create buckets |
| Images show as broken | Bucket is private | Buckets are public by default, but verify: if private, run setup script to recreate them |
| Build fails with type errors | Check for missing types | Run `npm install` again |
