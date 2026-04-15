import { PokemonCard } from "@/database";
import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name")?.trim() ?? "";
    const limitParam = Number(searchParams.get("limit"));
    const limit =
      Number.isFinite(limitParam) && limitParam > 0
        ? Math.min(limitParam, 100)
        : 25;

    const query =
      name.length > 0
        ? {
            name: {
              $regex: escapeRegex(name),
              $options: "i",
            },
          }
        : {};

    const cards = await PokemonCard.find(query)
      .sort({ name: 1 })
      .limit(limit)
      .select("id name number rarity types images setId")
      .lean();

    return NextResponse.json(cards, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "An error occurred while searching pokemon cards" },
      { status: 500 },
    );
  }
}
