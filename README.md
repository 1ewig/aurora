# Aurora — Luxury Landing Page

A single-page landing page for **Aurora**, a quiet-luxury fashion brand (SS 2025 Collection). Built with React 19, TypeScript, Vite, Tailwind CSS 4, and Framer Motion.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite 7 |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion 12 |
| State management | Zustand (cart, persisted to localStorage) |
| Bundle | Inline all assets into a single HTML file via `vite-plugin-singlefile` |

## Getting Started

```bash
npm install
npm run dev      # start dev server
npm run build    # production build → dist/index.html
npm run preview  # preview the production build
```

## Sections

1. **Hero** — Full-viewport intro with animated headline, CTAs, and product cascade.
2. **Marquee Bar** — Infinite scrolling brand ticker.
3. **Featured Collection** — Three curated products with staggered reveal.
4. **Lookbook Slider** — Full-bleed editorial image carousel (6 slides).
5. **Designer Story** — Split layout with founder portrait and brand philosophy.
6. **Testimonials** — Customer review carousel.
7. **Product Grid** — Filterable catalog (Outerwear, Knitwear, Trousers, Dresses, Accessories) with add-to-cart.
8. **Newsletter** — Email signup with success state.

## Additional Features

- Fixed navbar with scroll-aware transparency and mobile full-screen menu
- Slide-in cart drawer with quantity controls and checkout summary
- Scroll progress indicator
- WebP/JPEG `<picture>` element fallback for all images
- Responsive design (mobile-first)

## Image Optimization

JPEG source images live in `public/images/`. To regenerate WebP variants:

```bash
node scripts/optimize-images.mjs
```

Uses [sharp](https://sharp.pixelplumbing.com/) (resize longest edge to 2000px, quality 82).

## Project Structure

```
src/
├── animations/    # Framer Motion presets and variants
├── components/
│   ├── layout/    # Navbar, Footer
│   ├── sections/  # Page sections (Hero, ProductGrid, etc.)
│   └── ui/        # Reusable primitives (Button, ProductCard, etc.)
├── data/          # Static content (products, testimonials, navigation)
├── hooks/         # Custom React hooks (cart, scroll, media query, etc.)
└── utils/         # Utility functions (cn, formatCurrency)
```

## Brand Details

- **Brand:** Aurora
- **Tagline:** "Designed in solitude. Worn with intention."
- **Founder:** Elena Voss
- **Collection:** SS 2025
- **Positioning:** Quiet luxury, limited editions, intentional craftsmanship
