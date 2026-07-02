# Aurora — Codebase Structure

Quick-reference map for navigating the Aurora codebase.

---

## Directory Map

```
aurora/
├── .env.example                  # Environment variable template (copy to .env.local)
├── .insforge/project.json        # InsForge project config (auto-generated, gitignored)
├── AGENTS.md                     # AI agent InsForge skill references
├── README.md                     # Project overview, setup, architecture
├── docs/
│   ├── CODING_STANDARDS.md       # 4-layer architecture rules and conventions
│   └── BACKEND_DEPLOYMENT.md     # InsForge + DB setup walkthrough
├── migrations/
│   └── 20260614145429_better-auth-setup.sql
├── scripts/
│   ├── create-tables.sql         # Full database schema (products, orders, etc.)
│   ├── manage-user.ts            # CLI: create/update/delete users and roles
│   ├── optimize-images.mjs       # Sharp-based WebP preprocessing
│   ├── setup-db.js               # Better Auth schema initializer
│   ├── update-catalog.mts        # Upsert catalog without wiping orders/users
│   └── upload-and-seed.mts       # Full schema deploy + media upload + seed
├── src/
│   ├── proxy.ts                  # Next.js middleware (route protection) — see Gotchas
│   ├── animations/
│   │   ├── transitions.ts        # Shared Framer Motion spring/ease presets
│   │   └── variants.ts           # Animation variants (fade, slide, card, drawer)
│   ├── app/                      # Next.js App Router — pages, layouts, API routes
│   │   ├── globals.css           # Tailwind imports + custom theme tokens
│   │   ├── layout.tsx            # Root layout (fonts, metadata, providers)
│   │   ├── providers.tsx         # Client providers (React Query + auth init)
│   │   ├── robots.ts             # Dynamic robots.txt
│   │   ├── sitemap.ts            # Dynamic sitemap.xml
│   │   ├── (admin)/              # Route group: admin panel
│   │   ├── (auth)/               # Route group: login, register, reset, verify
│   │   ├── (store)/              # Route group: storefront pages
│   │   ├── (user)/               # Route group: user profile + orders
│   │   └── api/                  # API route handlers (see Routing Map)
│   ├── components/
│   │   ├── admin/                # Admin: dashboard, inventory, orders, users
│   │   ├── auth/                 # Login, register, reset password, verify
│   │   ├── checkout/             # Checkout form, order summary, success
│   │   ├── landing/              # Home page sections (Hero, Featured, etc.)
│   │   ├── layout/               # Navbar, Footer, MobileMenu
│   │   ├── product/
│   │   │   ├── detail/           # Product detail page components
│   │   │   └── listing/          # Product catalog/filtering components
│   │   ├── profile/              # User profile + order history
│   │   ├── story/                # Brand story page sections
│   │   └── ui/                   # Shared primitives (Button, Pagination, etc.)
│   ├── data/                     # Static content definitions (hero, lookbook, etc.)
│   ├── hooks/
│   │   ├── queries.ts            # All TanStack React Query hooks
│   │   ├── use*.ts               # Business logic hooks (one per feature)
│   │   └── ui/                   # Pure UI hooks (scroll lock, carousel, etc.)
│   ├── lib/
│   │   ├── auth.ts               # Better Auth server config
│   │   ├── auth-client.ts        # Better Auth browser client
│   │   ├── email.ts              # Nodemailer/Brevo SMTP transport
│   │   ├── email-templates.ts    # HTML/text email templates
│   │   ├── insforge.ts           # InsForge browser client (JWT-bridged)
│   │   ├── insforge.server.ts    # InsForge server client (JWT-signed)
│   │   └── lemonsqueezy.ts       # Lemon Squeezy REST API client
│   ├── stores/
│   │   ├── useAdminStore.ts      # Admin UI state
│   │   ├── useAuthStore.ts       # Auth state + Better Auth operations
│   │   ├── useCartStore.ts       # Cart with localStorage persistence
│   │   └── useProductStore.ts    # Product UI state (size guide toggle, etc.)
│   ├── types/
│   │   └── lemonsqueezy.d.ts     # Lemon Squeezy Window globals
│   └── utils/
│       ├── admin.ts              # Server-side role checks (requireAdmin, requireRole)
│       ├── auth.ts               # Auth utility helpers
│       ├── cn.ts                 # clsx + tailwind-merge
│       ├── db.ts                 # PostgreSQL connection pool
│       ├── formatCurrency.ts     # Currency formatting
│       ├── pricing.ts            # Order pricing calculations
│       ├── validation.ts         # Form/input validation
│       └── insforge/             # InsForge utility wrappers
```

---

## Architecture Quick-Ref

The codebase follows a strict 4-layer unidirectional data flow:

```
Pages (src/app/)
  │  Server Components — resolve params, export SEO metadata, render containers
  ▼
Containers / Bridges (src/components/*/)
  │  Read stores, call hooks, assemble props
  ├──► Hooks (src/hooks/) — business logic, form state, queries
  └──► Stores (src/stores/) — Zustand global state
  ▼
Presentational Components (src/components/*/)
  Pure JSX — receive everything via props, zero store/hook imports
```

- **Pages** are server components by default. Never import stores or client hooks directly.
- **Containers** are `"use client"` wrappers that bridge server data to client interactivity.
- **Hooks** contain business logic only. Never import UI components.
- **Presentational components** are pure. No stores, no hooks (except UI-only hooks like `useBodyScrollLock`).

See [docs/CODING_STANDARDS.md](docs/CODING_STANDARDS.md) for full rules and examples.

---

## Routing Map

### Storefront (public)

| URL | File | Notes |
|---|---|---|
| `/` | `(store)/page.tsx` | Landing page |
| `/products` | `(store)/products/page.tsx` | All products listing |
| `/products/[slug]` | `(store)/products/[slug]/page.tsx` | Product detail |
| `/products/category/[category]` | `(store)/products/category/[category]/page.tsx` | Category filter |
| `/story` | `(store)/story/page.tsx` | Brand story |
| `/checkout` | `(store)/checkout/page.tsx` | Checkout (guest OK) |
| `/checkout/success` | `(store)/checkout/success/page.tsx` | Order confirmation |

### Authentication (public)

| URL | File |
|---|---|
| `/login` | `(auth)/login/page.tsx` |
| `/register` | `(auth)/register/page.tsx` |
| `/reset-password` | `(auth)/reset-password/page.tsx` |
| `/verify` | `(auth)/verify/page.tsx` |

### User Account (auth required)

| URL | File |
|---|---|
| `/profile` | `(user)/profile/page.tsx` |
| `/profile/orders` | `(user)/profile/orders/page.tsx` |

### Admin Panel (admin required)

| URL | File |
|---|---|
| `/admin` | `(admin)/admin/page.tsx` — dashboard |
| `/admin/inventory` | `(admin)/admin/inventory/page.tsx` |
| `/admin/orders` | `(admin)/admin/orders/page.tsx` |
| `/admin/users` | `(admin)/admin/users/page.tsx` |

### API Routes

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/products` | GET | List products (paginated, filtered) |
| `/api/products/[slug]` | GET | Single product by slug |
| `/api/orders` | GET/POST | User orders / create order |
| `/api/checkout/session` | POST | Create Lemon Squeezy checkout |
| `/api/auth/[...all]` | ALL | Better Auth catch-all |
| `/api/auth/role` | GET | User role info |
| `/api/admin/products` | GET/POST | Admin product CRUD |
| `/api/admin/products/[id]` | GET/PATCH/DELETE | Single product |
| `/api/admin/orders` | GET | Admin orders list |
| `/api/admin/orders/[id]` | GET/PATCH/DELETE | Single order |
| `/api/admin/users` | GET | Admin users list |
| `/api/admin/users/[id]` | GET/PATCH/DELETE | Single user |
| `/api/admin/dashboard` | GET | Dashboard metrics |
| `/api/lookbook` | GET | Lookbook slides |
| `/api/editorial` | GET | Editorial content |
| `/api/insforge-token` | GET | JWT bridge for InsForge |
| `/api/webhooks/lemonsqueezy` | POST | Payment webhook (HMAC verified) |

---

## Database Schema

Core tables and relationships:

```
products (id PK, slug UNIQUE, name, category, price, badge, image, alt_text, description)
├── product_images (id PK, product_id FK → products, image_url)
├── product_sizes (id PK, product_id FK → products, size, stock) — UNIQUE(product_id, size)
├── product_details (id PK, product_id FK → products, detail)
└── product_keywords (id PK, product_id FK → products, keyword) — UNIQUE(product_id, keyword)

orders (id UUID PK, user_id TEXT NULL, order_number UNIQUE, items JSONB,
        subtotal, shipping, tax, total, shipping_address JSONB,
        status, payment_provider, ls_order_id UNIQUE, ls_order_number)
├── idx_orders_user_id
└── idx_orders_order_number

processed_webhooks (id PK, ls_event_id UNIQUE) — idempotency for Lemon Squeezy

lookbook_slides (id PK, slide_number UNIQUE, image_url, alt_text, tag, title, link)
editorial_content (id PK, image_url, alt_text, title, description)
hero_slides (id PK, slide_number UNIQUE, image_url, alt_text, title, link)
```

Key constraints:
- `product_sizes` uses `SELECT ... FOR UPDATE` for pessimistic stock locking during checkout
- `orders.user_id` is nullable — guest checkout is the default flow
- `orders` stores items as JSONB (denormalized snapshot, not a FK)
- `processed_webhooks.ls_event_id` enforces idempotent webhook processing

---

## Key Files by Task

| Task | File(s) |
|---|---|
| Add/modify products | `src/data/products.ts`, `scripts/update-catalog.mts` |
| Change product types/interfaces | `src/data/products.ts` (type defs at top) |
| Modify auth flow | `src/lib/auth.ts`, `src/lib/auth-client.ts`, `src/stores/useAuthStore.ts` |
| Change checkout logic | `src/app/api/orders/route.ts`, `src/hooks/useCheckoutForm.ts` |
| Modify payment integration | `src/lib/lemonsqueezy.ts`, `src/app/api/checkout/session/route.ts`, `src/app/api/webhooks/lemonsqueezy/route.ts` |
| Add admin feature | `src/components/admin/`, `src/app/api/admin/`, `src/hooks/useAdmin*.ts` |
| Edit email templates | `src/lib/email-templates.ts`, `src/lib/email.ts` |
| Change animations | `src/animations/variants.ts`, `src/animations/transitions.ts` |
| Modify database schema | `scripts/create-tables.sql` |
| Upload/seed media | `scripts/upload-and-seed.mts` |
| Add UI component | `src/components/ui/` (shared) or feature folder |
| Add page route | `src/app/(domain)/route/page.tsx` |
| Add API endpoint | `src/app/api/path/route.ts` |
| Modify Zustand store | `src/stores/use*Store.ts` |
| Add React Query hook | `src/hooks/queries.ts` |
| Add business logic hook | `src/hooks/useFeatureName.ts` |
| Add UI hook | `src/hooks/ui/useHookName.ts` |
| Modify middleware | `src/proxy.ts` (see Gotchas) |
| Role-based access | `src/utils/admin.ts` (`requireAdmin`, `requireRole`) |
| Database queries | Direct `pg` client in route handlers or hooks, pool at `src/utils/db.ts` |

---

## State Management

### Zustand Stores

| Store | File | Purpose | Consumers |
|---|---|---|---|
| `useCartStore` | `src/stores/useCartStore.ts` | Cart items, quantities, drawer state. Persisted to localStorage. | `CartDrawer`, `CheckoutForm`, `OrderSummaryContainer`, `Navbar` |
| `useAuthStore` | `src/stores/useAuthStore.ts` | User session, signIn/signOut/resetPassword wrappers | `NavbarProfileMenu`, `ProfileClient`, `LoginForm`, `RegisterForm` |
| `useProductStore` | `src/stores/useProductStore.ts` | Transient UI state (size guide open/close) | `ProductDetailClient`, `SizeGuideModal` |
| `useAdminStore` | `src/stores/useAdminStore.ts` | Admin panel UI state | `AdminSidebar`, admin containers |

### React Query Hooks (`src/hooks/queries.ts`)

| Hook | Fetches |
|---|---|
| `useProductsQuery(category?)` | All products |
| `usePaginatedProductsQuery(params)` | Paginated, filtered, sorted products |
| `useFeaturedProductsQuery(count)` | Deterministic daily featured subset |
| `useRelatedProductsQuery(current)` | Related products from same category |
| `useProductDetailsQuery(slug)` | Single product (with cached initialData) |
| `useLookbookQuery()` | Lookbook slides |
| `useEditorialQuery()` | Editorial content |
| `useOrders(page, limit)` | User order history |

Config: 5-min stale time, 10-min GC, no refetch on window focus.

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection (sslmode=require) |
| `NEXT_PUBLIC_INSFORGE_URL` | InsForge BaaS base URL |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | InsForge public anon key |
| `INSFORGE_API_KEY` | InsForge admin service key |
| `INSFORGE_JWT_SECRET` | InsForge JWT signing secret |
| `BETTER_AUTH_SECRET` | Better Auth session secret |
| `BETTER_AUTH_URL` | Better Auth server URL |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Better Auth client URL |
| `ADMIN_EMAILS` | Comma-separated admin email addresses |
| `BREVO_SMTP_*` | Brevo SMTP config (host, port, user, pass) |
| `BREVO_FROM_EMAIL` / `BREVO_FROM_NAME` | Transactional email sender |
| `LEMON_SQUEEZY_API_KEY` | Lemon Squeezy API key |
| `LEMON_SQUEEZY_STORE_ID` | Lemon Squeezy store ID |
| `LEMON_SQUEEZY_WEBHOOK_SECRET` | Webhook HMAC signing secret |
| `NEXT_PUBLIC_LS_ORDER_VARIANT_ID` | Product variant ID for checkout |

See [docs/BACKEND_DEPLOYMENT.md](docs/BACKEND_DEPLOYMENT.md) for where to find each value.

---

## Conventions & Gotchas

### Naming Rules
- **Components**: PascalCase filenames matching export name (`ProductInfo.tsx` → `export function ProductInfo`)
- **Page-level containers**: `XxxClient.tsx` (e.g., `ProductDetailClient.tsx`)
- **Sub-page containers**: `XxxContainer.tsx` (e.g., `OrderSummaryContainer.tsx`)
- **Hooks**: `useXxx.ts` — return plain data objects and handlers
- **Stores**: `useXxxStore.ts` — Zustand stores with optional persistence

### `"use client"` Rules
Start without it. Only add when the compiler requires it. You need it for: `useState`, `useEffect`, `useRef`, `onClick`/events, Zustand selectors, Framer Motion `motion.*`, or custom hooks.

### Import Aliases
- `@/components/...` — components
- `@/hooks/...` — hooks
- `@/stores/...` — stores
- `@/data/...` — static data
- `@/utils/...` — utilities
- `@/animations/...` — animation variants/transitions

### Gotchas
- **`src/proxy.ts` is not standard Next.js middleware.** It exports as `proxy`, not `middleware`. Route protection may not be active unless renamed to `middleware.ts` with the correct export.
- **Guest checkout is the default.** `orders.user_id` is nullable. The checkout flow works without authentication.
- **URL-synced filtering.** Product filters, sort, pagination, and search are synced to URL query strings for bookmarkability.
- **Dual InsForge clients.** `src/lib/insforge.ts` (browser, JWT-bridged) vs `src/lib/insforge.server.ts` (server, JWT-signed). Use the right one for your context.
- **Direct SQL, no ORM.** All database queries use raw `pg` with parameterized `$1, $2` syntax. There is no Prisma/Drizzle layer.
- **`json_agg` for nested data.** Product queries consolidate related tables (images, sizes, details) into a single DB roundtrip via PostgreSQL subqueries.

---

## Scripts Reference

| Script | Purpose | When to Run |
|---|---|---|
| `scripts/create-tables.sql` | Full database schema DDL | Automatically by upload-and-seed |
| `scripts/setup-db.js` | Initialize Better Auth schema | First-time setup only |
| `scripts/upload-and-seed.mts` | Deploy schema, upload media, seed data | First-time setup or full reset |
| `scripts/update-catalog.mts` | Upsert products/media without wiping orders | When adding/updating products |
| `scripts/manage-user.ts` | CLI user management (create, role, delete) | Admin account setup |
| `scripts/optimize-images.mjs` | WebP conversion via Sharp | When adding new image assets |

---

## Related Documentation

| File | Covers |
|---|---|
| [README.md](README.md) | Project overview, features, quick start, code examples |
| [docs/CODING_STANDARDS.md](docs/CODING_STANDARDS.md) | 4-layer architecture rules, `"use client"` conventions, examples |
| [docs/BACKEND_DEPLOYMENT.md](docs/BACKEND_DEPLOYMENT.md) | InsForge setup, env vars, DB init, webhook config |
| [AGENTS.md](AGENTS.md) | InsForge skill references and credential handling |
