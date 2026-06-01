export const FEATURE_FLAG_NAMES = [
  "show_import_from_collectr",
  "show_price",
] as const;

export type FeatureFlagName = (typeof FEATURE_FLAG_NAMES)[number];

export type FeatureFlags = Record<FeatureFlagName, boolean>;

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  show_import_from_collectr: false,
  show_price: false,
};

export function parseFeatureFlagValue(value: string | undefined): boolean {
  return value === "true";
}
