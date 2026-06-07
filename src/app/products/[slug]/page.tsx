import { notFound } from "next/navigation";
import { pool } from "@/utils/db";
import { Breadcrumbs } from "@/components/product/detail/Breadcrumbs";
import { ImageGallery } from "@/components/product/detail/ImageGallery";
import { ProductInfo } from "@/components/product/detail/ProductInfo";
import { ProductActions } from "@/components/product/detail/ProductActions";
import { ProductDetailsTabs } from "@/components/product/detail/ProductDetailsTabs";
import { RelatedProducts } from "@/components/product/detail/RelatedProducts";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  try {
    const result = await pool.query('SELECT * FROM products WHERE slug = $1', [slug]);
    const row = result.rows[0];

    if (!row) {
      notFound();
    }

    const product = {
      id: row.id,
      slug: row.slug,
      name: row.name,
      category: row.category,
      price: Number(row.price),
      badge: row.badge,
      image: row.image,
      images: row.images,
      altText: row.alt_text,
      span: row.span,
      aspectRatio: row.aspect_ratio,
      description: row.description,
      details: row.details,
      sizes: row.sizes,
    };

    return (
      <main id="main-content" tabIndex={-1} className="pt-24 pb-16 px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto">
        {/* Breadcrumbs */}
        <Breadcrumbs category={product.category} />

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left Side - Image Gallery */}
          <div className="lg:col-span-5">
            <ImageGallery images={product.images} altText={product.altText} />
          </div>

          {/* Right Side - Info & Purchasing */}
          <div className="lg:col-span-7 space-y-8 lg:sticky lg:top-24">
            <ProductInfo product={product} />
            <ProductActions product={product} />
            <ProductDetailsTabs product={product} />
          </div>
        </div>

        {/* Related Products Grid */}
        <RelatedProducts product={product} />
      </main>
    );
  } catch (error) {
    console.error("Failed to load product page details:", error);
    notFound();
  }
}
