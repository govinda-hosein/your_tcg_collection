import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { OwnedCard } from "@/database";
import connectDB from "@/lib/mongodb";

interface BulkRemoveItem {
  cardId: string;
  quantity: number;
}

interface BulkRemoveBody {
  items?: BulkRemoveItem[];
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: BulkRemoveBody;
  try {
    body = (await request.json()) as BulkRemoveBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const items = body.items;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { error: "items must be a non-empty array" },
      { status: 400 },
    );
  }

  for (const item of items) {
    if (
      typeof item.cardId !== "string" ||
      !item.cardId.trim() ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1
    ) {
      return NextResponse.json(
        {
          error:
            "Each item must have a valid cardId and a positive integer quantity",
        },
        { status: 400 },
      );
    }
  }

  await connectDB();

  let totalRemoved = 0;

  for (const item of items) {
    const cardId = item.cardId.trim();
    const existing = await OwnedCard.findOne({ cardId }).lean<{
      quantity: number;
    }>();
    if (!existing) continue;

    const newQuantity = existing.quantity - item.quantity;

    if (newQuantity <= 0) {
      await OwnedCard.deleteOne({ cardId });
      totalRemoved += existing.quantity;
    } else {
      await OwnedCard.updateOne(
        { cardId },
        { $set: { quantity: newQuantity } },
      );
      totalRemoved += item.quantity;
    }
  }

  return NextResponse.json({ removed: totalRemoved });
}
