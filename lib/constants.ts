export const RARITY_COLORS: Readonly<Record<string, string>> = {
  "ACE SPEC Rare": "from-cyan-400 to-teal-400",
  Common: "from-gray-400 to-gray-300",
  "Double Rare": "from-indigo-500 to-violet-500",
  "Hyper Rare": "from-amber-400 to-yellow-300",
  "": "from-sky-400 to-blue-500",
  Uncommon: "from-green-400 to-green-300",
  Rare: "from-blue-400 to-blue-300",
  "Ultra Rare": "from-yellow-400 to-orange-400",
  "Special Illustration Rare": "from-fuchsia-500 to-rose-500",
};

export const COLLECTR_SET_MAP: Record<string, string> = {
  "Crown Zenith: Galarian Gallery": "Crown Zenith Galarian Gallery",
  "SV: 151": "151",
  "Scarlet & Violet Base Set": "Scarlet & Violet",
  "Sword & Shield Base Set": "Sword & Shield",
  "Sword & Shield Promo": "SWSH Black Star Promos",
  "Scarlet & Violet Promo": "Scarlet & Violet Black Star Promos",
};

export const CARD_CONDITIONS = [
  "Near Mint",
  "Lightly Played",
  "Moderately Played",
  "Heavily Played",
  "Damaged",
  "Dent",
  "Print Line",
] as const;
