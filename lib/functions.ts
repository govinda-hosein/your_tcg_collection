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
