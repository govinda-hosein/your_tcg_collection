import { OwnedCard } from "@/database";
import type { OwnedCardViewModel } from "@/database/ownedCard.model";
import connectDB from "@/lib/mongodb";
import { NextResponse } from "next/server";

type PopulatedOwnedCardRecord = {
  quantity: number;
  card?: {
    id: string;
    name: string;
    number: string;
    regulationMark: string;
    rarity?: string;
    types?: string[];
    images?: {
      small: string;
      large: string;
    };
    set?: {
      name?: string;
    };
  };
};

const VALID_RARITIES: OwnedCardViewModel["rarity"][] = [
  "Common",
  "Uncommon",
  "Rare",
  "Holo Rare",
  "Ultra Rare",
  "Secret Rare",
];

function toRarity(value?: string): OwnedCardViewModel["rarity"] {
  return VALID_RARITIES.includes(value as OwnedCardViewModel["rarity"])
    ? (value as OwnedCardViewModel["rarity"])
    : "Rare";
}

export async function GET() {
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
      .lean<PopulatedOwnedCardRecord[]>();

    const response: OwnedCardViewModel[] = ownedCards
      .filter((ownedCard) => ownedCard.card)
      .map((ownedCard) => {
        const card = ownedCard.card!;

        return {
          id: card.id,
          name: card.name,
          set: card.set?.name ?? "Unknown Set",
          number: card.number,
          regulationMark: card.regulationMark,
          rarity: toRarity(card.rarity),
          condition: "Near Mint",
          quantity: ownedCard.quantity,
          images: card.images,
          type: card.types?.[0],
        };
      });

    return NextResponse.json(response, { status: 200 });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: "An error occurred while fetching owned cards" },
      { status: 500 },
    );
  }
}
