import { OwnedCard, PokemonCard } from "@/database";
import { NextRequest, NextResponse } from "next/server";

import type { OwnedCardViewModel } from "@/database/ownedCard.model";
import connectDB from "@/lib/mongodb";

interface CreateOwnedCardBody {
  cardId?: string;
  quantity?: number;
  price?: number;
  cardCondition?: string;
}

interface UpdateOwnedCardBody {
  cardId?: string;
  quantity?: number;
  price?: number;
  cardCondition?: string;
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
      artist: ownedCard.card.artist,
      rarity: ownedCard.card.rarity,
      types: ownedCard.card.types,
      images: ownedCard.card.images,
      set: {
        name: ownedCard.card.set?.name ?? "Unknown Set",
      },
    },
    quantity: ownedCard.quantity,
    price: ownedCard.price,
    cardCondition: ownedCard.cardCondition,
  };
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = (await request.json()) as CreateOwnedCardBody;
    const cardId = body.cardId?.trim();
    const quantity = body.quantity;
    const price = body.price;
    const cardCondition = body.cardCondition?.trim();

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

    if (
      price !== undefined &&
      (typeof price !== "number" || Number.isNaN(price) || price < 0)
    ) {
      return NextResponse.json(
        { error: "price must be a number greater than or equal to 0" },
        { status: 400 },
      );
    }

    if (body.cardCondition !== undefined && !cardCondition) {
      return NextResponse.json(
        { error: "cardCondition must be a non-empty string" },
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

    const setUpdate: { price?: number; cardCondition?: string } = {};
    if (price !== undefined) {
      setUpdate.price = price;
    }
    if (cardCondition) {
      setUpdate.cardCondition = cardCondition;
    }

    await OwnedCard.findOneAndUpdate(
      { cardId },
      Object.keys(setUpdate).length > 0
        ? {
            $inc: { quantity },
            $set: setUpdate,
          }
        : {
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
    const price = body.price;
    const cardCondition = body.cardCondition?.trim();

    if (!cardId) {
      return NextResponse.json(
        { error: "cardId is required" },
        { status: 400 },
      );
    }

    if (
      quantity !== undefined &&
      (!Number.isInteger(quantity) || quantity < 1)
    ) {
      return NextResponse.json(
        { error: "quantity must be an integer greater than 0" },
        { status: 400 },
      );
    }

    if (
      price !== undefined &&
      (typeof price !== "number" || Number.isNaN(price) || price < 0)
    ) {
      return NextResponse.json(
        { error: "price must be a number greater than or equal to 0" },
        { status: 400 },
      );
    }

    if (body.cardCondition !== undefined && !cardCondition) {
      return NextResponse.json(
        { error: "cardCondition must be a non-empty string" },
        { status: 400 },
      );
    }

    const updates: {
      quantity?: number;
      price?: number;
      cardCondition?: string;
    } = {};
    if (quantity !== undefined) {
      updates.quantity = quantity;
    }
    if (price !== undefined) {
      updates.price = price;
    }
    if (cardCondition) {
      updates.cardCondition = cardCondition;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        {
          error:
            "At least one field must be provided: quantity, price, or cardCondition",
        },
        { status: 400 },
      );
    }

    const updated = await OwnedCard.findOneAndUpdate(
      { cardId },
      { $set: updates },
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
