import { loadEnvConfig } from "@next/env";
import mongoose from "mongoose";

loadEnvConfig(process.cwd());

type ConfigSeedInput = {
  name: string;
  value: string;
};

const seedConfig: ConfigSeedInput[] = [
  {
    name: "show_import_from_collectr",
    value: "false",
  },
];

async function runSeed() {
  const { default: connectDB } = await import("../lib/mongodb");
  const { default: ConfigModel } = await import("../database/config.model");

  const shouldReset = process.argv.includes("--reset");

  await connectDB();

  if (shouldReset) {
    await ConfigModel.deleteMany({});
    console.log("Cleared existing Config documents.");
  }

  const operations = seedConfig.map((configItem) => ({
    updateOne: {
      filter: { name: configItem.name },
      update: { $set: configItem },
      upsert: true,
    },
  }));

  const result = await ConfigModel.bulkWrite(operations);

  console.log("Config seeding completed.");
  console.log(`Processed ${seedConfig.length} config setting(s).`);
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
