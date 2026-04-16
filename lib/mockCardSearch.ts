export interface MockCardSearchResult {
  name: string;
  set: string;
  number: string;
  rarity: string;
  type: string;
}

// Mock Pokemon card database for search
const MOCK_CARD_DATABASE: MockCardSearchResult[] = [
  // Base Set
  {
    name: "Charizard",
    set: "Base Set",
    number: "4/102",
    rarity: "Holo Rare",
    type: "Fire",
  },
  {
    name: "Blastoise",
    set: "Base Set",
    number: "2/102",
    rarity: "Holo Rare",
    type: "Water",
  },
  {
    name: "Venusaur",
    set: "Base Set",
    number: "15/102",
    rarity: "Holo Rare",
    type: "Grass",
  },
  {
    name: "Pikachu",
    set: "Base Set",
    number: "58/102",
    rarity: "Common",
    type: "Electric",
  },
  {
    name: "Raichu",
    set: "Base Set",
    number: "14/102",
    rarity: "Holo Rare",
    type: "Electric",
  },
  {
    name: "Mewtwo",
    set: "Base Set",
    number: "10/102",
    rarity: "Holo Rare",
    type: "Psychic",
  },
  {
    name: "Alakazam",
    set: "Base Set",
    number: "1/102",
    rarity: "Holo Rare",
    type: "Psychic",
  },
  {
    name: "Gyarados",
    set: "Base Set",
    number: "6/102",
    rarity: "Holo Rare",
    type: "Water",
  },
  {
    name: "Machamp",
    set: "Base Set",
    number: "8/102",
    rarity: "Holo Rare",
    type: "Fighting",
  },
  {
    name: "Magneton",
    set: "Base Set",
    number: "9/102",
    rarity: "Holo Rare",
    type: "Electric",
  },
  {
    name: "Nidoking",
    set: "Base Set",
    number: "11/102",
    rarity: "Holo Rare",
    type: "Grass",
  },
  {
    name: "Poliwrath",
    set: "Base Set",
    number: "13/102",
    rarity: "Holo Rare",
    type: "Water",
  },
  {
    name: "Clefairy",
    set: "Base Set",
    number: "5/102",
    rarity: "Holo Rare",
    type: "Fairy",
  },
  {
    name: "Hitmonchan",
    set: "Base Set",
    number: "7/102",
    rarity: "Holo Rare",
    type: "Fighting",
  },

  // Jungle Set
  {
    name: "Pikachu",
    set: "Jungle",
    number: "60/64",
    rarity: "Common",
    type: "Electric",
  },
  {
    name: "Jolteon",
    set: "Jungle",
    number: "4/64",
    rarity: "Holo Rare",
    type: "Electric",
  },
  {
    name: "Flareon",
    set: "Jungle",
    number: "3/64",
    rarity: "Holo Rare",
    type: "Fire",
  },
  {
    name: "Vaporeon",
    set: "Jungle",
    number: "12/64",
    rarity: "Holo Rare",
    type: "Water",
  },
  {
    name: "Scyther",
    set: "Jungle",
    number: "10/64",
    rarity: "Holo Rare",
    type: "Grass",
  },
  {
    name: "Pinsir",
    set: "Jungle",
    number: "9/64",
    rarity: "Holo Rare",
    type: "Grass",
  },
  {
    name: "Kangaskhan",
    set: "Jungle",
    number: "5/64",
    rarity: "Holo Rare",
    type: "Fighting",
  },

  // Fossil Set
  {
    name: "Dragonite",
    set: "Fossil",
    number: "4/62",
    rarity: "Holo Rare",
    type: "Dragon",
  },
  {
    name: "Zapdos",
    set: "Fossil",
    number: "15/62",
    rarity: "Holo Rare",
    type: "Electric",
  },
  {
    name: "Moltres",
    set: "Fossil",
    number: "12/62",
    rarity: "Holo Rare",
    type: "Fire",
  },
  {
    name: "Articuno",
    set: "Fossil",
    number: "2/62",
    rarity: "Holo Rare",
    type: "Water",
  },
  {
    name: "Lapras",
    set: "Fossil",
    number: "10/62",
    rarity: "Holo Rare",
    type: "Water",
  },
  {
    name: "Aerodactyl",
    set: "Fossil",
    number: "1/62",
    rarity: "Holo Rare",
    type: "Fighting",
  },

  // Team Rocket
  {
    name: "Dark Charizard",
    set: "Team Rocket",
    number: "4/82",
    rarity: "Holo Rare",
    type: "Fire",
  },
  {
    name: "Dark Blastoise",
    set: "Team Rocket",
    number: "3/82",
    rarity: "Holo Rare",
    type: "Water",
  },
  {
    name: "Dark Dragonite",
    set: "Team Rocket",
    number: "5/82",
    rarity: "Holo Rare",
    type: "Dragon",
  },

  // Gym Heroes
  {
    name: "Rocket's Mewtwo",
    set: "Gym Heroes",
    number: "14/132",
    rarity: "Holo Rare",
    type: "Psychic",
  },
  {
    name: "Erika's Venusaur",
    set: "Gym Heroes",
    number: "4/132",
    rarity: "Holo Rare",
    type: "Grass",
  },
  {
    name: "Blaine's Charizard",
    set: "Gym Heroes",
    number: "2/132",
    rarity: "Holo Rare",
    type: "Fire",
  },

  // Neo Genesis
  {
    name: "Lugia",
    set: "Neo Genesis",
    number: "9/111",
    rarity: "Holo Rare",
    type: "Psychic",
  },
  {
    name: "Ampharos",
    set: "Neo Genesis",
    number: "1/111",
    rarity: "Holo Rare",
    type: "Electric",
  },
  {
    name: "Typhlosion",
    set: "Neo Genesis",
    number: "17/111",
    rarity: "Holo Rare",
    type: "Fire",
  },
  {
    name: "Feraligatr",
    set: "Neo Genesis",
    number: "4/111",
    rarity: "Holo Rare",
    type: "Water",
  },
  {
    name: "Meganium",
    set: "Neo Genesis",
    number: "10/111",
    rarity: "Holo Rare",
    type: "Grass",
  },

  // Neo Discovery
  {
    name: "Espeon",
    set: "Neo Discovery",
    number: "1/75",
    rarity: "Holo Rare",
    type: "Psychic",
  },
  {
    name: "Umbreon",
    set: "Neo Discovery",
    number: "13/75",
    rarity: "Holo Rare",
    type: "Dark",
  },
  {
    name: "Scizor",
    set: "Neo Discovery",
    number: "10/75",
    rarity: "Holo Rare",
    type: "Steel",
  },

  // Legendary Collection
  {
    name: "Charizard",
    set: "Legendary Collection",
    number: "3/110",
    rarity: "Holo Rare",
    type: "Fire",
  },
  {
    name: "Pikachu",
    set: "Legendary Collection",
    number: "87/110",
    rarity: "Common",
    type: "Electric",
  },

  // EX Series
  {
    name: "Rayquaza",
    set: "EX Dragon",
    number: "97/97",
    rarity: "Secret Rare",
    type: "Dragon",
  },
  {
    name: "Mewtwo EX",
    set: "EX Ruby & Sapphire",
    number: "101/109",
    rarity: "Ultra Rare",
    type: "Psychic",
  },
  {
    name: "Blaziken",
    set: "EX Ruby & Sapphire",
    number: "3/109",
    rarity: "Holo Rare",
    type: "Fire",
  },

  // Diamond & Pearl
  {
    name: "Lucario",
    set: "Diamond & Pearl",
    number: "6/130",
    rarity: "Holo Rare",
    type: "Fighting",
  },
  {
    name: "Infernape",
    set: "Diamond & Pearl",
    number: "5/130",
    rarity: "Holo Rare",
    type: "Fire",
  },
  {
    name: "Empoleon",
    set: "Diamond & Pearl",
    number: "4/130",
    rarity: "Holo Rare",
    type: "Water",
  },

  // Modern Sets
  {
    name: "Pikachu VMAX",
    set: "Vivid Voltage",
    number: "44/185",
    rarity: "Ultra Rare",
    type: "Electric",
  },
  {
    name: "Charizard VMAX",
    set: "Darkness Ablaze",
    number: "20/189",
    rarity: "Ultra Rare",
    type: "Fire",
  },
  {
    name: "Mew VMAX",
    set: "Fusion Strike",
    number: "114/264",
    rarity: "Ultra Rare",
    type: "Psychic",
  },
];

export function mockCardSearch(query: string): MockCardSearchResult[] {
  const lowerQuery = query.toLowerCase().trim();

  if (lowerQuery.length < 2) {
    return [];
  }

  // Search by card name or set name
  const results = MOCK_CARD_DATABASE.filter(
    (card) =>
      card.name.toLowerCase().includes(lowerQuery) ||
      card.set.toLowerCase().includes(lowerQuery),
  );

  // Sort by relevance (exact name match first, then partial matches)
  return results
    .sort((a, b) => {
      const aNameMatch = a.name.toLowerCase() === lowerQuery;
      const bNameMatch = b.name.toLowerCase() === lowerQuery;

      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;

      const aStartsWith = a.name.toLowerCase().startsWith(lowerQuery);
      const bStartsWith = b.name.toLowerCase().startsWith(lowerQuery);

      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      return a.name.localeCompare(b.name);
    })
    .slice(0, 10); // Limit to top 10 results
}
