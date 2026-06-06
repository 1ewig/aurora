# Aurora — Premium E-Commerce Application

Aurora is a quiet-luxury fashion brand e-commerce web application (SS 2025 Collection). Built with Next.js 15, React 19, TypeScript, Tailwind CSS 4, and Framer Motion.

This repository evolved from a single landing page into a multi-page digital boutique with dynamic SSG routing, client-side category filtering, and a simulated checkout flow. Throughout development, business logic and complex state management were systematically extracted from UI components into dedicated hooks and Zustand stores, following a **pages → containers → hooks/stores → presentational components** architecture.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15.5.19 (App Router) |
| Language | React 19 + TypeScript 5.9 |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion 12 |
| State Management | Zustand (cart persisted to localStorage) |
| Fonts | next/font (Inter, Playfair Display) |
| Images | next/image (auto-optimized WebP/AVIF) |

## Architecture Pattern

The codebase follows a consistent 4-layer separation of concerns:

1. **Pages** — Server or client entry points. Server pages use `generateStaticParams` for SSG. Client pages call hooks and render presentational components.
2. **Containers/Bridges** — Thin `"use client"` wrappers that read Zustand stores, call business logic hooks, and pass resolved data + callbacks as props to presentational components.
3. **Hooks & Stores** — `src/hooks/` contains reusable business logic (form state, carousel, scroll effects, pricing calculations). `src/stores/` holds Zustand stores for global state with persistence.
4. **Presentational Components** — Pure JSX that receives all data and event handlers via props. Zero store imports, zero business logic.

This ensures SSG compatibility where it matters (product detail and category pages are pre-rendered), while keeping interactive state management cleanly isolated.

## Getting Started

```bash
npm install
npm run dev      # start dev server at http://localhost:3000
npm run build    # production build and static SSG generation → .next/
npm run start    # serve the production build
```

## Route Structure

| Route | Type | Description |
|---|---|---|
| `/` | Static | Brand landing page — hero, featured collection, lookbook carousel, testimonials, newsletter |
| `/products` | Static | Shop catalog — 14 pieces with fluid category filter pills |
| `/products/category/[category]` | SSG | Pre-rendered subpages for Outerwear, Knitwear, Trousers, Dresses, Accessories |
| `/products/[slug]` | SSG | Product detail — image gallery, size selector, details tabs, related pieces, size guide modal |
| `/checkout` | Static | Simulated checkout — 9-field form, order summary with pricing breakdown, order confirmation with demo notice |
| `/story` | Static | Brand narrative — hero, philosophy, parallax breakout, atelier section, CTA |

## Core Features

- **SSG Product Pages** — All product detail and category pages are pre-rendered at build time via `generateStaticParams`. Interactive elements are encapsulated in client wrappers (`ProductDetailContainer`, `CategoryProductsPage`) that leave SSG intact.
- **Category Filtering** — Pill buttons on `/products` update the URL via `pushState` for instant client-side filtering while maintaining shareable URLs. The `useProductFilter` hook powers both the main catalog and category subpages.
- **Cart Persistence** — Zustand store with `persist` middleware keeps bag contents, quantities, and sizes synced to `localStorage` across sessions.
- **PII Masking** — Checkout completion masks credit card digits and email addresses before rendering confirmation.
- **Demo Notice** — Order confirmation displays a prominent notice that this is a dummy e-commerce site built for learning purposes.
- **Animation Suite** — Framer Motion drives layout animations (spring-based tab indicators, staggered grid entries, drawer slides), magnetic hover effects, and image reveals.
- **Scroll-Aware Navbar** — The navigation bar dynamically applies background, border, and blur based on scroll position via `useNavbarScroll`.
- **Body Scroll Lock** — Cart drawer and size guide modal lock body scroll via `useBodyScrollLock` to prevent background scrolling.
- **Related Products** — Automatically filtered by category with fallback to any product when insufficient category matches.

## Project Structure

```
src/
├── app/
│   ├── checkout/page.tsx
│   ├── products/
│   │   ├── page.tsx
│   │   ├── [slug]/page.tsx              # SSG
│   │   └── category/[category]/page.tsx # SSG
│   ├── story/page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── components/
│   ├── checkout/      CartEmptyState, CheckoutForm, CheckoutSuccess, OrderSummary, OrderSummaryContainer
│   ├── landing/       FeaturedCollection, HeroSection, LookbookSlider, Newsletter, Testimonials
│   ├── layout/        Footer, Navbar
│   ├── product/
│   │   ├── listing/   CategoryFilter, CategoryProductsPage, PageHeader, ProductGrid
│   │   └── detail/    ImageGallery, ProductDetail, ProductDetailContainer, RelatedProducts, SizeGuideModal, SizeSelector
│   ├── story/         AtelierSection, ParallaxBreakout, PhilosophySection, StoryCta, StoryHero
│   └── ui/            Button, CartDrawer, EyebrowLabel, OptimizedImage, ProductCard
│
├── stores/            useCartStore (persisted), useProductStore
├── hooks/             useBodyScrollLock, useCarousel, useCheckoutForm, useInView, useMagneticHover,
│                      useMediaQuery, useNavbarScroll, useNewsletterSubmit, useOrderPricing, useRelatedProducts
├── data/              navigation, products (14 items), testimonials
├── animations/        variants.ts
└── utils/             cn.ts, formatCurrency.ts
```

## Hooks Overview

| Hook | Purpose | Used By |
|---|---|---|
| `useCarousel` | Slide index, direction, autoplay with proper timer cleanup | LookbookSlider, Testimonials |
| `useCheckoutForm` | 9 form fields, validation, order processing, PII masking | CheckoutForm |
| `useNewsletterSubmit` | Email field state + submission lifecycle | Newsletter |
| `useNavbarScroll` | Scroll threshold → background, border, blur classes | Navbar |
| `useBodyScrollLock` | Toggle `overflow: hidden` on body | CartDrawer, SizeGuideModal |
| `useProductFilter` | Category state, filtered product list, URL sync | ProductsPage, CategoryProductsPage |
| `useRelatedProducts` | Memoized category-matched + fallback products | ProductDetailContainer → ProductDetail |
| `useOrderPricing` | Shipping threshold, 8% tax, total calculation | OrderSummaryContainer |
| `useInView` | Intersection Observer for entrance animations | Various |
| `useMediaQuery` | Window matchMedia listener | Various |
| `useMagneticHover` | Pointer tracking for magnetic button effect | UI components |

## State Management

Two Zustand stores handle global state:

- **`useCartStore`** — Cart items (id, slug, name, price, size, quantity, image, category), drawer open/close, add/remove/update operations, computed totals. Persisted to `localStorage` under key `aurora-cart`.
- **`useProductStore`** — Per-product selected sizes, active info tabs, and size guide modal visibility. Not persisted (resets on page refresh).

## Image Optimization

JPEG source images live in `images-sources/` (outside `public/` to avoid shipping raw assets), organized in `products/`, `lookbook/`, and `editorial/` subdirectories. Pre-optimized WebP variants are served directly from `public/images/` via `next/image`.

To regenerate WebP from JPEG originals:

```bash
node scripts/optimize-images.mjs
```

Uses [sharp](https://sharp.pixelplumbing.com/) (resizes longest edge to 2000px, quality 100).
