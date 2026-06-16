/**
 * Aurora — src/data/lookbook.ts
 *
 * Lookbook slide data for the homepage slider carousel.
 * Each slide represents a curated editorial image.
 */

export interface LookbookSlide {
  id?: number;
  slideNumber: number;
  originalImage: string;
  imageUrl: string;
  altText: string;
  tag?: string;
  title?: string;
  link?: string;
}

export const lookbookSlides: LookbookSlide[] = [
  {
    slideNumber: 1,
    originalImage: "/images/lookbook/lookbook-1.webp",
    imageUrl: "",
    altText: "Woman in tailored cream overcoat walking through European cobblestone street at golden hour",
    tag: "Outerwear",
    title: "Look 01 — The Overcoat",
    link: "/products/ivory-wool-overcoat"
  },
  {
    slideNumber: 2,
    originalImage: "/images/lookbook/lookbook-2.webp",
    imageUrl: "",
    altText: "Female model in all-white minimalist look in brutalist concrete architecture",
    tag: "Dresses",
    title: "Look 02 — The White Study",
    link: "/products/ivory-mock-neck-jumpsuit"
  },
  {
    slideNumber: 3,
    originalImage: "/images/lookbook/lookbook-3.webp",
    imageUrl: "",
    altText: "Model in earth-tone outfit in a mid-century modern interior",
    tag: "Knitwear",
    title: "Look 03 — The Interior",
    link: "/products/camel-knit-cardigan"
  },
  {
    slideNumber: 4,
    originalImage: "/images/lookbook/lookbook-4.webp",
    imageUrl: "",
    altText: "Solitary figure in charcoal coat in a misty forest at dawn",
    tag: "Outerwear",
    title: "Look 04 — The Drift",
    link: "/products/charcoal-belted-overcoat"
  },
  {
    slideNumber: 5,
    originalImage: "/images/lookbook/lookbook-5.webp",
    imageUrl: "",
    altText: "Model in structured black blazer on rooftop at blue hour",
    tag: "Outerwear",
    title: "Look 05 — Blue Hour",
    link: "/products/structured-black-blazer"
  },
  {
    slideNumber: 6,
    originalImage: "/images/lookbook/lookbook-6.webp",
    imageUrl: "",
    altText: "Model in champagne slip dress in gallery-white studio space",
    tag: "Outerwear",
    title: "Look 06 — The Studio",
    link: "/products/champagne-silk-slip-dress"
  }
];
