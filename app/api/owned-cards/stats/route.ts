import { OwnedCard, PokemonCard, Set } from "@/database";

import connectDB from "@/lib/mongodb";
import { NextResponse } from "next/server";

type QuantitySummary = {
  _id: null;
  totalQuantity: number;
};

type ArtistSummary = {
  _id: null;
  artists: string[];
};

type RaritySummary = {
  _id: null;
  rarities: string[];
};

type OwnedSetSummary = {
  id: string;
  name: string;
};

export async function GET() {
  try {
    await connectDB();

    const [quantitySummary, artistSummary, raritySummary, ownedSets] =
      await Promise.all([
        OwnedCard.aggregate<QuantitySummary>([
          {
            $group: {
              _id: null,
              totalQuantity: { $sum: "$quantity" },
            },
          },
        ]),
        OwnedCard.aggregate<ArtistSummary>([
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
            $group: {
              _id: null,
              artists: {
                $addToSet: {
                  $trim: {
                    input: { $ifNull: ["$card.artist", ""] },
                  },
                },
              },
            },
          },
          {
            $project: {
              _id: 1,
              artists: {
                $filter: {
                  input: "$artists",
                  as: "artist",
                  cond: { $ne: ["$$artist", ""] },
                },
              },
            },
          },
        ]),
        OwnedCard.aggregate<RaritySummary>([
          {
            $lookup: {
              from: PokemonCard.collection.name,
              localField: "cardId",
              foreignField: "id",
              as: "card",
            },
          },
          { $unwind: "$card" },
          {
            $group: {
              _id: null,
              rarities: {
                $addToSet: {
                  $trim: {
                    input: { $ifNull: ["$card.rarity", ""] },
                  },
                },
              },
            },
          },
          {
            $project: {
              _id: 1,
              rarities: {
                $filter: {
                  input: "$rarities",
                  as: "rarity",
                  cond: { $ne: ["$$rarity", ""] },
                },
              },
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
    const artists = artistSummary[0]?.artists ?? [];
    const ownedRarities = raritySummary[0]?.rarities ?? [];

    return NextResponse.json(
      {
        totalQuantity: summary?.totalQuantity ?? 0,
        artists: artists.sort((a, b) => a.localeCompare(b)),
        rarities: ownedRarities.sort((a, b) => a.localeCompare(b)),
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
