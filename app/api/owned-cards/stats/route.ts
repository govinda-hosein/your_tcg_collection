import { OwnedCard } from "@/database";
import connectDB from "@/lib/mongodb";
import { NextResponse } from "next/server";

type QuantitySummary = {
  _id: null;
  totalQuantity: number;
};

export async function GET() {
  try {
    await connectDB();

    const [summary] = await OwnedCard.aggregate<QuantitySummary>([
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: "$quantity" },
        },
      },
    ]);

    return NextResponse.json(
      { totalQuantity: summary?.totalQuantity ?? 0 },
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
