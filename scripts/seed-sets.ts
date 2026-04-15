import { loadEnvConfig } from "@next/env";
import mongoose from "mongoose";
import { readFile } from "node:fs/promises";
import path from "node:path";

loadEnvConfig(process.cwd());

type SetSeedInput = {
  id: string;
  name: string;
  series: string;
  printedTotal: number;
  total: number;
  ptcgoCode: string;
  releaseDate: string;
  updatedAt: string;
};

async function loadSetSeedData(): Promise<SetSeedInput[]> {
  const setsJsonPath = path.resolve(
    process.cwd(),
    "external/pokemon-tcg-data/sets/en.json",
  );

  const rawContent = await readFile(setsJsonPath, "utf-8");
  const parsed = JSON.parse(rawContent) as Array<Record<string, unknown>>;

  if (!Array.isArray(parsed)) {
    throw new Error("Expected sets file to contain an array.");
  }

  const filtered = parsed.filter((item) => {
    const legalities = item.legalities as Record<string, unknown> | undefined;
    return legalities?.standard !== undefined;
  });

  return filtered.map((item) => ({
    id: String(item.id ?? ""),
    name: String(item.name ?? ""),
    series: String(item.series ?? ""),
    printedTotal: Number(item.printedTotal ?? 0),
    total: Number(item.total ?? 0),
    ptcgoCode: String(item.ptcgoCode ?? ""),
    releaseDate: String(item.releaseDate ?? ""),
    updatedAt: String(item.updatedAt ?? ""),
  }));
}

async function runSeed() {
  const { default: connectDB } = await import("../lib/mongodb");
  const { default: SetModel } = await import("../database/set.model");
  const shouldReset = process.argv.includes("--reset");
  const seedSets = await loadSetSeedData();

  await connectDB();

  if (shouldReset) {
    await SetModel.deleteMany({});
    console.log("Cleared existing Set documents.");
  }

  const operations = seedSets.map((setItem) => ({
    updateOne: {
      filter: { id: setItem.id },
      update: { $set: setItem },
      upsert: true,
    },
  }));

  const result = await SetModel.bulkWrite(operations);

  console.log("Seeding completed.");
  console.log(
    `Processed ${seedSets.length} sets from external/pokemon-tcg-data/sets/en.json.`,
  );
  console.log(
    `Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}, Upserted: ${result.upsertedCount}`,
  );
}

runSeed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
