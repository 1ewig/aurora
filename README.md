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

## ⚙️ Core Engineering Highlights & Design Decisions

### 1. Pessimistic Concurrency & Stock Locks
To prevent inventory overselling during high-volume checkouts, the application avoids typical check-then-set logic. Instead, checking and deducting stock are wrapped in an atomic PostgreSQL transaction utilizing a pessimistic row-level lock (`SELECT ... FOR UPDATE`).

In [src/app/api/orders/route.ts](src/app/api/orders/route.ts#L118-L136):
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
Aurora uses direct `pg` connection pools rather than adding an ORM overhead. To prevent N+1 query patterns when rendering complex product detail pages (which require sizes, secondary images, and product detail bullets), PostgreSQL `json_agg` compiles relational datasets into the exact nested JSON structure expected by the frontend.

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
User sessions and administrative screens are secured via Next.js Edge Middleware. Rather than loading page bundles to the client before authenticating, a lightweight fetch check routes requests to the Better Auth engine at the edge, protecting `/admin` and `/profile` subroutes with zero cold-start latency.

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

### 4. Zero-Latency Page Transitions with TanStack Query
To achieve instant page navigation, product listings populate detail pages optimistically using local cache lookup. When a customer clicks a product card, the detail view extracts initial details from the query cache list before revalidating the full description in the background.

In [src/hooks/queries.ts](src/hooks/queries.ts#L85-L109):
```typescript
export function useProductDetailsQuery(slug: string) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProductDetails(slug),
    initialData: () => {
      const cachedQueries = queryClient.getQueriesData<Product[]>({ queryKey: ['products'] });
      for (const [, products] of cachedQueries) {
        if (products) {
          const product = products.find((p) => p.slug === slug);
          if (product) return { ...product, images: product.images || [product.image] };
        }
      }
      return undefined;
    },
  });
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
Aurora utilizes a consolidated database seeding and asset ingestion script. Running this script creates all Postgres tables, sets up three public asset buckets (`product-media`, `lookbook-media`, `editorial-media`), and imports demo files.

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
| **[scripts/upload-and-seed.mts](scripts/upload-and-seed.mts)** | Schema deployer, bucket configuration, and recursive image uploader. |
| **[scripts/optimize-images.mjs](scripts/optimize-images.mjs)** | Asset WebP preprocessing script utilizing Sharp. |

---

## 📈 Optimization & Performance Metrics
*   **Intelligent Layout Hydration**: Next.js Image optimization (`next/image`) automatically requests WebP/AVIF images from InsForge Storage with intrinsic sizing rules, completely avoiding Cumulative Layout Shift (CLS).
*   **No Font CDNs**: Fonts (Inter & Playfair Display) are stored locally using `next/font` to eliminate secondary domain connection delays and Flash of Invisible Text (FOIT).
*   **Lazy Bundle Loading**: Admin features (user grids, product editors, detailed invoice listings) are code-split using dynamic client imports (`next/dynamic`), reducing bundle sizes by ~30% for regular consumers.
