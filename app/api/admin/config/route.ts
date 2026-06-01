import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Config } from "@/database";
import {
  DEFAULT_FEATURE_FLAGS,
  FEATURE_FLAG_NAMES,
  parseFeatureFlagValue,
} from "@/lib/featureFlags.config";
import connectDB from "@/lib/mongodb";

type UpdateConfigBody = {
  name?: string;
  enabled?: boolean;
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const configs = await Config.find({
    name: { $in: FEATURE_FLAG_NAMES },
  })
    .select("name value")
    .lean<Array<{ name: string; value: string }>>();

  const flags = { ...DEFAULT_FEATURE_FLAGS };

  for (const config of configs) {
    if (config.name in flags) {
      const key = config.name as keyof typeof flags;
      flags[key] = parseFeatureFlagValue(config.value);
    }
  }

  return NextResponse.json({ flags });
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
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  )
    .select("name value")
    .lean<{ name: string; value: string } | null>();

  return NextResponse.json({
    name,
    value: updatedConfig?.value ?? nextValue,
    enabled: parseFeatureFlagValue(updatedConfig?.value ?? nextValue),
  });
}
