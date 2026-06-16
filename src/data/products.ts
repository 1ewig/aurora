export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  badge?: string;
  image: string;
  images?: string[];
  altText: string;
  span?: string;
  aspectRatio?: string;
  description?: string;
  details?: string[];
  sizes?: string[];
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
    slug: "ivory-wool-overcoat",
    name: "Ivory Wool Overcoat",
    category: "Outerwear",
    price: 1290,
    badge: "New",
    image: "/images/products/hero-product-1.webp",
    images: ["/images/products/hero-product-1.webp"],
    altText: "Ivory cream wool overcoat on seamless white background",
    
    
    description: "An elegant, double-breasted overcoat tailored from premium Italian virgin wool. Designed with a structured drape, classic notch lapels, and a belted waist for a sophisticated silhouette that elevates any winter ensemble.",
    details: ["100% fine Italian virgin wool","Tailored fit with structured shoulders","Fully lined in 100% cupro silk","Double-breasted button closure with horn buttons","Professional dry clean only","Crafted in Milan, Italy"],
    sizes: ["XS","S","M","L","XL"],
  },
  {
    id: "h2",
    slug: "camel-cashmere-turtleneck",
    name: "Camel Cashmere Turtleneck",
    category: "Knitwear",
    price: 485,
    
    image: "/images/products/hero-product-2.webp",
    images: ["/images/products/hero-product-2.webp"],
    altText: "Camel cashmere turtleneck sweater folded on marble surface",
    
    
    description: "Indulgently soft and exceptionally warm, this turtleneck is knitted from 100% grade-A Mongolian cashmere. Its classic rib-knit details and relaxed fit offer effortless luxury for cold-weather layering.",
    details: ["100% pure Mongolian cashmere","12-gauge knit for a dense, soft feel","Ribbed collar, cuffs, and hem","Naturally insulating and breathable","Dry clean or delicate hand wash cold","Spun in Scotland"],
    sizes: ["XS","S","M","L","XL"],
  },
  {
    id: "h3",
    slug: "ecru-linen-blazer",
    name: "Ecru Linen Blazer",
    category: "Outerwear",
    price: 890,
    badge: "Limited",
    image: "/images/products/hero-product-3.webp",
    images: ["/images/products/hero-product-3.webp"],
    altText: "Ecru linen blazer on ghost mannequin with side lighting",
    
    
    description: "Lightweight and unstructured, this ecru blazer is woven from premium French flax linen. Ideal for warm climates, it combines casual elegance with structured lapels and clean pocket detailing.",
    details: ["100% premium French flax linen","Unstructured, breathable build","Two-button closure with mother-of-pearl buttons","Dual vent back for comfort and mobility","Dry clean recommended","Tailored in Portugal"],
    sizes: ["XS","S","M","L","XL"],
  },
  {
    id: "h4",
    slug: "charcoal-wide-leg-trousers",
    name: "Charcoal Wide-Leg Trousers",
    category: "Trousers",
    price: 395,
    
    image: "/images/products/hero-product-4.webp",
    images: ["/images/products/hero-product-4.webp"],
    altText: "Charcoal wide-leg tailored trousers styled with white shirt",
    
    
    description: "Tailored to sit high on the waist, these trousers feature structured pleats and a flowing wide-leg cut. Made from mid-weight wool crepe, they offer comfort, fluidity, and timeless styling versatility.",
    details: ["100% wool crepe","High-rise fit with front pleats","Concealed zip fly with hook-and-eye closure","Side slip pockets and back welt pockets","Dry clean only","Crafted in Japan"],
    sizes: ["XS","S","M","L","XL"],
  },
  {
    id: "h5",
    slug: "champagne-silk-slip-dress",
    name: "Champagne Silk Slip Dress",
    category: "Dresses",
    price: 720,
    badge: "New",
    image: "/images/products/hero-product-5.webp",
    images: ["/images/products/hero-product-5.webp"],
    altText: "Champagne gold silk slip dress hanging on brass rail",
    
    
    description: "A liquid-like drape crafted from heavyweight 19mm mulberry silk. Cut on the bias to hug contours gracefully, this slip dress features a refined V-neckline and adjustable spaghetti straps for a perfect fit.",
    details: ["100% 19mm Mulberry Silk","Fluid bias-cut silhouette","Adjustable crossover back straps","Midi length with subtle side slit","Dry clean or hand wash in cold water","Made in France"],
    sizes: ["XS","S","M","L","XL"],
  }
];

export const featuredProducts: Product[] = [
  {
    id: "f1",
    slug: "ivory-wool-overcoat",
    name: "Ivory Wool Overcoat",
    category: "Outerwear",
    price: 1290,
    badge: "New",
    image: "/images/products/hero-product-1.webp",
    images: ["/images/products/hero-product-1.webp"],
    altText: "Ivory cream wool overcoat",
    span: "lg:col-span-2",
    aspectRatio: "aspect-[3/4]",
    description: "An elegant, double-breasted overcoat tailored from premium Italian virgin wool. Designed with a structured drape, classic notch lapels, and a belted waist for a sophisticated silhouette that elevates any winter ensemble.",
    details: ["100% fine Italian virgin wool","Tailored fit with structured shoulders","Fully lined in 100% cupro silk","Double-breasted button closure with horn buttons","Professional dry clean only","Crafted in Milan, Italy"],
    sizes: ["XS","S","M","L","XL"],
  },
  {
    id: "f2",
    slug: "ecru-linen-blazer",
    name: "Ecru Linen Blazer",
    category: "Outerwear",
    price: 890,
    badge: "Limited",
    image: "/images/products/hero-product-3.webp",
    images: ["/images/products/hero-product-3.webp"],
    altText: "Ecru linen blazer",
    span: "lg:col-span-1",
    aspectRatio: "aspect-square",
    description: "Lightweight and unstructured, this ecru blazer is woven from premium French flax linen. Ideal for warm climates, it combines casual elegance with structured lapels and clean pocket detailing.",
    details: ["100% premium French flax linen","Unstructured, breathable build","Two-button closure with mother-of-pearl buttons","Dual vent back for comfort and mobility","Dry clean recommended","Tailored in Portugal"],
    sizes: ["XS","S","M","L","XL"],
  },
  {
    id: "f3",
    slug: "champagne-silk-slip-dress",
    name: "Champagne Silk Slip Dress",
    category: "Dresses",
    price: 720,
    badge: "New",
    image: "/images/products/hero-product-5.webp",
    images: ["/images/products/hero-product-5.webp"],
    altText: "Champagne silk slip dress",
    span: "lg:col-span-2",
    aspectRatio: "aspect-[3/4]",
    description: "A liquid-like drape crafted from heavyweight 19mm mulberry silk. Cut on the bias to hug contours gracefully, this slip dress features a refined V-neckline and adjustable spaghetti straps for a perfect fit.",
    details: ["100% 19mm Mulberry Silk","Fluid bias-cut silhouette","Adjustable crossover back straps","Midi length with subtle side slit","Dry clean or hand wash in cold water","Made in France"],
    sizes: ["XS","S","M","L","XL"],
  }
];

export const allProducts: Product[] = [
  {
    id: "p6",
    slug: "camel-wrap-coat",
    name: "Camel Wrap Coat",
    category: "Outerwear",
    price: 1150,
    
    image: "/images/products/camel-wrap-coat.webp",
    images: ["/images/products/camel-wrap-coat.webp"],
    altText: "Camel wrap coat",
    
    
    description: "A signature wrap coat crafted from pure camel hair. Unlined and finished with hand-stitched details, this piece features a self-tie belt, generous lapels, and deep patch pockets for unmatched style and warmth.",
    details: ["100% luxury camel hair","Hand-stitched edge detailing","Belted wrap design with relaxed shoulder silhouette","Large functional patch pockets","Dry clean only","Made in Italy"],
    sizes: ["XS","S","M","L","XL"],
  },
  {
    id: "p7",
    slug: "ebony-wool-overcoat",
    name: "Ebony Wool Overcoat",
    category: "Outerwear",
    price: 1390,
    badge: "Limited",
    image: "/images/products/ebony-wool-overcoat.webp",
    images: ["/images/products/ebony-wool-overcoat.webp"],
    altText: "Ebony wool overcoat with peak lapels",
    
    
    description: "A sharp, tailored overcoat crafted from heavy felted wool. It features dramatic peak lapels, a double-breasted closure, and deep ebony tones, offering a strong structure and superior protection against elements.",
    details: ["100% heavyweight felted wool","Structured peak lapels","Polished horn buttons","Internal chest pockets for security","Dry clean only","Made in London"],
    sizes: ["XS","S","M","L","XL"],
  },
  {
    id: "p8",
    slug: "silk-scarf-amber",
    name: "Silk Scarf in Amber",
    category: "Accessories",
    price: 195,
    
    image: "/images/products/silk-scarf-amber.webp",
    images: ["/images/products/silk-scarf-amber.webp"],
    altText: "Silk scarf in amber gold",
    
    
    description: "A luxurious square scarf rendered in deep amber hues. Made from lightweight silk twill, it is hand-rolled and finished with an artistic abstract print, making it the perfect refined accent for any neck, hair, or handbag.",
    details: ["100% silk twill","Hand-rolled edges","Exquisite abstract print design","90cm x 90cm square size","Dry clean or hand wash cold","Made in Lyon, France"],
    sizes: ["One Size"],
  },
  {
    id: "p9",
    slug: "charcoal-merino-crewneck",
    name: "Charcoal Merino Crewneck",
    category: "Knitwear",
    price: 325,
    
    image: "/images/products/charcoal-merino-crewneck.webp",
    images: ["/images/products/charcoal-merino-crewneck.webp"],
    altText: "Charcoal merino wool crewneck sweater",
    
    
    description: "Knitted from fine Australian merino wool, this crewneck is soft, lightweight, and insulating. Featuring a tailored fit and classic neck line, it's a versatile building block for modular modern wardrobes.",
    details: ["100% Australian merino wool","Extrafine 18-gauge knit structure","Tailored fit with ribbed cuffs and hem","Naturally moisture-wicking and breathable","Hand wash cold, dry flat","Crafted in Japan"],
    sizes: ["XS","S","M","L","XL"],
  },
  {
    id: "p10",
    slug: "black-tailored-trousers",
    name: "Black Tailored Trousers",
    category: "Trousers",
    price: 450,
    
    image: "/images/products/black-tailored-trousers.webp",
    images: [
      "/images/products/black-tailored-trousers.webp",
      "/images/products/black-tailored-trousers-2.webp"
    ],

    altText: "Black tailored dress trousers",
    
    
    description: "Crafted from a fine wool and silk blend, these trousers offer a sharp crease, slim-straight leg, and clean waistband details. A foundational piece designed for longevity and timeless appeal.",

    details: ["85% wool, 15% silk blend","Mid-rise with structured waist bands","Pressed crease along front and back","Concealed button and zip closure","Dry clean only","Crafted in Italy"],
    sizes: ["XS","S","M","L","XL"],
  },
  {
    id: "p11",
    slug: "emerald-velvet-midi-dress",
    name: "Emerald Velvet Midi Dress",
    category: "Dresses",
    price: 890,
    badge: "New",
    image: "/images/products/emerald-velvet-midi-dress.webp",
    images: ["/images/products/emerald-velvet-midi-dress.webp"],
    altText: "Emerald green velvet midi dress",
    
    
    description: "Capturing a deep, luminous green, this midi dress is crafted from rich silk velvet. It is shaped with long sleeves, a mock neck, and a delicate tie back, creating an elegant and striking evening statement.",
    details: ["80% viscose, 20% silk velvet","Mock neck with back ribbon closure","Discreet side zipper","Slightly structured puff sleeve detail","Dry clean only","Made in France"],
    sizes: ["XS","S","M","L","XL"],
  },
  {
    id: "p12",
    slug: "leather-belt-oak",
    name: "Leather Belt in Oak",
    category: "Accessories",
    price: 240,
    
    image: "/images/products/leather-belt-oak.webp",
    images: ["/images/products/leather-belt-oak.webp"],
    altText: "Oak brown leather belt with brass buckle",
    
    
    description: "A solid, vegetable-tanned full-grain leather belt in deep oak brown. Finished with a hand-burnished edge and a solid brass buckle, it is designed to age beautifully and develop a rich, personal patina over time.",
    details: ["100% full-grain vegetable-tanned leather","Solid brass buckle detail","3cm width, versatile for loop fits","Hand-painted and burnished edges","Wipe clean with dry cloth, leather conditioner safe","Crafted in England"],
    sizes: ["80","85","90","95","100"],
  },
  {
    id: "p13",
    slug: "navy-wool-peacoat",
    name: "Navy Wool Peacoat",
    category: "Outerwear",
    price: 980,
    
    image: "/images/products/navy-wool-peacoat.webp",
    images: ["/images/products/navy-wool-peacoat.webp"],
    altText: "Navy blue wool peacoat",
    
    
    description: "A nautical classic reinterpreted. Made from robust Melton wool, this double-breasted peacoat features wide lapels, anchor-engraved buttons, and warm moleskin-lined pockets for ultimate comfort.",
    details: ["100% heavy Melton wool","Double-breasted front with anchor-engraved buttons","Warm moleskin pocket lining","Tailored fit with structural cuffs","Dry clean only","Made in Japan"],
    sizes: ["XS","S","M","L","XL"],
  },
  {
    id: "p14",
    slug: "ivory-cashmere-cardigan",
    name: "Ivory Cashmere Cardigan",
    category: "Knitwear",
    price: 520,
    badge: "New",
    image: "/images/products/ivory-cashmere-cardigan.webp",
    images: ["/images/products/ivory-cashmere-cardigan.webp"],
    altText: "Ivory cashmere cardigan",
    
    
    description: "A soft, cocooning cardigan knitted from organic Mongolian cashmere. Designed with an oversized fit, low V-neckline, and horn buttons, it provides a warm layer of relaxed sophistication.",
    details: ["100% pure organic cashmere","Heavy rib knit with V-neck construction","Large mock-horn button front closure","Relaxed drop-shoulder silhouette","Dry clean or hand wash cold","Crafted in Scotland"],
    sizes: ["XS","S","M","L","XL"],
  },
  {
    id: "p15",
    slug: "ivory-mock-neck-jumpsuit",
    name: "Ivory Mock-Neck Jumpsuit",
    category: "Dresses",
    price: 950,
    badge: "New",
    image: "/images/products/ivory-mock-neck-jumpsuit.webp",
    images: ["/images/products/ivory-mock-neck-jumpsuit.webp"],
    altText: "Ivory mock-neck sleeveless crepe jumpsuit",
    
    
    description: "A striking sleeveless jumpsuit tailored from heavy double-weave crepe. Featuring a refined mock neck, structured waist panel, and a flowing wide-leg silhouette that moves with effortless grace.",
    details: ["82% triacetate, 18% polyester double crepe","Sleeveless mock-neck silhouette","Concealed zip closure at the back","Side slip pockets","Dry clean only","Crafted in Milan, Italy"],
    sizes: ["XS","S","M","L","XL"],
  },
  {
    id: "p16",
    slug: "camel-knit-cardigan",
    name: "Camel Knit Cardigan",
    category: "Knitwear",
    price: 580,
    badge: "New",
    image: "/images/products/camel-knit-cardigan.webp",
    images: ["/images/products/camel-knit-cardigan.webp"],
    altText: "Camel knit cardigan with horn buttons",
    
    
    description: "A timeless cardigan sweater spun from pure, mid-weight camel hair. It features structured ribbing details, horn buttons, and a relaxed drop-shoulder shape for cozy winter styling.",
    details: ["100% fine camel hair","Mock-horn front buttons","Rib-knit cuffs, hem, and pocket openings","Two front patch pockets","Dry clean only","Crafted in Scotland"],
    sizes: ["XS","S","M","L","XL"],
  },
  {
    id: "p17",
    slug: "charcoal-belted-overcoat",
    name: "Charcoal Belted Overcoat",
    category: "Outerwear",
    price: 1450,
    badge: "New",
    image: "/images/products/charcoal-belted-overcoat.webp",
    images: ["/images/products/charcoal-belted-overcoat.webp"],
    altText: "Charcoal grey belted wool overcoat",
    
    
    description: "An elegant double-breasted overcoat tailored from textured charcoal Melton wool. Styled with structured shoulders, wide notch lapels, and a removable fabric self-tie belt.",
    details: ["85% virgin wool, 15% cashmere blend","Removable self-tie waist belt","Double-breasted front with matching buttons","Fully lined in premium cupro","Professional dry clean only","Tailored in Milan, Italy"],
    sizes: ["XS","S","M","L","XL"],
  },
  {
    id: "p18",
    slug: "structured-black-blazer",
    name: "Structured Black Blazer",
    category: "Outerwear",
    price: 890,
    badge: "Limited",
    image: "/images/products/structured-black-blazer.webp",
    images: ["/images/products/structured-black-blazer.webp"],
    altText: "Structured black tailored blazer",
    
    
    description: "A sharply tailored blazer with satin peak lapels. Constructed with structured shoulders and a single button closure, this piece offers a sleek evening silhouette.",
    details: ["100% wool crepe with satin silk details","Single-button front closure","Structured padded shoulders","Dual back vents","Dry clean only","Crafted in Milan, Italy"],
    sizes: ["XS","S","M","L","XL"],
  }
];
