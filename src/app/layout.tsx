/**
 * Aurora — src/app/layout.tsx
 *
 * Root layout loading global fonts, metadata, viewport, and provider wrappers.
 */

import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Providers from "@/app/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

/** Application-level metadata for SEO and social sharing. */
export const metadata: Metadata = {
  title: "Aurora — Premium Clothing",
  description:
    "Singular pieces for the considered wardrobe. Designed in solitude. Worn with intention.",
  openGraph: {
    title: "Aurora — Premium Clothing",
    description:
      "Singular pieces for the considered wardrobe. Designed in solitude. Worn with intention.",
    type: "website",
  },
};

/** Application viewport configuration for responsive rendering. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

/** Root layout wrapping all pages with fonts, providers, and base HTML structure. */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfairDisplay.variable}`}
    >
      <body className="bg-bg-primary min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
