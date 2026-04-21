import type { Metadata } from "next";
import { Suspense } from "react";

import { decodeBasketParam } from "@/lib/basket";
import { BasketPageClient } from "./BasketPageClient";

type BasketPageProps = {
  searchParams: Promise<{
    basket?: string;
  }>;
};

const siteTitle = process.env.NEXT_PUBLIC_SITE_TITLE || "Your TCG Collection";
const siteOrigin = (
  process.env.NEXT_PUBLIC_BASE_URL || "https://sarikas-bulk-cards.netlify.app"
).replace(/\/$/, "");
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");

export async function generateMetadata({
  searchParams,
}: BasketPageProps): Promise<Metadata> {
  const params = await searchParams;
  const basketParam = params.basket;

  if (!basketParam) {
    return {
      title: `Basket | ${siteTitle}`,
      description: "Build and share your basket of cards.",
    };
  }

  const decoded = decodeBasketParam(basketParam);
  const distinctCards = decoded.length;
  const totalQuantity = decoded.reduce((sum, item) => sum + item.quantity, 0);
  const imageUrl = `${siteOrigin}${basePath}/api/basket-preview?basket=${encodeURIComponent(basketParam)}`;
  const title = `${distinctCards} card${distinctCards === 1 ? "" : "s"} in this shared basket`;
  const description = `Contains ${totalQuantity} total card${totalQuantity === 1 ? "" : "s"}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${basePath}/basket?basket=${encodeURIComponent(basketParam)}`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default function BasketPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <BasketPageClient />
    </Suspense>
  );
}
