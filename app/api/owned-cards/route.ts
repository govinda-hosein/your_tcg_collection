import { OwnedCard } from "@/database";
import type { OwnedCardViewModel } from "@/database/ownedCard.model";
import connectDB from "@/lib/mongodb";
import { NextResponse } from "next/server";

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
      .map<OwnedCardViewModel>((ownedCard) => ({
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
        quantity: ownedCard.quantity,
      }))
      .sort((a, b) => a.card.name.localeCompare(b.card.name));

    return NextResponse.json(response, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "An error occurred while fetching owned cards" },
      { status: 500 },
    );
  }
}
