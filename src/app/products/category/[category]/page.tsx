import { notFound } from "next/navigation";
import { CategoryProductsPage } from "./CategoryProductsPage";

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

  return <CategoryProductsPage categoryName={categoryName} />;
}
