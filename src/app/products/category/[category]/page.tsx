import { notFound } from "next/navigation";
import { CategoryProductsPage } from "@/components/product/listing/CategoryProductsPage";

export const dynamic = 'force-dynamic';

const categoryMap: Record<string, string> = {
  outerwear: "Outerwear",
  knitwear: "Knitwear",
  trousers: "Trousers",
  dresses: "Dresses",
  accessories: "Accessories",
};

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
