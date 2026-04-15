import { OwnedCard } from "@/database";
import type { OwnedCardViewModel } from "@/database/ownedCard.model";
import connectDB from "@/lib/mongodb";
import { NextResponse } from "next/server";

type OwnedCardRarity = NonNullable<OwnedCardViewModel["card"]>["rarity"];

const VALID_RARITIES: OwnedCardRarity[] = [
  "Common",
  "Uncommon",
  "Rare",
  "Holo Rare",
  "Ultra Rare",
  "Secret Rare",
];

function toRarity(value?: string): OwnedCardRarity {
  return VALID_RARITIES.includes(value as OwnedCardRarity)
    ? (value as OwnedCardRarity)
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
      .lean<OwnedCardViewModel[]>();

    const response: OwnedCardViewModel[] = ownedCards
      .filter((ownedCard) => ownedCard.card)
      .map((ownedCard) => {
        const card = ownedCard.card!;

        return {
          cardId: ownedCard.cardId,
          card: {
            id: card.id,
            name: card.name,
            number: card.number,
            regulationMark: card.regulationMark,
            rarity: toRarity(card.rarity),
            types: card.types,
            images: card.images,
            set: {
              name: card.set?.name ?? "Unknown Set",
            },
          },
          condition: "Near Mint",
          quantity: ownedCard.quantity,
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
