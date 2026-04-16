import { OwnedCard } from "@/database";
import type { OwnedCardViewModel } from "@/database/ownedCard.model";
import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

type PopulatedOwnedCard = OwnedCardViewModel & {
  card: NonNullable<OwnedCardViewModel["card"]>;
};

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
      rarity: ownedCard.card.rarity,
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

export async function GET(request: NextRequest) {
  const rarity = request.nextUrl.searchParams.get("rarity")?.trim() || null;

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
      .filter((ownedCard) =>
        rarity
          ? ownedCard.card.rarity?.toLowerCase() === rarity.toLowerCase()
          : true,
      )
      .map((ownedCard) => toOwnedCardViewModel(ownedCard))
      .sort((a, b) => (a.card?.name ?? "").localeCompare(b.card?.name ?? ""));

    return NextResponse.json(response, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "An error occurred while fetching owned cards" },
      { status: 500 },
    );
  }
}
