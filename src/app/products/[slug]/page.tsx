import { notFound } from "next/navigation";
import { heroProducts, allProducts } from "@/data/products";
import { ProductDetail } from "@/components/product/ProductDetail";
import { HydrationWrapper } from "@/app/hydration-wrapper";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/ui/CartDrawer";
import { ScrollProgress } from "@/components/ui/ScrollProgress";

export async function generateStaticParams() {
  const all = [...heroProducts, ...allProducts];
  // Filter duplicates (e.g. if a product is in both lists, though they have different IDs, their slugs might match)
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
    <HydrationWrapper>
      <ScrollProgress />
      <Navbar />
      <CartDrawer />
      <main id="main-content" tabIndex={-1} className="bg-bg-primary min-h-screen">
        <ProductDetail product={product} />
      </main>
      <Footer />
    </HydrationWrapper>
  );
}
