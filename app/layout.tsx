import "./globals.css";

import { Bowlby_One, Outfit } from "next/font/google";

import type { Metadata } from "next";

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

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_SITE_TITLE || "Your TCG Collection",
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    "Track and explore your trading card collection",
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
