# Aurora

A quiet-luxury fashion e-commerce platform built with **Next.js 15**, **React 19**, and **PostgreSQL**.

**[→ Live Demo](https://aurora-nu-three.vercel.app/)** · Full-Stack Developer · TypeScript · Tailwind CSS 4 · InsForge

---

## What This Project Shows

### Security Architecture

- **Middleware-gated protected routes** with SSR cookie-based auth (`@insforge/sdk/ssr` `updateSession`). Protected paths (`/profile`) redirect unauthenticated users to login. Server routes use `setAuthCookies` for httpOnly token handling.
- **Rate-limited user enumeration check** — `POST /api/auth/check-user` uses an in-memory sliding-window limiter (10 req/min/IP) with `429 Too Many Requests` responses.
- **Server-side pricing enforcement** — `POST /api/orders` recalculates subtotal, shipping, tax, and total from the items array, ignoring any client-supplied pricing fields (preventing price manipulation).
- **Row-Level Security** on `public.profiles` — public read, individual insert/update scoped to `auth.uid()`.
- **SQL-injection-safe** — all queries use parameterized `pg` pool statements.

### Data & State Design

- **PostgreSQL** with `json_agg()` single-query optimization for product detail pages (avoids N+1 on images, sizes, details).
- **DB triggers** auto-sync `auth.users.profile` JSONB → `public.profiles.display_name` with `COALESCE` fallback chain (`displayName` → `name` → `nickname`).
- **Zustand stores** for auth, cart, and UI state. Cart persists to `localStorage` via Zustand `persist` middleware.
- **TanStack Query** for declarative server-state caching — cache-first navigation between catalog and product pages (0ms perceived load for already-seen data).

### Guest Checkout with Analytics

- Guest orders insert into `orders` with `user_id = NULL` (FK allows NULL, `ON DELETE SET NULL`).
- Distinguishable for admin analytics: `SELECT ... WHERE user_id IS NULL`.
- Guest email stored in `shipping_address` JSONB for order confirmation and future lookup.

### Developer Tooling

- **Automated catalog sync** (`update-catalog.mts`) — processes new images through Sharp WebP optimization, uploads to the correct InsForge Storage bucket, and upserts product records to PostgreSQL without destroying user data.
- **Multi-bucket asset management** — three isolated InsForge Storage buckets (`product-media`, `lookbook-media`, `editorial-media`) with distinct RLS policies.
- **Database-driven lookbook & editorial** — slides and editorial content managed via PostgreSQL and queried through API endpoints, enabling dynamic updates without redeploys.

---

## Tech Stack

**Next.js 15** · **React 19** · **TypeScript** · **PostgreSQL** · **Tailwind CSS 4** · **Framer Motion** · **Zustand** · **TanStack Query** · **InsForge** (BaaS) · **Sharp** · **Vercel**

---

## Getting Started

```bash
git clone https://github.com/1ewig/aurora
cd aurora
npm install
npm run dev
```

Configure your InsForge project keys in `.env.local` (see `BACKEND_DEPLOYMENT.md`).

---

<p align="center">Built by <a href="https://github.com/1ewig">Moshu</a></p>
