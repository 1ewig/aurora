# 🌌 Aurora
### *Quiet-Luxury Fashion E-Commerce (SS 2025 Collection)*

Aurora is a premium, high-performance e-commerce platform dedicated to a minimalist, quiet-luxury brand. Built on the modern React 19 and Next.js 15 architecture, it integrates **InsForge** as a comprehensive Serverless Backend-as-a-Service (BaaS) alongside high-efficiency caching, relational database querying, and robust authentication.

---

## 🏗️ Architecture & Philosophy

Aurora follows a strict **4-layer Separation of Concerns** model to decouple presentation from side effects, business logic, and global states:

```
                  ┌────────────────────────┐
                  │      Pages / Route     │
                  │      (src/app/*)       │
                  └───────────┬────────────┘
                              │ Server Components: Resolve Params, Metadata,
                              │ and instantiate Root Layout Containers.
                              ▼
                  ┌────────────────────────┐
                  │  Containers & Bridges  │
                  │   (src/components/*)   │
                  └──────┬──────────┬──────┘
                         │          │
        Reads/Writes     │          │  Invokes Custom Hook queries,
        Global States    │          │  manages form states, etc.
                         ▼          ▼
   ┌───────────────────────┐      ┌────────────────────────┐
   │    Zustand Stores     │      │    Hooks & Queries     │
   │    (src/stores/*)     │      │     (src/hooks/*)      │
   └───────────────────────┘      └─────────┬──────────────┘
                                            │
                                            ▼
                              ┌────────────────────────┐
                              │ Presentational Element │
                              │   (src/components/*)   │
                              └────────────────────────┘
                                 Pure JSX Components: Receive all configurations
                                 via props, 100% side-effect-free.
```

---

## ⚡ Core Systems & Features

*   🚀 **0ms Perceived Page Loads (Initial Seeding)**: Aurora leverages TanStack Query client-side state matching. When navigating from the catalog to a product details page, the application pre-populates the UI instantly using existing catalog cache. Extended details and inventory configurations are then fetched progressively in the background.
*   🗃️ **Unified SQL Subqueries**: To maximize database efficiency, `/api/products/[slug]` retrieves catalog records, attributes, details, and cross-reference image tables inside a single consolidated PostgreSQL query utilizing `json_agg()`.
*   📦 **Multi-Bucket Asset Management**: Media files are dynamically parsed and uploaded into three separate public InsForge Storage buckets depending on context:
    *   `product-media`: Product catalog primary images.
    *   `lookbook-media`: High-resolution landing and collection slide imagery.
    *   `editorial-media`: Immersive story, narrative, and atelier banner graphics.
*   🔒 **Row-Level Security (RLS)**: Enforces security policies at the database layer. Public users are restricted to read-only (`SELECT`) actions, while administrative mutations (`INSERT`, `UPDATE`, `DELETE`) require authenticated keys.
*   ⚙️ **DRY Media Optimization**: Employs a standardized pipeline that rescales local source images and converts them to optimized `.webp` format using `Sharp` via an integrated preprocessing runner.

---

## 🛠️ Tech Stack Reference

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 15.5.19 | App Router, SSR, and dynamic API endpoints |
| **Language** | React 19 + TypeScript 5.9 | Typed, functional component patterns |
| **Database** | PostgreSQL | Cloud-managed DB via InsForge |
| **Client SDK** | `@insforge/sdk` | Serverless SDK for database CRUD and Storage |
| **Data Fetching** | `@tanstack/react-query` v5 | Declarative client caching and mutations |
| **Styling** | Tailwind CSS 4 | Utilitarian layout design system |
| **Animation** | Framer Motion 12 | Fluid transitions and micro-animations |
| **State** | Zustand | Persistent browser states (e.g. user authentication & cart) |
| **Typography** | `next/font` | Premium typefaces (Inter & Playfair Display) |

---

## 🚦 Getting Started & Data Management

For complete workspace credentials and project connection variables, see the detailed instructions in [BACKEND_DEPLOYMENT.md](file:///c:/Users/moshu%20moshu/Desktop/aurora/BACKEND_DEPLOYMENT.md).

### Seeding, Syncing, and Maintenance Commands

Aurora provides highly automated utilities to maintain code-to-database parity:

#### 1. Full Database & Storage Reset
Wipes all existing database tables, drops/recreates the three media buckets (`product-media`, `lookbook-media`, `editorial-media`), processes local WebP files, uploads media, and runs a clean seed.
```bash
npx tsx scripts/upload-and-seed.mts
```

#### 2. Safe Catalog Synchronizations (Non-destructive)
Optimizes newly added images, uploads modifications directly to storage, and upserts product parameters into PostgreSQL. **Note:** User profiles, login accounts, and order history are fully preserved.
```bash
npx tsx scripts/update-catalog.mts
```

#### 3. Single-Item Catalog Removal
Removes a specific product from the database (cascading all joins) and clean-deletes its orphan storage media from the server buckets if not referenced elsewhere.
```bash
npx tsx scripts/delete-product.mts <product_id>
```

#### 4. Project Server Initialization
Start the local development server once the backend sync succeeds:
```bash
npm run dev
```

---

## 🗺️ Project Navigation

### App Route Definitions

| Route Path | Content Strategy | Purpose / Operation |
| :--- | :--- | :--- |
| `/` | Static | Brand landing experience (lookbook sliders, categories) |
| `/products` | Static / Client Filtered | Dynamic shop listing with interactive category filters |
| `/products/category/[category]` | Dynamic (SSR) | Group-targeted product catalogs |
| `/products/[slug]` | Dynamic (SSR) | Detailed product view with progressive specs and size guides |
| `/checkout` | Static | Secure shopping cart validation & mock transaction checkouts |
| `/story` | Static | Brand narrative, parallax breakouts, and atelier showcases |
| `/profile` | Static (Auth Required) | User account customization and data settings |
| `/profile/orders` | Static (Auth Required) | Historical user order items log |
| `/login` | Static | Secure client login panel |
| `/register` | Static | Secure client account creation panel |
| `/api/products` | API Endpoint | PostgreSQL SELECT list data |
| `/api/products/[slug]` | API Endpoint | Deep SQL Join for detail lists and image catalogs |
| `/api/lookbook` | API Endpoint | Lookbook carousel slider data |
| `/api/editorial` | API Endpoint | Editorial and atelier component text blocks |
| `/api/orders` | API Endpoint | Authenticated cart transaction logger |

---

### File Architecture

```
scripts/
├── upload-and-seed.mts              # Destructive baseline seed script
├── update-catalog.mts               # Additive database catalog sync script
├── optimize-images.mjs              # Local Sharp optimization workflow
└── delete-product.mts               # Target database & storage purge script
src/
├── app/
│   ├── (auth)/                      # Login and Registration pages
│   ├── (store)/                     # Catalog, checkout, story, and details page wrapper group
│   ├── (user)/                      # ProfileLayoutClient, ProfilePage, Orders list pages
│   ├── api/                         # Backend API endpoints (Auth, Products, Orders, Lookbook, Editorial)
│   ├── layout.tsx                   # Main global layout container
│   ├── providers.tsx               # TanStack query clients wrapper
│   └── globals.css                  # Global Tailwind 4 styles
│
├── components/
│   ├── auth/                        # LoginForm, RegisterForm, and client-page bridges
│   ├── checkout/                    # Checkout forms, orders, summaries, and empty states
│   ├── landing/                     # Featured collections, Hero, LookbookSlider, and reviews
│   ├── layout/                      # Navbar, Footer, MobileMenu, and profile controls
│   ├── product/                     # Category filters, product details, selectors, and size grids
│   ├── profile/                     # ProfileClient, sidebar dashboards, and order modal panels
│   └── story/                       # Narrative parallax frames, philosophy sections, and atelier lists
│
├── stores/                          # Zustand global hooks (useCartStore, useAuthStore, useProductStore)
├── hooks/                           # Queries hooks (useProductsQuery, etc.) and layout helpers
├── data/                            # Local navigation, products, lookbook, and editorial base data
└── utils/                           # Database pool (pg), BaaS connections, validation, and auth helpers
```
