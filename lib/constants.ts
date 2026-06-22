export const RARITY_COLORS: Readonly<Record<string, string>> = {
  "ACE SPEC Rare": "from-cyan-400 to-teal-400",
  "Classic Collection": "from-rose-400 to-pink-400",
  Common: "from-gray-400 to-gray-300",
  "Double Rare": "from-indigo-500 to-violet-500",
  "Hyper Rare": "from-amber-400 to-yellow-300",
  "Illustration Rare": "from-pink-400 to-purple-400",
  MEGA_ATTACK_RARE: "from-red-400 to-orange-400",
  Promo: "from-green-400 to-green-300",
  Rare: "from-blue-400 to-blue-300",
  "Rare Ace": "from-cyan-400 to-teal-400",
  "Rare Holo": "from-purple-400 to-pink-400",
  "Rare Holo EX": "from-purple-400 to-pink-400",
  "Rare Holo V": "from-purple-400 to-pink-400",
  "Rare Holo VMAX": "from-purple-400 to-pink-400",
  "Rare Secret": "from-red-400 to-orange-400",
  "Rare Ultra": "from-yellow-400 to-orange-400",
  "Shiny Ultra Rare": "from-yellow-400 to-orange-400",
  "Special Illustration Rare": "from-fuchsia-500 to-rose-500",
  "Trainer Gallery Rare Holo": "from-green-400 to-green-300",
  "Ultra Rare": "from-yellow-400 to-orange-400",
  Uncommon: "from-green-400 to-green-300",
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
