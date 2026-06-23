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
| **Explorer** | `explorer@example.com` | `Explorer123!` | Inventory control, order manager, user table |

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
- Strict 4-layer separation of concerns with unidirectional data flow: Pages → Containers/Bridges → Hooks/Stores → Presentational Components, formally documented in docs/CODING_STANDARDS.md and enforced by convention rather than tooling.
- React Server Components (RSC) by default with scoped client interactivity: "use client" is applied only where Framer Motion, state hooks, or event handlers are required, maximizing SSG eligibility and SEO indexability.
- Pessimistic concurrency control via SELECT ... FOR UPDATE: src/app/api/orders/route.ts wraps stock validation and decrement inside an atomic transaction with a row-level lock, preventing inventory overselling under concurrent checkout load.
- Guest checkout fully enabled end-to-end: Unauthenticated users can browse, select sizes, enter shipping details, and complete orders without creating an account; the cart and checkout form are fully decoupled from auth requirements.

### 2. Backend & Database Engineering
- Raw pg connection pool (src/utils/db.ts) with conditional SSL (rejectUnauthorized: false for managed DBs) and a 1-second idle timeout designed to allow Next.js build processes to exit cleanly.
- PostgreSQL json_agg optimization: src/app/api/products/[slug]/route.ts compiles nested product_images, product_sizes, and product_details into a single query response, eliminating N+1 query patterns and reducing round-trips.
- Atomic order transactions: The POST handler in src/app/api/orders/route.ts wraps product validation, stock deduction, order insertion, and email dispatch in a single BEGIN...COMMIT/ROLLBACK block, guaranteeing consistency or full rollback on failure.
- Direct SQL parameterization with security-conscious error masking: All API routes use $1, $2 parameter binding to prevent SQL injection, and generic "Failed to fetch..." messages are returned to clients to avoid leaking database schema details.

### 3. Frontend & State Management
- Zustand 5 with localStorage persistence: src/stores/useCartStore.ts uses the persist middleware under the key aurora-cart, enabling cross-session cart recovery without Redux boilerplate or context provider complexity.
- TanStack React Query 5 centralized caching: src/hooks/queries.ts configures 5-minute staleTime and 10-minute gcTime at the root QueryClient (src/app/providers.tsx), with refetchOnWindowFocus disabled to avoid unnecessary background revalidation.
- Optimistic initial data hydration: useProductDetailsQuery reads cached product list data from the React Query cache before requesting /api/products/[slug], eliminating navigation delay between listing and detail views.
- Better Auth with humanized error mapping: src/stores/useAuthStore.ts maps raw auth error codes (email_not_verified, weak_password, rate_limit, expired reset tokens) to user-friendly messages, and augments the session with admin role data from /api/auth/role.

### 4. API & Business Logic Quality
- Comprehensive per-field validation layer: src/utils/validation.ts validates email format, US ZIP codes (^\d{5}(-\d{4})?$), card numbers (13–19 digits), MM/YY expiry with future-date enforcement, and 3–4 digit CVC.
- Checkout form with privacy-preserving masking: src/hooks/useCheckoutForm.ts auto-prefills user profile data for logged-in users and masks emails/card numbers before passing them to success callbacks or UI display.
- Edge-gated route protection via middleware: src/middleware.ts intercepts requests to /profile and /admin/*, fetches the session cookie, and redirects unauthenticated or non-admin users before server component bundles hydrate.
- Admin-centric centralized state: src/stores/useAdminStore.ts manages products, orders, dashboard metrics, and order status updates with optimistic local state synchronization after PATCH/POST mutations.

### 5. Developer Experience & Code Quality
- Strict TypeScript compiler hygiene: tsconfig.json enables strict: true, noUnusedLocals, noUnusedParameters, noFallthroughCasesInSwitch, and isolatedModules, with path aliases (@/* → src/*) for clean imports.
- One-command infrastructure orchestration: scripts/upload-and-seed.mts drops/recreates 7 database tables, wipes and recreates 3 S3-compatible storage buckets, recursively uploads all local assets, and seeds catalog, lookbook, and editorial content.
- Conventional file and directory organization: One PascalCase component per file, feature-foldered structure (product/detail/, product/listing/, story/, profile/), useXxx.ts hooks pattern, and @/ import prefix convention documented in CODING_STANDARDS.md.
- Transactional email integration with graceful degradation: src/lib/email.ts lazily initializes a Nodemailer singleton for Brevo SMTP, silently skips sending when env vars are missing (e.g., local dev), and dispatches dual HTML/plain-text order confirmation templates.

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

# Manage admin user accounts and roles
npx tsx scripts/manage-user.ts

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
| **[src/hooks/useUsersManagement.ts](src/hooks/useUsersManagement.ts)** | Custom React hook separating business/state logic from admin user panel. |
| **[src/stores/useAuthStore.ts](src/stores/useAuthStore.ts)** | Zustand client wrapper for session tracking. |
| **[scripts/manage-user.ts](scripts/manage-user.ts)** | Comprehensive CLI for user creations, role updating, and account deletion. |
| **[scripts/upload-and-seed.mts](scripts/upload-and-seed.mts)** | Schema deployer, S3 bucket config, and media asset ingestion pipeline. |
| **[scripts/optimize-images.mjs](scripts/optimize-images.mjs)** | Asset WebP preprocessing script utilizing Sharp. |
