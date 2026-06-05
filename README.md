# Aurora — Premium E-Commerce Application

Aurora is a quiet-luxury fashion brand e-commerce web application (SS 2025 Collection). Built with Next.js 15, React 19, TypeScript, Tailwind CSS 4, and Framer Motion. 

This repository began as a single landing page and has been expanded into a fully realized multi-page digital boutique with dynamic SSG routing, client-side animation filters, and checkout simulation.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15.5.19 (App Router) |
| Language | React 19 + TypeScript |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion 12 |
| State Management | Zustand (cart state persisted to localStorage) |
| Fonts | next/font (Inter, Playfair Display) |
| Images | next/image (auto-optimized WebP/AVIF with responsive layouts) |

## Getting Started

```bash
npm install
npm run dev      # start dev server at http://localhost:3000
npm run build    # production build and static SSG generation → .next/
npm run start    # serve the production build
```

## Route Structure

- **`/` (Home)** — Homepage composes high-fidelity brand sections (Hero, Featured Collection, Lookbook Carousel, Testimonials, and Newsletter).
- **`/products` (Catalog)** — General shop catalog grid rendering all 14 premium pieces with fluid category filtering.
- **`/products/category/[category]` (Category Index)** — Dedicated subpages pre-rendered for individual collections (`/outerwear`, `/knitwear`, `/trousers`, `/dresses`, `/accessories`).
- **`/products/[slug]` (Product Detail)** — SSG pre-rendered product detail views featuring image gallery thumbnails, size selection, materials & fit tabs, and same-category related recommendations.
- **`/checkout` (Secure Checkout)** — Single-page simulated checkout collecting contact info, shipping coordinates, and mock billing details with PII masking validation.
- **`/story` (Atelier Brand Narrative)** — Brand philosophy narrative column detailing creative director Elena Voss's conviction and historic mill partnerships.

## Core Features & Interactions

- **Global Shell Isolation** — `Navbar`, `Footer`, `CartDrawer`, and `ScrollProgress` are hosted centrally inside `layout.tsx`. State is preserved on route transitions, completely eliminating page navigation flashes.
- **SEO-Friendly Client Filters** — Category filter pills on `/products` behave as links to category subfolders for search engines, but utilize `window.history.pushState` on click for instant, page-reload-free grid filtering animations.
- **Micro-Animations & Gestures** — Magnetic buttons, cross-fade slide transitions, layout-aware active tab indicators, and spring-based interactions throughout.
- **PII Masking** — The checkout completion screen masks critical information (e.g., credit card digits and email handles) before rendering client confirmations.
- **Cart Persistence** — Zustand store keeps bag quantities, line items, and sizes synced with browser local storage.

## Project Structure

```
src/
├── app/                  # Next.js App Router Pages
│   ├── checkout/             # checkout/page.tsx
│   ├── products/             # products/page.tsx (Catalog)
│   │   ├── [slug]/               # products/[slug]/page.tsx (Detail SSG)
│   │   └── category/             # products/category/[category]/page.tsx (Category SSG)
│   ├── story/                # story/page.tsx
│   ├── globals.css           # Tailwind v4 directives & custom tokens
│   ├── layout.tsx            # Global layout shell (Navbar, Footer, CartDrawer)
│   └── page.tsx              # Brand landing page layout
│
├── components/           # UI & Page Layout Components
│   ├── checkout/             # CheckoutForm, OrderSummary
│   ├── landing/              # Hero, FeaturedCollection, LookbookSlider, etc.
│   ├── layout/               # Navbar, Footer
│   ├── product/              # ProductDetail, ImageGallery, SizeSelector, RelatedProducts, ProductCatalogView
│   └── ui/                   # Button, CartDrawer, ProductCard, OptimizedImage, etc.
│
├── data/                 # Navigation, testimonials, products catalog datasets
├── hooks/                # Zustand Cart store, Media query, Magnetic hover hooks
└── utils/                # cn styling merges, formatCurrency helpers
```

## Image Optimization

JPEG source images live in `images-sources/` (outside `public/` to avoid shipping raw assets), organized in `products/`, `lookbook/`, and `editorial/` subdirectories. Pre-optimized WebP variants are served directly from `public/images/` via `next/image` in their respective matching subdirectories.

To regenerate WebP from the JPEG originals:
```bash
node scripts/optimize-images.mjs
```
Uses [sharp](https://sharp.pixelplumbing.com/) (resizes longest edge to 2000px, quality 100).
