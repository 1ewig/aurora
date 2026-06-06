import { EyebrowLabel } from "@/components/ui/EyebrowLabel";

interface PageHeaderProps {
  category: string;
}

export function PageHeader({ category }: PageHeaderProps) {
  return (
    <div>
      <EyebrowLabel>Atelier Catalog</EyebrowLabel>
      <h1
        id="products-heading"
        className="font-sans font-black leading-tight tracking-[-0.02em] mt-4 text-text-primary uppercase"
        style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
      >
        {category === "All" ? "Shop All" : category}
        <br />
        Pieces.
      </h1>
    </div>
  );
}
