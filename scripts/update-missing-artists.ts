import { loadEnvConfig } from "@next/env";
import mongoose from "mongoose";
import { readFile } from "node:fs/promises";
import path from "node:path";

loadEnvConfig(process.cwd());

async function main() {
  const filePath = path.resolve(__dirname, "missing_artists.json");
  let raw: Record<string, string>;
  try {
    const content = await readFile(filePath, "utf-8");
    raw = JSON.parse(content);
    if (typeof raw !== "object" || Array.isArray(raw) || raw === null)
      throw new Error(
        "File must be a JSON object mapping card IDs to artist names",
      );
  } catch (err) {
    console.error("Failed to read or parse missing_artists.json:", err);
    process.exit(1);
    return;
  }

  const entries = Object.entries(raw);
  console.log(`Loaded ${entries.length} entries from file.`);

  const { default: connectDB } = await import("../lib/mongodb");
  const { PokemonCard } = await import("../database");
  await connectDB();

  let updatedCount = 0;
  for (const [id, artist] of entries) {
    if (!id || typeof artist !== "string" || !artist.trim()) continue;
    const res = await PokemonCard.updateOne(
      { id },
      { $set: { artist: artist.trim() } },
    );
    if (res.modifiedCount > 0) updatedCount++;
  }

  await mongoose.connection.close();
  console.log(`Updated ${updatedCount} PokemonCard records with artist info.`);
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
