import { readFile } from "node:fs/promises";
import path from "node:path";

import { loadEnvConfig } from "@next/env";
import mongoose from "mongoose";

loadEnvConfig(process.cwd());

type BackupFile = {
  collection: string;
  exportedAt: string;
  count: number;
  documents: Record<string, unknown>[];
};

async function readBackupFile(filePath: string): Promise<BackupFile> {
  const raw = await readFile(filePath, "utf-8");
  return JSON.parse(raw) as BackupFile;
}

async function restoreCollection(
  filePath: string,
  model: mongoose.Model<never>,
  dryRun: boolean,
): Promise<{ collection: string; restored: number }> {
  const backup = await readBackupFile(filePath);

  if (!dryRun) {
    await model.deleteMany({});

    const BATCH_SIZE = 1000;
    for (let i = 0; i < backup.documents.length; i += BATCH_SIZE) {
      const batch = backup.documents.slice(i, i + BATCH_SIZE);
      await model.insertMany(batch, { lean: true });
    }
  }

  return { collection: backup.collection, restored: backup.documents.length };
}

async function runRestore() {
  const args = process.argv.slice(2);
  const dirArg = args.find((a) => !a.startsWith("--"));
  const dryRun = args.includes("--dry-run");

  if (!dirArg) {
    console.error(
      "Usage: tsx scripts/restore-mongodb.ts <backup-dir> [--dry-run]",
    );
    console.error(
      "Example: tsx scripts/restore-mongodb.ts backups/mongodb/2026-05-20T12-34-56-789Z",
    );
    process.exitCode = 1;
    return;
  }

  const backupDir = path.resolve(process.cwd(), dirArg);

  if (dryRun) {
    console.log("Dry run mode — no data will be written.");
  } else {
    console.log(
      "WARNING: This will DELETE all existing documents and replace them with the backup.",
    );
    console.log(`Restoring from: ${backupDir}`);
  }

  const { default: connectDB } = await import("../lib/mongodb");
  const { OwnedCard, PokemonCard, Set } = await import("../database");

  await connectDB();

  const collections = [
    {
      fileName: "owned-cards.json",
      model: OwnedCard as mongoose.Model<never>,
    },
    {
      fileName: "pokemon-cards.json",
      model: PokemonCard as mongoose.Model<never>,
    },
    {
      fileName: "sets.json",
      model: Set as mongoose.Model<never>,
    },
  ];

  for (const { fileName, model } of collections) {
    const filePath = path.join(backupDir, fileName);
    const { collection, restored } = await restoreCollection(
      filePath,
      model,
      dryRun,
    );
    console.log(
      `${dryRun ? "[dry-run] Would restore" : "Restored"} ${collection}: ${restored} documents`,
    );
  }

  console.log(dryRun ? "Dry run complete." : "Restore complete.");
}

runRestore()
  .catch((error) => {
    console.error("Restore failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
