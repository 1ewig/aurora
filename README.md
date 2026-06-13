# Aurora — Premium E-Commerce Application

Aurora is a quiet-luxury fashion brand e-commerce web application (SS 2025 Collection). Built with Next.js 15, React 19, TypeScript, Tailwind CSS 4, Framer Motion, PostgreSQL, TanStack Query, and InsForge.

The application uses **InsForge** as its Backend-as-a-Service (BaaS) for database and media storage. It implements **TanStack Query** for client-side caching, utilizing a progressive **Initial Data Seeding** technique to load detail pages instantly from the listing cache, and uses **Row Level Security (RLS)** in PostgreSQL to secure the catalog.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15.5.19 (App Router) |
| Language | React 19 + TypeScript 5.9 |
| Database | PostgreSQL (hosted on InsForge Cloud DB) |
| Client SDK | `@insforge/sdk` (Storage Bucket client) |
| Data Caching | `@tanstack/react-query` v5 |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion 12 |
| State Management | Zustand (cart persisted to `localStorage`) |
| Fonts | `next/font` (Inter, Playfair Display) |

---

## Architecture Pattern

The codebase follows a 4-layer separation of concerns:

```
Pages (src/app/)
  │  Server Components: resolve route params, export SEO metadata, render containers
  │
  ▼
Containers / Bridges (src/components/*/)
  │  Read stores, call hooks, assemble props
  │
  ├──► Hooks & Queries (src/hooks/)
  │     Business logic, react-query hooks, form state
  │
  ├──► Stores (src/stores/)
  │     Zustand global state management
  │
  ▼
Presentational Components (src/components/*/)
  Pure JSX — receive everything via props, zero store/hook imports
```

---

## Getting Started

Follow the step-by-step guide in [`BACKEND_DEPLOYMENT.md`](BACKEND_DEPLOYMENT.md) to set up a new InsForge project, configure your environment variables (`.env.local`), and seed the database.

### Seeding and Managing Data

The project includes built-in scripts to manage the e-commerce catalog, lookbook, and editorial content:

* **First-time setup / Wiping & Seeding**:
  Drops existing tables, creates/wipes/prepares three public storage buckets (`product-media`, `lookbook-media`, `editorial-media`), recursively uploads all local assets, and seeds the entire database from scratch.
  ```bash
  npx tsx scripts/upload-and-seed.mts
  ```

* **Updating catalog / Incremental updates**:
  Updates existing product details and description, force-overwrites updated images in storage, and inserts any new products without dropping tables (preserving user accounts and orders).
  ```bash
  npx tsx scripts/update-catalog.mts
  ```

* **Wipe a product (Database & Storage)**:
  Wipes a product from the database, cascading to related tables, and automatically deletes its associated images from the InsForge storage bucket if they are not used by other products.
  ```bash
  npx tsx scripts/delete-product.mts <product_id>
  ```

### Running Locally

Once the database and storage are seeded:

```bash
npm install
npm run dev
```

---

## Route Structure

| Route | Type | Description |
|---|---|---|
| `/` | Static | Brand landing page — hero slider, featured collections, lookbook carousel |
| `/products` | Static | Shop catalog with client-side category filter query pills |
| `/products/category/[category]` | Dynamic (SSR) | Category-specific product lists |
| `/products/[slug]` | Dynamic (SSR) | Product detail view with progressive loading, size selection, specs |
| `/checkout` | Static | Checkout form, summary pricing, masked PII confirmation |
| `/story` | Static | Brand narrative, philosophy, parallax breakout, atelier section |
| `/profile` | Static | User profile details and settings (auth-guarded) |
| `/profile/orders` | Static | User purchase order history list (auth-guarded) |
| `/login` | Static | User sign-in page |
| `/register` | Static | User registration page |
| `/api/products` | API | Database SELECT endpoint for catalog products |
| `/api/products/[slug]` | API | Consolidated SELECT query for detail specifications, images, and sizes |
| `/api/lookbook` | API | Database SELECT endpoint for lookbook slides |
| `/api/editorial` | API | Database SELECT endpoint for editorial/story sections |
| `/api/orders` | API | Create/retrieve order records linked to user profiles |

---

## Core Features

- **Database-Driven Content**: Products, sizes, images, specifications, lookbook slides, and editorial story cards are fetched dynamically from a PostgreSQL database hosted on InsForge.
- **Unified Querying**: `/api/products/[slug]` performs a single SQL query using PostgreSQL subqueries with `json_agg()` to retrieve base columns, sizes, details, and lookup images in a single connection.
- **Initial Data Seeding (0ms Load Times)**: When opening a details page, TanStack Query pre-populates the details view using cached list data from the catalog. The user immediately sees the correct product image, title, and price, while descriptions and sizes load progressively in the background.
- **Multi-Bucket InsForge Storage**: Assets are routed and stored in three public InsForge buckets (`product-media`, `lookbook-media`, `editorial-media`) depending on their relative paths.
- **Row Level Security (RLS)**: Enforced database-level security policies (`Allow public read access`) permitting public `SELECT` lookups while restricting all `INSERT`/`UPDATE`/`DELETE` writes to authenticated administrators.
- **Indexed Relationships**: Foreign keys on `product_images`, `product_details`, and `orders` are indexed to speed up database joins and handle cascading deletes efficiently.

---

## Project Structure

```
scripts/
├── upload-and-seed.mts              # First-time setup / Wipes buckets & tables and seeds DB from scratch
├── update-catalog.mts               # Safe catalog update / Optimizes, overwrites storage and upserts DB
├── optimize-images.mjs              # Standardizes local image scaling and WebP conversion
├── delete-product.mts               # Wipes a product and deletes its unused media assets
src/
├── app/
│   ├── (auth)/                      # Login, Register pages
│   ├── (store)/                     # catalog, checkout, story and details page wrapper group
│   ├── (user)/                      # ProfileLayoutClient, ProfilePage, Orders list pages
│   ├── api/                         # auth, products, orders, lookbook, and editorial endpoints
│   ├── layout.tsx
│   ├── providers.tsx               # TanStack QueryClient Provider wrapper
│   └── globals.css
│
├── components/
│   ├── auth/          LoginForm, RegisterForm, LoginClient, RegisterClient
│   ├── checkout/      CartEmptyState, CheckoutForm, CheckoutSuccess, OrderSummary, OrderSummaryContainer
│   ├── landing/       FeaturedCollection, HeroSection, LookbookSlider, Newsletter, Testimonials
│   ├── layout/        Footer, Navbar, MobileMenu, NavbarProfileMenu
│   ├── product/
│   │   ├── listing/   CategoryFilter, PageHeader, ProductGrid
│   │   └── detail/    Breadcrumbs, ImageGallery, ProductActions, ProductDetailClient, ProductDetailsTabs, ProductInfo, RelatedProducts, SizeGuideModal, SizeSelector
│   ├── profile/       ProfileClient, ProfileForm, ProfileSidebar, ProfileWorkspace, OrdersClient, OrderCard, OrderDetailModal
│   └── story/         AtelierSection, ParallaxBreakout, PhilosophySection, StoryCta, StoryHero
│
├── stores/            useCartStore, useAuthStore, useProductStore
├── hooks/             queries (useProductsQuery, useLookbookQuery, etc.), useBodyScrollLock, useCarousel,
│                      useCheckoutForm, useNavbarScroll, useRelatedProducts, useInitializeAuth, useOrders
├── data/              navigation, products, lookbook, editorial, testimonials
└── utils/             cn.ts, db.ts (pg pool), insforge.ts (BaaS configs), auth.ts, validation.ts
```
