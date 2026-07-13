/**
 * Aurora — src/data/materials.ts
 *
 * Fabric & Materials index page section showcasing high-end luxury textiles with macro close-ups.
 */

export interface MaterialItem {
  name: string;
  source: string;
  description: string;
  image: string;
  properties: string[];
}

export const materials: MaterialItem[] = [
  {
    name: "Italian Wool",
    source: "Biella, Italy",
    description: "Sourced from historic, solar-powered family mills, offering structural weight, natural resilience, and deep heat retention.",
    image: "/images/materials/wool-macro.webp",
    properties: ["100% Virgin Wool", "Naturally Repellent", "Zero Synthetics"],
  },
  {
    name: "Grade-A Cashmere",
    source: "Mongolian Highlands / Scottish Mills",
    description: "Combines raw Mongolian undercoat down with heritage Scottish spinning, achieving cloud-like softness and high thermal efficiency.",
    image: "/images/materials/cashmere-macro.webp",
    properties: ["Organic Spun", "12-Gauge Density", "Exceptionally Soft"],
  },
  {
    name: "Mulberry Silk",
    source: "Lyon, France",
    description: "Heavyweight 19mm mulberry silk cut on the bias to move fluidly like liquid. Reflects ambient light with a refined, deep luster.",
    image: "/images/materials/silk-macro.webp",
    properties: ["100% Mulberry Silk", "19 Momme Weight", "Bias-cut Fluidity"],
  },
];
