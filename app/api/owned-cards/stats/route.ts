import { OwnedCard, PokemonCard, Set } from "@/database";

import connectDB from "@/lib/mongodb";
import { NextResponse } from "next/server";

type QuantitySummary = {
  _id: null;
  totalQuantity: number;
};

type OwnedSetSummary = {
  id: string;
  name: string;
};

export async function GET() {
  try {
    await connectDB();

    const [quantitySummary, ownedSets] = await Promise.all([
      OwnedCard.aggregate<QuantitySummary>([
        {
          $group: {
            _id: null,
            totalQuantity: { $sum: "$quantity" },
          },
        },
      ]),
      OwnedCard.aggregate<OwnedSetSummary>([
        {
          $lookup: {
            from: PokemonCard.collection.name,
            localField: "cardId",
            foreignField: "id",
            as: "card",
          },
        },
        {
          $unwind: "$card",
        },
        {
          $lookup: {
            from: Set.collection.name,
            localField: "card.setId",
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
          $group: {
            _id: "$card.setId",
            name: { $first: { $ifNull: ["$set.name", "Unknown Set"] } },
          },
        },
        {
          $project: {
            _id: 0,
            id: "$_id",
            name: 1,
          },
        },
        {
          $sort: {
            name: 1,
          },
        },
      ]),
    ]);

    const summary = quantitySummary[0];

    return NextResponse.json(
      {
        totalQuantity: summary?.totalQuantity ?? 0,
        sets: ownedSets,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "An error occurred while fetching collection stats" },
      { status: 500 },
    );
  }
}
