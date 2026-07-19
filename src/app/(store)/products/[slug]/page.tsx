/**
 * Aurora — src/app/(store)/products/[slug]/page.tsx
 *
 * Product detail page (server component). Performs two DB queries on the
 * server:
 *  1. generateMetadata — fetches name, description, and image for SEO
 *     meta tags and Open Graph / Twitter card sharing.
 *  2. Page body — fetches pricing info to build a JSON-LD Product schema
 *     for rich search results, then delegates rendering to the client
 *     container (ProductDetailClient) which fetches the full product
 *     data via React Query.
 *
 * Both queries use LOWER() for case-insensitive slug matching and are
 * wrapped in try/catch so metadata failures degrade gracefully (empty
 * object) rather than throwing a 500.
 */

import { pool } from "@/utils/db";
import { ProductDetailClient } from "@/components/product/detail/ProductDetailClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Dynamic SEO metadata. Queries the product name/description/image so
 * social previews show the correct product regardless of share URL.
 * Falls back to empty metadata if the slug is invalid or the query fails.
 */
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  try {
    const result = await pool.query(
      "SELECT name, description, image, category FROM products WHERE LOWER(slug) = LOWER($1)",
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
    // Graceful degradation: if metadata query fails, return empty so
    // Next.js falls back to the root layout's defaults.
    console.error("Failed to generate metadata:", error);
    return {};
  }
}

/** Product detail page for a single product identified by slug. */
export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  /*
   * Build JSON-LD structured data for Google Rich Results.
   * Queried separately from generateMetadata for two reasons:
   *  1. generateMetadata should stay fast and focused on SEO.
   *  2. We need the price here which metadata doesn't fetch.
   *
   * The schema is serialized with </g escaping to prevent XSS via
   * dangerouslySetInnerHTML (see notes below).
   */
  let jsonLd = null;
  try {
    const result = await pool.query(
      "SELECT name, description, price, image FROM products WHERE LOWER(slug) = LOWER($1)",
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
    // JSON-LD failures are non-fatal — the page still renders fine
    // without rich results markup.
    console.error("Failed to query product for JSON-LD:", err);
  }

  /*
   * Sanitize the JSON string against XSS injection.
   * dangerouslySetInnerHTML will interpret </script> sequences as
   * closing the parent <script> tag. Replacing < with the Unicode
   * escape \u003c prevents this without breaking JSON.parse on
   * the consumer side (Google, Discord, etc. handle it correctly).
   */
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
