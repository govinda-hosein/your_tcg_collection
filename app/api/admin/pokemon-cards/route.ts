import { NextRequest, NextResponse } from "next/server";

type CreatePokemonCardPayload = {
  name?: string;
  number?: string;
  artist?: string;
  image_url?: string;
  set?: string;
  rarity?: string;
};

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as CreatePokemonCardPayload;

    // Placeholder behavior: log payload only until create logic is implemented.
    console.log("Create pokemon card payload:", payload);

    return NextResponse.json(
      {
        message: "Create pokemon card endpoint reached",
        payload,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
