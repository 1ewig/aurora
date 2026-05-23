export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  location: string;
  source: string;
  initials: string;
  color: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    quote:
      "Aurora pieces feel like wearing a deliberate thought. Nothing else compares to this quality. Each garment feels like it was made precisely for you.",
    name: "Maja H.",
    location: "Berlin",
    source: "verified-customer",
    initials: "MH",
    color: "#C8A882",
  },
  {
    id: "t2",
    quote:
      "I've worn luxury brands my entire life. Aurora is something different — there's an intentionality in every seam that you simply don't find elsewhere.",
    name: "Yuki T.",
    location: "Tokyo",
    source: "verified-customer",
    initials: "YT",
    color: "#6B6B6B",
  },
  {
    id: "t3",
    quote:
      "The Ivory Overcoat stopped conversations in Paris. Three weeks later, I still receive messages asking where it's from. My answer is always the same: Aurora.",
    name: "Erik S.",
    location: "Stockholm",
    source: "verified-customer",
    initials: "ES",
    color: "#0D0D0D",
  },
  {
    id: "t4",
    quote:
      "Wearing Aurora is a private luxury. The craftsmanship is visible only to those who know where to look. That is exactly the point.",
    name: "Leila A.",
    location: "Dubai",
    source: "verified-customer",
    initials: "LA",
    color: "#4A7C59",
  },
];
