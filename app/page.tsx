import HomePageClient from "@/components/HomePageClient";
import { OwnedCard } from "@/database";
import type { OwnedCardViewModel } from "@/database/ownedCard.model";
import connectDB from "@/lib/mongodb";
import type { Metadata } from "next";

type SearchParams = {
  search?: string | string[];
  rarity?: string | string[];
};

type PopulatedOwnedCard = OwnedCardViewModel & {
  card: NonNullable<OwnedCardViewModel["card"]>;
};

const siteTitle = process.env.NEXT_PUBLIC_SITE_TITLE || "Your TCG Collection";
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");
const fallbackOgImagePath = `${basePath}/opengraph-image`;

function firstValue(value?: string | string[]): string {
  if (Array.isArray(value)) return value[0]?.trim() ?? "";
  return value?.trim() ?? "";
}

function matchesSearch(card: OwnedCardViewModel, query: string) {
  if (!query) return true;
  const q = query.toLowerCase();
  const cardName = card.card?.name?.toLowerCase() ?? "";
  const setName = card.card?.set?.name?.toLowerCase() ?? "";
  return cardName.includes(q) || setName.includes(q);
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  const search = firstValue(params.search);
  const rarity = firstValue(params.rarity);

  if (!search) {
    return {
      openGraph: {
        images: [
          {
            url: fallbackOgImagePath,
            width: 1200,
            height: 630,
            alt: siteTitle,
          },
        ],
      },
      twitter: {
        images: [fallbackOgImagePath],
      },
    };
  }

  try {
    await connectDB();

    const ownedCards = await OwnedCard.find()
      .populate({
        path: "card",
        populate: {
          path: "set",
          select: "name",
        },
      })
      .lean<PopulatedOwnedCard[]>();

    const firstMatch = ownedCards
      .filter((ownedCard) => ownedCard.card)
      .filter((ownedCard) =>
        rarity
          ? ownedCard.card.rarity?.toLowerCase() === rarity.toLowerCase()
          : true,
      )
      .sort((a, b) => (a.card?.name ?? "").localeCompare(b.card?.name ?? ""))
      .find((ownedCard) => matchesSearch(ownedCard, search));

    const previewImage =
      firstMatch?.card?.images?.large || firstMatch?.card?.images?.small;

    if (!previewImage) {
      return {
        openGraph: {
          images: [
            {
              url: fallbackOgImagePath,
              width: 1200,
              height: 630,
              alt: siteTitle,
            },
          ],
        },
        twitter: {
          images: [fallbackOgImagePath],
        },
      };
    }

    const alt = firstMatch?.card?.name
      ? `${firstMatch.card.name} search preview`
      : siteTitle;

    return {
      openGraph: {
        images: [
          {
            url: previewImage,
            width: 1200,
            height: 630,
            alt,
          },
        ],
      },
      twitter: {
        images: [previewImage],
      },
    };
  } catch {
    return {
      openGraph: {
        images: [
          {
            url: fallbackOgImagePath,
            width: 1200,
            height: 630,
            alt: siteTitle,
          },
        ],
      },
      twitter: {
        images: [fallbackOgImagePath],
      },
    };
  }
}

export default function HomePage() {
  return <HomePageClient />;
}
