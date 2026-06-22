import { PokemonCard, Set } from "@/database";
import { NextRequest, NextResponse } from "next/server";

import { COLLECTR_SET_MAP } from "@/lib/constants";
import connectDB from "@/lib/mongodb";

type CreatePokemonCardPayload = {
  name?: string;
  number?: string;
  artist?: string;
  image_url?: string;
  set?: string;
  rarity?: string;
};

type DeletePokemonCardPayload = {
  id?: string;
};

function generateBaseSetId(name: string): string {
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "custom-set";
}

function formatReleaseDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

function formatUpdatedAt(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  const second = String(date.getSeconds()).padStart(2, "0");
  return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
}

async function generateUniqueSetId(setName: string): Promise<string> {
  const baseId = generateBaseSetId(setName);
  let candidate = baseId;
  let suffix = 2;

  // Ensure generated id is unique in the Set collection.
  while (await Set.exists({ id: candidate })) {
    candidate = `${baseId}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as CreatePokemonCardPayload;
    const name = payload.name?.trim();
    const number = payload.number?.trim();
    const imageUrl = payload.image_url?.trim();
    const artist = payload.artist?.trim();
    const rarity = payload.rarity?.trim();
    const setName = payload.set?.trim();

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    if (!number) {
      return NextResponse.json(
        { error: "number is required" },
        { status: 400 },
      );
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: "image_url is required" },
        { status: 400 },
      );
    }

    if (!setName) {
      return NextResponse.json({ error: "set is required" }, { status: 400 });
    }

    const resolvedSetName = COLLECTR_SET_MAP[setName] ?? setName;

    await connectDB();

    let matchedSet = await Set.findOne({ name: resolvedSetName })
      .select("id name")
      .lean<{ id: string; name: string } | null>();

    let createdSet = false;

    if (!matchedSet) {
      const now = new Date();
      const generatedSetId = await generateUniqueSetId(resolvedSetName);

      await Set.create({
        id: generatedSetId,
        name: resolvedSetName,
        series: "Custom",
        printedTotal: 0,
        total: 0,
        ptcgoCode: generatedSetId.toUpperCase().slice(0, 10),
        releaseDate: formatReleaseDate(now),
        updatedAt: formatUpdatedAt(now),
      });

      matchedSet = {
        id: generatedSetId,
        name: resolvedSetName,
      };
      createdSet = true;
    }

    const setId = matchedSet.id;
    const cardId = `${setId}-${number}`;

    const existingCard = await PokemonCard.exists({ id: cardId });
    if (existingCard) {
      return NextResponse.json(
        { error: `Pokemon card already exists with id: ${cardId}` },
        { status: 409 },
      );
    }

    const createdCard = await PokemonCard.create({
      id: cardId,
      setId,
      name,
      number,
      ...(artist ? { artist } : {}),
      ...(rarity ? { rarity } : {}),
      images: {
        small: imageUrl,
        large: imageUrl,
      },
    });

    return NextResponse.json(
      {
        message: "Pokemon card created",
        payload: {
          id: createdCard.id,
          name: createdCard.name,
          number: createdCard.number,
          artist: createdCard.artist,
          rarity: createdCard.rarity,
          image_url: imageUrl,
          set: resolvedSetName,
          images: createdCard.images,
          setId,
          setCreated: createdSet,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create pokemon card:", error);

    const message =
      error instanceof Error ? error.message : "Failed to create pokemon card";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const payload = (await request.json()) as DeletePokemonCardPayload;
    const cardId = payload.id?.trim();

    if (!cardId) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await connectDB();

    const deletedCard = await PokemonCard.findOneAndDelete({ id: cardId })
      .select("id name number setId")
      .lean<{
        id: string;
        name: string;
        number: string;
        setId: string;
      } | null>();

    if (!deletedCard) {
      return NextResponse.json(
        { error: `Pokemon card not found with id: ${cardId}` },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: "Pokemon card deleted",
        payload: {
          id: deletedCard.id,
          name: deletedCard.name,
          number: deletedCard.number,
          setId: deletedCard.setId,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to delete pokemon card:", error);

    const message =
      error instanceof Error ? error.message : "Failed to delete pokemon card";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
