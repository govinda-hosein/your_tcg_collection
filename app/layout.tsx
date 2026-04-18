import "./globals.css";

import { Bowlby_One, Outfit } from "next/font/google";

import type { Metadata } from "next";
import { Providers } from "./providers";

const outfit = Outfit({
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

const bowlbyOne = Bowlby_One({
  variable: "--font-bowlby",
  weight: "400",
  subsets: ["latin"],
});

const siteTitle = process.env.NEXT_PUBLIC_SITE_TITLE || "Your TCG Collection";
const siteDescription =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
  "Track and explore your trading card collection";
const siteOrigin = (
  process.env.NEXT_PUBLIC_BASE_URL || "https://sarikas-bulk-cards.netlify.app"
).replace(/\/$/, "");
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");
const sitePath = basePath || "/";
const openGraphImagePath = `${basePath}/opengraph-image`;

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: siteTitle,
  description: siteDescription,
  alternates: {
    canonical: sitePath,
  },
  openGraph: {
    type: "website",
    url: sitePath,
    title: siteTitle,
    description: siteDescription,
    siteName: siteTitle,
    images: [
      {
        url: openGraphImagePath,
        width: 1200,
        height: 630,
        alt: siteTitle,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [openGraphImagePath],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${bowlbyOne.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
