import { MetadataRoute } from "next";

/** Dynamically generates robots.txt crawler instructions. */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aurora-nu-three.vercel.app";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/profile/", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
