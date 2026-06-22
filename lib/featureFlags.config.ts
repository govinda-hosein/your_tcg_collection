export const FEATURE_FLAG_NAMES = [
  "show_import_from_collectr",
  "show_price",
  "show_delete_all_inventory",
  "show_card_condition",
  "show_create_card",
  "show_delete_pokemon_card",
  "show_pokemon_type_filter",
] as const;

export type FeatureFlagName = (typeof FEATURE_FLAG_NAMES)[number];

export type FeatureFlags = Record<FeatureFlagName, boolean>;

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  show_import_from_collectr: false,
  show_price: false,
  show_delete_all_inventory: false,
  show_card_condition: false,
  show_create_card: false,
  show_delete_pokemon_card: false,
  show_pokemon_type_filter: false,
};

export function parseFeatureFlagValue(value: string | undefined): boolean {
  return value === "true";
}
