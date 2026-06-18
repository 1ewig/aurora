# 🌌 Aurora

### A Quiet-Luxury Digital Storefront — Minimalist, Editorial, Server-Rendered.

[![Next.js 15](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-blue?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169e1?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![InsForge BaaS](https://img.shields.io/badge/BaaS-InsForge-FF6B6B?style=flat-square)](https://insforge.dev)
[![Better Auth](https://img.shields.io/badge/Auth-Better_Auth-E26D5C?style=flat-square)](https://www.better-auth.com/)

---

## 🔗 Live Application & Demo Accounts

Explore the live environment and administration panel using these credentials:

*   **Live Application**: [aurora-nu-three.vercel.app](https://aurora-nu-three.vercel.app/)
*   **GitHub Repository**: [github.com/1ewig/aurora](https://github.com/1ewig/aurora)

### Demo Accounts

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@example.com` | `Customer123!` | Personal profile, order history, checkout |
| **Admin** | `admin@example.com` | `Admin123!` | Inventory control, order manager, user table |

> [!TIP]
> **Guest Checkout** is fully enabled. Users can browse products, select sizes, input address details, and checkout without authenticating or creating an account.

---

## 🏛️ System Architecture

Aurora combines React Server Components (RSC) for fast first-paint metrics and SEO indexability, combined with highly focused client state containers for responsive user interaction.

```mermaid
graph TD
    subgraph Client ["Client Browser (React 19 / Zustand / React Query)"]
        UI["UI & Presentational Components"]
        Zustand["Zustand Store (Cart & UI State)"]
        RQ["React Query (Server Cache)"]
    end

    subgraph Edge ["Edge Infrastructure"]
        Middleware["Next.js Edge Middleware (Session & Admin protection)"]
    end

    subgraph Server ["Next.js 15 Server (App Router)"]
        RSC["Server Components (RSC - Hydrated & SEO)"]
        Routes["API Route Handlers (Auth & Checkout Operations)"]
    end

    subgraph Backend ["InsForge BaaS & Infrastructure"]
        Postgres[("PostgreSQL Database (Raw pg, SELECT FOR UPDATE locks)")]
        Storage["Object Storage (Product / Lookbook / Editorial buckets)"]
        BetterAuth["Better Auth Engine"]
    end

    UI --> Middleware
    Middleware --> RSC
    Middleware --> Routes
    RSC --> Postgres
    RSC --> Storage
    Routes --> Postgres
    Routes --> BetterAuth
    UI -.-> |Reads Cache| RQ
    UI -.-> |Manages Cart| Zustand
```

---

## 🌌 Core Technical & Architectural Talking Points

### 1. Architecture & Design Patterns
*   **React Server Components (RSC) for Performance & SEO**: Leverages Next.js 15's server rendering to achieve fast first-paint metrics while maintaining full SEO indexability, using carefully scoped client components only where client-side interactivity is required.
*   **Four-Layer Separation of Concerns**: Enforces strict architectural boundaries (`Pages` ➔ `Containers/Bridges` ➔ `Hooks/Stores` ➔ `Presentational Components`), eliminating tight coupling and enabling a predictable unidirectional data flow.
*   **Pessimistic Concurrency Control with PostgreSQL Locks**: Prevents inventory overselling during high-volume checkout scenarios by wrapping stock check-and-decrement actions in an atomic database transaction using a row-level lock (`SELECT ... FOR UPDATE`).
*   **Zero-Latency Page Transitions via TanStack Query**: Implements optimistic cache hydration by pre-loading product details from prior listing queries, eliminating navigation delays and improving perceived performance.

### 2. Backend Engineering
*   **High-Performance Direct SQL with json_agg Optimization**: Bypasses ORM overhead by utilizing direct raw `pg` connection pools and PostgreSQL's native JSON aggregation (`json_agg`), eliminating N+1 query patterns when compiling relational catalog datasets.
*   **Edge Middleware Session Security**: Validates user session cookies at the Next.js edge layer before serving page bundles, blocking unauthorized access to `/admin` and `/profile` routes with minimal performance overhead.
*   **Atomic Order Processing Transactions**: Wraps the entire checkout pipeline (product validation ➔ stock deduction ➔ order insertion ➔ email confirmation dispatch) in a single transaction, guaranteeing complete consistency or an automatic rollback on failure.
*   **Automated Email Workflows**: Integrates Nodemailer with HTML and plain-text order confirmation templates, dispatching formatted transactional receipts with itemized tallies, shipping metadata, and custom branding.

### 3. Frontend & State Management
*   **Zustand for Lightweight Global State**: Manages shopping cart with `localStorage` persistence, UI drawer toggles, and authentication state wrappers without Redux boilerplate—reducing client bundle overhead.
*   **React Query for Server Cache**: Centralizes all API data fetching, handling built-in query caching, background stale revalidation, and optimistic UI transitions.
*   **Better Auth Integration with Humanized Error Mapping**: Wraps raw auth errors with client-side mappings (e.g. email verification warnings, rate limits, weak passwords) to guide users through error recovery seamlessly.
*   **Framer Motion for Editorial Animations**: Powers smooth page transitions, lookbook carousel slides, and shopping cart drawer entrances without heavy CSS-in-JS runtimes.

### 4. Performance, UX & DX
*   **Fully Enabled Guest Checkout**: Allows unauthenticated catalog browsing, variant selection, address input, and order completion to minimize checkout friction and boost conversion rates.
*   **Intelligent Asset Optimization**: Local font loading eliminates external CDN layout shifts (FOIT/CLS); Sharp pre-compiles images; and Next.js Image optimization serves responsive, edge-constrained WebP/AVIF formats.
*   **Role-Based Access Control**: Implements edge-gated administrative boundaries, routing non-admin requests away from `/admin/*` views with zero cold-start delay.
*   **TypeScript-First & ESLint Enforced**: Standardizes complete type safety across Next.js API routes, Zustand stores, and database schemas with strict pre-commit lint rules.
*   **Declarative Seeding & Setup Pipeline**: Automates local environments using a single command (`npx tsx scripts/upload-and-seed.mts`), which drops/recreates schema tables, configures public S3 buckets, and recursively processes media assets.

---

## ⚙️ Core Engineering Highlights & Code Examples

### 1. Pessimistic Concurrency & Stock Locks
To prevent inventory overselling under heavy load, Aurora locks the product sizes database row before validating and decrementing stock.

In [src/app/api/orders/route.ts](src/app/api/orders/route.ts#L121-L139):
```typescript
// Lock product size stock to prevent race conditions under load
const sizeRes = await client.query(
  "SELECT stock FROM product_sizes WHERE product_id = $1 AND size = $2 FOR UPDATE",
  [item.id, item.size || ""]
);
const sizeInfo = sizeRes.rows[0];
if (!sizeInfo || sizeInfo.stock < item.quantity) {
  throw new Error(`Insufficient stock for "${product.name}".`);
}

// Atomic stock decrement
await client.query(
  "UPDATE product_sizes SET stock = stock - $1 WHERE product_id = $2 AND size = $3",
  [item.quantity, item.id, item.size || ""]
);
```

### 2. High-Performance Direct SQL (`json_agg` Optimization)
Rather than making multiple database requests, PostgreSQL compiles nested relational details directly into a JSON block for the route handler.

In [src/app/api/products/[slug]/route.ts](src/app/api/products/%5Bslug%5D/route.ts#L19-L49):
```sql
SELECT 
  p.id, p.slug, p.name, p.category, p.price, p.badge, p.image, p.alt_text as "altText", 
  (
    SELECT COALESCE(json_agg(image_url ORDER BY id), '[]'::json)
    FROM product_images WHERE product_id = p.id
  ) as images,
  (
    SELECT COALESCE(json_agg(size ORDER BY id), '[]'::json)
    FROM product_sizes WHERE product_id = p.id
  ) as sizes,
  (
    SELECT COALESCE(json_agg(detail ORDER BY id), '[]'::json)
    FROM product_details WHERE product_id = p.id
  ) as details
FROM products p
WHERE p.slug = $1;
```

### 3. Edge-Gated Security Middleware
Lightweight Edge functions block unauthenticated or non-admin requests before they load server component bundles.

In [src/middleware.ts](src/middleware.ts#L28-L48):
```typescript
const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
const baseUrl = process.env.BETTER_AUTH_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`;
const sessionRes = await fetch(`${baseUrl}/api/auth/get-session`, {
  headers: { cookie: request.headers.get('cookie') || '' },
});
const session = sessionRes.ok ? await sessionRes.json() : null;

if (!session?.user) {
  return NextResponse.redirect(new URL("/login?redirect=" + pathname, request.url));
}
if (isAdminPath && !isAdmin(session.user.email)) {
  return NextResponse.redirect(new URL("/", request.url));
}
```

---

## 🎨 Architectural Coding Standards

We follow a strict unidirectional data flow standard defined in [docs/CODING_STANDARDS.md](docs/CODING_STANDARDS.md):

```
Pages (src/app/)
  │  Server Components: resolve route params, export SEO metadata, render containers
  ▼
Containers / Bridges (src/components/*/)
  │  Read stores, call hooks, assemble props
  ├──► Hooks (src/hooks/) - Business logic, form state, queries
  └──► Stores (src/stores/) - Zustand global state management
  ▼
Presentational Components (src/components/*/)
     Pure JSX — receive everything via props, zero store/hook imports
```

---

## 🛠️ Complete Technical Stack

| Component | Technology | Usage |
| :--- | :--- | :--- |
| **Core Framework** | Next.js 15.5 + React 19 | App Router, Server Components, Route Handlers |
| **Database** | PostgreSQL (InsForge) | SQL Database, transactional operations, direct connection pool |
| **Authentication** | Better Auth 1.6 | Email/password auth, edge session validations, secure administration |
| **Server Cache** | TanStack React Query 5 | Query caching, optimistic UI hydration, stale revalidation |
| **Client State** | Zustand 5 | Client-side shopping cart with localStorage persistence, UI modal toggles |
| **Styling Engine** | Tailwind CSS 4 | CSS theme tokens, responsive layouts, modular styles |
| **Animations** | Framer Motion 12 | Smooth page entrances, cart drawers, lookbook sliders |
| **Image Preprocessor**| Sharp | Automated asset WebP conversions and edge constraint scaling |
| **Notifications** | Nodemailer + SMTP | Automated transactional order confirmations and auth updates |

---

## 🚀 Quick Start & Onboarding

To spin up a local instance of Aurora, clone the repository and execute the setup pipeline:

```bash
# 1. Clone the project and install dependencies
git clone https://github.com/1ewig/aurora.git
cd aurora
npm install

# 2. Configure environment parameters
cp .env.example .env.local
```

### 3. Database Schema, Storage & Data Seeding
Follow the **[Backend Deployment Guide](docs/BACKEND_DEPLOYMENT.md)** to configure your InsForge credentials in `.env.local`. Once ready, execute the onboarding pipeline:

```bash
# Deploy full database structures and store media resources
npx tsx scripts/upload-and-seed.mts

# Start local server
npm run dev
```

Visit `http://localhost:3000` to interact with your local environment.

---

## 🔍 Key Files to Review

Explore the implementation quality of the core components in this codebase:

| Resource Path | Demonstration Purpose |
| :--- | :--- |
| **[src/middleware.ts](src/middleware.ts)** | Edge middleware, route-gating, role-checking. |
| **[src/app/api/orders/route.ts](src/app/api/orders/route.ts)** | Concurrency transaction logic, email template compiler. |
| **[src/hooks/queries.ts](src/hooks/queries.ts)** | Optimistic cache loading, React Query data fetching layer. |
| **[src/app/api/products/[slug]/route.ts](src/app/api/products/%5Bslug%5D/route.ts)** | PostgreSQL query optimizations (`json_agg` data shaping). |
| **[src/stores/useAuthStore.ts](src/stores/useAuthStore.ts)** | Zustand client wrapper for session tracking. |
| **[scripts/upload-and-seed.mts](scripts/upload-and-seed.mts)** | Schema deployer, S3 bucket config, and media asset ingestion pipeline. |
| **[scripts/optimize-images.mjs](scripts/optimize-images.mjs)** | Asset WebP preprocessing script utilizing Sharp. |
