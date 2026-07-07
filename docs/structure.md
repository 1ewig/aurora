# Aurora — Codebase Structure

Comprehensive reference for navigating and understanding the Aurora codebase.
Covers architecture, routing, data flow, types, stores, hooks, API routes, database schema, payments, auth, and conventions.

---

## 1. Project Overview

| Attribute | Value |
|---|---|
| **Framework** | Next.js 16.2.9 (App Router) |
| **Language** | TypeScript 5.9.3 (strict mode) |
| **React** | 19.2.7 |
| **Styling** | Tailwind CSS 4.1.17 + `tailwind-merge` |
| **State (global)** | Zustand 5.0.13 |
| **Server state** | TanStack React Query 5.101.0 |
| **Auth** | Better Auth 1.6.18 (email/password) |
| **Payments** | Lemon Squeezy (sandbox, overlay modal) |
| **BaaS** | InsForge 1.3.1 (Postgres, Storage, JWT bridge) |
| **Email** | Nodemailer 9.0.0 via Brevo SMTP |
| **Animation** | Framer Motion 12.38.0 |
| **Carousel** | Embla Carousel 8.6.0 + autoplay |
| **Database driver** | `pg` 8.21.0 (raw SQL, no ORM) |
| **Testing** | Vitest 4.1.9 |
| **Linting** | ESLint 10.4.1 + `eslint-config-next` |
| **Image optimization** | Sharp 0.34.5 (script-based WebP) |
| **Analytics** | Vercel Analytics (`@vercel/analytics`) |
| **Deploy target** | Vercel |

---

## 2. Directory Map

```
aurora/
│
├── .env.example                         # Env var template (copy to .env.local)
├── .env.local                           # Local env vars (gitignored)
├── .insforge/project.json               # InsForge project config (gitignored)
├── AGENTS.md                            # AI agent InsForge skill references
├── README.md                            # Project overview, setup, architecture
├── package.json                         # Dependencies & scripts
├── next.config.ts                       # Next.js config (image remotePatterns)
├── tsconfig.json                        # TypeScript strict config, @/ alias
├── vitest.config.ts                     # Vitest test runner config
│
├── docs/
│   ├── CODING_STANDARDS.md              # 4-layer architecture rules and conventions
│   └── BACKEND_DEPLOYMENT.md            # InsForge + DB setup walkthrough
│
├── migrations/
│   └── 20260614145429_better-auth-setup.sql  # Better Auth schema migration
│
├── scripts/                             # CLI tools & DB scripts (6 files)
│
├── __tests__/                           # Integration tests
│   ├── api/
│   │   ├── categories.test.ts
│   │   ├── checkout.test.ts
│   │   ├── webhook.test.ts
│   │   └── admin-auth.test.ts
│
└── src/                                 # Application source (~196 files)
    ├── proxy.ts                         # Middleware (route protection)
    ├── animations/                      # Framer Motion presets (2 files)
    ├── app/                             # Next.js App Router (~60 files)
    ├── components/                      # React components (~92 files)
    ├── data/                            # Static content definitions (7 files)
    ├── hooks/                           # Custom React hooks (13 files)
    ├── lib/                             # Third-party integrations (7 files)
    ├── stores/                          # Zustand state stores (4 files)
    ├── types/                           # TypeScript declarations (1 file)
    └── utils/                           # Utility functions (9 files)
```

### 2.1 `src/animations/`

| File | Content |
|---|---|
| `transitions.ts` | Reusable spring/ease presets (`springSmooth`, `springBouncy`, etc.) |
| `variants.ts` | Framer Motion `Variants` objects (fade, slide, scale, drawer, card cascade) |

### 2.2 `src/app/`

```
src/app/
├── globals.css                # Tailwind v4 @import + custom @theme tokens
├── icon.svg                   # Favicon
├── layout.tsx                 # Root layout (fonts, metadata, viewport, providers)
├── providers.tsx              # Client providers (React Query + auth init)
├── robots.ts                  # Dynamic robots.txt
├── sitemap.ts                 # Dynamic sitemap.xml (products + categories + static)
│
├── (admin)/                   # Route group: admin panel (5 files)
│   └── admin/
│       ├── layout.tsx         # Admin layout (Sidebar, role check)
│       ├── page.tsx           # Dashboard page
│       ├── inventory/page.tsx # Inventory management
│       ├── orders/page.tsx    # Order management
│       └── users/page.tsx     # User management
│
├── (auth)/                    # Route group: authentication (4 directories)
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── reset-password/page.tsx
│   └── verify/page.tsx
│
├── (store)/                   # Route group: storefront (11 files)
│   ├── layout.tsx             # Navbar + CartDrawer + Footer
│   ├── not-found.tsx
│   ├── page.tsx               # Landing page
│   ├── checkout/
│   │   ├── page.tsx           # Checkout form
│   │   └── success/page.tsx   # Order confirmation
│   ├── products/
│   │   ├── page.tsx           # All products listing
│   │   ├── loading.tsx
│   │   ├── [slug]/
│   │   │   ├── page.tsx       # Product detail
│   │   │   └── loading.tsx
│   │   └── category/
│   │       ├── [category]/
│   │       │   ├── page.tsx   # Category filtered listing
│   │       │   └── loading.tsx
│   └── story/page.tsx         # Brand story
│
├── (user)/                    # Route group: user account (6 files)
│   ├── layout.tsx             # User layout with auth redirect
│   ├── profile/
│   │   ├── layout.tsx         # Profile page layout (sidebar + workspace)
│   │   ├── page.tsx           # Profile details
│   │   ├── loading.tsx
│   │   ├── ProfileLayoutClient.tsx  # Client wrapper for profile layout
│   │   └── orders/
│   │       ├── page.tsx       # Order history
│   │       └── loading.tsx
│
└── api/                       # API route handlers (22 endpoints)
    ├── admin/
    │   ├── dashboard/route.ts
    │   ├── orders/route.ts + [id]/route.ts
    │   ├── products/route.ts + [id]/route.ts
    │   └── users/route.ts + [id]/route.ts
    ├── auth/
    │   ├── [...all]/route.ts  # Better Auth catch-all
    │   └── role/route.ts      # Role check endpoint
    ├── categories/route.ts + daily/route.ts
    ├── checkout/session/route.ts
    ├── editorial/route.ts
    ├── insforge-token/route.ts
    ├── lookbook/route.ts
    ├── orders/route.ts
    ├── products/route.ts + [slug]/route.ts
    └── webhooks/lemonsqueezy/route.ts
```

### 2.3 `src/components/`

```
src/components/
├── admin/                         # Admin panel (18 files)
│   ├── dashboard/                 # 4 components
│   ├── inventory/                 # 6 components
│   ├── orders/                    # 3 components
│   └── users/                     # 5 components
│
├── auth/                          # Auth forms (8 files)
│   ├── LoginClient.tsx, LoginForm.tsx
│   ├── RegisterClient.tsx, RegisterForm.tsx
│   ├── ResetPasswordClient.tsx, ResetPasswordForm.tsx
│   └── VerifyClient.tsx, VerifyForm.tsx
│
├── checkout/                      # Checkout flow (7 files)
│
├── landing/                       # Home page sections (10 files)
│   ├── LandingClient.tsx, Hero.tsx, FeaturedCollection.tsx
│   ├── ProductGrid.tsx, LookbookSlider.tsx, MarqueeBar.tsx
│   ├── DesignerStory.tsx, Testimonials.tsx, Newsletter.tsx
│   └── ui/                        # Landing-specific primitives (2 files)
│
├── layout/                        # Shared layout (4 files)
│   ├── Navbar.tsx, NavbarProfileMenu.tsx
│   ├── MobileMenu.tsx, Footer.tsx
│
├── product/                       # Product pages (15 files)
│   ├── detail/                    # 8 components
│   └── listing/                   # 7 components
│
├── profile/                       # User profile (7 files)
│   ├── ProfileClient.tsx, ProfileForm.tsx
│   ├── ProfileSidebar.tsx, ProfileWorkspace.tsx
│   └── orders/                    # 3 components
│
├── story/                         # Brand story (6 files)
│
└── ui/                            # Shared primitives (12 files)
    ├── Button.tsx, ProductCard.tsx, Pagination.tsx
    ├── CartDrawer.tsx, OptimizedImage.tsx
    ├── AdminSidebar.tsx, AdminHeaderPanel.tsx
    ├── AnimatedText.tsx, EyebrowLabel.tsx
    ├── OrderStatusBadge.tsx, ConfirmDialog.tsx
    └── ScrollToTop.tsx
```

### 2.4 `src/data/` (Static Content)

| File | Content |
|---|---|
| `products.ts` | `Product` type + `heroProducts`, `featuredProducts`, `allProducts` arrays |
| `categories.ts` | `Category` type (union), `CategoryData` interface, `categoryDataList` |
| `hero.ts` | `HeroSlide` type + `heroSlides` array for homepage |
| `editorial.ts` | Editorial content for story page |
| `lookbook.ts` | Lookbook slide data |
| `navigation.ts` | Navigation link definitions |
| `testimonials.ts` | Testimonial quotes for landing |

### 2.5 `src/hooks/`

```
src/hooks/
├── queries.ts                          # All React Query hooks (products, categories, lookbook, editorial, orders)
├── useInitializeAuth.ts                # Auth store init on mount
├── useAdminDashboard.ts                # Dashboard data loader
├── useCheckoutForm.ts                  # Checkout form state + validation + LS integration
├── useCheckoutSuccess.ts               # Success page: clears cart, reads sessionStorage, polls for order number (up to 10x @ 1.5s)
├── useNewsletterSubmit.ts              # Newsletter signup (static placeholder)
├── useOrdersManagement.ts              # Admin order management
├── useProductFilter.ts                 # URL-synced product listing filters
├── useProductForm.ts                   # Admin product form state + upload
├── useUserSessions.ts                  # Multi-session management
├── useUsersManagement.ts               # Admin user CRUD
└── ui/                                 # Pure UI hooks (3 files)
    ├── useBodyScrollLock.ts
    ├── useCarousel.ts                   # Wraps Embla Carousel
    └── useNavbarScroll.ts              # Show/hide on scroll direction
```

### 2.6 `src/lib/` (Third-Party Integrations)

| File | Purpose | Runtime |
|---|---|---|
| `auth.ts` | Better Auth server instance config | Server |
| `auth-client.ts` | Better Auth browser client | Client |
| `email.ts` | Nodemailer/Brevo SMTP transport | Server |
| `email-templates.ts` | HTML/text order confirmation templates | Server |
| `insforge.ts` | InsForge browser client (JWT-bridged, auto-refresh) | Client |
| `insforge.server.ts` | InsForge server client (JWT-signed) | Server |
| `lemonsqueezy.ts` | Lemon Squeezy REST API v1/checkouts | Server |

### 2.7 `src/stores/` (Zustand)

| File | Persistence | Key | Notes |
|---|---|---|---|
| `useCartStore.ts` | localStorage | `aurora-cart` | Persisted shopping cart state |
| `useAuthStore.ts` | None (session) | — | Authentication and user session store |
| `useProductStore.ts` | None (transient UI) | — | UI state (size selection, active details tab) |
| `useAdminStore.ts` | None | — | Deprecated as Zustand store (types-only now) |

### 2.8 `src/utils/`

| File | Purpose |
|---|---|
| `admin.ts` | `requireAdmin()`, `requireRole()` — server-side RBAC |
| `auth.ts` | `normalizeProfile()`, `isAdmin()` |
| `cn.ts` | `cn()` — clsx + tailwind-merge |
| `db.ts` | `pool` — PostgreSQL `Pool` singleton |
| `formatCurrency.ts` | Intl.NumberFormat USD formatting |
| `pricing.ts` | `calculateOrderPricing()` — shipping/tax/total |
| `validation.ts` | `validateField()`, `validateAll()` — checkout form |
| `insforge.ts` | `getStorageUrl()`, `getStorageKeyFromUrl()` — path↔URL mapping |
| `insforge/client.ts` | InsForge client utility wrappers |
| `insforge/server.ts` | InsForge server utility wrappers |

### 2.9 `scripts/`

| Script | Language | Purpose |
|---|---|---|
| `create-tables.sql` | SQL | Full DDL (categories, products, product_*, orders, reservations, lookbook, editorial, hero) |
| `setup-db.js` | JS | Better Auth schema initializer |
| `upload-and-seed.mts` | TS | Deploy schema + upload media + seed DB (full reset) |
| `update-catalog.mts` | TS | Upsert products without wiping orders/users (`--catalog-only`) |
| `manage-user.ts` | TS | CLI user management (create, role, delete) |
| `optimize-images.mjs` | JS | Sharp-based WebP preprocessing |

### 2.10 `migrations/`

| File | Purpose |
|---|---|
| `20260614145429_better-auth-setup.sql` | Auto-generated Better Auth schema migration |

### 2.11 `__tests__/`

```
__tests__/
└── api/
    ├── categories.test.ts      # Categories endpoint tests
    ├── checkout.test.ts        # Checkout session creation tests
    ├── webhook.test.ts         # Lemon Squeezy webhook tests
    └── admin-auth.test.ts      # Admin role auth tests
```

---

## 3. Architecture: 4-Layer Unidirectional Data Flow

The codebase enforces a strict 4-layer architecture with unidirectional dependencies:

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: Pages (src/app/)                                  │
│  Server Components — resolve params, export SEO metadata,   │
│  render container components                                │
│  RULES: No "use client", no store/hook imports              │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: Container/Bridge Components (src/components/*/)   │
│  "use client" — read stores, call hooks, assemble props     │
│  Named *Client.tsx or *Container.tsx                        │
├─────────────────────────────────────────────────────────────┤
│  Layer 3: Hooks (src/hooks/) + Stores (src/stores/)         │
│  Business logic, queries, form state, global state          │
│  Never import UI components                                 │
├─────────────────────────────────────────────────────────────┤
│  Layer 4: Presentational Components (src/components/*/)     │
│  Pure JSX — receive everything via props                    │
│  Zero store/hook imports                                    │
│  Only UI-only hooks allowed (useBodyScrollLock, etc.)       │
└─────────────────────────────────────────────────────────────┘
```

### Concrete Example: Product Detail Page

```
1. Page (server)
   src/app/(store)/products/[slug]/page.tsx
   → Resolves params.slug
   → Exports generateMetadata({ params }) — fetches product for SEO
   → Renders <ProductDetailClient slug={slug} />

2. Container (client)
   src/components/product/detail/ProductDetailClient.tsx
   → "use client"
   → useProductDetailsQuery(slug) — fetches product
   → useProductStore — selectedSize, activeTab, sizeGuide open
   → useCartStore — addItem
   → Passes data down as props

3. Hooks + Stores
   → queries.ts: useProductDetailsQuery(slug)
     - Query key: ['product', slug]
     - initialData from cached ['products'] query
     - Fetches GET /api/products/[slug]
   → useProductStore: transient UI state (size selection, tabs)
   → useCartStore: addItem action (persisted)

4. Presentational
   → ProductInfo — receives product, selectedSize, callbacks
   → ImageGallery — receives images, selectedSize
   → SizeSelector — receives sizes, selectedSize, onSelect
   → ProductActions — receives onAddToCart
   → Breadcrumbs — receives category, productName
   → SizeGuideModal — receives isOpen, onClose
```

### Import Alias Map

| Alias | Target |
|---|---|
| `@/components/*` | `src/components/*` |
| `@/hooks/*` | `src/hooks/*` |
| `@/stores/*` | `src/stores/*` |
| `@/data/*` | `src/data/*` |
| `@/utils/*` | `src/utils/*` |
| `@/animations/*` | `src/animations/*` |
| `@/lib/*` | `src/lib/*` |

---

## 4. Routing Map

### 4.1 Storefront (public, indexed)

| URL | File | Metadata | Notes |
|---|---|---|---|
| `/` | `(store)/page.tsx` | Title: "SS 2026 Collection" | `<LandingClient />` |
| `/products` | `(store)/products/page.tsx` | Dynamic title | `<ProductListingClient />` |
| `/products/[slug]` | `(store)/products/[slug]/page.tsx` | Dynamic (product name) | `<ProductDetailClient />` |
| `/products/category/[category]` | `(store)/products/category/[category]/page.tsx` | Dynamic (category name) | 404 on unknown slug |
| `/story` | `(store)/story/page.tsx` | Brand story | `<StoryPageClient />` |
| `/checkout` | `(store)/checkout/page.tsx` | Checkout | Guest OK |
| `/checkout/success` | `(store)/checkout/success/page.tsx` | Order confirmation | Reads sessionStorage |
| `/story` | `(store)/story/page.tsx` | Brand story | `<StoryPageClient />` |

**Loading states**: `products/loading.tsx`, `products/[slug]/loading.tsx`, `products/category/[category]/loading.tsx`

### 4.2 Authentication (public, noindex)

| URL | File | Notes |
|---|---|---|
| `/login` | `(auth)/login/page.tsx` | `noindex, nofollow` |
| `/register` | `(auth)/register/page.tsx` | `noindex, nofollow` |
| `/reset-password` | `(auth)/reset-password/page.tsx` | `noindex, nofollow` |
| `/verify` | `(auth)/verify/page.tsx` | `noindex, nofollow` |

### 4.3 User Account (auth required, noindex)

| URL | File | Notes |
|---|---|---|
| `/profile` | `(user)/profile/page.tsx` | `noindex, nofollow`, `<ProfileClient />` |
| `/profile/orders` | `(user)/profile/orders/page.tsx` | `noindex, nofollow`, `<OrdersClient />` |

### 4.4 Admin Panel (admin required, noindex)

| URL | File | Notes |
|---|---|---|
| `/admin` | `(admin)/admin/page.tsx` | `<DashboardClient />` |
| `/admin/inventory` | `(admin)/admin/inventory/page.tsx` | `<InventoryClient />` |
| `/admin/orders` | `(admin)/admin/orders/page.tsx` | `<OrdersClient />` |
| `/admin/users` | `(admin)/admin/users/page.tsx` | `<UsersClient />` |

### 4.5 API Routes

#### Public Endpoints

| Endpoint | Method | Auth | Caching | Purpose |
|---|---|---|---|---|
| `/api/products` | GET | None | `'use cache'` 300s, tag: `products` | List/paginate/filter/sort |
| `/api/products/[slug]` | GET | None | `'use cache'` 300s, tag: `products` | Single product detail (with images, sizes, details) |
| `/api/categories` | GET | None | `'use cache'` 300s, tags: `categories,products` | All categories with metadata |
| `/api/categories/daily` | GET | None | `'use cache'` 300s, tags: `categories,products` | 3 daily rotating categories (day-of-year modulo) |
| `/api/lookbook` | GET | None | `'use cache'` 300s, tag: `lookbook` | Lookbook slides |
| `/api/editorial` | GET | None | `'use cache'` 600s, tag: `editorial` | Editorial content |
| `/api/orders` | GET | Better Auth session | React Query 2min | User's orders (paginated) |
| `/api/orders` | POST | _(removed)_ | — | ~~Create order (deactivated)~~ |

#### Auth Endpoints

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/auth/[...all]` | ALL | None | Better Auth catch-all (signin, signup, verify, reset, session, etc.) |
| `/api/auth/role` | GET | Better Auth session | Returns `{ isAdmin, role }` for current user |

#### Checkout / Payment

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/checkout/session` | POST | Optional (guest OK) | Create Lemon Squeezy checkout with stock reservation |
| `/api/webhooks/lemonsqueezy` | POST | HMAC signature | Process `order_created` events (idempotent) |

#### Admin Endpoints (require admin role)

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/admin/dashboard` | GET | Dashboard metrics + 5 recent orders |
| `/api/admin/products` | GET | All products (admin view) |
| `/api/admin/products` | POST | Create product |
| `/api/admin/products/[id]` | PUT | Update product (full replacement of images, sizes, details in txn, cleans up old storage) |
| `/api/admin/products/[id]` | DELETE | Delete product (with cascade + unused storage cleanup) |
| `/api/admin/orders` | GET | All orders (admin view) |
| `/api/admin/orders/[id]` | PATCH | Update order status (validated against allowed values) |
| `/api/admin/users` | GET | All users with account links + session count |
| `/api/admin/users/[id]` | GET | Single user (supports `?include=sessions` for session list) |
| `/api/admin/users/[id]` | PATCH | Update user fields (`name`, `emailVerified`, `role`) |
| `/api/admin/users/[id]` | DELETE | Delete user (self-deletion blocked) |

#### Infrastructure

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/insforge-token` | GET | Better Auth session | Returns signed JWT for InsForge bridge |

---

## 5. API Route Handler Reference

### 5.1 `GET /api/products`

**File**: `src/app/api/products/route.ts`

**Query params**: `category`, `page`, `limit` (default 12), `search`, `sortBy` (price-asc, price-desc, name-asc, name-desc)

**Behavior**:
- With `page` param: returns `{ products: [...], total: number }` (paginated)
- Without `page` param: returns `Product[]` (all matching)
- Search searches `name`, `description`, and `product_keywords` via `ILIKE`
- Cached via Next.js 16 `'use cache'` with 300s revalidation (`cacheLife`) and `products` tag (`cacheTag`)

**Response shape (paginated)**:
```ts
{ products: Product[], total: number }
```
**Response shape (unpaginated)**:
```ts
Product[]
```

### 5.2 `GET /api/products/[slug]`

**File**: `src/app/api/products/[slug]/route.ts`

**Behavior**:
- Uses `json_agg` subqueries to consolidate `product_images`, `product_sizes`, `product_details` into a single row
- Case-insensitive slug lookup via `LOWER(p.slug) = LOWER($1)`
- Returns 404 if not found
- Cached via Next.js 16 `'use cache'` 300s, tag `products`

**Response shape**:
```ts
{
  id: string; slug: string; name: string; category: string;
  price: number; badge: string | null; image: string;
  images: string[]; altText: string; span: string | null;
  aspectRatio: string | null; description: string;
  details: string[]; sizes: string[];
}
```

### 5.3 `GET /api/categories`

**File**: `src/app/api/categories/route.ts`

**Behavior**: Returns all categories ordered by name. Cached via Next.js 16 `'use cache'` (300s) with tags `categories,products`.

**Response**: `CategoryMetadata[]`

### 5.4 `GET /api/categories/daily`

**File**: `src/app/api/categories/daily/route.ts`

**Behavior**: Returns 3 categories deterministically selected by day-of-year modulo. Shares the same `'use cache'` properties and tags as the regular categories route — both hit the same cached data.

### 5.5 `POST /api/checkout/session`

**File**: `src/app/api/checkout/session/route.ts`

**Request body** (`CheckoutSessionRequest`):
```ts
{
  variantId?: string;           // Derived server-side from env
  cartItems: Array<{
    internalProductId: string;  // varchar(50)
    quantity: number;
    size: string;
  }>;
  shippingAddress: {
    email: string; firstName: string; lastName: string;
    address: string; city: string; zipCode: string;
  };
}
```

**Processing flow**:
1. Validates variantId, cartItems, quantities (max 10 per item)
2. Merges duplicate items (same product ID + size)
3. Fetches products from DB for authentic prices (prevents tampering)
4. Opens PG transaction:
   - Locks `product_sizes` rows `FOR UPDATE` (sorted to prevent deadlocks)
   - Checks active reservations (`product_reservations` where `expires_at > NOW()`)
   - Computes available stock = stock - reserved
   - Inserts 35-minute soft reservation
   - Commits
5. Computes pricing (free shipping >$500, 8% tax)
6. Sanitizes address (strip HTML, trim, max 200 chars)
7. Calls `createCheckout()` via Lemon Squeezy API
8. On failure: rolls back reservation
9. Returns checkout URL

**Response**: `{ checkoutUrl: string, checkoutId: string }`

### 5.6 `POST /api/webhooks/lemonsqueezy`

**File**: `src/app/api/webhooks/lemonsqueezy/route.ts`

**Signature verification**: HMAC-SHA256 timing-safe comparison via `crypto.timingSafeEqual`

**Event handling**: Only processes `order_created` events

**Processing flow** (`handleOrderCreated`):
1. Extracts custom data (user_id, reservation_id, cart_items, shipping_address)
2. Opens PG transaction:
   - Idempotency check: `INSERT INTO processed_webhooks (ls_event_id) ... ON CONFLICT DO NOTHING`
   - If already processed: rollback early
   - For each cart item: verify product exists, lock size `FOR UPDATE`, check stock, decrement stock
   - Delete reservation
   - Insert order record (status `pending`, `is_paid=true`)
   - Update `ls_customer_id` on user
3. Sends transactional order confirmation email (fire-and-forget, non-blocking)

**Response**: `{ received: true }` (200) or `{ error }` (401/400/500)

### 5.7 `GET /api/orders`

**File**: `src/app/api/orders/route.ts`

**Query params**: `limit` (max 100, default 50), `offset`, `lsOrderId` (optional — lookup by LS order ID, no auth needed)

**Auth**: Better Auth session required (except `lsOrderId` lookup which is unauthenticated)

**Response** (normal): `{ orders: Order[], total: number }`
**Response** (`lsOrderId`): `{ orderNumber: string }`

### 5.8 `GET /api/auth/role`

**File**: `src/app/api/auth/role/route.ts`

**Response**: `{ isAdmin: boolean, role: string }`

Reads from `better_auth."user"` table, falls back to `ADMIN_EMAILS` env whitelist.

### 5.9 `GET /api/admin/dashboard`

**File**: `src/app/api/admin/dashboard/route.ts`

**Auth**: `requireAdmin()`

**Runs 5 parallel queries**:
1. Total sales + total orders (excl. cancelled)
2. Pending order count
3. Shipped order count
4. Low stock count (products with any size having stock < 5)
5. Last 5 orders (with shipping name)

**Response**:
```ts
{
  metrics: DashboardMetrics;    // totalSales, totalOrders, averageOrderValue, pendingCount, shippedCount, lowStockCount
  recentOrders: RecentOrder[];  // 5 most recent
}
```

### 5.10 Admin CRUD Endpoints

**Pattern**: All follow `requireAdmin()` → validate → DB operation → response

| Endpoint | Body / Params | Behavior |
|---|---|---|
| `POST /api/admin/products` | `ProductData` | Insert product + images + sizes + details (transaction, no keywords) |
| `PUT /api/admin/products/[id]` | `ProductData` | Update product + replace images/sizes/details (transaction, cleans up old storage objects) |
| `DELETE /api/admin/products/[id]` | — | Delete with cascade + unused storage object cleanup |
| `PATCH /api/admin/orders/[id]` | `{ status }` | Update order status (validated: `pending`/`confirmed`/`shipped`/`delivered`/`cancelled`) |
| `PATCH /api/admin/users/[id]` | `{ name?, emailVerified?, role? }` | Update user fields in `better_auth."user"` (role validated: `user` or `admin`) |

---

## 6. Database Schema

### 6.1 Full DDL (public schema, 12 tables)

```sql
-- Helper for RLS (extracts sub claim from bridge JWT)
CREATE FUNCTION public.requesting_user_id() RETURNS text ...

-- Categories
CREATE TABLE categories (
  slug        VARCHAR(50) PRIMARY KEY,
  name        VARCHAR(100) UNIQUE NOT NULL,
  image       TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Products (base)
CREATE TABLE products (
  id           VARCHAR(50) PRIMARY KEY,
  slug         VARCHAR(100) UNIQUE NOT NULL,
  name         VARCHAR(255) NOT NULL,
  category     VARCHAR(100) NOT NULL REFERENCES categories(name),
  price        NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  badge        VARCHAR(50),
  image        TEXT NOT NULL,
  alt_text     TEXT NOT NULL,
  span         VARCHAR(50),
  aspect_ratio VARCHAR(50),
  description  TEXT NOT NULL,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE UNIQUE INDEX idx_products_slug_lower ON products (LOWER(slug));

-- Product images (1:N)
CREATE TABLE product_images (
  id         SERIAL PRIMARY KEY,
  product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
  image_url  TEXT NOT NULL
);

-- Product sizes with stock (1:N)
CREATE TABLE product_sizes (
  id         SERIAL PRIMARY KEY,
  product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
  size       VARCHAR(50) NOT NULL,
  stock      INT NOT NULL DEFAULT 10,
  UNIQUE(product_id, size)
);

-- Product detail bullets (1:N)
CREATE TABLE product_details (
  id         SERIAL PRIMARY KEY,
  product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
  detail     TEXT NOT NULL
);

-- Product search keywords (1:N)
CREATE TABLE product_keywords (
  id         SERIAL PRIMARY KEY,
  product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
  keyword    VARCHAR(100) NOT NULL,
  UNIQUE(product_id, keyword)
);

-- Orders (guest checkout allowed — user_id nullable)
CREATE TABLE orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          TEXT,
  order_number     VARCHAR(50) UNIQUE NOT NULL,
  items            JSONB NOT NULL,           -- Denormalized snapshot
  subtotal         NUMERIC(10,2) NOT NULL,
  shipping         NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax              NUMERIC(10,2) NOT NULL DEFAULT 0,
  total            NUMERIC(10,2) NOT NULL,
  shipping_address JSONB NOT NULL,
  status           VARCHAR(20) NOT NULL DEFAULT 'pending',
  is_paid          BOOLEAN NOT NULL DEFAULT FALSE,
  payment_provider VARCHAR(50),
  ls_order_id      TEXT UNIQUE,
  ls_order_number  INTEGER,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Processed webhooks (idempotency)
CREATE TABLE processed_webhooks (
  id           SERIAL PRIMARY KEY,
  ls_event_id  TEXT UNIQUE NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product reservations (checkout stock holding, 35-min TTL)
CREATE TABLE product_reservations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL,
  product_id     VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
  size           VARCHAR(50) NOT NULL,
  quantity       INT NOT NULL,
  expires_at     TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lookbook slides
CREATE TABLE lookbook_slides (
  id             SERIAL PRIMARY KEY,
  slide_number   INT UNIQUE NOT NULL,
  original_image TEXT NOT NULL,
  image_url      TEXT NOT NULL,
  alt_text       TEXT NOT NULL,
  tag            VARCHAR(50),
  title          VARCHAR(255),
  link           VARCHAR(255)
);

-- Editorial content
CREATE TABLE editorial_content (
  id             VARCHAR(50) PRIMARY KEY,
  original_image TEXT NOT NULL,
  image_url      TEXT NOT NULL,
  alt_text       TEXT NOT NULL,
  title          VARCHAR(255),
  description    TEXT
);

-- Hero slides
CREATE TABLE hero_slides (
  id             SERIAL PRIMARY KEY,
  slide_number   INT UNIQUE NOT NULL,
  original_image TEXT NOT NULL,
  image_url      TEXT NOT NULL,
  alt_text       TEXT NOT NULL,
  title          VARCHAR(255),
  link           VARCHAR(255)
);


-- ========================================================
--  Row Level Security (RLS) Policies
-- ========================================================

-- Helper for RLS (extracts sub claim from bridge JWT)
CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS text
LANGUAGE sql STABLE
AS $$ SELECT NULLIF(auth.jwt() ->> 'sub', '')::text $$;

-- 1. Categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow admin write access" ON public.categories FOR ALL TO authenticated USING (
  public.requesting_user_id() IN (
    SELECT id FROM better_auth."user" WHERE role = 'admin'
  )
);

-- 2. Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow admin write access" ON public.products FOR ALL TO authenticated USING (
  public.requesting_user_id() IN (
    SELECT id FROM better_auth."user" WHERE role = 'admin'
  )
);

-- 3. Product Images
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Allow admin write access" ON public.product_images FOR ALL TO authenticated USING (
  public.requesting_user_id() IN (
    SELECT id FROM better_auth."user" WHERE role = 'admin'
  )
);

-- 4. Product Sizes
ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.product_sizes FOR SELECT USING (true);
CREATE POLICY "Allow admin write access" ON public.product_sizes FOR ALL TO authenticated USING (
  public.requesting_user_id() IN (
    SELECT id FROM better_auth."user" WHERE role = 'admin'
  )
);

-- 5. Product Details
ALTER TABLE public.product_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.product_details FOR SELECT USING (true);
CREATE POLICY "Allow admin write access" ON public.product_details FOR ALL TO authenticated USING (
  public.requesting_user_id() IN (
    SELECT id FROM better_auth."user" WHERE role = 'admin'
  )
);

-- 6. Product Keywords
ALTER TABLE public.product_keywords ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.product_keywords FOR SELECT USING (true);
CREATE POLICY "Allow admin write access" ON public.product_keywords FOR ALL TO authenticated USING (
  public.requesting_user_id() IN (
    SELECT id FROM better_auth."user" WHERE role = 'admin'
  )
);

-- 7. Lookbook Slides
ALTER TABLE public.lookbook_slides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.lookbook_slides FOR SELECT USING (true);
CREATE POLICY "Allow admin write access" ON public.lookbook_slides FOR ALL TO authenticated USING (
  public.requesting_user_id() IN (
    SELECT id FROM better_auth."user" WHERE role = 'admin'
  )
);

-- 8. Editorial Content
ALTER TABLE public.editorial_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.editorial_content FOR SELECT USING (true);
CREATE POLICY "Allow admin write access" ON public.editorial_content FOR ALL TO authenticated USING (
  public.requesting_user_id() IN (
    SELECT id FROM better_auth."user" WHERE role = 'admin'
  )
);

-- 9. Hero Slides
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.hero_slides FOR SELECT USING (true);
CREATE POLICY "Allow admin write access" ON public.hero_slides FOR ALL TO authenticated USING (
  public.requesting_user_id() IN (
    SELECT id FROM better_auth."user" WHERE role = 'admin'
  )
);

-- 10. Orders (Users read own orders, Admins read all)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to view own orders" ON public.orders FOR SELECT TO authenticated USING (
  user_id = public.requesting_user_id()
  OR
  public.requesting_user_id() IN (
    SELECT id FROM better_auth."user" WHERE role = 'admin'
  )
);

-- 11. Processed Webhooks (Bypass RLS on Service role, block client-side)
ALTER TABLE public.processed_webhooks ENABLE ROW LEVEL SECURITY;

-- 12. Product Reservations (Bypass RLS on Service role, block client-side)
ALTER TABLE public.product_reservations ENABLE ROW LEVEL SECURITY;
```

### 6.2 Indexes

| Index | Table | Columns | Type |
|---|---|---|---|
| `idx_products_slug_lower` | products | `LOWER(slug)` | UNIQUE |
| `idx_product_images_product_id` | product_images | product_id | B-tree |
| `idx_product_details_product_id` | product_details | product_id | B-tree |
| `idx_product_keywords_product_id` | product_keywords | product_id | B-tree |
| `idx_product_keywords_val` | product_keywords | keyword | B-tree |
| `idx_orders_user_id` | orders | user_id | B-tree |
| `idx_orders_order_number` | orders | order_number | B-tree |
| `idx_product_reservations_lookup` | product_reservations | product_id, size, expires_at | B-tree |

### 6.3 Order Statuses (enum-like)

`pending` → `confirmed` → `shipped` → `delivered`
(with `cancelled` allowed from any state)

### 6.4 Better Auth Schema (`better_auth`)

Managed by Better Auth migration. Key tables:
- `user` — id, email, name, emailVerified, image, role, ls_customer_id (custom columns)
- `session` — id, userId, expiresAt, token
- `account` — id, userId, providerId, providerAccountId
- `verification` — id, identifier, value, expiresAt, createdAt
- `rateLimit` — id, identifier, windowStart, windowEnd, count

---

## 7. Type System Reference

### 7.1 Product Types (`src/data/products.ts`)

```ts
interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  badge?: string;
  image: string;
  images?: string[];
  altText: string;
  span?: string;           // CSS grid span class (e.g. "lg:col-span-2")
  aspectRatio?: string;    // CSS aspect ratio class (e.g. "aspect-[3/4]")
  description?: string;
  details?: string[];      // Bullet points
  sizes?: string[];        // Size labels
  keywords?: string[];
}

type Category = "Outerwear" | "Knitwear" | "Trousers" | "Dresses" | "Accessories";
```

### 7.2 Category Types (`src/data/categories.ts`)

```ts
interface CategoryData {
  slug: string;
  name: string;
  image: string;
  description: string;
}
```

### 7.3 Cart Types (`src/stores/useCartStore.ts`)

```ts
interface CartItem {
  id: string;        // Product ID
  slug: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
  category: string;
}
```

### 7.4 Auth Types (`src/stores/useAuthStore.ts`)

```ts
interface User {
  id: string;
  email: string;
  name?: string | null;
  emailVerified?: boolean | null;
  image?: string | null;
  isAdmin?: boolean | null;
  role?: string | null;
}

interface Profile {
  displayName: string;
}
```

### 7.5 Admin Types (`src/stores/useAdminStore.ts`)

```ts
interface SizeStock {
  size: string;
  stock: number;
}

interface ProductData {
  id: string; slug: string; name: string; category: string;
  price: number; badge: string | null; image: string; altText: string;
  span: string | null; aspectRatio: string | null; description: string;
  images: string[]; sizes: SizeStock[]; details: string[];
}

interface OrderItem {
  id: string; slug: string; name: string; price: number;
  size: string; image: string; quantity: number;
}

interface ShippingAddress {
  email: string; firstName: string; lastName: string;
  address: string; city: string; zipCode: string;
}

interface OrderData {
  id: string; userId: string | null; orderNumber: string;
  items: OrderItem[]; subtotal: number; shipping: number; tax: number; total: number;
  shippingAddress: ShippingAddress;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  isPaid: boolean; createdAt: string;
}

interface DashboardMetrics {
  totalSales: number; totalOrders: number; averageOrderValue: number;
  pendingCount: number; shippedCount: number; lowStockCount: number;
}

interface RecentOrder {
  orderNumber: string; total: number; status: string;
  isPaid?: boolean; createdAt: string; firstName: string; lastName: string;
}
```

### 7.6 Checkout Types (`src/app/api/checkout/session/route.ts`)

```ts
interface CheckoutSessionRequest {
  variantId?: string;
  cartItems: Array<{
    internalProductId: string;  // varchar(50)
    quantity: number; size: string;
  }>;
  shippingAddress: {
    email: string; firstName: string; lastName: string;
    address: string; city: string; zipCode: string;
  };
}
```

### 7.7 Validation Types (`src/utils/validation.ts`)

```ts
interface FieldErrors {
  email?: string; firstName?: string; lastName?: string;
  address?: string; city?: string; zipCode?: string;
  cardNumber?: string; cardExpiry?: string; cardCVC?: string;
}
```

### 7.8 Hero / Landing Types (`src/data/hero.ts`)

```ts
interface HeroSlide {
  id?: number;
  slideNumber: number;
  originalImage: string;
  imageUrl: string;
  altText: string;
  title?: string;
  link?: string;
}
```

### 7.9 Query Types (`src/hooks/queries.ts`)

```ts
interface PaginatedProductsParams {
  category?: string; page?: number; limit?: number;
  search?: string; sortBy?: string;
}

interface PaginatedProductsResponse {
  products: Product[];
  total: number;
}

interface AdminPaginatedProductsResponse {
  products: ProductData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PaginatedOrdersResponse {
  orders: OrderData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PaginatedUsersResponse {
  users: AdminUserRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Order {
  id: string; userId: string | null; orderNumber: string;
  items: OrderItem[]; subtotal: number; shipping: number; tax: number; total: number;
  shippingAddress: { email: string; firstName: string; lastName: string; address: string; city: string; zipCode: string; };
  status: string; createdAt: string;
}

interface CategoryMetadata {
  slug: string; name: string; image: string; description: string;
}
```

### 7.10 Email Types (`src/lib/email-templates.ts`)

```ts
interface OrderConfirmationData {
  orderNumber: string; customerName: string;
  items: Array<{ name: string; size: string; quantity: number; price: string }>;
  subtotal: string; shipping: string; tax: string; total: string;
  shippingAddress: { firstName: string; lastName: string; address: string; city: string; zipCode: string; };
}
```

### 7.11 Lemon Squeezy Types (`src/lib/lemonsqueezy.ts`)

```ts
interface CreateCheckoutPayload {
  variantId: string; userId: string | null;
  userEmail?: string; userName?: string;
  reservationId?: string;
  cartItems: Array<{ internalProductId: string; quantity: number; size: string }>;
  shippingAddress: { email: string; firstName: string; lastName: string; address: string; city: string; zipCode: string; };
  totalPriceCents: number;
  description?: string;
}

interface LemonSqueezyCheckoutResponse {
  checkoutUrl: string;
  checkoutId: string;
}
```

### 7.12 Webhook Verified Item Type (`src/app/api/webhooks/lemonsqueezy/route.ts`)

```ts
interface VerifiedItem {
  id: string; slug: string; name: string; size: string;
  price: number; image: string; quantity: number;
}
```

---

## 8. Zustand Store API Reference

### 8.1 `useCartStore` (`src/stores/useCartStore.ts`)

**State**:
```ts
{ items: CartItem[]; isOpen: boolean }
```

**Actions**:
```ts
addItem(product: Omit<CartItem, "quantity">): void
  // If same ID+size exists, increments quantity. Otherwise adds with qty 1.

removeItem(id: string, size: string): void
  // Removes specific product+size combination.

updateQuantity(id: string, size: string, quantity: number): void
  // Updates quantity for specific product+size.

clearCart(): void
openCart(): void
closeCart(): void
toggleCart(): void
totalItems(): number      // Derived: sum of quantities
totalPrice(): number       // Derived: sum of price * qty
```

**Persistence**: `localStorage` key `aurora-cart`

**Consumers**: `CartDrawer`, `CheckoutForm`, `OrderSummaryContainer`, `Navbar`, `ProductActions`, `CartEmptyState`

### 8.2 `useAuthStore` (`src/stores/useAuthStore.ts`)

**State**:
```ts
{ user: User | null; profile: Profile | null; loading: boolean; error: string | null }
```

**Actions**:
```ts
signIn(email: string, password: string): Promise<{ error: any; needsVerification?: boolean }>
signUp(email: string, password: string, name?: string): Promise<{ error: any; needsVerification?: boolean }>
signOut(): Promise<void>
updateProfile(profile: Partial<Profile>): Promise<{ error: any }>
verifyEmail(email: string, token: string): Promise<{ error: any }>
resendVerification(email: string): Promise<{ error: any }>
sendResetPasswordEmail(email: string): Promise<{ error: any }>
resetPassword(newPassword: string, token: string): Promise<{ error: any }>
changePassword(currentPassword: string, newPassword: string): Promise<{ error: any }>
clearError(): void
```

**Flow**: Each method wraps `authClient` calls, maps errors via `mapBetterAuthError()`, fetches `/api/auth/role` for admin status after sign-in/sign-up.

**Consumers**: `LoginForm`, `RegisterForm`, `NavbarProfileMenu`, `ProfileClient`, `ResetPasswordForm`, `VerifyForm`

### 8.3 `useProductStore` (`src/stores/useProductStore.ts`)

**State**:
```ts
{
  selectedSizes: Record<string, string>;   // productId → selected size
  activeTabs: Record<string, "details" | "shipping">;
  isSizeGuideOpen: boolean;
}
```

**Actions**:
```ts
setSelectedSize(productId: string, size: string): void
setActiveTab(productId: string, tab: "details" | "shipping"): void
setSizeGuideOpen(isOpen: boolean): void
```

**Consumers**: `ProductDetailClient`, `SizeGuideModal`

### 8.4 `useAdminStore` (`src/stores/useAdminStore.ts`)

**Note:** This file no longer acts as a Zustand store. All data fetching, updates, and mutation actions have been migrated to TanStack Query and mutations (see `src/hooks/queries.ts`). This file serves solely as a central repository for admin TypeScript interfaces (`ProductData`, `SizeStock`, `OrderData`, `DashboardMetrics`, `RecentOrder`, etc.).

---

## 9. React Query Hooks Reference

All in `src/hooks/queries.ts`. Default config: staleTime=5min, gcTime=10min, refetchOnWindowFocus=false.

### Storefront Queries
| Hook | Query Key | Fetches | Notes |
|---|---|---|---|
| `useProductsQuery(category?)` | `['products', categoryOr'All']` | `GET /api/products?category=...` | Returns `Product[]` (unpaginated) |
| `usePaginatedProductsQuery(params)` | `['products', 'paginated', params]` | `GET /api/products?page=&limit=&search=&sortBy=&category=` | Returns `PaginatedProductsResponse` |
| `useFeaturedProductsQuery(count=3)` | `['products', 'All']` | Fetches all, then `select` deterministic daily subset | Day-of-month modulo algorithm |
| `useRelatedProductsQuery(current)` | `['products', 'All']` | Fetches all, then `select` up to 4 same-category | Falls back to any if no same-category |
| `useProductDetailsQuery(slug)` | `['product', slug]` | `GET /api/products/[slug]` | `staleTime: 0`, `initialData` from cached product list |
| `useLookbookQuery()` | `['lookbook']` | `GET /api/lookbook` | Lookbook slides |
| `useEditorialQuery()` | `['editorial']` | `GET /api/editorial` | Editorial content |
| `useOrders(page=0, limit=50)` | `['orders', userId, page]` | `GET /api/orders?limit=&offset=` | staleTime=2min, enabled only when `user.id` exists |
| `useCategoriesQuery()` | `['categories']` | `GET /api/categories` | staleTime=10min |
| `useDailyCategoriesQuery()` | `['categories', 'daily']` | `GET /api/categories/daily` | staleTime=30min |

### Admin Queries & Mutations
| Hook / Mutation | Query Key | Target Endpoint | Notes |
|---|---|---|---|
| `useAdminDashboardQuery()` | `['admin', 'dashboard']` | `GET /api/admin/dashboard` | Returns dashboard statistics + recent orders list |
| `useAdminProductsQuery(params)` | `['admin', 'products', params]` | `GET /api/admin/products` | Returns paginated products list. Uses `keepPreviousData` caching. |
| `useAdminOrdersQuery(params)` | `['admin', 'orders', params]` | `GET /api/admin/orders` | Returns paginated orders list. Uses `keepPreviousData` caching. |
| `useAdminUsersQuery(params)` | `['admin', 'users', params]` | `GET /api/admin/users` | Returns paginated users list. Uses `keepPreviousData` caching. |
| `useAdminUserSessionsQuery(userId)` | `['admin', 'users', userId, 'sessions']` | `GET /api/admin/users/:id?include=sessions` | Fetches user's active sessions (enabled only if `userId` is set) |
| `useUpdateOrderStatusMutation()` | — | `PATCH /api/admin/orders/:id` | Updates order status; invalidates `orders` and `dashboard` caches |
| `useSaveProductMutation()` | — | `POST/PUT /api/admin/products` | Creates or updates a product; invalidates `products` cache |
| `useDeleteProductMutation()` | — | `DELETE /api/admin/products/:id` | Deletes a product; invalidates `products` cache |
| `useToggleUserVerifyMutation()` | — | `PATCH /api/admin/users/:id` | Toggles email verification status; invalidates `users` cache |
| `useUpdateUserRoleMutation()` | — | `PATCH /api/admin/users/:id` | Updates a user's system role; invalidates `users` cache |
| `useDeleteUserMutation()` | — | `DELETE /api/admin/users/:id` | Deletes a user; invalidates `users` cache |

---

## 10. Custom Business Hooks

### 10.1 `useInitializeAuth()` (`src/hooks/useInitializeAuth.ts`)

Called once in `Providers.tsx`. Fetches `authClient.getSession()` + `/api/auth/role` on mount and populates `useAuthStore`.

### 10.2 `useCheckoutForm()` (`src/hooks/useCheckoutForm.ts`)

**State**: email, firstName, lastName, address, city, zipCode, fieldErrors, touched, loading, error

**Features**:
- Per-field validation + blur validation via `validateField`/`validateAll`
- Pre-fills email and name from auth store
- `handlePlaceOrder`: validates → POST `/api/checkout/session` → stores checkout data in `sessionStorage` → opens LS overlay (or fallback redirect)
- LS overlay event handler: clears cart + invalidates `['orders']` query on `Checkout.Success`

**Returns**: `{ email, setEmail, firstName, setFirstName, ..., loading, items, handlePlaceOrder, error, fieldErrors, handleBlur, touched }`

### 10.3 `useProductFilter(options?)` (`src/hooks/useProductFilter.ts`)

**URL-synced**: Reads/writes `page`, `sortBy`, `search` from URL search params via `useSearchParams`/`useRouter`

**State**: activeCategory, searchQuery (local input), pagination

**Features**:
- `handleCategoryChange(category)`: navigates to `/products/category/[slug]` or `/products`
- `applyFilters(category, sortBy)`: single navigation (avoids double push)
- `handlePageChange(n)`: sets `page` param
- `handleSearchSubmit` / `handleClearSearch`: sets/clears `search` param, resets page
- Uses `usePaginatedProductsQuery` internally

**Returns**: `{ activeCategory, handleCategoryChange, sortBy, applyFilters, searchQuery, handleSearchSubmit, handleClearSearch, filtered, isLoading, total, totalPages, currentPage, onPageChange, categories }`

### 10.4 `useProductForm(onSuccess)` (`src/hooks/useProductForm.ts`)

**State**: All form fields (id, name, slug, category, price, badge, altText, span, aspectRatio, description, details[], sizes[], images)

**Features**:
- InsForge storage upload (`product-media` bucket) via `useInsforgeClient()`
- Auto-slug from name (when creating)
- Change detection via JSON snapshot comparison
- `resetForm(product?)` — populate for editing or clear for new
- Detail bullets add/remove, size+stock add (dedupes by uppercase)

**Returns**: `{ formId, setFormId, ..., mainImageUrl, galleryUrls, uploading, saving, isReady, hasChanges, resetForm, handleUpload, handleSave, handleAddDetail, handleAddSize }`

### 10.5 `useAdminDashboard()` (`src/hooks/useAdminDashboard.ts`)

Simple hook: wraps `useAdminDashboardQuery()` to fetch and return dashboard metrics and recent orders.

### 10.6 Additional Admin Hooks

| Hook | Purpose |
|---|---|
| `useOrdersManagement()` | Manages state filters, search parameters, status mutations, and page queries for admin orders list |
| `useUsersManagement()` | Manages state filters, sorting, verification/role mutations, and details queries for admin users list |
| `useCheckoutSuccess()` | Success page: clears cart on mount, reads `sessionStorage('ls_checkout_data')`, polls `/api/orders?lsOrderId=` for order number (up to 10× at 1.5s intervals). Returns `{ orderData, isLoaded, user }` |

---

## 11. Auth System

### 11.1 Better Auth Configuration (`src/lib/auth.ts`)

- **Database**: Separate `Pool` scoped to `better_auth` schema via `SET search_path TO better_auth, public`
- **Auth methods**: `emailAndPassword` with email verification required
- **Rate limiting**: DB-backed storage, custom rules per endpoint (5/min for sign-in/sign-up, 3/min for reset/verification emails)
- **Session**: 7-day expiry, 1-day update age, cookie cache 5min
- **Email**: Sends via Nodemailer/Brevo for password reset and verification
- **CSRF**: Enabled
- **Secure cookies**: Production only
- **Trusted origins**: From `NEXT_PUBLIC_APP_URL`

### 11.2 Auth Client (`src/lib/auth-client.ts`)

Browser client: `createAuthClient({ baseURL: NEXT_PUBLIC_BETTER_AUTH_URL })`.
Exports: `signIn`, `signUp`, `signOut`, `useSession`.

### 11.3 Server-Side Guards (`src/utils/admin.ts`)

```ts
// Role level hierarchy: user=0, admin=10
ROLE_LEVELS = { user: 0, admin: 10 };

async function requireRole(minLevel = 10): Promise<{ user, role, error? }>
async function requireAdmin(): Promise<{ user, error? }>
```

Flow: `auth.api.getSession()` → query `better_auth."user".role` → check level → return user or error response.

### 11.4 Error Mapping (`mapBetterAuthError`)

Maps Better Auth error codes/messages to human-readable strings:
- `email_not_verified` / 403 → "Please verify your email before signing in."
- `user_not_found` → "No account found with this email address."
- `invalid_password` → "Incorrect password."
- `invalid_token` → "This link is invalid or has expired."
- `weak_password` → "Password must be at least 8 characters."
- `rate_limit` → "Too many attempts. Please wait..."
- Duplicate email → "An account with this email already exists."
- Expired reset → "This password reset link has expired."

### 11.5 Middleware Route Protection (`src/proxy.ts`)

**Note**: File is named `proxy.ts` not `middleware.ts`. Export is `proxy` not `middleware`. May need renaming for active protection.

Protects `/profile/*` and `/admin/*`. Redirects unauthenticated users to `/login?redirect=pathname`. Fetches session via `BETTER_AUTH_URL/api/auth/get-session`.

---

## 12. Payment Flow (Lemon Squeezy)

### 12.1 Complete Checkout Flow

```
User fills checkout form
  ↓
POST /api/checkout/session
  ├── Validate input (quantities, merge duplicates)
  ├── Fetch authentic prices from DB
  ├── BEGIN transaction
  │   ├── FOR EACH item (sorted by productId):
  │   │   ├── SELECT stock FROM product_sizes ... FOR UPDATE
  │   │   ├── SELECT COALESCE(SUM(quantity),0) FROM product_reservations WHERE expires_at > NOW()
  │   │   ├── available = stock - reserved; CHECK qty <= available
  │   │   └── INSERT product_reservations (35-minute TTL)
  │   └── COMMIT
  ├── Calculate pricing (free ship >$500, 8% tax)
  ├── POST Lemon Squeezy /v1/checkouts (custom_price, custom_data, redirect_url)
  │   └── Returns { checkoutUrl, checkoutId }
  ├── On LS API failure: DELETE product_reservations (rollback)
  └── Response: { checkoutUrl, checkoutId }
  ↓
Browser opens LS overlay modal (or fallback redirect)
  ↓
User completes payment on Lemon Squeezy Checkout
  ↓
LS redirects to /checkout/success?order_id=[order_id]
  ↓
LS sends webhook POST → /api/webhooks/lemonsqueezy
  ├── HMAC-SHA256 verification (timing-safe)
  ├── Only processes order_created events
  ├── BEGIN transaction
  │   ├── INSERT processed_webhooks (idempotency) → ON CONFLICT DO NOTHING → skip
  │   ├── FOR EACH cart item:
  │   │   ├── Verify product still exists, lock size FOR UPDATE
  │   │   ├── CHECK stock >= quantity
  │   │   └── UPDATE product_sizes SET stock = stock - quantity
  │   ├── DELETE product_reservations (reservation consumed)
  │   ├── INSERT INTO orders (status='pending', is_paid=true)
  │   └── UPDATE better_auth."user" SET ls_customer_id (if new)
  │   └── COMMIT
  └── Fire-and-forget: sendEmail(orderConfirmation)
```

### 12.2 Reservation Lifecycle

| Stage | Action | Duration |
|---|---|---|
| Created | `INSERT product_reservations` | 35 min (expires_at) |
| Consumed | Webhook `order_created` → `DELETE` after stock deduction | ~seconds |
| Expired | Cleaned up by subsequent stock check queries (ignored if `expires_at < NOW()`) | 35 min |
| Cancelled | `DELETE` on checkout session creation failure | Immediate |

### 12.3 Idempotency

`processed_webhooks(ls_event_id)` with `ON CONFLICT DO NOTHING` prevents double processing of the same LS event.

### 12.4 Pricing Rules

- **Shipping**: Free over $500 (or subtotal = 0)
- **Tax**: 8% of subtotal
- **Total**: subtotal + shipping + tax

---

## 13. InsForge Integration

### 13.1 Storage Buckets

| Bucket | Path Prefix | Used By |
|---|---|---|
| `product-media` | `/images/products/` | Product images/gallery, seed scripts |
| `lookbook-media` | `/images/lookbook/` | Lookbook slider |
| `editorial-media` | `/images/editorial/` | Brand story page |
| `hero-media` | `/images/hero/` | Homepage hero slides |
| `category-media` | `/images/categories/` | Category listing images |

### 13.2 Dual Client Architecture

#### Browser Client (`src/lib/insforge.ts`)
- Hook: `useInsforgeClient(): { client: InsForgeClient; isReady: boolean }`
- JWT bridge: fetches `/api/insforge-token` on mount + every 50 minutes
- Token signed with `INSFORGE_JWT_SECRET`, sub = user.id, role = authenticated
- Uses `setAccessToken` or `getHttpClient().setAuthToken()` depending on SDK version
- `isReady` = false until first successful token fetch

#### Server Client (`src/lib/insforge.server.ts`)
- Factory: `createInsforgeClient(): Promise<InsForgeClient | null>`
- Signs JWT server-side using `jsonwebtoken` with `INSFORGE_JWT_SECRET`
- Returns null if no session

#### Token Endpoint (`src/app/api/insforge-token/route.ts`)
- `GET /api/insforge-token` — requires Better Auth session
- Signs JWT: `{ sub, role: 'authenticated', aud: 'insforge-api' }`, HS256, 1h expiry
- No cache (`Cache-Control: no-store`)

### 13.3 Storage URL Utilities (`src/utils/insforge.ts`)

```ts
// Maps local paths to full InsForge Storage URLs
getStorageUrl(localPath: string): string
  // /images/products/foo.webp → https://*.insforge.app/api/storage/buckets/product-media/objects/foo.webp

// Extracts object key from Storage URLs or local paths
getStorageKeyFromUrl(url: string): string | null
```

---

## 14. Email System

### 14.1 SMTP Transport (`src/lib/email.ts`)

- **Provider**: Brevo (Sendinblue)
- **Library**: Nodemailer
- **Lazy init**: Transporter singleton created on first use
- **Graceful skip**: Returns `{ sent: false, error }` if env vars not configured
- **Config vars**: `BREVO_SMTP_HOST`, `BREVO_SMTP_PORT`, `BREVO_SMTP_USER`, `BREVO_SMTP_PASS`, `BREVO_FROM_EMAIL`, `BREVO_FROM_NAME`

### 14.2 Email Templates (`src/lib/email-templates.ts`)

| Template | Type | Used By |
|---|---|---|
| `orderConfirmationHtml(data)` | HTML (styled table) | Webhook order processing |
| `orderConfirmationText(data)` | Plain text fallback | Webhook order processing |

**`OrderConfirmationData` shape**: orderNumber, customerName, items[], subtotal, shipping, tax, total, shippingAddress

### 14.3 Email Triggers

| Event | Template | Sender |
|---|---|---|
| Password reset | Inline HTML in `auth.ts` | Better Auth callback |
| Email verification | Inline HTML in `auth.ts` | Better Auth callback |
| Sign-up attempt alert | Plain text | Better Auth `onExistingUserSignUp` |
| Order confirmation | `orderConfirmationHtml` + `orderConfirmationText` | Webhook handler |

---

## 15. Environment Variables

### 15.1 Database

| Variable | Source |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string with `sslmode=require` |

### 15.2 Authentication (Better Auth)

| Variable | Purpose |
|---|---|
| `BETTER_AUTH_SECRET` | Session signing secret (generate: `openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | Server base URL (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Client base URL (same as above) |
| `ADMIN_EMAILS` | Comma-separated legacy admin email list |

### 15.3 InsForge (BaaS)

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_INSFORGE_URL` | InsForge project API base URL |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | Public anon key (safe in client) |
| `INSFORGE_API_KEY` | Admin service key (server only) |
| `INSFORGE_JWT_SECRET` | JWT signing secret for bridge tokens |

### 15.4 Email (Brevo SMTP)

| Variable | Purpose |
|---|---|
| `BREVO_SMTP_HOST` | `smtp-relay.brevo.com` |
| `BREVO_SMTP_PORT` | `587` |
| `BREVO_SMTP_USER` | SMTP login email |
| `BREVO_SMTP_PASS` | SMTP key |
| `BREVO_FROM_EMAIL` | Sender address (e.g. `noreply@yourdomain.com`) |
| `BREVO_FROM_NAME` | Sender name |

### 15.5 Payments (Lemon Squeezy)

| Variable | Purpose |
|---|---|
| `LEMON_SQUEEZY_API_KEY` | LS REST API key (sandbox or production) |
| `LEMON_SQUEEZY_STORE_ID` | LS store ID |
| `LEMON_SQUEEZY_WEBHOOK_SECRET` | Webhook HMAC signing secret |
| `NEXT_PUBLIC_LS_ORDER_VARIANT_ID` | Product variant ID for LS checkout |

### 15.6 App

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_APP_URL` | Canonical app URL (used in redirects, sitemap, CORS) |

---

## 16. Scripts Reference

| Script | Language | Purpose | When to Run |
|---|---|---|---|
| `scripts/create-tables.sql` | SQL | Full DDL (categories, products, product_*, orders, reservations, lookbook, editorial, hero, indexes, RLS helper) | Auto by upload-and-seed |
| `scripts/setup-db.js` | JS | Initialize Better Auth schema (`npx @better-auth/cli` equivalent) | First-time setup |
| `scripts/upload-and-seed.mts` | TS | Deploy schema + upload media to InsForge Storage + seed all DB tables | First-time setup or full reset |
| `scripts/update-catalog.mts` | TS | Upsert products/media from `src/data/products.ts` | Adding/updating products (safe for production — uses `--catalog-only` flag) |
| `scripts/manage-user.ts` | TS | CLI user management (create, set role, delete) | Admin account setup |
| `scripts/optimize-images.mjs` | JS | Sharp-based WebP conversion of image assets | When adding new images |

### Update-Catalog Details

The `update-catalog.mts` script:
- Handles 5 InsForge Storage buckets (product, lookbook, editorial, hero, category)
- Upserts lookbook slides, editorial content, hero slides, categories, and products
- `--catalog-only` flag skips transactional tables (orders, processed_webhooks, product_reservations) and only updates catalog

---

## 17. Animation System

### 17.1 Transitions (`src/animations/transitions.ts`)

| Preset | Type | Use Case |
|---|---|---|
| `springSmooth` | spring 300/30 | Buttons, cards |
| `springBouncy` | spring 400/20 | Playful UI elements |
| `springStiff` | spring 500/35 | Subtle micro-interactions |
| `springGentle` | spring 180/22 | Soft reveals |
| `easeOutQuart` | cubic [0.25,0.46,0.45,0.94] | Smooth deceleration |
| `easeInOutCubic` | cubic [0.65,0,0.35,1] | Gentle fades |

### 17.2 Variants (`src/animations/variants.ts`)

| Variant | Type | Description |
|---|---|---|
| `fadeInUp` | Variants | Opacity 0→1, y 40→0 |
| `fadeIn` | Variants | Opacity 0→1 |
| `staggerContainer` | Variants | Staggers children (0.12s delay) |
| `slideInLeft` / `slideInRight` | Variants | x ±60→0 |
| `scaleIn` | Variants | Scale 0.88→1 |
| `cardCascade(index)` | Variants factory | Staggered cascade with rotation |
| `drawerSlide` | Variants | Cart drawer: x 100%→0 |
| `overlayMenu` | Variants | Full-screen menu: x 100%→0 |
| `menuItemVariant` | Variants | Menu items: x 40→0 |
| `navbarReveal` | Variants | Y -100→0 on page load |
| `cardEnter(index)` | Variants factory | Card grid entrance (alternating offset) |
| `cardExit` | Variants | Scale 0.85 + y 30 |
| `cardImageReveal` | Variants | Scale 1.08→1 |
| `testimonialSlide` | Variants | Direction-aware horizontal slide |
| `mentionFloat` | keyframes | Y float [0,-8,0] infinite |

---

## 18. Patterns & Conventions

### 18.1 Naming Rules

| Pattern | Example | Rule |
|---|---|---|
| Components | `ProductInfo.tsx` | PascalCase, matching export |
| Page containers | `ProductDetailClient.tsx` | `XxxClient.tsx` |
| Sub-page containers | `OrderSummaryContainer.tsx` | `XxxContainer.tsx` |
| Hooks | `useCheckoutForm.ts` | `useXxx.ts` |
| Stores | `useCartStore.ts` | `useXxxStore.ts` |

### 18.2 `"use client"` Rules

Start without it. Add when using:
- `useState`, `useEffect`, `useRef`, `useCallback`, `useMemo`
- `onClick`, `onSubmit`, or any event handlers
- Zustand store selectors
- Framer Motion `motion.*` components
- Custom hooks that use any of the above
- `useSearchParams`, `useRouter`, `usePathname` (Next.js navigation hooks)

### 18.3 Data Flow Rules

- **Pages** are server components. Never import stores or client hooks.
- **Containers** (`"use client"`) bridge server data to client interactivity.
- **Hooks** contain business logic only. Never import UI components.
- **Presentational components** are pure. No stores, no hooks (except UI-only hooks like `useBodyScrollLock`).
- **Stores** are singletons with Zustand. Use selectors (`useStore(s => s.field)`) for granular re-renders.

### 18.4 Database Access Pattern

All queries use raw SQL via the `pg` `Pool` singleton (`src/utils/db.ts`):

```ts
import { pool } from '@/utils/db';

// Parameterized queries with $1, $2 syntax
const result = await pool.query(
  'SELECT * FROM products WHERE category = $1 AND price > $2',
  [category, minPrice]
);
```

For nested data, use PostgreSQL subqueries with `json_agg`:

```ts
SELECT p.*,
  (SELECT COALESCE(json_agg(image_url ORDER BY id), '[]'::json)
   FROM product_images WHERE product_id = p.id) as images,
  (SELECT COALESCE(json_agg(size ORDER BY id), '[]'::json)
   FROM product_sizes WHERE product_id = p.id) as sizes
FROM products p
WHERE LOWER(p.slug) = LOWER($1)
```

### 18.5 Caching Strategy

- **Public product/catalog routes**: Next.js 16 `'use cache'` with 300s revalidate (`cacheLife`) and `products` tag (`cacheTag`)
- **Categories**: Next.js 16 `'use cache'` 300s, `categories` + `products` tags
- **Admin**: No caching (always fresh)
- **React Query**: 5-min stale, 10-min gc, no refetch on focus
- **Admin cache invalidation**: Cache tags revalidated on product mutations

### 18.6 Error Handling Pattern

API routes use try/catch with structured error responses:

```ts
try {
  // ... handler logic
} catch (error) {
  console.error("[route] Failed:", error);
  return NextResponse.json(
    { error: "Human-readable error message" },
    { status: 500 }
  );
}
```

---

## 19. Gotchas

### 19.1 Proxy / Middleware

`src/proxy.ts` is NOT standard Next.js middleware. It exports as `proxy`, not `middleware`. The file is named `proxy.ts` not `middleware.ts`. Route protection may not be active unless renamed to `middleware.ts` with the correct export.

### 19.2 Guest Checkout

`orders.user_id` is nullable — guest checkout is the default flow. The checkout form works without authentication.

### 19.3 URL-Synced Filtering

Product filters, sort, pagination, and search are synced to URL query strings for bookmarkability. The `useProductFilter` hook reads from `useSearchParams()` and writes via `router.push()`.

### 19.4 Dual InsForge Clients

- `src/lib/insforge.ts` — browser client with automatic JWT bridge
- `src/lib/insforge.server.ts` — server client with manual JWT signing
Use the correct one for your runtime context. The browser client has an `isReady` state.

### 19.5 Direct SQL, No ORM

All database queries use raw `pg` with parameterized `$1, $2` syntax. There is no Prisma/Drizzle/Drizzle layer.

### 19.6 `json_agg` for Nested Data

Product queries consolidate related tables (images, sizes, details) into a single DB roundtrip via PostgreSQL subqueries. The `/api/products/:slug` endpoint uses this pattern.

### 19.7 `useProductDetailsQuery` initialData

The `useProductDetailsQuery` uses `initialData` from cached product list queries (`['products']`) to enable instant page rendering while fetching fresh data in the background.

### 19.8 Email Configuration

If Brevo SMTP is not configured, the `sendEmail` function silently returns `{ sent: false, error }`. Better Auth callbacks will throw if email sending fails (they expect `{ sent: true }`).

### 19.9 Webhook HMAC Verification

The webhook uses `crypto.timingSafeEqual` for signature verification, preventing timing attacks. The raw body is read once via `req.text()` before JSON parsing.

### 19.10 Stock Reservation and Deadlock Prevention

Cart items are sorted by `internalProductId` before `SELECT ... FOR UPDATE` to prevent database deadlocks. Each item's reservation also checks for existing active reservations (not yet expired).

---

## 20. Testing

| Tool | Config |
|---|---|
| **Runner** | Vitest 4.1.9 |
| **Config** | `vitest.config.ts` |
| **Location** | `__tests__/api/` |
| **Tests** | 4 test files |

### Test Files

| File | Tests |
|---|---|
| `__tests__/api/categories.test.ts` | Categories endpoint (success + DB error) |
| `__tests__/api/checkout.test.ts` | Checkout session creation |
| `__tests__/api/webhook.test.ts` | Lemon Squeezy webhook processing |
| `__tests__/api/admin-auth.test.ts` | Admin role authentication |

### Run Commands

```bash
npm test          # vitest run
npm run test:watch  # vitest watch mode
```

---

## 21. Related Documentation

| File | Covers |
|---|---|
| [README.md](README.md) | Project overview, features, quick start, code examples |
| [docs/CODING_STANDARDS.md](docs/CODING_STANDARDS.md) | 4-layer architecture rules, `"use client"` conventions, examples |
| [docs/BACKEND_DEPLOYMENT.md](docs/BACKEND_DEPLOYMENT.md) | InsForge setup, env vars, DB init, webhook config |
| [AGENTS.md](AGENTS.md) | InsForge skill references and credential handling |
