import { loadEnvConfig } from "@next/env";
import mongoose from "mongoose";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

loadEnvConfig(process.cwd());

type CardSeedInput = {
  id: string;
  setId: string;
  name: string;
  supertype: string;
  hp: string;
  types: string[];
  convertedRetreatCost: number;
  number: string;
  rarity: string;
  regulationMark: string;
  images: {
    small: string;
    large: string;
  };
};

type RawCardInput = Record<string, unknown>;

function toCardSeedInput(
  item: RawCardInput,
  setId: string,
): CardSeedInput | null {
  const legalities = item.legalities as Record<string, unknown> | undefined;
  const images = item.images as Record<string, unknown> | undefined;
  const types = item.types as unknown;

  // Keep the same legality filter: only cards with legalities.standard.
  if (legalities?.standard === undefined) {
    return null;
  }

  // Keep only rows that satisfy required PokemonCard model fields.
  if (
    typeof item.id !== "string" ||
    typeof item.name !== "string" ||
    typeof item.supertype !== "string" ||
    typeof item.hp !== "string" ||
    !Array.isArray(types) ||
    types.length === 0 ||
    typeof item.convertedRetreatCost !== "number" ||
    typeof item.number !== "string" ||
    typeof item.rarity !== "string" ||
    typeof item.regulationMark !== "string" ||
    typeof images?.small !== "string" ||
    typeof images?.large !== "string"
  ) {
    return null;
  }

  return {
    id: item.id,
    setId,
    name: item.name,
    supertype: item.supertype,
    hp: item.hp,
    types: types.filter((value): value is string => typeof value === "string"),
    convertedRetreatCost: item.convertedRetreatCost,
    number: item.number,
    rarity: item.rarity,
    regulationMark: item.regulationMark,
    images: {
      small: images.small,
      large: images.large,
    },
  };
}

async function loadCardSeedData(): Promise<CardSeedInput[]> {
  const cardsDirPath = path.resolve(
    process.cwd(),
    "external/pokemon-tcg-data/cards/en",
  );

  const fileNames = await readdir(cardsDirPath);
  const jsonFileNames = fileNames.filter((fileName) =>
    fileName.endsWith(".json"),
  );

  const allCards: CardSeedInput[] = [];

  for (const fileName of jsonFileNames) {
    const setId = path.basename(fileName, ".json");
    const filePath = path.join(cardsDirPath, fileName);
    const rawContent = await readFile(filePath, "utf-8");
    const parsed = JSON.parse(rawContent) as unknown;

    if (!Array.isArray(parsed)) {
      continue;
    }

    for (const row of parsed) {
      if (!row || typeof row !== "object") {
        continue;
      }

      const mapped = toCardSeedInput(row as RawCardInput, setId);
      if (mapped) {
        allCards.push(mapped);
      }
    }
  }

  return allCards;
}

async function runSeed() {
  const { default: connectDB } = await import("../lib/mongodb");
  const { default: PokemonCardModel } =
    await import("../database/pokemonCard.model");

  const shouldReset = process.argv.includes("--reset");
  const seedCards = await loadCardSeedData();

  await connectDB();

  if (shouldReset) {
    await PokemonCardModel.deleteMany({});
    console.log("Cleared existing PokemonCard documents.");
  }

  const operations = seedCards.map((card) => ({
    updateOne: {
      filter: { id: card.id },
      update: { $set: card },
      upsert: true,
    },
  }));

  const BATCH_SIZE = 1000;
  let matchedCount = 0;
  let modifiedCount = 0;
  let upsertedCount = 0;

  for (let i = 0; i < operations.length; i += BATCH_SIZE) {
    const batch = operations.slice(i, i + BATCH_SIZE);
    const result = await PokemonCardModel.bulkWrite(batch);
    matchedCount += result.matchedCount;
    modifiedCount += result.modifiedCount;
    upsertedCount += result.upsertedCount;
  }

  console.log("Pokemon card seeding completed.");
  console.log(
    `Processed ${seedCards.length} cards from external/pokemon-tcg-data/cards/en/*.json.`,
  );
  console.log(
    `Matched: ${matchedCount}, Modified: ${modifiedCount}, Upserted: ${upsertedCount}`,
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
