/**
 * Aurora — src/data/hero.ts
 *
 * Hero slide data for the homepage slider carousel/cascade cards.
 */

export interface HeroSlide {
  id?: number;
  slideNumber: number;
  originalImage: string;
  imageUrl: string;
  altText: string;
  title?: string;
  link?: string;
}

export const heroSlides: HeroSlide[] = [
  {
    slideNumber: 1,
    originalImage: "/images/hero/hero-1.webp",
    imageUrl: "",
    altText: "Woman in tailored cream overcoat walking through European cobblestone street at golden hour",
    title: "Ivory Wool Overcoat",
    link: "/products/ivory-wool-overcoat"
  },
  {
    slideNumber: 2,
    originalImage: "/images/hero/hero-2.webp",
    imageUrl: "",
    altText: "Female model in all-white minimalist look in brutalist concrete architecture",
    title: "Camel Cashmere Turtleneck",
    link: "/products/camel-cashmere-turtleneck"
  },
  {
    slideNumber: 3,
    originalImage: "/images/hero/hero-3.webp",
    imageUrl: "",
    altText: "Model in earth-tone outfit in a mid-century modern interior",
    title: "Ecru Linen Blazer",
    link: "/products/ecru-linen-blazer"
  },
  {
    slideNumber: 4,
    originalImage: "/images/hero/hero-4.webp",
    imageUrl: "",
    altText: "Solitary figure in charcoal coat in a misty forest at dawn",
    title: "Charcoal Wide-Leg Trousers",
    link: "/products/charcoal-wide-leg-trousers"
  },
  {
    slideNumber: 5,
    originalImage: "/images/hero/hero-5.webp",
    imageUrl: "",
    altText: "Model in structured black blazer on rooftop at blue hour",
    title: "Champagne Silk Slip Dress",
    link: "/products/champagne-silk-slip-dress"
  }
];
