import { notFound } from "next/navigation";
import { heroProducts, allProducts } from "@/data/products";
import { ProductDetailContainer } from "@/components/product/ProductDetailContainer";

export async function generateStaticParams() {
  const all = [...heroProducts, ...allProducts];
  // Filter duplicates
  const slugs = Array.from(new Set(all.map((p) => p.slug)));
  return slugs.map((slug) => ({
    slug,
  }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const all = [...heroProducts, ...allProducts];
  const product = all.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  return (
    <main id="main-content" tabIndex={-1}>
      <ProductDetailContainer product={product} />
    </main>
  );
}
