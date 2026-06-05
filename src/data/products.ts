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
}

export const categories = [
  "Outerwear",
  "Knitwear",
  "Trousers",
  "Dresses",
  "Accessories",
] as const;

export type Category = (typeof categories)[number];

export const heroProducts: Product[] = [
  {
    id: "h1",
    name: "Ivory Wool Overcoat",
    category: "Outerwear",
    price: 1290,
    badge: "New",
    image: "/images/hero-product-1.jpg",
    altText: "Ivory cream wool overcoat on seamless white background",
  },
  {
    id: "h2",
    name: "Camel Cashmere Turtleneck",
    category: "Knitwear",
    price: 485,
    image: "/images/hero-product-2.jpg",
    altText: "Camel cashmere turtleneck sweater folded on marble surface",
  },
  {
    id: "h3",
    name: "Ecru Linen Blazer",
    category: "Outerwear",
    price: 890,
    badge: "Limited",
    image: "/images/hero-product-3.jpg",
    altText: "Ecru linen blazer on ghost mannequin with side lighting",
  },
  {
    id: "h4",
    name: "Charcoal Wide-Leg Trousers",
    category: "Trousers",
    price: 395,
    image: "/images/hero-product-4.jpg",
    altText: "Charcoal wide-leg tailored trousers styled with white shirt",
  },
  {
    id: "h5",
    name: "Champagne Silk Slip Dress",
    category: "Dresses",
    price: 720,
    badge: "New",
    image: "/images/hero-product-5.jpg",
    altText: "Champagne gold silk slip dress hanging on brass rail",
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
  },
];

export const allProducts: Product[] = [
  {
    id: "p6",
    name: "Camel Wrap Coat",
    category: "Outerwear",
    price: 1150,
    image: "/images/camel-wrap-coat.jpg",
    altText: "Camel wrap coat",
  },
  {
    id: "p7",
    name: "Ebony Wool Overcoat",
    category: "Outerwear",
    price: 1390,
    badge: "Limited",
    image: "/images/ebony-wool-overcoat.jpg",
    altText: "Ebony wool overcoat with peak lapels",
  },
  {
    id: "p8",
    name: "Silk Scarf in Amber",
    category: "Accessories",
    price: 195,
    image: "/images/silk-scarf-amber.jpg",
    altText: "Silk scarf in amber gold",
  },
  {
    id: "p9",
    name: "Charcoal Merino Crewneck",
    category: "Knitwear",
    price: 325,
    image: "/images/charcoal-merino-crewneck.jpg",
    altText: "Charcoal merino wool crewneck sweater",
  },
  {
    id: "p10",
    name: "Black Tailored Trousers",
    category: "Trousers",
    price: 450,
    image: "/images/black-tailored-trousers.jpg",
    altText: "Black tailored dress trousers",
  },
  {
    id: "p11",
    name: "Emerald Velvet Midi Dress",
    category: "Dresses",
    price: 890,
    badge: "New",
    image: "/images/emerald-velvet-midi-dress.jpg",
    altText: "Emerald green velvet midi dress",
  },
  {
    id: "p12",
    name: "Leather Belt in Oak",
    category: "Accessories",
    price: 240,
    image: "/images/leather-belt-oak.jpg",
    altText: "Oak brown leather belt with brass buckle",
  },
  {
    id: "p13",
    name: "Navy Wool Peacoat",
    category: "Outerwear",
    price: 980,
    image: "/images/navy-wool-peacoat.jpg",
    altText: "Navy blue wool peacoat",
  },
  {
    id: "p14",
    name: "Ivory Cashmere Cardigan",
    category: "Knitwear",
    price: 520,
    badge: "New",
    image: "/images/ivory-cashmere-cardigan.jpg",
    altText: "Ivory cashmere cardigan",
  },
];
