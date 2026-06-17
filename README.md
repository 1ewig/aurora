# Aurora

A quiet-luxury digital storefront — minimal, editorial, server-rendered.

---

### Live Links & Demo Credentials

- **Live Application**: [aurora-nu-three.vercel.app](https://aurora-nu-three.vercel.app/)
- **GitHub Repository**: [github.com/1ewig/aurora](https://github.com/1ewig/aurora)

**Guest / Demo Accounts:**

| Role | Email | Password |
| :--- | :--- | :--- |
| Customer | `customer@example.com` | `Customer123!` |
| Admin | `admin@example.com` | `Admin123!` |

> Guest checkout is fully enabled — you can purchase items without creating an account.

---

### Project Goal & Context

Aurora solves a specific retail problem: translating the sensory, premium feel of a physical luxury atelier into a fast digital medium. Most fashion e-commerce is cluttered with pop-ups, aggressive retargeting, and heavy client-side JavaScript that degrades the browsing experience.

As a portfolio project, the goal was to master Next.js 15's full-stack capabilities — specifically building a hybrid server/client architecture where product pages are server-rendered for SEO and instant first paint, while the shopping cart and checkout remain interactive without full page reloads.

---

### Engineering & Design Decisions

**Why Next.js 15 (App Router)?**

- **React Server Components**: Product catalogs, lookbook sliders, and editorial pages fetch data on the server. The client receives fully-formed HTML — no loading spinners, no layout shift, minimal JavaScript.
- **Route Handlers**: Order creation, stock validation, and price calculations happen exclusively in API routes. The client never computes totals, preventing price tampering.
- **Edge Middleware**: Session and admin-role checks run at the edge before any page markup reaches the client. Profile and admin routes are guarded with zero cold-start cost.

**Raw SQL over ORM**

Rather than adding Prisma's query compilation overhead, Aurora uses direct `pg` connection pools. This gives precise control over query shape:

- `SELECT ... FOR UPDATE` row locks prevent inventory overselling during concurrent checkout.
- `json_agg` aggregates product sizes, images, and metadata into the exact shape the frontend expects — no N+1, no mapping layer.
- Transactions with `BEGIN`/`COMMIT`/`ROLLBACK` ensure atomicity across stock validation, deduction, and order creation.

**Infrastructure Consolidation with InsForge**

InsForge provides the PostgreSQL database, file storage (product images, lookbook assets, editorial media), and authentication under a single API boundary. The client SDK is bridged via HS256 JWTs signed server-side, keeping the anon key public while authorizing storage and database access per-user.

**State Management Split**

- **TanStack React Query v5** — server data caching and invalidation. Product lists, lookbook slides, editorial content, and order history are cached keyed by query params, enabling instant back-navigation and optimistic updates.
- **Zustand** — purely client-side state. The shopping cart (persisted to `localStorage`), auth session wrapper, admin panel data, and product detail UI state (selected size, active tab, size guide modal) live in lightweight Zustand stores.

**Design System**

Tailwind CSS v4 with custom design tokens defined in `globals.css` via the `@theme` directive. A warm off-white background (`#F7F7F5`), gold accent (`#C8A882`), and deep ink (`#0D0D0D`) define the brand palette. Display typography uses Playfair Display (serif), body copy uses Inter (sans-serif). Framer Motion spring presets power page entrances, the slide-out cart drawer, overlay mobile menu, and staggered card reveals.

---

### Technical Challenges & Lessons Learned

**Challenge: Preventing Inventory Overselling During Concurrent Checkout**

- **Situation**: Multiple customers checking out simultaneously could read identical stock levels, resulting in overselling a product size.
- **Task**: Guarantee that stock deduction is atomic under concurrency.
- **Action**: Wrapped the stock-check-and-deduct logic in a PostgreSQL transaction using `SELECT stock FROM product_sizes WHERE ... FOR UPDATE`. This pessimistic row lock forces concurrent requests to queue — the second transaction sees the updated stock committed by the first.
- **Result**: Inventory counts remain consistent under load. Failed transactions roll back automatically, and the API returns a clear out-of-stock error to the user.

**Challenge: Eliminating Loading States on Product Detail Navigation**

- **Situation**: Navigating from the catalog to `/products/[slug]` caused a visible loading flash while the detail page fetched product metadata.
- **Task**: Make product detail transitions feel instantaneous.
- **Action**: Modified the detail query hook to use `initialData`. When the slug matches an item already cached in the product list query, the detail page hydrates immediately from that cached data — no fetch needed. The hook still revalidates in the background for freshness.
- **Result**: Loading spinners on product transitions were eliminated. Navigation feels instant.

**Challenge: Serving High-Resolution Fashion Photography Fast**

- **Situation**: Directly serving raw high-resolution product images caused large bundle sizes and slow page loads.
- **Task**: Optimize images for web delivery without visible quality loss.
- **Action**: Built a Sharp preprocessing script that converts source files to WebP, scales the longest edge to 2000px, and compresses to 85% quality. The pipeline runs before deployment.
- **Result**: Average image size reduced by ~60%. Pages load with sharp, artifact-free imagery.

---

### Performance & Optimizations

- **`next/image` with Remote Patterns**: All product, lookbook, and editorial images are served through Next.js's Image component, configured with a remote pattern for `**.insforge.app`. Automatic WebP/AVIF negotiation, lazy loading, and intrinsic sizing prevent layout shift.
- **Local Font Hosting**: Playfair Display and Inter are served via `next/font`, eliminating external font CDN latency and removing flash-of-invisible-text (FOIT).
- **Dynamic Imports**: Admin panel components (product form modals, order detail panels, inventory tables) are code-split and only load when the admin navigates to those routes.
- **N+1 Query Prevention**: Product detail queries aggregate sizes, images, and metadata into a single payload using PostgreSQL `json_agg`, avoiding the classic N+1 loop.
- **Lighthouse Scores**: _Pending — I'll run a full audit and publish real numbers soon._

---

### Tech Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| Framework | Next.js 15 + React 19 | App Router, Server Components, Route Handlers |
| Database | PostgreSQL (InsForge) | Product catalog, orders, inventory, auth |
| Auth | Better Auth | Email/password, sessions, email verification, password reset |
| Client State | Zustand 5 | Shopping cart, auth wrapper, admin panel, UI state |
| Server State | TanStack React Query 5 | Product/lookbook/editorial/order caching |
| Styling | Tailwind CSS 4 | Design tokens in CSS, utility-first responsive layout |
| Animation | Framer Motion 12 | Page transitions, cart drawer, mobile menu, staggered reveals |
| Image Processing | Sharp | WebP conversion, resize, compression pipeline |
| Email | Nodemailer + Brevo SMTP | Order confirmations, verification, password reset |
| Backend | InsForge BaaS | Postgres hosting, file storage, JWT bridge |
| Deployment | Vercel | Edge functions, serverless routes, static generation |

---

### Quick Start

```bash
git clone https://github.com/1ewig/aurora
cd aurora
npm install
```

Then follow the **[Backend Deployment Guide](docs/BACKEND_DEPLOYMENT.md)** to set up an InsForge project, configure environment variables, upload assets, and seed the database.

Once your `.env.local` is configured:

```bash
npm run dev
```

Visit `http://localhost:3000`.

---

### Key Files to Review

| File | What it demonstrates |
| :--- | :--- |
| `src/middleware.ts` | Edge middleware — route protection, admin role gating, session cookie validation |
| `src/app/api/orders/route.ts` | Transactional checkout — stock validation, `FOR UPDATE` row locks, inventory deduction, email confirmation |
| `src/hooks/queries.ts` | TanStack Query hooks with `initialData` hydration, background revalidation, cache key strategy |
| `src/stores/useAuthStore.ts` | Zustand store wrapping Better Auth — error mapping, session management, admin role detection |
| `src/lib/auth.ts` | Better Auth server configuration — email/password, verification flow, SMTP integration |
| `src/utils/pricing.ts` | Server-side price calculation — free shipping threshold, tax rate, totals |
