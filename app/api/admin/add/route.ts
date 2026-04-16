import { OwnedCard, PokemonCard } from "@/database";
import type { OwnedCardViewModel } from "@/database/ownedCard.model";
import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

type OwnedCardRarity = NonNullable<OwnedCardViewModel["card"]>["rarity"];
type PopulatedOwnedCard = OwnedCardViewModel & {
  card: NonNullable<OwnedCardViewModel["card"]>;
};

interface CreateOwnedCardBody {
  cardId?: string;
  quantity?: number;
}

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

async function findOwnedCardViewModel(
  cardId: string,
): Promise<OwnedCardViewModel | null> {
  const ownedCard = await OwnedCard.findOne({ cardId })
    .populate({
      path: "card",
      populate: {
        path: "set",
        select: "name",
      },
    })
    .lean<PopulatedOwnedCard | null>();

  if (!ownedCard || !ownedCard.card) {
    return null;
  }

  return toOwnedCardViewModel(ownedCard);
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = (await request.json()) as CreateOwnedCardBody;
    const cardId = body.cardId?.trim();
    const quantity = body.quantity;

    if (!cardId) {
      return NextResponse.json(
        { error: "cardId is required" },
        { status: 400 },
      );
    }

    if (!Number.isInteger(quantity) || quantity === undefined || quantity < 1) {
      return NextResponse.json(
        { error: "quantity must be an integer greater than 0" },
        { status: 400 },
      );
    }

    const existingPokemonCard = await PokemonCard.exists({ id: cardId });

    if (!existingPokemonCard) {
      return NextResponse.json(
        { error: "Pokemon card not found" },
        { status: 404 },
      );
    }

    await OwnedCard.findOneAndUpdate(
      { cardId },
      {
        $inc: { quantity },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    const createdOwnedCard = await findOwnedCardViewModel(cardId);

    if (!createdOwnedCard) {
      return NextResponse.json(
        { error: "An error occurred while creating the owned card" },
        { status: 500 },
      );
    }

    return NextResponse.json(createdOwnedCard, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "An error occurred while creating the owned card" },
      { status: 500 },
    );
  }
}
