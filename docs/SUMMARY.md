# Aurora — System Context & Architecture Guide

> **Single Architecture Reference:** Primary context guide for developers and AI agents. It captures high-level architecture, domain invariants, concurrency patterns, and mandatory engineering rules. File-level implementation details belong in the code.

---

## 1. Executive Summary & Domain Invariants

- **Domain Purpose:** Quiet-luxury digital fashion storefront ("Singular pieces for the considered wardrobe") combining an editorial shopping experience, customer account workspace, and role-gated admin console.
- **Guest Checkout is Default:** `orders.user_id` is nullable. Unauthenticated shoppers can complete orders without signup. Customer accounts are optional upsells for order history and profile management.
- **Embedded Payment Overlay:** Shoppers complete payment via a Lemon Squeezy overlay modal (embed mode). The server generates checkout sessions with dynamic pricing and fulfills orders asynchronously via signed webhooks.
- **Database-Seeded Catalog:** Seeded from static definitions into PostgreSQL (`scripts/upload-and-seed.mts`). Runtime reads query the database directly; static data files in `src/data/` serve strictly as seed sources.
- **Strict Concurrency & Stock Integrity:** Server-side price re-computation prevents client tampering; atomic row locks (`SELECT ... FOR UPDATE`) and 35-minute soft reservations prevent inventory overselling.
- **Performance & SEO Targets:** Engineered for near-perfect Core Web Vitals (99% Performance, 100% SEO). React Server Components handle initial HTML; client boundaries are strictly isolated to interactive subtrees.
- **Editorial Brand Language:** Editorial cream/black palette with `#E9C8A0` accent; Inter (body) + Playfair Display (headings) via `next/font` CSS variables; whole-dollar currency formatting (`formatCurrency`) without cents for luxury feel.

---

## 2. Technical Stack & Infrastructure

| Layer                  | Technology                          | Key Responsibility & Configuration                                                                                       |
| :--------------------- | :---------------------------------- | :----------------------------------------------------------------------------------------------------------------------- |
| **Framework**          | Next.js 16.4.2 (App Router)         | React Server Components, Route Handlers, `'use cache'` directives (`cacheComponents: true`, `partialPrefetching: true`). |
| **UI Runtime**         | React 19.2                          | Server Components default; async `params`/`headers` promises; `<Suspense>` streaming boundaries.                         |
| **Language & Tooling** | TypeScript 5.9 + Bun                | Strict typing (`@/*` alias); Bun is the sole package manager and task runner across dev/build/test.                      |
| **Database**           | PostgreSQL (via InsForge BaaS)      | Raw connection pooling (`pg` Pool in `@/utils/db`), parameterized queries (`$1, $2`). No ORM.                            |
| **BaaS / Storage**     | InsForge (`@insforge/sdk`)          | Postgres hosting, HS256 JWT bridge, and 5 S3 buckets (`product/lookbook/editorial/material/category-media`).             |
| **Authentication**     | Better Auth 1.6 (email/password)    | Own `better_auth` schema and pool, edge session validation, sliding 7-day cookie windows.                                |
| **Payments**           | Lemon Squeezy (REST API + Webhooks) | Dynamic checkout session generation and cryptographically verified webhook order fulfillment.                            |
| **Client State**       | Zustand 5                           | Cart persisted in `localStorage` (`useCartStore`); SSR-safe React Context auth store (`useAuthStore`).                   |
| **Server State**       | TanStack React Query 5              | Server cache: 5m stale / 10m GC. Admin queries use `staleTime: 0` + `keepPreviousData`.                                  |
| **Styling & Motion**   | Tailwind CSS 4 + Framer Motion 12   | Minimalist luxury design tokens (`@theme`); Framer Motion entrance and drawer transitions.                               |
| **Asset Pipeline**     | Sharp 0.34 (`optimize-images.ts`)   | Offline WebP conversion for committed assets; Next.js `remotePatterns` for runtime AVIF/WebP.                            |
| **Email Transport**    | Nodemailer 9 + Brevo SMTP           | Transactional verification and order emails; silent-skip in local development when unconfigured.                         |
| **Testing & Linting**  | Vitest 4 + Oxlint                   | Unit/API integration tests with mocked DB (`vi.mock`); ultra-fast Rust-based Oxlint configuration.                       |

---

## 3. The 4-Layer Unidirectional Architecture

Every feature in Aurora strictly adheres to a unidirectional 4-layer separation of concerns:

```
RSC Page (src/app/) ──renders──▶ XxxClient.tsx (Client Orchestrator)
                                        │
                                        ├──► Feature Hooks / React Query (src/hooks/)
                                        └──► Zustand Stores (src/stores/)
                                                │
                                                ▼
                              Presentational Components (src/components/*/)
                              (Pure JSX props — ZERO store or hook imports)
```

### Layer Contracts & Boundaries

| Layer                      | Primary Location                  | Permitted Imports & Logic                                      | Forbidden Patterns                             |
| :------------------------- | :-------------------------------- | :------------------------------------------------------------- | :--------------------------------------------- |
| **1. Server Page**         | `src/app/**/page.tsx`             | Direct SQL via `db.ts`, cached accessors, SEO metadata exports | Store/hook imports, client event listeners     |
| **2. Client Orchestrator** | `src/components/**/XxxClient.tsx` | TanStack Query hooks, Zustand stores, layout assembly          | Direct DB queries, raw SQL, bypassing hooks    |
| **3. Hooks & Stores**      | `src/hooks/`, `src/stores/`       | Query keys, mutation functions, client persistence logic       | JSX presentation markup, direct DOM mutations  |
| **4. Presentational**      | `src/components/*`                | Pure visual JSX, Framer Motion animations, prop callbacks      | Store or hook imports (even if `"use client"`) |

- **Server-to-Client Hydration:** Server pages pass `initialData` into client orchestrators to eliminate client-side fetching waterfalls and ensure instant first-render displays.
- **Streaming & Suspense Boundaries:** The root layout wraps `AuthInitializer` in `<Suspense fallback={null}>` so session verification never blocks initial HTML streaming. Checkout success wraps query consumers in `<Suspense>` to prevent whole-page CSR bailouts.

---

## 4. Checkout, Concurrency & Stock Lifecycle

Checkout follows an atomic, pessimistic locking workflow to guarantee stock consistency under concurrent traffic:

```
[Client Cart] ──POST /api/checkout/session──▶ [Server Re-Pricing & Stock Verification]
                                                        │
                     ┌──────────────────────────────────┴──────────────────────────────────┐
                     ▼                                                                     ▼
           Price Re-computation                                           SELECT ... FOR UPDATE (Row Lock)
        (DB lookup defeats tampering)                                    (Ordered by product_id+size)
                     │                                                                     │
                     └──────────────────────────────────┬──────────────────────────────────┘
                                                        ▼
                                           35-Min Soft Reservation
                                        (product_reservations table)
                                                        │
                                                        ▼
                                        Lemon Squeezy Checkout Creation
                                                        │
                                                        ▼
                                        Customer Pays in Embed Overlay
                                                        │
                                                        ▼
                                  POST /api/webhooks/lemonsqueezy (HMAC Checked)
                                                        │
                                                        ▼
                             Idempotent DB Transaction (processed_webhooks ledger):
                             Stock Debited ──▶ Reservation Deleted ──▶ Order Created (AUR-XXXXXXXX)
```

- **Server-Side Pricing & Shipping:** Product prices submitted by the client are strictly ignored; prices are queried fresh from `products`. Shipping is $25 flat (free above $500 order subtotal), plus 8% calculated tax.
- **Deadlock-Free Row Locks:** Rows in `product_sizes` are locked with `SELECT ... FOR UPDATE` in deterministic sorted order (`product_id ASC, size ASC`) across both reservation and checkout fulfillment transactions.
- **Soft Reservation Semantics:** Stock is never decremented during checkout session creation. It is locked with `FOR UPDATE` and held as a 35-minute reservation in `product_reservations`. Stock decrement occurs strictly within the verified webhook transaction.
- **Order State Machine:** Orders transition monotonically: `pending` $\to$ `confirmed` $\to$ `shipped` $\to$ `delivered`. A terminal `cancelled` status can be set from any active state via admin updates with audit logging (`{from, to}`).
- **Webhook Idempotency:** Webhook events are deduplicated via `processed_webhooks` (`ls_event_id` unique constraint) and `orders.ls_order_id`. Non-`order_created` events return `200 OK` and are safely acknowledged.
- **Automated Cron Cleanups:** Background cron schedules clean up expired stock reservations every 5 minutes and purge stale rate-limit windows every hour.
- **Success Polling:** `/checkout/success` polls `/api/orders?lsOrderId=...` (up to 10× at 1.5s intervals) to retrieve the official order number before clearing the Zustand cart.

---

## 5. High-Level Blueprint & Route Groups

The App Router tree is partitioned into four explicit route groups:

| Route Group              | Path Scope                                            | Access Level          | Gate Mechanism                        | SEO Policy                          |
| :----------------------- | :---------------------------------------------------- | :-------------------- | :------------------------------------ | :---------------------------------- |
| **Storefront `(store)`** | `/`, `/products/*`, `/story`, `/checkout/*`           | Public / Guest        | None                                  | Indexed, semantic metadata, JSON-LD |
| **Auth Flows `(auth)`**  | `/login`, `/register`, `/verify`, `/reset-password`   | Public / Guest        | Redirect if authed                    | `robots: noindex`                   |
| **Customer `(user)`**    | `/profile`, `/profile/orders`                         | Authed Customer       | Edge proxy (`proxy.ts`) + Layout gate | `robots: noindex`                   |
| **Admin `(admin)`**      | `/admin/dashboard`, `/users`, `/orders`, `/inventory` | Admin (Role $\ge$ 10) | Edge proxy + Layout gate + API checks | `robots: noindex`                   |

- **API Route Tiers:**
  - _Public Read:_ `/api/products*`, `/api/categories`, `/api/editorial`, `/api/landing` (cached via Next.js 16 `'use cache'`).
  - _Public Mutation:_ `/api/checkout/session`, `/api/newsletter` (rate-limited via DB sliding-window).
  - _Session-Authed:_ `/api/auth/[...all]`, `/api/auth/role`, `/api/orders` (customer history or guest lookup).
  - _Admin-Guarded:_ `/api/admin/*` and `/api/insforge-token` (require admin role level 10 + audit logging).
  - _Webhooks:_ `/api/webhooks/lemonsqueezy` (cryptographic HMAC-SHA256 signature verification).
- **Caching Backbone:** Public endpoints leverage Next.js 16 `'use cache'` paired with `cacheLife({ stale, revalidate })` and `cacheTag(...)`: `landing` (60s), `products` (300s), `categories` (300s), `editorial` (600s).
- **Cache Invalidation:** Admin catalog mutations immediately invalidate server caches via `revalidateTag('products', { expire: 0 })` and `revalidateTag('landing', { expire: 0 })`.

---

## 6. Auth & Infrastructure Boundaries

- **Better Auth vs. InsForge Auth:** Authentication is managed strictly by **Better Auth** using email and password credentials with its own dedicated Postgres pool and `better_auth` schema. **InsForge auth is NOT used.**
- **Dual InsForge Clients:** Browser operations use `src/lib/insforge.ts` (auto-refreshes HS256 JWT every 50m via `/api/insforge-token`). Server operations use `src/lib/insforge.server.ts` signed with `INSFORGE_JWT_SECRET`.
- **InsForge Storage:** Hosts 5 public object storage buckets (`product-media`, `lookbook-media`, `editorial-media`, `material-media`, `category-media`). Storage cleanups on product updates delete orphan files automatically.
- **RBAC Hierarchy:** User roles are defined on `better_auth."user".role`: `user` (level 0) and `admin` (level 10). `requireAdmin()` and `requireRole()` enforce authorization on admin route handlers. `ADMIN_EMAILS` serves strictly as an environment-level fallback.
- **Session Security & Hydration:** Session cookie `better-auth.session_token` uses 7-day lifespans with 1-day sliding renewal. Root layout hydrates user sessions server-side via `getServerAuthUser()` (memoized with `React.cache()`).
- **Rate Limiting:** Public endpoints enforce sliding-window rate limits backed by PostgreSQL (`rate_limits` table: 5/min sign-in, 3/min newsletter, 10/min checkout) with anti-spoofing IP resolution.

---

## 7. Non-Negotiable Engineering Rules & Known Gotchas

1. **Always Bun:** Use `bun`, never `npm`, `pnpm`, or `npx`. Dev server: `bun run dev`; tests: `bun run test`; linting: `bun run lint`; build: `bun run build`.
2. **Standard Verification Order:** Always run `bun run lint` $\to$ `bun run test` $\to$ `bun run build`. GitHub Actions CI runs lint + test on every push.
3. **No Server Actions:** Aurora deliberately avoids Next.js Server Actions. All server mutations must be implemented as REST API route handlers in `src/app/api/`.
4. **No ORM:** All database queries must be raw, parameterized SQL (`$1, $2`) via the `pg` pool (`@/utils/db`). Never interpolate unsanitized strings into SQL.
5. **No DB Imports in Client Code:** Server utilities (`@/utils/db`, `@/lib/auth`, `@/utils/admin`) are protected with `'server-only'`. Client data access flows exclusively through API routes.
6. **Active Edge Protection in `src/proxy.ts`:** In Next.js 16, edge middleware is renamed to `proxy`. [`src/proxy.ts`](file:///c:/Users/Asad/Desktop/Desktop/projects/aurora/src/proxy.ts) exporting `proxy` is the active security edge gating `/profile/*` and `/admin*`. Keep cookie fast-paths in sync with Better Auth.
7. **Never Swallow `DynamicServerError`:** Route handler catch blocks must call `rethrowIfDynamicServerError(error)` before error responses so Next.js internal prerender signals propagate correctly.
8. **PostgreSQL 1-Second Pool Idle Timeout:** The database pool in `@/utils/db` sets `idleTimeoutMillis: 1000`. Do not increase or remove this; it is mandatory for `next build` to close open connections and exit cleanly.
9. **Tests Mock Database Calls:** Vitest tests do not require a live database connection; all queries are mocked via `vi.mock("@/utils/db")`.
10. **Test Coverage Provider:** Use `bun run test:coverage` (configured with `@vitest/coverage-istanbul`). Do not use v8 coverage under Bun because `node:inspector` APIs are unsupported.
11. **Raw Body Before Parsing in Webhooks:** The Lemon Squeezy webhook endpoint must read `await req.text()` before parsing JSON to preserve cryptographic signature verification via `crypto.timingSafeEqual`.
12. **Audit Admin Mutations:** All mutating admin endpoints (`/api/admin/*`) must invoke `logAudit()` to record actor ID, action, target, and before/after metadata diffs in `audit_logs`.
13. **Denormalized Order Snapshots:** `orders.items` stores line items as a JSONB snapshot at checkout time. There is no normalized `order_items` table.
14. **Immediate Cache Expiry Flag:** When calling `revalidateTag`, always provide `{ expire: 0 }` to force immediate purge rather than background revalidation.
15. **CamelCase API Contract:** PostgreSQL snake_case columns are mapped to camelCase at the API route boundary. Client stores and components expect camelCase models.
16. **N+1 Query Elimination with `json_agg`:** Consolidate nested relations (images, sizes, details) into unified subqueries directly in PostgreSQL to prevent N+1 database roundtrips.
17. **Master DDL Source of Truth:** Table definitions and RLS policies live in `scripts/create-tables.sql`. Apply schema updates through this file and deployment scripts, not ad-hoc migrations.
