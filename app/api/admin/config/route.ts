import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Config } from "@/database";
import connectDB from "@/lib/mongodb";

type UpdateConfigBody = {
  name?: string;
  enabled?: boolean;
};

function toEnabledFlag(value: string | undefined): boolean {
  return value === "true";
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const name = request.nextUrl.searchParams.get("name")?.trim();
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  await connectDB();

  const config = await Config.findOne({ name })
    .select("name value")
    .lean<{ name: string; value: string } | null>();

  return NextResponse.json({
    name,
    value: config?.value ?? "false",
    enabled: toEnabledFlag(config?.value),
  });
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: UpdateConfigBody;
  try {
    body = (await request.json()) as UpdateConfigBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  if (typeof body.enabled !== "boolean") {
    return NextResponse.json(
      { error: "enabled must be a boolean" },
      { status: 400 },
    );
  }

  await connectDB();

  const nextValue = body.enabled ? "true" : "false";

  const updatedConfig = await Config.findOneAndUpdate(
    { name },
    { $set: { name, value: nextValue } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )
    .select("name value")
    .lean<{ name: string; value: string } | null>();

  return NextResponse.json({
    name,
    value: updatedConfig?.value ?? nextValue,
    enabled: toEnabledFlag(updatedConfig?.value ?? nextValue),
  });
}
