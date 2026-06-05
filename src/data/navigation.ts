export interface NavLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: NavLink[];
}

export const navLinks: NavLink[] = [
  { label: "Shop All", href: "/products" },
  { label: "Collections", href: "/#collection" },
  { label: "Lookbook", href: "/#lookbook" },
  { label: "Story", href: "/#story" },
  { label: "Contact", href: "/#newsletter" },
];

export const footerNav: FooterColumn[] = [
  {
    title: "Shop",
    links: [
      { label: "All Pieces", href: "/products" },
      { label: "Outerwear", href: "/products" },
      { label: "Knitwear", href: "/products" },
      { label: "Trousers", href: "/products" },
      { label: "Dresses", href: "/products" },
      { label: "Accessories", href: "/products" },
    ],
  },
  {
    title: "Aurora",
    links: [
      { label: "Our Story", href: "/#story" },
      { label: "Press", href: "#" },
      { label: "Sustainability", href: "#" },
      { label: "Careers", href: "#" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Shipping & Returns", href: "#" },
      { label: "Size Guide", href: "#" },
      { label: "Care Instructions", href: "#" },
      { label: "Contact Us", href: "/#newsletter" },
    ],
  },
];
