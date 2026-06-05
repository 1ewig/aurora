# Aurora — E-Commerce Expansion Plan

## Route Structure

```
src/app/
├── page.tsx                          # /  — landing page (as-is)
├── layout.tsx                        # Root layout with nav/footer
├── globals.css
├── not-found.tsx
├── products/
│   ├── page.tsx                      # /products — catalog listing
│   └── [slug]/
│       └── page.tsx                  # /products/[slug] — product detail
└── checkout/
    └── page.tsx                      # /checkout — single-page checkout
```

## File Organization

```
src/components/
├── landing/                          # renamed from sections/ (Hero, MarqueeBar, etc.)
├── layout/                           # Navbar, Footer, CartDrawer (as-is)
├── product/                          # NEW
│   ├── ProductDetail.tsx             #   Main detail layout (images + info)
│   ├── ImageGallery.tsx              #   Main image + thumbnail strip
│   ├── SizeSelector.tsx              #   Size picker
│   └── RelatedProducts.tsx           #   Same-category grid
├── checkout/                         # NEW
│   ├── CheckoutForm.tsx              #   Shipping info fields
│   └── OrderSummary.tsx              #   Cart items + total
└── ui/                               # Button, OptimizedImage, etc. (as-is)
```

## Data Changes

### `src/data/products.ts` — Expanded Product type

```ts
interface Product {
  id: string;
  slug: string;             // NEW: "ivory-wool-overcoat"
  name: string;
  category: string;
  price: number;
  badge?: string;
  image: string;            // main image
  images: string[];         // NEW: gallery images
  altText: string;
  description: string;      // NEW: full product description
  details: string[];        // NEW: ["Italian wool", "Dry clean only", ...]
  sizes: string[];          // NEW: ["XS", "S", "M", "L", "XL"]
}
```

## Implementation Phases

| Phase | Files | Scope |
|-------|-------|-------|
| **1** | Rename `sections/` → `landing/` | Update all imports, no functional change |
| **2** | `src/data/products.ts` | Add slug, description, images[], sizes, details to every product |
| **3** | `products/[slug]/page.tsx` + 4 new components | Product detail page with `generateStaticParams` |
| **4** | `products/page.tsx` | Catalog listing page (reuses ProductGrid) |
| **5** | `checkout/page.tsx` + 2 new components | Single-page checkout form + order summary |
| **6** | `Navbar.tsx`, `navigation.ts` | Add "Shop All" route link |

## Key Design Decisions

- **Product images**: Existing product images serve as the single gallery shot. Gallery component degrades gracefully for single-image products.
- **SSG**: All product pages pre-rendered at build time via `generateStaticParams`
- **No payment**: Checkout collects shipping info, "Place Order" triggers a simulated success and clears cart
- **Cart persistence**: Zustand + localStorage (as-is, already working)
- **Cart**: Slide-in drawer only (no `/cart` page)
- **Landing page**: Components remain as-is, just renamed from `sections/` to `landing/`
