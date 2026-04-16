import { OwnedCard } from "@/database";
import type { OwnedCardViewModel } from "@/database/ownedCard.model";
import connectDB from "@/lib/mongodb";
import { NextResponse } from "next/server";

type OwnedCardRarity = NonNullable<OwnedCardViewModel["card"]>["rarity"];
type PopulatedOwnedCard = OwnedCardViewModel & {
  card: NonNullable<OwnedCardViewModel["card"]>;
};

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

function toOwnedCardViewModel(
  ownedCard: PopulatedOwnedCard,
): OwnedCardViewModel {
  return {
    cardId: ownedCard.cardId,
    card: {
      id: ownedCard.card.id,
      name: ownedCard.card.name,
      number: ownedCard.card.number,
      regulationMark: ownedCard.card.regulationMark,
      rarity: toRarity(ownedCard.card.rarity),
      types: ownedCard.card.types,
      images: ownedCard.card.images,
      set: {
        name: ownedCard.card.set?.name ?? "Unknown Set",
      },
    },
    condition: "Near Mint",
    quantity: ownedCard.quantity,
  };
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
      .lean<PopulatedOwnedCard[]>();

    const response: OwnedCardViewModel[] = ownedCards
      .filter((ownedCard) => ownedCard.card)
      .map((ownedCard) => toOwnedCardViewModel(ownedCard));

    return NextResponse.json(response, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "An error occurred while fetching owned cards" },
      { status: 500 },
    );
  }
}
