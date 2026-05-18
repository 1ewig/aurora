export interface NavLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: NavLink[];
}

export const navLinks: NavLink[] = [
  { label: "Collections", href: "#collection" },
  { label: "Lookbook", href: "#lookbook" },
  { label: "Story", href: "#story" },
  { label: "About", href: "#story" },
  { label: "Contact", href: "#newsletter" },
];

export const footerNav: FooterColumn[] = [
  {
    title: "Shop",
    links: [
      { label: "Outerwear", href: "#all-products" },
      { label: "Knitwear", href: "#all-products" },
      { label: "Trousers", href: "#all-products" },
      { label: "Dresses", href: "#all-products" },
      { label: "Accessories", href: "#all-products" },
    ],
  },
  {
    title: "Aurora",
    links: [
      { label: "Our Story", href: "#story" },
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
      { label: "Contact Us", href: "#newsletter" },
    ],
  },
];
