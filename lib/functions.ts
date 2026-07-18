export function isHoloRarity(rarity?: string): boolean {
  if (!rarity) {
    return false;
  }

  return (
    rarity.includes("Illustration") ||
    rarity.includes("Hyper") ||
    rarity.includes("Ultra")
  );
}

const APOSTROPHE_VARIANTS = /['\u2018\u2019\u02BC]/g;

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFKC")
    .replace(APOSTROPHE_VARIANTS, "'")
    .toLowerCase()
    .trim();
}
