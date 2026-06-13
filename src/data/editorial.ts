export interface EditorialItem {
  id: string;
  originalImage: string;
  imageUrl: string;
  altText: string;
  title: string;
  description?: string;
}

export const editorialItems: EditorialItem[] = [
  {
    id: "designer",
    originalImage: "/images/editorial/designer.webp",
    imageUrl: "",
    altText: "Creative director sketching designs in studio",
    title: "The Conviction",
    description: "Elena Voss founded Aurora on a simple yet profound premise: every design decision has a ripple effect. We believe that true luxury isn't about excess or ostentation. It is found in precision, in solitude, and in the choices made before a garment ever reaches the atelier floor."
  },
  {
    id: "loom",
    originalImage: "/images/editorial/loom.webp",
    imageUrl: "",
    altText: "Wool loom detail",
    title: "Historic Mills",
    description: "A garment is only as good as the fibers it's made from. We work exclusively with generational family-owned mills in Biella, Italy for our virgin wool blends."
  },
  {
    id: "folding",
    originalImage: "/images/editorial/folding.webp",
    imageUrl: "",
    altText: "Cashmere folding",
    title: "Heritage Spinning",
    description: "Partnering with heritage spinning ateliers in Scotland for Mongolian cashmere to ensure natural resiliency, drape, and warmth."
  }
];
