import "server-only";

import { Config } from "@/database";
import connectDB from "@/lib/mongodb";

import {
  DEFAULT_FEATURE_FLAGS,
  FEATURE_FLAG_NAMES,
  FeatureFlags,
  parseFeatureFlagValue,
} from "./featureFlags.config";

export async function getFeatureFlags(): Promise<FeatureFlags> {
  await connectDB();

  const configs = await Config.find({
    name: { $in: FEATURE_FLAG_NAMES },
  })
    .select("name value")
    .lean<Array<{ name: string; value: string }>>();

  const flags: FeatureFlags = { ...DEFAULT_FEATURE_FLAGS };

  for (const config of configs) {
    if (config.name in flags) {
      const key = config.name as keyof FeatureFlags;
      flags[key] = parseFeatureFlagValue(config.value);
    }
  }

  return flags;
}
