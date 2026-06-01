export const FEATURE_FLAG_NAMES = [
  "show_import_from_collectr",
  "show_price",
  "show_delete_all_inventory",
  "show_card_condition",
] as const;

export type FeatureFlagName = (typeof FEATURE_FLAG_NAMES)[number];

export type FeatureFlags = Record<FeatureFlagName, boolean>;

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  show_import_from_collectr: false,
  show_price: false,
  show_delete_all_inventory: false,
  show_card_condition: false,
};

export function parseFeatureFlagValue(value: string | undefined): boolean {
  return value === "true";
}
