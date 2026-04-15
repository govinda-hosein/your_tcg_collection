import { Set } from "@/database";
import connectDB from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const events = await Set.find().sort({ createdAt: -1 });
    return NextResponse.json(events, { status: 200 });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: "An error occurred while fetching sets" },
      { status: 500 },
    );
  }
}
