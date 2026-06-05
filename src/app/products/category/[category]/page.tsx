import { notFound } from "next/navigation";
import { heroProducts, allProducts } from "@/data/products";
import { CategoryCatalog } from "@/components/product/CategoryCatalog";

const categoryMap: Record<string, string> = {
  outerwear: "Outerwear",
  knitwear: "Knitwear",
  trousers: "Trousers",
  dresses: "Dresses",
  accessories: "Accessories",
};

export async function generateStaticParams() {
  return [
    { category: "outerwear" },
    { category: "knitwear" },
    { category: "trousers" },
    { category: "dresses" },
    { category: "accessories" },
  ];
}

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const categoryName = categoryMap[categorySlug];

  if (!categoryName) {
    notFound();
  }

  // Combine unique products
  const combinedProducts = [...heroProducts, ...allProducts];
  const filtered = combinedProducts.filter((p) => p.category === categoryName);

  return (
    <CategoryCatalog
      categorySlug={categorySlug}
      categoryName={categoryName}
      filteredProducts={filtered}
    />
  );
}
