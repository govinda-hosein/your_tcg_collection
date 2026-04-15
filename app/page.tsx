"use client";

import { CardGrid } from "@/components/CardGrid";
import { CollectionStats } from "@/components/CollectionStats";
import { SearchBar } from "@/components/SearchBar";
import { Plus } from "lucide-react";
import { useState } from "react";

export interface PokemonCard {
  id: string;
  name: string;
  set: string;
  number: string;
  rarity:
    | "Common"
    | "Uncommon"
    | "Rare"
    | "Holo Rare"
    | "Ultra Rare"
    | "Secret Rare";
  condition: "Mint" | "Near Mint" | "Excellent" | "Good" | "Played" | "Poor";
  quantity: number;
  imageUrl?: string;
  type?: string;
}

const INITIAL_CARDS: PokemonCard[] = [
  {
    id: "1",
    name: "Charizard",
    set: "Base Set",
    number: "4/102",
    rarity: "Holo Rare",
    condition: "Near Mint",
    quantity: 1,
    type: "Fire",
  },
  {
    id: "2",
    name: "Pikachu",
    set: "Base Set",
    number: "58/102",
    rarity: "Common",
    condition: "Excellent",
    quantity: 3,
    type: "Electric",
  },
  {
    id: "3",
    name: "Blastoise",
    set: "Base Set",
    number: "2/102",
    rarity: "Holo Rare",
    condition: "Mint",
    quantity: 1,
    type: "Water",
  },
  {
    id: "4",
    name: "Mewtwo",
    set: "Base Set",
    number: "10/102",
    rarity: "Holo Rare",
    condition: "Near Mint",
    quantity: 2,
    type: "Psychic",
  },
  {
    id: "5",
    name: "Gyarados",
    set: "Base Set",
    number: "6/102",
    rarity: "Holo Rare",
    condition: "Excellent",
    quantity: 1,
    type: "Water",
  },
  {
    id: "6",
    name: "Alakazam",
    set: "Base Set",
    number: "1/102",
    rarity: "Holo Rare",
    condition: "Near Mint",
    quantity: 1,
    type: "Psychic",
  },
];

export default function Home() {
  const title = process.env.NEXT_PUBLIC_SITE_TITLE || "Your TCG Collection";
  const words = title.trim().split(/\s+/);
  const splitIndex = Math.ceil(words.length / 2);
  const titleStart = words.slice(0, splitIndex).join(" ");
  const titleEnd = words.slice(splitIndex).join(" ");

  const [cards, setCards] = useState<PokemonCard[]>(INITIAL_CARDS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCards = cards.filter((card) => {
    const matchesSearch =
      card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.set.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleAddCard = (newCard: Omit<PokemonCard, "id">) => {
    const card: PokemonCard = {
      ...newCard,
      id: Date.now().toString(),
    };
    setCards([...cards, card]);
  };

  const handleDeleteCard = (id: string) => {
    setCards(cards.filter((card) => card.id !== id));
  };

  const handleUpdateCard = (id: string, updates: Partial<PokemonCard>) => {
    setCards(
      cards.map((card) => (card.id === id ? { ...card, ...updates } : card)),
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Vintage paper texture overlay */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-5xl mb-2 tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span className="text-primary">{titleStart}</span>
            {titleEnd ? " " : null}
            <span className="text-accent">{titleEnd}</span>
          </h1>
          <p className="text-muted-foreground">
            {process.env.NEXT_PUBLIC_SITE_DESCRIPTION}
          </p>
        </div>

        {/* Collection Stats */}
        <CollectionStats />

        {/* Controls */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg
                     flex items-center gap-2 shadow-lg hover:scale-105
                     transition-transform duration-200"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <Plus className="w-5 h-5" />
            ADD CARD
          </button>
        </div>

        {/* Card Grid */}
        <CardGrid
          cards={filteredCards}
          onDelete={handleDeleteCard}
          onUpdate={handleUpdateCard}
        />
      </div>
    </div>
  );
}
