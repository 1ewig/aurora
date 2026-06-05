import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfairDisplay.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
