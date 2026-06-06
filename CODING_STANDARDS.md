# Coding Standards

## Architecture Overview

The codebase follows a strict 4-layer separation of concerns:

```
Pages (src/app/)
  │  Import components, call hooks, pass data as props
  │
  ▼
Containers / Bridges (src/components/*/)
  │  Read stores, call hooks, assemble props
  │
  ├──► Hooks (src/hooks/)
  │     Business logic, form state, animation state, side effects
  │     May call Zustand stores
  │
  ├──► Stores (src/stores/)
  │     Zustand global state management
  │
  ▼
Presentational Components (src/components/*/)
  Pure JSX — receive everything via props, zero store/hook imports
```

Data flows **down** from pages through containers into presentational components. Business logic lives in hooks. Global state lives in stores.

---

## Layer Rules

### Pages (`src/app/`)

- Import components, call hooks, pass returned data as props
- Server components by default — use `"use client"` only when interactivity is required
- Use `generateStaticParams` for SSG on product detail and category pages
- Never import Zustand stores directly — delegate to a bridge/container or hook
- Never contain JSX markup beyond layout scaffolding (wrapping `<main>`, containers)

```tsx
// ✅ Good — server page, SSG, delegates to a client container
export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) notFound();
  return <ProductDetailContainer product={product} />;
}
```

```tsx
// ✅ Good — client page, calls hook, passes props
export default function ProductsPage() {
  const { activeCategory, filtered, categories, handleCategoryChange } = useProductFilter();
  return (
    <main>
      <PageHeader category={activeCategory} />
      <CategoryFilter ... />
      <ProductGrid products={filtered} />
    </main>
  );
}
```

### Containers / Bridges

- `"use client"` wrappers that act as the bridge between stores/hooks and presentational components
- Read Zustand stores with individual selectors (avoid subscribing to the entire store)
- Call business logic hooks
- Pass resolved data and event handlers as props
- One container per page-orchestrated feature

```tsx
// ✅ Good — bridge reads stores, passes props
export function ProductDetailContainer({ product }) {
  const selectedSize = useProductStore((s) => s.selectedSizes[product.id]);
  const addItem = useCartStore((s) => s.addItem);
  const relatedProducts = useRelatedProducts(product);

  return (
    <ProductDetail
      product={product}
      selectedSize={selectedSize}
      onAddToBag={handleAddToBag}
      relatedProducts={relatedProducts}
    />
  );
}
```

### Hooks (`src/hooks/`)

- Encapsulate business logic, form state, animation state, side effects
- May call Zustand stores via individual selectors
- Never import UI components
- Return plain data objects and handler functions
- Keep hooks focused — one responsibility per hook

```tsx
// ✅ Good — pure logic, returns data + handlers
export function useCheckoutForm(onOrderPlaced) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    // validation, submission, callbacks
  };

  return { email, setEmail, loading, handlePlaceOrder };
}
```

### Stores (`src/stores/`)

- Zustand for global state shared across multiple components
- Cart store with `persist` middleware for `localStorage` durability
- Product store for transient UI state (no persistence)
- No JSX, no React hooks
- Use individual selectors at consumption sites to avoid unnecessary re-renders

```ts
// ✅ Good — Zustand store, focused, with persistence
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => set((state) => ({ items: [...state.items, product] })),
      removeItem: (id, size) => set(...),
      clearCart: () => set({ items: [] }),
      totalPrice: () => get().items.reduce(...),
    }),
    { name: "aurora-cart" }
  )
);
```

### Presentational Components (`src/components/`)

- Receive everything via props
- Zero store imports, zero hook imports (except utility hooks like `useBodyScrollLock` that manage pure UI concerns)
- No business logic — no filtering, no calculations, no data fetching
- Pure JSX rendering with Tailwind styling
- Prefer composition over configuration — lean interfaces with specific props

```tsx
// ✅ Good — pure presentational, all data comes via props
interface ProductDetailProps {
  product: Product;
  selectedSize: string;
  onSizeChange: (size: string) => void;
  onAddToBag: () => void;
  isInCart: boolean;
}

export function ProductDetail({ product, selectedSize, onSizeChange, onAddToBag, isInCart }: ProductDetailProps) {
  return (
    <div>
      <SizeSelector sizes={product.sizes} selectedSize={selectedSize} onChange={onSizeChange} />
      <Button onClick={onAddToBag} disabled={isInCart}>Add to Bag</Button>
    </div>
  );
}
```

---

## `"use client"` Rules

| Scenario | Directive |
|---|---|
| Pure JSX layout, no hooks, no events | **None** (server component) |
| Uses Framer Motion (`motion.div`, etc.) | `"use client"` |
| Uses `useState`, `useEffect`, `useRef` | `"use client"` |
| Uses a custom hook (useCarousel, etc.) | `"use client"` |
| USES `onClick`, `onChange`, form events | `"use client"` |
| Reads a Zustand store via selector | `"use client"` |
| Page with `generateStaticParams` | **None** (server) — delegate interactivity to child client containers |

**As a rule**: start without `"use client"` and only add it when the compiler tells you it's needed. This maximizes SSG eligibility.

---

## Import Conventions

| Import | Path Prefix |
|---|---|
| Components | `@/components/...` |
| Hooks | `@/hooks/...` |
| Stores | `@/stores/...` |
| Static data | `@/data/...` |
| Utilities | `@/utils/...` |
| Animation variants | `@/animations/...` |
| Sibling files | `./ComponentName` (relative) |

---

## Directory Conventions

- Components organized by **feature** or **page**:
  - `src/components/checkout/` — checkout page
  - `src/components/landing/` — home page sections
  - `src/components/layout/` — Navbar, Footer
  - `src/components/product/listing/` — category listing page
  - `src/components/product/detail/` — product detail page
  - `src/components/story/` — brand story page
  - `src/components/ui/` — shared reusable primitives
- One component per file (named export)
- Component filenames match their export name (PascalCase)
- Hooks are named `useXxx.ts` and return plain objects

---

## Verification

Before committing, run the build to type-check everything:

```bash
npm run build
```

The build compiles TypeScript and validates types. Address any errors before pushing.
