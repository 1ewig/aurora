/**
 * Aurora — src/app/(store)/products/[slug]/page.tsx
 *
 * Individual product detail page with dynamic metadata from the database.
 */

import { pool } from "@/utils/db";
import { ProductDetailClient } from "@/components/product/detail/ProductDetailClient";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Generate dynamic metadata based on the product slug. */
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  try {
    const result = await pool.query(
      "SELECT name, description, image, category FROM products WHERE slug = $1",
      [slug]
    );
    const product = result.rows[0];
    if (!product) {
      return {};
    }
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aurora-nu-three.vercel.app";
    const title = `${product.name} | Aurora`;
    
    return {
      title,
      description: product.description,
      openGraph: {
        title,
        description: product.description,
        type: "website",
        url: `${baseUrl}/products/${slug}`,
        images: [
          {
            url: product.image,
            alt: product.name,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description: product.description,
        images: [product.image],
      },
    };
  } catch (error) {
    console.error("Failed to generate metadata:", error);
    return {};
  }
}

/** Product detail page for a single product identified by slug. */
export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  // Fetch product variables to build JSON-LD schema on the server
  let jsonLd = null;
  try {
    const result = await pool.query(
      "SELECT name, description, price, image FROM products WHERE slug = $1",
      [slug]
    );
    const product = result.rows[0];
    if (product) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aurora-nu-three.vercel.app";
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": product.image,
        "description": product.description,
        "offers": {
          "@type": "Offer",
          "price": product.price,
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "url": `${baseUrl}/products/${slug}`,
        },
      };
    }
  } catch (err) {
    console.error("Failed to query product for JSON-LD:", err);
  }

  // Prevent script injection inside script tag (XSS mitigation)
  const jsonLdString = jsonLd ? JSON.stringify(jsonLd).replace(/</g, "\\u003c") : null;

  return (
    <>
      {jsonLdString && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString }}
        />
      )}
      <ProductDetailClient slug={slug} />
    </>
  );
}
