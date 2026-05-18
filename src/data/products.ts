export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  badge?: string;
  image: string;
  altText: string;
  span?: string;
  aspectRatio?: string;
  filter: string;
}

export const heroProducts: Product[] = [
  {
    id: "h1",
    name: "Ivory Wool Overcoat",
    category: "Outerwear",
    price: 1290,
    badge: "New",
    image: "/images/hero-product-1.jpg",
    altText: "Ivory cream wool overcoat on seamless white background",
    filter: "Outerwear",
  },
  {
    id: "h2",
    name: "Camel Cashmere Turtleneck",
    category: "Knitwear",
    price: 485,
    image: "/images/hero-product-2.jpg",
    altText: "Camel cashmere turtleneck sweater folded on marble surface",
    filter: "Knitwear",
  },
  {
    id: "h3",
    name: "Ecru Linen Blazer",
    category: "Outerwear",
    price: 890,
    badge: "Limited",
    image: "/images/hero-product-3.jpg",
    altText: "Ecru linen blazer on ghost mannequin with side lighting",
    filter: "Outerwear",
  },
  {
    id: "h4",
    name: "Charcoal Wide-Leg Trousers",
    category: "Trousers",
    price: 395,
    image: "/images/hero-product-4.jpg",
    altText: "Charcoal wide-leg tailored trousers styled with white shirt",
    filter: "Trousers",
  },
  {
    id: "h5",
    name: "Champagne Silk Slip Dress",
    category: "Dresses",
    price: 720,
    badge: "New",
    image: "/images/hero-product-5.jpg",
    altText: "Champagne gold silk slip dress hanging on brass rail",
    filter: "Dresses",
  },
];

export const featuredProducts: Product[] = [
  {
    id: "f1",
    name: "Ivory Wool Overcoat",
    category: "Outerwear",
    price: 1290,
    badge: "New",
    image: "/images/hero-product-1.jpg",
    altText: "Ivory cream wool overcoat",
    span: "lg:col-span-2",
    aspectRatio: "aspect-[3/4]",
    filter: "Outerwear",
  },
  {
    id: "f2",
    name: "Ecru Linen Blazer",
    category: "Outerwear",
    price: 890,
    badge: "Limited",
    image: "/images/hero-product-3.jpg",
    altText: "Ecru linen blazer",
    span: "lg:col-span-1",
    aspectRatio: "aspect-square",
    filter: "Outerwear",
  },
  {
    id: "f3",
    name: "Champagne Silk Slip Dress",
    category: "Dresses",
    price: 720,
    badge: "New",
    image: "/images/hero-product-5.jpg",
    altText: "Champagne silk slip dress",
    span: "lg:col-span-2",
    aspectRatio: "aspect-[3/4]",
    filter: "Dresses",
  },
];

export const allProducts: Product[] = [
  {
    id: "p1",
    name: "Ivory Wool Overcoat",
    category: "Outerwear",
    price: 1290,
    badge: "New",
    image: "/images/hero-product-1.jpg",
    altText: "Ivory wool overcoat",
    filter: "Outerwear",
  },
  {
    id: "p2",
    name: "Camel Cashmere Turtleneck",
    category: "Knitwear",
    price: 485,
    image: "/images/hero-product-2.jpg",
    altText: "Camel cashmere turtleneck",
    filter: "Knitwear",
  },
  {
    id: "p3",
    name: "Ecru Linen Blazer",
    category: "Outerwear",
    price: 890,
    badge: "Limited",
    image: "/images/hero-product-3.jpg",
    altText: "Ecru linen blazer",
    filter: "Outerwear",
  },
  {
    id: "p4",
    name: "Charcoal Wide-Leg Trousers",
    category: "Trousers",
    price: 395,
    image: "/images/hero-product-4.jpg",
    altText: "Charcoal wide-leg trousers",
    filter: "Trousers",
  },
  {
    id: "p5",
    name: "Champagne Silk Slip Dress",
    category: "Dresses",
    price: 720,
    badge: "New",
    image: "/images/hero-product-5.jpg",
    altText: "Champagne silk slip dress",
    filter: "Dresses",
  },
  {
    id: "p6",
    name: "Camel Wrap Coat",
    category: "Outerwear",
    price: 1150,
    image: "/images/hero-product-1.jpg",
    altText: "Camel wrap coat",
    filter: "Outerwear",
  },
  {
    id: "p7",
    name: "Ivory Wool Overcoat II",
    category: "Outerwear",
    price: 1390,
    badge: "Limited",
    image: "/images/hero-product-3.jpg",
    altText: "Ivory wool overcoat variant",
    filter: "Outerwear",
  },
  {
    id: "p8",
    name: "Silk Scarf in Amber",
    category: "Accessories",
    price: 195,
    image: "/images/hero-product-2.jpg",
    altText: "Silk scarf in amber gold",
    filter: "Accessories",
  },
];
