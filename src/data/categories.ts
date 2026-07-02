/**
 * Aurora — src/data/categories.ts
 *
 * Category metadata and assets for the storefront and database seeding.
 */

export const categories = [
  "Outerwear",
  "Knitwear",
  "Trousers",
  "Dresses",
  "Accessories",
] as const;

export type Category = (typeof categories)[number];

export interface CategoryData {
  slug: string;
  name: string;
  image: string;
  description: string;
}

export const categoryDataList: CategoryData[] = [
  {
    slug: "outerwear",
    name: "Outerwear",
    image: "/images/categories/outerwear.webp",
    description: "Empowering silhouettes, structured overcoats, and tailored blazers designed for transitions."
  },
  {
    slug: "knitwear",
    name: "Knitwear",
    image: "/images/categories/knitwear.webp",
    description: "Indulgently soft cashmere, merino wool, and heavy rib-knits crafted for warmth and comfort."
  },
  {
    slug: "trousers",
    name: "Trousers",
    image: "/images/categories/trousers.webp",
    description: "Fluid drapes, wide-leg cuts, and classic tailoring engineered for effortless motion."
  },
  {
    slug: "dresses",
    name: "Dresses",
    image: "/images/categories/dresses.webp",
    description: "Minimalist lines, silk slip-drapes, and refined silhouettes that transition seamlessly from day to night."
  },
  {
    slug: "accessories",
    name: "Accessories",
    image: "/images/categories/accessories.webp",
    description: "Fine leather goods, soft wool wraps, and intentional finishing details to complete the look."
  }
];
