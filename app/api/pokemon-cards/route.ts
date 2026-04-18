import { NextRequest, NextResponse } from "next/server";

import { PokemonCard, Set } from "@/database";
import connectDB from "@/lib/mongodb";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id")?.trim() ?? "";
    const name = searchParams.get("name")?.trim() ?? "";
    const limitParam = Number(searchParams.get("limit"));
    const limit =
      Number.isFinite(limitParam) && limitParam > 0
        ? Math.min(limitParam, 100)
        : 25;

    if (id.length > 0) {
      const cardResults = await PokemonCard.aggregate([
        {
          $match: { id },
        },
        {
          $lookup: {
            from: Set.collection.name,
            localField: "setId",
            foreignField: "id",
            as: "set",
          },
        },
        {
          $unwind: {
            path: "$set",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 0,
            id: 1,
            name: 1,
            number: 1,
            regulationMark: 1,
            rarity: 1,
            types: 1,
            images: 1,
            set: {
              name: "$set.name",
            },
          },
        },
        {
          $limit: 1,
        },
      ]);

      const card = cardResults[0] ?? null;
      if (!card) {
        return NextResponse.json(
          { error: "Pokemon card not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(card, { status: 200 });
    }

    const query =
      name.length > 0
        ? {
            name: {
              $regex: escapeRegex(name),
              $options: "i",
            },
          }
        : {};

    const cards = await PokemonCard.aggregate([
      {
        $match: query,
      },
      {
        $lookup: {
          from: Set.collection.name,
          localField: "setId",
          foreignField: "id",
          as: "set",
        },
      },
      {
        $unwind: {
          path: "$set",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: {
          "set.releaseDate": -1,
          name: 1,
          number: 1,
        },
      },
      {
        $limit: limit,
      },
      {
        $project: {
          _id: 0,
          id: 1,
          name: 1,
          number: 1,
          regulationMark: 1,
          rarity: 1,
          types: 1,
          images: 1,
          set: {
            name: "$set.name",
          },
        },
      },
    ]);

    return NextResponse.json(cards, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "An error occurred while searching pokemon cards" },
      { status: 500 },
    );
  }
}
