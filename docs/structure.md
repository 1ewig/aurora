# Aurora — Codebase Structure


## 1. Project Overview

| Attribute | Value |
|---|---|
| **Runtime** | Bun 1.0+ |
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


## 2. Directory Map

```
aurora/
├── .env.example / .env.local             # Local env templates & secrets
├── .insforge/project.json                # InsForge project config
├── AGENTS.md / README.md                 # Agent skills & setup instructions
├── next.config.ts / tsconfig.json        # Next.js & TypeScript strict configs
├── vitest.config.ts                      # Vitest test runner configuration
├── docs/                                 # Standards, deployment & performance guides
├── migrations/                           # Better Auth schema migrations
├── scripts/                              # CLI maintenance & DB seed tools (7 files)
├── __tests__/                            # Integration, store, & utility tests (21 files)
└── src/                                  # Core application source (~208 files)
    ├── proxy.ts                          # Edge middleware route protection
    ├── animations/                       # Framer Motion presets & variants
    ├── app/                              # Next.js App Router (pages & API)
    ├── components/                       # React UI component library
    ├── data/                             # Static catalog & editorial definitions
    ├── hooks/                            # Custom React hooks & React Query hooks
    ├── lib/                              # External client & SDK initializations
    ├── stores/                           # Global Zustand stores
    ├── types/                            # Global TypeScript declarations
    └── utils/                            # Database, auth, & helper utilities
```

### 2.1 Component Library Layout (`src/components/`)

| Directory | Components | Description |
|---|---|---|
| `admin/` | 26 files | Activity logs, metrics dashboard, inventory CRUD, orders, user management |
| `auth/` | 10 files | AuthInitializer, AuthSkeleton, Login, Register, ResetPassword, Verify forms |
| `checkout/` | 7 files | Checkout form, summary, step navigation, confirmation triggers |
| `landing/` | 11 files | Hero, collection grids, lookbook slider, story preview, marquee bar, newsletter |
| `layout/` | 4 files | Sticky Navbar, NavbarProfileMenu, MobileMenu, Footer |
| `product/` | 16 files | Detail view (gallery, size selector, tabs) & Listing views (grid, filters) |
| `profile/` | 9 files | User workspace, profile form, order history views & skeletons |
| `story/` | 5 files | Brand history, editorial layout, and material composition sections |
| `ui/` | 13 files | Primitives (Button, ProductCard, CartDrawer, Modals, Pagination, Badges) |

### 2.3 `src/app/` — App Router File Tree

```
src/app/
├── globals.css                # Tailwind v4 @import + custom @theme tokens
├── icon.svg                   # Favicon
├── layout.tsx                 # Root layout (fonts, metadata, viewport, providers)
├── providers.tsx              # Client: React Query (staleTime=5min, gcTime=10min) + auth init
├── robots.ts                  # Dynamic robots.txt
├── sitemap.ts                 # Dynamic sitemap.xml
│
├── (admin)/admin/
│   ├── layout.tsx + loading.tsx + AdminLayoutClient.tsx
│   └── page.tsx, activity/page.tsx, dashboard/page.tsx,
│       inventory/{loading,page}.tsx, orders/{loading,page}.tsx, users/{loading,page}.tsx
│
├── (auth)/
│   ├── login/{loading,page}.tsx
│   ├── register/{loading,page}.tsx
│   ├── reset-password/{loading,page}.tsx
│   └── verify/{loading,page}.tsx
│
├── (store)/
│   ├── layout.tsx, not-found.tsx, page.tsx
│   ├── checkout/{loading,page}.tsx + success/page.tsx
│   ├── products/{page,loading}.tsx + [slug]/{page,loading}.tsx + category/[category]/{page,loading}.tsx
│   └── story/{loading,page}.tsx
│
├── (user)/
│   ├── layout.tsx + UserLayoutClient.tsx
│   └── profile/{layout,page,loading}.tsx + ProfileLayoutClient.tsx + orders/{page,loading}.tsx
│
└── api/
    ├── admin/{audit,dashboard,orders,products,users}/
    ├── auth/{[...all],role}/
    ├── categories/, checkout/session/, editorial/, insforge-token/
    ├── landing/, newsletter/, orders/, products/, webhooks/lemonsqueezy/
```

### 2.4 `src/hooks/` — Custom React Hooks

| File | Type | Purpose |
|---|---|---|
| `queries/index.ts` | React Query | Storefront queries (products, categories, orders, lookbook, editorial) |
| `queries/admin.ts` | React Query | Admin queries + mutations (dashboard, products, orders, users) |
| `useInitializeAuth.ts` | Init | Fetches session + role on mount, populates `useAuthStore` |
| `useCheckoutForm.ts` | Business | Checkout form state, field validation, LS checkout flow |
| `useCheckoutSuccess.ts` | Business | Clears cart, polls `GET /api/orders?lsOrderId=` (10× at 1.5s) |
| `useNewsletterSubmit.ts` | Business | Newsletter signup (static placeholder) |
| `useProductFilter.ts` | Business | URL-synced product listing filters + pagination |
| `useProductForm.ts` | Business | Admin product form state, InsForge upload, CRUD |
| `useAdminDashboard.ts` | Business | Wraps `useAdminDashboardQuery` for metrics |
| `useOrdersManagement.ts` | Business | Admin order filters + status mutations |
| `useUsersManagement.ts` | Business | Admin user filters, role/verify toggles |
| `useUserSessions.ts` | Business | Multi-session management |
| `ui/useBodyScrollLock.ts` | UI | Scroll lock for modal/drawer open states |
| `ui/useCarousel.ts` | UI | Embla Carousel wrapper |
| `ui/useNavbarScroll.ts` | UI | Show/hide navbar on scroll direction |

### 2.5 `src/lib/` — Third-Party Integrations

| File | Purpose | Runtime |
|---|---|---|
| `auth.ts` | Better Auth server instance config | Server |
| `auth-client.ts` | Better Auth browser client (`createAuthClient`) | Client |
| `email.ts` | Nodemailer/Brevo SMTP transport (lazy singleton) | Server |
| `email-templates.ts` | HTML/text order confirmation templates | Server |
| `insforge.ts` | InsForge browser client (auto JWT bridge each 50min) | Client |
| `insforge.server.ts` | InsForge server client (manual JWT signing) | Server |
| `lemonsqueezy.ts` | LS REST API v1/checkouts client | Server |

### 2.6 `src/stores/` — Zustand State Stores

| Store | Persistence | Key |
|---|---|---|
| `useCartStore.ts` | `localStorage` | `aurora-cart` |
| `useAuthStore.ts` | None (session) | — |
| `useProductStore.ts` | None (transient) | — |
| `useAdminStore.ts` | None (types only) | — |

### 2.7 `src/data/` — Static Content Definitions

| File | Content |
|---|---|
| `products.ts` | `Product` type + `heroProducts`, `featuredProducts`, `allProducts` arrays |
| `categories.ts` | `Category` type (union), `CategoryData` interface, `categoryDataList` |
| `editorial.ts` | Editorial content for story page |
| `lookbook.ts` | Lookbook slide data |
| `navigation.ts` | Navigation link definitions |
| `testimonials.ts` | Testimonial quotes for landing |

### 2.8 `src/utils/` — Utility Functions

| File | Purpose |
|---|---|
| `admin.ts` | `requireAdmin()`, `requireRole()` — server-side RBAC |
| `auth.ts` | `normalizeProfile()`, `isAdmin()` |
| `cn.ts` | `cn()` — clsx + tailwind-merge |
| `db.ts` | `pool` — PostgreSQL `Pool` singleton |
| `env.ts` | Environment variable validation helpers |
| `formatCurrency.ts` | Intl.NumberFormat USD formatting |
| `pricing.ts` | `calculateOrderPricing()` — shipping/tax/total |
| `sanitize.ts` | Input sanitization utilities |
| `validation.ts` | `validateField()`, `validateAll()` — checkout form |
| `insforge.ts` | `getStorageUrl()`, `getStorageKeyFromUrl()` — path↔URL |
| `insforge/client.ts` | InsForge client utility wrappers |
| `insforge/server.ts` | InsForge server utility wrappers |

### 2.9 `__tests__/` — Test Files

```
__tests__/
├── api/
│   ├── admin-authorization.test.ts / admin-orders / admin-products / admin-users
│   ├── auth-role / categories / checkout-session / landing
│   ├── newsletter / orders / stock-locking / webhook-idempotency
├── stores/
│   ├── auth.test.ts / cart.test.ts
└── utils/
    ├── cn / env / formatCurrency / pricing / sanitize / validation + mocks
```

## 3. Architecture: 4-Layer Unidirectional Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: Pages (src/app/)                                  │
│  Server Components — resolve params, export SEO metadata,   │
│  render container components                                │
│  RULES: No "use client", no store/hook imports              │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: Container/Bridge (src/components/*/)              │
│  "use client" — read stores, call hooks, assemble props     │
│  Named *Client.tsx or *Container.tsx                        │
├─────────────────────────────────────────────────────────────┤
│  Layer 3: Hooks (src/hooks/) + Stores (src/stores/)         │
│  Business logic, queries, form state, global state          │
│  Never import UI components                                 │
├─────────────────────────────────────────────────────────────┤
│  Layer 4: Presentational Components (src/components/*/)     │
│  Pure JSX — receive everything via props                    │
│  Zero store/hook imports (except UI-only hooks)             │
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
   → queries/index.ts: useProductDetailsQuery(slug)
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

### `"use client"` Rules

Start without it. Add when using:
- `useState`, `useEffect`, `useRef`, `useCallback`, `useMemo`
- `onClick`, `onSubmit`, event handlers
- Zustand store selectors
- Framer Motion `motion.*` components
- Custom hooks that use any of the above
- `useSearchParams`, `useRouter`, `usePathname`


## 4. Routing Map

### 4.1 Storefront & Public Routes

| URL Path | Server Component File | Metadata Title | Key Container Component |
|---|---|---|---|
| `/` | `(store)/page.tsx` | SS 2026 Collection | `<LandingClient />` |
| `/products` | `(store)/products/page.tsx` | Dynamic Catalog | `<ProductListingClient />` |
| `/products/[slug]` | `(store)/products/[slug]/page.tsx` | Dynamic Product Name | `<ProductDetailClient />` |
| `/products/category/[category]` | `(store)/products/category/.../page.tsx` | Category Name | `<ProductListingClient />` |
| `/story` | `(store)/story/page.tsx` | Brand Story | `<StoryPageClient />` |
| `/checkout` | `(store)/checkout/page.tsx` | Checkout | `<CheckoutClient />` |
| `/checkout/success` | `(store)/checkout/success/page.tsx` | Order Confirmed | `<CheckoutSuccessClient />` |

### 4.2 Auth, User, & Admin Routes (noindex)

| Route Group | Path | Authorization | Purpose / Container |
|---|---|---|---|
| `(auth)` | `/login`, `/register`, `/reset-password`, `/verify` | Public | Auth flow forms |
| `(user)` | `/profile`, `/profile/orders` | Authenticated | `<ProfileClient />`, `<OrdersClient />` |
| `(admin)` | `/admin`, `/admin/dashboard` | Admin Role | Metrics dashboard |
| `(admin)` | `/admin/activity` | Admin Role | System activity logs |
| `(admin)` | `/admin/inventory` | Admin Role | `<InventoryClient />` catalog management |
| `(admin)` | `/admin/orders` | Admin Role | `<OrdersClient />` order management |
| `(admin)` | `/admin/users` | Admin Role | `<UsersClient />` user CRUD & sessions |

### 4.3 API Endpoints Overview

| Category | Endpoint Route | Allowed Methods | Auth Scope | Purpose |
|---|---|---|---|---|
| **Public Catalog** | `/api/products` | GET | None | List, filter, paginate, search catalog |
| **Public Catalog** | `/api/products/[slug]` | GET | None | Single product detail via `json_agg` |
| **Public Catalog** | `/api/categories` | GET | None | Category metadata listing |
| **Public Catalog** | `/api/editorial`, `/api/landing` | GET | None | Landing page & brand story content |
| **Public Catalog** | `/api/newsletter` | POST | None | Newsletter signup & welcome email |
| **User Orders** | `/api/orders` | GET | Session | Fetch user-owned order history |
| **Auth Engine** | `/api/auth/[...all]` | ALL | None / Session | Better Auth internal handler |
| **Auth Engine** | `/api/auth/role` | GET | Session | Returns current user RBAC role |
| **Checkout** | `/api/checkout/session` | POST | Optional | Create Lemon Squeezy session + reserve stock |
| **Checkout** | `/api/webhooks/lemonsqueezy` | POST | LS HMAC | Idempotent order processing webhook |
| **Admin Operations**| `/api/admin/dashboard` | GET | Admin Role | Metric summaries & recent orders |
| **Admin Operations**| `/api/admin/products` | GET, POST | Admin Role | Catalog creation & fetch |
| **Admin Operations**| `/api/admin/products/[id]` | PUT, DELETE | Admin Role | Update or remove product + cleanup storage |
| **Admin Operations**| `/api/admin/orders` | GET | Admin Role | Global order management list |
| **Admin Operations**| `/api/admin/orders/[id]` | PATCH | Admin Role | Status transition updates |
| **Admin Operations**| `/api/admin/users` | GET | Admin Role | Paginated user accounts list |
| **Admin Operations**| `/api/admin/users/[id]` | GET, PATCH, DELETE | Admin Role | User management & session inspector |
| **Infrastructure** | `/api/insforge-token` | GET | Session | Issue short-lived InsForge JWT bridge token |

### Loading States

Routes with `loading.tsx`: `checkout/`, `story/`, `products/`, `products/[slug]/`, `products/category/[category]/`, `profile/orders/`

### Admin CRUD Request Bodies

| Endpoint | Body Shape |
|---|---|
| `POST /api/admin/products` | `{ id, slug, name, category, price, badge, image, altText, span, aspectRatio, description, images: string[], sizes: Array<{size, stock}>, details: string[] }` |
| `PUT /api/admin/products/[id]` | Same shape. Replaces images/sizes/details in a transaction, cleans up old storage objects |
| `PATCH /api/admin/orders/[id]` | `{ status: "pending" \| "confirmed" \| "shipped" \| "delivered" \| "cancelled" }` |
| `PATCH /api/admin/users/[id]` | `{ name?, emailVerified?: boolean, role?: "user" \| "admin" }` |


## 5. API Route Handler Reference

### 5.1 `GET /api/products`
- **Params**: `category`, `page`, `limit` (default 12), `search` (`ILIKE` on name/description/keywords), `sortBy`
- **Caching**: `'use cache'` (300s TTL, `cacheTag: 'products'`)
- **Returns**: `{ products: Product[], total: number }` (if paginated) or `Product[]`

### 5.2 `GET /api/products/[slug]`
- **Behavior**: Single SQL query with PostgreSQL `json_agg` subqueries to assemble images, sizes, and details
- **Caching**: `'use cache'` (300s TTL, `cacheTag: 'products'`)
- **Returns**: `{ id, slug, name, category, price, badge, image, images, altText, span, aspectRatio, description, details, sizes }`

### 5.3 `POST /api/checkout/session`
- **Request**: `{ variantId?, cartItems: [{ internalProductId, quantity, size }], shippingAddress }`
- **Execution**:
  1. Validates inputs & merges duplicate items (same product + size).
  2. Fetches authentic prices from PostgreSQL.
  3. Begins PG transaction: locks `product_sizes` `FOR UPDATE` (sorted by ID to prevent deadlocks), checks stock vs active reservations, inserts a 35-minute `product_reservations` holding record.
  4. Computes pricing (free shipping > $500, 8% tax) and calls Lemon Squeezy API.
  5. Rolls back reservation on LS API failure.
- **Returns**: `{ checkoutUrl: string, checkoutId: string }`

### 5.4 `POST /api/webhooks/lemonsqueezy`
- **Verification**: `crypto.timingSafeEqual` HMAC-SHA256 signature validation
- **Execution**:
  1. Processes `order_created` events inside a single transaction.
  2. Inserts event ID into `processed_webhooks` (`ON CONFLICT DO NOTHING`) for strict idempotency.
  3. Deducts stock from `product_sizes` and deletes active `product_reservations`.
  4. Inserts `orders` record (`is_paid = true`).
  5. Asynchronously sends HTML order confirmation email via Nodemailer/Brevo.

### 5.5 `GET /api/admin/dashboard`
- **Security**: Requires `requireAdmin()` check
- **Execution**: Executes 5 parallel SQL queries (total sales/orders, pending count, shipped count, low stock count, 5 recent orders)
- **Returns**: `{ metrics: DashboardMetrics, recentOrders: RecentOrder[] }`

### 5.6 Admin CRUD Endpoints
- **`POST/PUT /api/admin/products`**: Inserts or updates base product, replaces image/size/detail child records in a transaction, and deletes replaced files from InsForge storage.
- **`DELETE /api/admin/products/[id]`**: Cascades deletion of child DB records and removes associated storage objects.
- **`PATCH /api/admin/orders/[id]`**: Validates status string (`pending`, `confirmed`, `shipped`, `delivered`, `cancelled`) and updates order status.
- **`PATCH /api/admin/users/[id]`**: Updates user details (`name`, `emailVerified`, `role`) in `better_auth."user"`.

### 5.7 `GET /api/categories`
- **Behavior**: Returns all categories ordered by name.
- **Caching**: `'use cache'` (300s, tags: `categories,products`)
- **Returns**: `CategoryMetadata[]`

### 5.8 `GET /api/orders`
- **Params**: `limit` (max 100, default 50), `offset`, `lsOrderId` (optional—bypasses auth)
- **Auth**: Better Auth session required (except `lsOrderId` lookup which is unauthenticated)
- **Returns**: `{ orders: Order[], total: number }` (normal) or `{ orderNumber: string }` (`lsOrderId` lookup)

### 5.9 `GET /api/auth/role`
- **Returns**: `{ isAdmin: boolean, role: string }`
- Reads from `better_auth."user"` table, falls back to `ADMIN_EMAILS` env whitelist.

### 5.10 `GET /api/landing` / `GET /api/editorial`
- `GET /api/landing`: Returns landing page data (featured products, lookbook slides, testimonials)
- `GET /api/editorial`: Returns editorial content blocks for brand story page. Cached `'use cache'` (600s, tag: `editorial`)


## 6. Database Schema

### 6.1 Schema Reference Table

| Table | PK | Columns | Description |
|---|---|---|---|
| `categories` | `slug VARCHAR(50)` | `name VARCHAR(100) UNIQUE`, `image TEXT`, `description TEXT` | Product taxonomy |
| `products` | `id VARCHAR(50)` | `slug VARCHAR(100) UNIQUE`, `category FK(name)`, `price NUMERIC(10,2) CHECK(>=0)`, `badge`, `image`, `alt_text`, `span`, `aspect_ratio`, `description TEXT` | Base catalog products |
| `product_images` | `id SERIAL` | `product_id FK(id) CASCADE`, `image_url TEXT` | Gallery |
| `product_sizes` | `id SERIAL` | `product_id FK(id) CASCADE`, `size VARCHAR(50)`, `stock INT DEFAULT 10` | Stock per size |
| `product_details` | `id SERIAL` | `product_id FK(id) CASCADE`, `detail TEXT` | Bullet points |
| `product_keywords` | `id SERIAL` | `product_id FK(id) CASCADE`, `keyword VARCHAR(100) UNIQUE(product_id,keyword)` | Search index |
| `orders` | `id UUID DEFAULT gen_random_uuid()` | `user_id TEXT nullable`, `order_number VARCHAR(50) UNIQUE`, `items JSONB`, `subtotal/shipping/tax/total NUMERIC(10,2)`, `shipping_address JSONB`, `status VARCHAR(20)`, `is_paid BOOLEAN`, `ls_order_id TEXT UNIQUE` | Guest-checkout orders |
| `processed_webhooks` | `id SERIAL` | `ls_event_id TEXT UNIQUE`, `processed_at` | Idempotency |
| `product_reservations` | `id UUID` | `product_id FK(id) CASCADE`, `size`, `quantity INT`, `expires_at TIMESTAMPTZ` | 35-min stock holds |
| `lookbook_slides` | `id SERIAL` | `slide_number INT UNIQUE`, `original_image`, `image_url`, `alt_text`, `tag`, `title`, `link` | Home slider |
| `editorial_content` | `id VARCHAR(50)` | `original_image`, `image_url`, `alt_text`, `title`, `description` | Story page |
| `newsletter_subscriptions`| `id SERIAL` | `email VARCHAR(255) UNIQUE`, `status VARCHAR(20) DEFAULT 'active'` | Subscribers |

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

### 6.3 Security & Rules
- **RLS**: All tables have public read (`SELECT true`) and admin write via `public.requesting_user_id() IN (SELECT id FROM better_auth."user" WHERE role = 'admin')`. Webhooks/reservations bypass RLS via backend service role.
- **Order Statuses**: `pending` → `confirmed` → `shipped` → `delivered` (`cancelled` from any state).
- **Better Auth (`better_auth`)**: `user` (id, email, name, emailVerified, image, role, ls_customer_id), `session`, `account`, `verification`, `rateLimit`.


## 7. Type System Reference

### 7.1 Static Catalog Types (`src/data/`)

| Type Name | Defined In | Primary Fields / Attributes |
|---|---|---|
| `Product` | `src/data/products.ts` | `id`, `slug`, `name`, `category`, `price`, `badge?`, `image`, `images?`, `altText`, `span?`, `aspectRatio?`, `description?`, `details?`, `sizes?`, `keywords?` |
| `Category` | `src/data/products.ts` | `"Outerwear" \| "Knitwear" \| "Trousers" \| "Dresses" \| "Accessories"` |
| `CategoryData` | `src/data/categories.ts` | `slug`, `name`, `image`, `description` |

### 7.2 Core Application Types

| Type Name | Defined In | Primary Fields / Attributes |
|---|---|---|
| `CartItem` | `src/stores/useCartStore.ts` | `id`, `slug`, `name`, `price`, `size`, `quantity`, `image`, `category` |
| `User` | `src/stores/useAuthStore.ts` | `id`, `email`, `name?`, `emailVerified?`, `image?`, `isAdmin?`, `role?` |
| `Profile` | `src/stores/useAuthStore.ts` | `displayName` |
| `FieldErrors` | `src/utils/validation.ts` | `email?`, `firstName?`, `lastName?`, `address?`, `city?`, `zipCode?`, `cardNumber?`, `cardExpiry?`, `cardCVC?` |

### 7.3 Admin Management Types (`src/stores/useAdminStore.ts`)

| Type Name | Primary Fields / Attributes |
|---|---|
| `SizeStock` | `size: string`, `stock: number` |
| `ProductData` | `id`, `slug`, `name`, `category`, `price`, `badge`, `image`, `altText`, `span`, `aspectRatio`, `description`, `images`, `sizes: SizeStock[]`, `details` |
| `OrderItem` | `id`, `slug`, `name`, `price`, `size`, `image`, `quantity` |
| `ShippingAddress` | `email`, `firstName`, `lastName`, `address`, `city`, `zipCode` |
| `OrderData` | `id`, `userId`, `orderNumber`, `items: OrderItem[]`, `subtotal`, `shipping`, `tax`, `total`, `shippingAddress`, `status`, `isPaid`, `createdAt` |
| `DashboardMetrics` | `totalSales`, `totalOrders`, `averageOrderValue`, `pendingCount`, `shippedCount`, `lowStockCount` |
| `RecentOrder` | `orderNumber`, `total`, `status`, `isPaid?`, `createdAt`, `firstName`, `lastName` |

### 7.4 API & Integration Payload Types

| Type Name | Defined In | Primary Fields / Attributes |
|---|---|---|
| `CheckoutSessionRequest` | `api/checkout/session` | `variantId?`, `cartItems: [{ internalProductId, quantity, size }]`, `shippingAddress` |
| `PaginatedProductsResponse`| `hooks/queries/` | `products: Product[]`, `total: number` |
| `AdminPaginatedProductsResponse`| `hooks/queries/` | `products: ProductData[]`, `total`, `page`, `limit`, `totalPages` |
| `PaginatedOrdersResponse` | `hooks/queries/` | `orders: OrderData[]`, `total`, `page`, `limit`, `totalPages` |
| `PaginatedUsersResponse` | `hooks/queries/` | `users: AdminUserRow[]`, `total`, `page`, `limit`, `totalPages` |
| `Order` | `hooks/queries/` | `id`, `userId`, `orderNumber`, `items: OrderItem[]`, `subtotal`, `shipping`, `tax`, `total`, `status`, `createdAt` |
| `CategoryMetadata` | `hooks/queries/` | `slug`, `name`, `image`, `description` |
| `OrderConfirmationData` | `lib/email-templates.ts` | `orderNumber`, `customerName`, `items: [{ name, size, quantity, price }]`, `subtotal`, `shipping`, `tax`, `total`, `shippingAddress` |
| `CreateCheckoutPayload` | `lib/lemonsqueezy.ts` | `variantId`, `userId`, `userEmail?`, `userName?`, `reservationId?`, `cartItems`, `shippingAddress`, `totalPriceCents`, `description?` |
| `VerifiedItem` | `api/webhooks/lemonsqueezy` | `id`, `slug`, `name`, `size`, `price`, `image`, `quantity` |


## 8. Zustand Store API Reference

### 8.1 `useCartStore` (`src/stores/useCartStore.ts`)
- **State**: `{ items: CartItem[], isOpen: boolean }`
- **Actions**:
  - `addItem(product: Omit<CartItem, "quantity">)`: If same ID+size exists, increments quantity. Otherwise adds with qty 1.
  - `removeItem(id, size)`: Removes specific product+size.
  - `updateQuantity(id, size, quantity)`: Updates quantity for specific product+size.
  - `clearCart()` / `openCart()` / `closeCart()` / `toggleCart()`
  - `totalItems()`: Derived sum of quantities.
  - `totalPrice()`: Derived sum of price × qty.
- **Persistence**: `localStorage` key `aurora-cart`.
- **Consumers**: `CartDrawer`, `CheckoutForm`, `OrderSummaryContainer`, `Navbar`, `ProductActions`, `CartEmptyState`

### 8.2 `useAuthStore` (`src/stores/useAuthStore.ts`)
- **State**: `{ user: User | null, profile: Profile | null, loading: boolean, error: string | null }`
- **Actions**: `signIn(email, password)`, `signUp(email, password, name?)`, `signOut()`, `updateProfile(profile)`, `verifyEmail(email, token)`, `resendVerification(email)`, `sendResetPasswordEmail(email)`, `resetPassword(newPassword, token)`, `changePassword(currentPassword, newPassword)`, `clearError()`
- **Behavior**: Wraps `authClient` calls, normalizes profile state, maps internal auth errors via `mapBetterAuthError()`, and triggers `/api/auth/role` on sign in.
- **Consumers**: `LoginForm`, `RegisterForm`, `NavbarProfileMenu`, `ProfileClient`, `ResetPasswordForm`, `VerifyForm`

### 8.3 `useProductStore` (`src/stores/useProductStore.ts`)
- **State**: `{ selectedSizes: Record<string, string>, activeTabs: Record<string, "details" | "shipping">, isSizeGuideOpen: boolean }`
- **Actions**: `setSelectedSize(productId, size)`, `setActiveTab(productId, tab)`, `setSizeGuideOpen(isOpen)`
- **Consumers**: `ProductDetailClient`, `SizeGuideModal`

### 8.4 `useAdminStore` (`src/stores/useAdminStore.ts`)
- **Note**: Refactored to act purely as a TypeScript interface repository. All runtime state and mutation actions have been migrated to TanStack Query hooks.


## 9. React Query Hooks Reference

All hooks in `src/hooks/queries/`. Default config: `staleTime=5min`, `gcTime=10min`, `refetchOnWindowFocus=false`.

### 9.1 Storefront Hooks (`src/hooks/queries/`)

| Hook | Query Key | Target Endpoint / Source | Purpose |
|---|---|---|---|
| `useProductsQuery(category?)` | `['products', category]` | `GET /api/products` | Unpaginated category catalog |
| `usePaginatedProductsQuery(params)`| `['products', 'paginated', params]`| `GET /api/products` | Paginated, filtered, sorted search |
| `useFeaturedProductsQuery(count)` | `['products', 'All']` | Client-side daily subset | Deterministic modulo daily subset |
| `useRelatedProductsQuery(current)` | `['products', 'All']` | Client-side recommendation| Up to 4 same-category products |
| `useProductDetailsQuery(slug)` | `['product', slug]` | `GET /api/products/[slug]` | Product details (`staleTime: 0`, `initialData` from cached list) |
| `useLookbookQuery()` | `['lookbook']` | `GET /api/landing` | Home lookbook slider items |
| `useEditorialQuery()` | `['editorial']` | `GET /api/editorial` | Editorial story page blocks |
| `useOrders(page, limit)` | `['orders', userId, page]` | `GET /api/orders` | User order history (paginated, staleTime=2min) |
| `useCategoriesQuery()` | `['categories']` | `GET /api/categories` | Complete category list (staleTime=10min) |
| `useDailyCategoriesQuery()` | `['categories', 'daily']` | Client-side subset of categories | Daily featured categories (staleTime=30min) |

### 9.2 Admin Queries & Mutations (`src/hooks/queries/`)

| Hook / Mutation | Query Key / Target | Purpose |
|---|---|---|
| `useAdminDashboardQuery()` | `['admin', 'dashboard']` | Fetches system overview metrics and 5 recent orders |
| `useAdminProductsQuery(params)` | `['admin', 'products', params]` | Paginated admin product list (uses `keepPreviousData`) |
| `useAdminOrdersQuery(params)` | `['admin', 'orders', params]` | Paginated admin order management list |
| `useAdminUsersQuery(params)` | `['admin', 'users', params]` | Paginated admin user list |
| `useAdminUserSessionsQuery(id)` | `['admin', 'users', id, 'sessions']` | Active sessions for a user |
| `useUpdateOrderStatusMutation()` | `PATCH /api/admin/orders/[id]` | Status transitions (invalidates `orders`, `dashboard`) |
| `useSaveProductMutation()` | `POST/PUT /api/admin/products` | Creates or updates product (invalidates `products`) |
| `useDeleteProductMutation()` | `DELETE /api/admin/products/[id]`| Deletes product (invalidates `products`) |
| `useToggleUserVerifyMutation()` | `PATCH /api/admin/users/[id]` | Toggles email verification (invalidates `users`) |
| `useUpdateUserRoleMutation()` | `PATCH /api/admin/users/[id]` | Updates role `user` ↔ `admin` (invalidates `users`) |
| `useDeleteUserMutation()` | `DELETE /api/admin/users/[id]` | Deletes user account (invalidates `users`) |


## 10. Custom Business Hooks

### 10.1 Key Application Hooks
- **`useInitializeAuth()`**: Invoked once in root `Providers.tsx`. Fetches `authClient.getSession()` and `/api/auth/role` to prime `useAuthStore`.
- **`useCheckoutForm()`**: Manages checkout form state (email, firstName, lastName, address, city, zipCode), per-field blur validation, and `handlePlaceOrder()`. Calls `POST /api/checkout/session`, caches order meta in `sessionStorage`, opens LS overlay modal. LS `Checkout.Success` event: clears cart + invalidates `['orders']`.
  - **Returns**: `{ email, setEmail, firstName, ..., loading, items, handlePlaceOrder, error, fieldErrors, handleBlur, touched }`
- **`useProductFilter(options?)`**: URL-synced filter state. Reads/writes `page`, `sortBy`, `search` from URL search params via `useSearchParams`/`useRouter`.
  - **Returns**: `{ activeCategory, handleCategoryChange, sortBy, applyFilters, searchQuery, handleSearchSubmit, handleClearSearch, filtered, isLoading, total, totalPages, currentPage, onPageChange, categories }`
- **`useProductForm(onSuccess)`**: Admin catalog form state (id, name, slug, category, price, badge, altText, span, aspectRatio, description, details[], sizes[], images). InsForge storage upload to `product-media` bucket. Auto-slug from name. Change detection via JSON snapshot comparison.
  - **Returns**: `{ formId, setFormId, ..., mainImageUrl, galleryUrls, uploading, saving, isReady, hasChanges, resetForm, handleUpload, handleSave, handleAddDetail, handleAddSize }`
- **`useCheckoutSuccess()`**: Fires on `/checkout/success`. Clears local cart on mount, reads `sessionStorage('ls_checkout_data')`, polls `GET /api/orders?lsOrderId=` (up to 10× at 1.5s intervals) for order number.
  - **Returns**: `{ orderData, isLoaded, user }`

### 10.2 Management Hooks

| Hook Name | File Location | Primary Function |
|---|---|---|
| `useAdminDashboard()` | `src/hooks/useAdminDashboard.ts` | Wraps `useAdminDashboardQuery` for metrics & recent orders |
| `useOrdersManagement()` | `src/hooks/useOrdersManagement.ts` | Filters, pagination, and status updates for admin orders |
| `useUsersManagement()` | `src/hooks/useUsersManagement.ts` | Search, role updates, and session viewing for admin users |
| `useUserSessions()` | `src/hooks/useUserSessions.ts` | Active session tracking and termination per user |


## 11. Auth System

### 11.1 Server & Client Setup
- **Server Instance (`src/lib/auth.ts`)**: Better Auth config. Database: separate `Pool` scoped to `better_auth` schema via `SET search_path TO better_auth, public`. Auth methods: `emailAndPassword` with email verification required. Rate limiting: DB-backed storage, custom rules per endpoint (5/min for sign-in/sign-up, 3/min for reset/verification emails). Session: 7-day expiry, 1-day update age, cookie cache 5min. CSRF enabled. Secure cookies: production only. Trusted origins from `NEXT_PUBLIC_APP_URL`.
- **Client SDK (`src/lib/auth-client.ts`)**: `createAuthClient({ baseURL: NEXT_PUBLIC_BETTER_AUTH_URL })`. Exports: `signIn`, `signUp`, `signOut`, `useSession`.
- **RBAC Guards (`src/utils/admin.ts`)**: Role level hierarchy — `ROLE_LEVELS = { user: 0, admin: 10 }`. `requireRole(minLevel = 10)` queries `better_auth."user".role`. `requireAdmin()` enforces `minLevel = 10`.
- **Middleware Guard (`src/proxy.ts`)**: Intercepts `/profile/*` and `/admin/*`. Validates sessions via `BETTER_AUTH_URL/api/auth/get-session`, redirects unauthenticated users to `/login?redirect=pathname`.

### 11.2 Error Mapping (`mapBetterAuthError`)

| Better Auth Error | Display Message |
|---|---|
| `email_not_verified` / 403 | "Please verify your email before signing in." |
| `user_not_found` | "No account found with this email address." |
| `invalid_password` | "Incorrect password." |
| `invalid_token` | "This link is invalid or has expired." |
| `weak_password` | "Password must be at least 8 characters." |
| `rate_limit` | "Too many attempts. Please wait..." |
| Duplicate email | "An account with this email already exists." |
| Expired reset link | "This password reset link has expired." |


## 12. Payment Flow (Lemon Squeezy)

### 12.1 Transaction Sequence

```
User submits Checkout Form
  ↓
POST /api/checkout/session
  ├── Validate cart items & merge duplicates
  ├── Fetch authentic prices from Postgres
  ├── BEGIN DB Transaction
  │   ├── Lock product_sizes FOR UPDATE (sorted by ID)
  │   ├── Verify stock >= quantity + active reservations
  │   └── INSERT product_reservations (35-minute TTL)
  ├── Calculate total price (Subtotal + 8% Tax + Shipping)
  ├── POST Lemon Squeezy Checkout API
  └── Return { checkoutUrl, checkoutId }
  ↓
User completes checkout on Lemon Squeezy Modal
  ↓
Lemon Squeezy Webhook → POST /api/webhooks/lemonsqueezy
  ├── HMAC-SHA256 signature verification
  ├── BEGIN DB Transaction
  │   ├── INSERT processed_webhooks (ON CONFLICT DO NOTHING -> abort if processed)
  │   ├── UPDATE product_sizes SET stock = stock - qty
  │   ├── DELETE product_reservations
  │   └── INSERT INTO orders (status = 'pending', is_paid = true)
  └── Trigger async confirmation email via Brevo SMTP
```

### 12.2 Reservation Lifecycle

| Stage | Action | Duration |
|---|---|---|
| Created | `INSERT product_reservations` | 35 min (expires_at) |
| Consumed | Webhook `order_created` → `DELETE` after stock deduction | ~seconds |
| Expired | Cleaned up by subsequent stock check queries (ignored if `expires_at < NOW()`) | 35 min |
| Cancelled | `DELETE` on checkout session creation failure | Immediate |

### 12.3 Rules & Idempotency
- **Idempotency**: `processed_webhooks(ls_event_id)` with `ON CONFLICT DO NOTHING` prevents double processing.
- **Pricing**: Free shipping over $500 (or subtotal = 0). 8% tax on subtotal. Total = subtotal + shipping + tax.


## 13. InsForge Integration

### 13.1 Storage Buckets
- `product-media` (`/images/products/`): Catalog & gallery assets.
- `lookbook-media` (`/images/lookbook/`): Home lookbook slides.
- `editorial-media` (`/images/editorial/`): Brand story images.
- `material-media` (`/images/materials/`): Fabric composition index.
- `category-media` (`/images/categories/`): Category preview images.

### 13.2 Architecture & Dual Clients
- **Browser Client (`src/lib/insforge.ts`)**: Client component hook (`useInsforgeClient`) that auto-refreshes JWT bridge tokens via `GET /api/insforge-token` every 50 minutes.
- **Server Client (`src/lib/insforge.server.ts`)**: Server-side client initialized with custom HS256 JWTs signed using `INSFORGE_JWT_SECRET`.
- **Storage Path Mapping (`src/utils/insforge.ts`)**: Helper utilities `getStorageUrl()` and `getStorageKeyFromUrl()` map relative paths (e.g. `/images/products/foo.webp`) to absolute InsForge bucket URLs.


## 14. Email System

### 14.1 Configuration & Delivery
- **Transport (`src/lib/email.ts`)**: Nodemailer SMTP transport targeting Brevo (`smtp-relay.brevo.com:587`). Gracefully skips transmission if credentials are unconfigured.
- **Templates (`src/lib/email-templates.ts`)**: Provides HTML and plain text renderers (`orderConfirmationHtml`, `orderConfirmationText`).
- **Triggers**: Better Auth password resets, email verification links, sign-up security alerts, and post-checkout order confirmation receipts.


## 15. Environment Variables

| Variable Name | Required Scope | Purpose / Description |
|---|---|---|
| `DATABASE_URL` | Server Only | PostgreSQL connection string (`sslmode=require`) |
| `BETTER_AUTH_SECRET` | Server Only | Secret key used for session signing |
| `BETTER_AUTH_URL` | Server Only | Better Auth server base URL |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Client & Server | Public base URL for client SDK calls |
| `ADMIN_EMAILS` | Server Only | Fallback whitelist for admin access |
| `NEXT_PUBLIC_INSFORGE_URL` | Client & Server | Base URL for InsForge instance |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | Client & Server | Public anonymous API key |
| `INSFORGE_API_KEY` | Server Only | Service key for elevated DB access |
| `INSFORGE_JWT_SECRET` | Server Only | Secret for signing bridge JWT tokens |
| `BREVO_SMTP_HOST` / `PORT` | Server Only | Host (`smtp-relay.brevo.com`) & Port (`587`) |
| `BREVO_SMTP_USER` / `PASS` | Server Only | Brevo authentication credentials |
| `BREVO_FROM_EMAIL` / `NAME` | Server Only | Sender address and sender display name |
| `LEMON_SQUEEZY_API_KEY` | Server Only | REST API key for checkout generation |
| `LEMON_SQUEEZY_STORE_ID` | Server Only | Store identifier |
| `LEMON_SQUEEZY_WEBHOOK_SECRET` | Server Only | Secret for validating HMAC signatures |
| `NEXT_PUBLIC_LS_ORDER_VARIANT_ID`| Client & Server | Variant ID for checkout creation |
| `NEXT_PUBLIC_APP_URL` | Client & Server | Base application URL for CORS & sitemap |


## 16. Scripts Reference

| Script Command / File | Language | Purpose & Usage Context |
|---|---|---|
| `scripts/create-tables.sql` | SQL | Full DDL setup: tables, indexes, RLS policies |
| `scripts/setup-db.js` | JavaScript | Initializes Better Auth database tables |
| `scripts/upload-and-seed.mts` | TypeScript | Complete reset: deploys schema, uploads media, seeds catalog |
| `scripts/update-catalog.mts` | TypeScript | Catalog update without wiping user/order history (`--catalog-only`) |
| `scripts/manage-user.ts` | TypeScript | CLI tool for creating users, deleting users, or setting roles |
| `scripts/wipe-db.mts` | TypeScript | Drops all database tables and resets schema |
| `scripts/optimize-images.mjs` | JavaScript | Sharp utility for WebP conversion of static assets |


## 17. Animation System

### 17.1 Spring & Transition Presets (`src/animations/transitions.ts`)

| Preset Name | Motion Type | Primary Application |
|---|---|---|
| `springSmooth` | Spring (stiffness: 300, damping: 30) | Buttons, card hover states |
| `springBouncy` | Spring (stiffness: 400, damping: 20) | Popovers, badge animations |
| `springStiff` | Spring (stiffness: 500, damping: 35) | Micro-interactions |
| `springGentle` | Spring (stiffness: 180, damping: 22) | Page transitions, modal reveals |
| `easeOutQuart` | Cubic Bezier `[0.25, 0.46, 0.45, 0.94]` | Smooth decelerations |
| `easeInOutCubic` | Cubic Bezier `[0.65, 0, 0.35, 1]` | Background fades |

### 17.2 Framer Motion Variants (`src/animations/variants.ts`)

| Variant Name | Variant Structure / Type |
|---|---|
| `fadeInUp` | `Variants` (opacity 0→1, y 40→0) |
| `fadeIn` | `Variants` (opacity 0→1) |
| `staggerContainer` | `Variants` (staggers children by 0.12s) |
| `slideInLeft` / `slideInRight` | `Variants` (x ±60→0) |
| `scaleIn` | `Variants` (scale 0.88→1) |
| `cardCascade` | Variant factory function taking item index |
| `drawerSlide` | `Variants` (x 100%→0 for slide-over cart) |
| `overlayMenu` | `Variants` (fullscreen navigation slide) |
| `cardEnter` | Variant factory for staggered product grid entry (alternating offset) |
| `cardExit` | `Variants` (scale 0.85 + y 30) |
| `navbarReveal` | `Variants` (y -100→0 on page load) |
| `menuItemVariant` | `Variants` (x 40→0) |
| `cardImageReveal` | `Variants` (scale 1.08→1) |
| `testimonialSlide` | `Variants` (direction-aware horizontal slide) |
| `mentionFloat` | keyframes (y float [0, -8, 0] infinite) |


## 18. Patterns & Conventions

### 18.1 Naming & Layering Rules
- **Components**: PascalCase (e.g. `ProductInfo.tsx`).
- **Containers**: Suffix with `Client` or `Container` (e.g. `ProductDetailClient.tsx`).
- **Hooks & Stores**: Prefix with `use` (e.g. `useCheckoutForm.ts`, `useCartStore.ts`).
- **"use client" Directive**: Place only on Layer 2 containers or interactive Layer 4 leaf components using state, event handlers, navigation hooks, or Framer Motion.

### 18.2 Data Flow Rules
- **Pages** are server components. Never import stores or client hooks.
- **Containers** (`"use client"`) bridge server data to client interactivity. Read stores with individual selectors (`useStore(s => s.field)`) to avoid unnecessary re-renders.
- **Hooks** contain business logic only. Never import UI components.
- **Presentational components** are pure. No stores, no hooks (except UI-only hooks like `useBodyScrollLock`).
- **Stores** are Zustand singletons. Only `useCartStore` uses `persist` middleware (localStorage key `aurora-cart`).

### 18.3 Database Access Pattern

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

### 18.4 Caching Strategy
- **Public routes**: Next.js 16 `'use cache'` with 300s revalidate (`cacheLife`) and `products`/`categories` tags (`cacheTag`)
- **Admin**: No caching (always fresh)
- **React Query**: 5-min stale, 10-min gc, no refetch on focus
- **Admin invalidation**: Mutations invalidate `['products']`, `['orders']`, `['admin']`, `['dashboard']` query caches

### 18.5 Error Handling Pattern

```ts
try {
  // handler logic
} catch (error) {
  console.error("[route] Failed:", error);
  return NextResponse.json(
    { error: "Human-readable message" },
    { status: 500 }
  );
}
```


## 19. Gotchas

1. **Proxy Middleware File Naming**: Middleware is defined in `src/proxy.ts` and exports `proxy`. Next.js requires `middleware.ts` with export `middleware` for automated global route protection.
2. **Guest Checkout Default**: `orders.user_id` is nullable. Guest checkout is supported without requiring account creation.
3. **URL-Synced Search & Filters**: Filtering, sorting, and pagination state in product listings are read directly from search params via `useSearchParams()` for deep linking.
4. **Dual InsForge SDK Instances**: Client components must use `src/lib/insforge.ts` (`useInsforgeClient`), which handles JWT bridge updates. Server routes must use `src/lib/insforge.server.ts`.
5. **No ORM**: All database interactions use raw `pg` queries. Schema changes require SQL scripts.
6. **PostgreSQL Subqueries**: Product detail queries aggregate child arrays in PostgreSQL using `json_agg`.
7. **`useProductDetailsQuery` Pre-populating**: Uses `initialData` from cached catalog lists to support instant page loads while revalidating details in the background.
8. **Email Transport Fallback**: If Brevo credentials are not configured, `sendEmail` logs a warning and returns `{ sent: false }` without throwing.
9. **Webhook Security**: Webhook processing reads the raw request text (`req.text()`) for HMAC signature validation using `crypto.timingSafeEqual` before JSON parsing.
10. **Deadlock Prevention**: Product size rows are sorted by `internalProductId` before locking with `SELECT ... FOR UPDATE` during stock reservation and deduction.


## 20. Testing

- **Runner & Config**: Vitest 4.1.9 configured in `vitest.config.ts`.
- **Test Structure**:
  - `__tests__/api/` (12 files): API integration tests (admin rights, webhook idempotency, stock locking, session checkout).
  - `__tests__/stores/` (2 files): Zustand store unit tests (`auth`, `cart`).
  - `__tests__/utils/` (7 files): Unit tests for formatters, pricing algorithms, field sanitization, and input validators.

```bash
bun run test          # Run all Vitest unit and integration test suites
bun run test:watch    # Launch Vitest in watch mode
```


## 21. Related Documentation

| Guide Document | Primary Subject Matter |
|---|---|
| [README.md](README.md) | Project overview, key features, developer quickstart, code examples |
| [docs/CODING_STANDARDS.md](docs/CODING_STANDARDS.md) | 4-layer architecture, client/server boundaries, coding style |
| [docs/BACKEND_DEPLOYMENT.md](docs/BACKEND_DEPLOYMENT.md) | InsForge setup, database deployment, webhook configuration |
| [AGENTS.md](AGENTS.md) | AI agent skill references and InsForge credential handling |