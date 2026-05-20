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
  const { OwnedCard, PokemonCard, Set } = await import("../database");

  await connectDB();

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
      name: "OwnedCard",
      fileName: "owned-cards.json",
      fetch: async () => OwnedCard.find().sort({ _id: 1 }).lean(),
    },
    {
      name: "PokemonCard",
      fileName: "pokemon-cards.json",
      fetch: async () => PokemonCard.find().sort({ _id: 1 }).lean(),
    },
    {
      name: "Set",
      fileName: "sets.json",
      fetch: async () => Set.find().sort({ _id: 1 }).lean(),
    },
  ] as const;

  const summary: Array<{ collection: string; count: number; file: string }> =
    [];

  for (const collection of collections) {
    const documents = await collection.fetch();
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

    console.log(`Backed up ${collection.name}: ${documents.length} documents`);
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
