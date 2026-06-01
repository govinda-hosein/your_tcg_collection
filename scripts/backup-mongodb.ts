import { mkdir, writeFile } from "node:fs/promises";

import { loadEnvConfig } from "@next/env";
import mongoose from "mongoose";
import path from "node:path";

loadEnvConfig(process.cwd());

function getTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

async function runBackup() {
  const { default: connectDB } = await import("../lib/mongodb");
  const { Config, OwnedCard, PokemonCard, Set } = await import("../database");

  await connectDB();

  const database = mongoose.connection.db;

  if (!database) {
    throw new Error("Database connection is not available");
  }

  const timestamp = getTimestamp();
  const backupDir = path.resolve(
    process.cwd(),
    "backups",
    "mongodb",
    timestamp,
  );
  await mkdir(backupDir, { recursive: true });

  const collections = [
    {
      name: "Config",
      fileName: "config.json",
      collectionName: Config.collection.collectionName,
      fetch: async () => Config.find().sort({ _id: 1 }).lean(),
    },
    {
      name: "OwnedCard",
      fileName: "owned-cards.json",
      collectionName: OwnedCard.collection.collectionName,
      fetch: async () => OwnedCard.find().sort({ _id: 1 }).lean(),
    },
    {
      name: "PokemonCard",
      fileName: "pokemon-cards.json",
      collectionName: PokemonCard.collection.collectionName,
      fetch: async () => PokemonCard.find().sort({ _id: 1 }).lean(),
    },
    {
      name: "Set",
      fileName: "sets.json",
      collectionName: Set.collection.collectionName,
      fetch: async () => Set.find().sort({ _id: 1 }).lean(),
    },
  ] as const;

  const summary: Array<{ collection: string; count: number; file: string }> =
    [];

  for (const collection of collections) {
    const collectionExists = await database
      .listCollections({ name: collection.collectionName }, { nameOnly: true })
      .hasNext();

    const documents = collectionExists ? await collection.fetch() : [];
    const filePath = path.join(backupDir, collection.fileName);

    await writeFile(
      filePath,
      JSON.stringify(
        {
          collection: collection.name,
          exportedAt: new Date().toISOString(),
          count: documents.length,
          documents,
        },
        null,
        2,
      ),
      "utf-8",
    );

    summary.push({
      collection: collection.name,
      count: documents.length,
      file: collection.fileName,
    });

    if (collectionExists) {
      console.log(
        `Backed up ${collection.name}: ${documents.length} documents`,
      );
    } else {
      console.log(
        `Skipped ${collection.name}: collection ${collection.collectionName} does not exist yet`,
      );
    }
  }

  await writeFile(
    path.join(backupDir, "manifest.json"),
    JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        backupDir,
        collections: summary,
      },
      null,
      2,
    ),
    "utf-8",
  );

  console.log(`Backup complete: ${backupDir}`);
}

runBackup()
  .catch((error) => {
    console.error("Backup failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
