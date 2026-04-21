import { OwnedCard, PokemonCard } from "@/database";
import { NextRequest, NextResponse } from "next/server";

import type { OwnedCardViewModel } from "@/database/ownedCard.model";
import connectDB from "@/lib/mongodb";

interface CreateOwnedCardBody {
  cardId?: string;
  quantity?: number;
}

interface UpdateOwnedCardBody {
  cardId?: string;
  quantity?: number;
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
    .lean<OwnedCardViewModel | null>();

  if (!ownedCard) {
    return null;
  }

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
    quantity: ownedCard.quantity,
  };
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
        returnDocument: "after",
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

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    const body = (await request.json()) as UpdateOwnedCardBody;
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

    const updated = await OwnedCard.findOneAndUpdate(
      { cardId },
      { $set: { quantity } },
      { returnDocument: "after" },
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Owned card not found" },
        { status: 404 },
      );
    }

    const updatedOwnedCard = await findOwnedCardViewModel(cardId);

    if (!updatedOwnedCard) {
      return NextResponse.json(
        { error: "An error occurred while updating the owned card" },
        { status: 500 },
      );
    }

    return NextResponse.json(updatedOwnedCard, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "An error occurred while updating the owned card" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const cardId = searchParams.get("cardId");

  if (!cardId || typeof cardId !== "string" || cardId.trim() === "") {
    return NextResponse.json({ error: "cardId is required" }, { status: 400 });
  }

  await connectDB();

  const deleted = await OwnedCard.findOneAndDelete({ cardId: cardId.trim() });

  if (!deleted) {
    return NextResponse.json(
      { error: "Owned card not found" },
      { status: 404 },
    );
  }

  return new NextResponse(null, { status: 204 });
}
