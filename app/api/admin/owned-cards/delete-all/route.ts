import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { OwnedCard } from "@/database";
import connectDB from "@/lib/mongodb";

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const result = await OwnedCard.deleteMany({});

  return NextResponse.json({ deletedCount: result.deletedCount ?? 0 });
}
