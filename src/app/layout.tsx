/**
 * Aurora — src/app/layout.tsx
 *
 * Root layout wrapping every page in the application. Responsible for:
 *  1. Loading Google Fonts (Inter for body, Playfair Display for headings)
 *     via CSS custom property variables (--font-inter, --font-playfair).
 *  2. Exporting global metadata and viewport used as defaults by all child routes.
 *  3. Nesting providers: QueryClientProvider (React Query) → AuthInitializer
 *     (session hydration) → child pages.
 *  4. Injecting Vercel Analytics for web vitals tracking.
 *
 * Font variables are applied to <html> so Tailwind's @theme tokens can
 * reference them throughout the design system.
 */

import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Providers from "@/app/providers";
import { Analytics } from "@vercel/analytics/next";
import { AuthInitializer } from "@/components/auth/AuthInitializer";
import { Suspense } from "react";

// Load Inter as the primary body font, exposed via --font-inter CSS variable.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Load Playfair Display for editorial/serif headings, exposed via --font-playfair.
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

/** Application-level metadata for SEO and social sharing. */
export const metadata: Metadata = {
  title: {
    default: "Aurora — Premium Clothing",
    // %s is replaced by child page titles via generateMetadata or export metadata.
    template: "%s | Aurora",
  },
  description:
    "Singular pieces for the considered wardrobe. Designed in solitude. Worn with intention.",
  openGraph: {
    title: "Aurora — Premium Clothing",
    description:
      "Singular pieces for the considered wardrobe. Designed in solitude. Worn with intention.",
    type: "website",
    url: "https://aurora-nu-three.vercel.app",
    siteName: "Aurora",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aurora — Premium Clothing",
    description:
      "Singular pieces for the considered wardrobe. Designed in solitude. Worn with intention.",
  },
};

/** Application viewport configuration for responsive rendering. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

/**
 * Root layout. Renders the HTML shell with font CSS variables applied to <html>,
 * then nests providers in order: React Query → Suspense boundary → AuthInitializer.
 * The Suspense boundary prevents AuthInitializer's session fetch from blocking
 * the entire page tree during streaming.
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfairDisplay.variable}`}
    >
      <body className="bg-bg-primary min-h-screen antialiased">
        <Providers>
          {/* Suspense allows the auth check to stream without blocking SSR */}
          <Suspense fallback={null}>
            <AuthInitializer>
              {children}
            </AuthInitializer>
          </Suspense>
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
