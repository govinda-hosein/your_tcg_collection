"use client";

import { ArrowLeft, Loader2, Search } from "lucide-react";

import { CardSearchResult } from "@/components/CardSearchResult";
import {
  mockCardSearch,
  type MockCardSearchResult,
} from "@/lib/mockCardSearch";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddCardPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MockCardSearchResult[]>(
    [],
  );
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCard, setSelectedCard] = useState<MockCardSearchResult | null>(
    null,
  );
  const [quantity, setQuantity] = useState(1);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    // Simulate API delay
    setTimeout(() => {
      const results = mockCardSearch(query);
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  };

  const handleSelectCard = (card: MockCardSearchResult) => {
    setSelectedCard(card);
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleAddToCollection = () => {
    if (!selectedCard) return;

    // TODO: Wire this to a persisted add-card API endpoint.
    console.info("Adding card", {
      card: selectedCard,
      quantity,
    });

    setSelectedCard(null);
    setQuantity(1);
    router.push("/");
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

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push("/")}
          className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground
                   transition-colors duration-200 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Collection
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-5xl mb-2 tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span className="text-primary">ADD</span>{" "}
            <span className="text-accent">CARD</span>
          </h1>
          <p className="text-muted-foreground">
            Search and add cards to your collection
          </p>
        </div>

        {/* Search Section */}
        <div
          className="bg-card border-4 border-border rounded-2xl shadow-2xl overflow-hidden mb-6"
          style={{
            animation: "slideInUp 0.5s ease-out",
          }}
        >
          {/* Decorative Header */}
          <div className="bg-linear-to-r from-primary via-secondary to-accent h-3" />

          <div className="p-8">
            <label className="block text-sm mb-2 font-medium">
              Search for a Card
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Type a Pokemon name... (e.g., Pikachu, Charizard)"
                className="w-full pl-12 pr-4 py-4 bg-input-background border-2 border-border
                         rounded-lg focus:outline-none focus:border-primary
                         transition-colors duration-200 text-lg"
                autoFocus
              />
              {isSearching && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary animate-spin" />
              )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-4 border-2 border-border rounded-lg overflow-hidden bg-input-background max-h-96 overflow-y-auto">
                {searchResults.map((card, index) => (
                  <CardSearchResult
                    key={`${card.name}-${card.set}-${index}`}
                    card={card}
                    onClick={() => handleSelectCard(card)}
                  />
                ))}
              </div>
            )}

            {!isSearching &&
              searchQuery.length >= 2 &&
              searchResults.length === 0 && (
                <div className="mt-4 text-center py-8 text-muted-foreground">
                  No cards found matching &quot;{searchQuery}&quot;
                </div>
              )}
          </div>
        </div>

        {/* Selected Card Section */}
        {selectedCard && (
          <div
            className="bg-card border-4 border-border rounded-2xl shadow-2xl overflow-hidden"
            style={{
              animation: "slideInUp 0.5s ease-out",
            }}
          >
            {/* Decorative Header */}
            <div className="bg-linear-to-r from-accent to-primary h-3" />

            <div className="p-8">
              <h2
                className="text-2xl mb-6"
                style={{ fontFamily: "var(--font-display)" }}
              >
                SELECTED CARD
              </h2>

              {/* Card Preview */}
              <div className="bg-linear-to-br from-purple-100 to-pink-100 rounded-xl p-6 mb-6 border-2 border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">
                      {selectedCard.name}
                    </h3>
                    <div className="text-muted-foreground">
                      {selectedCard.set} • {selectedCard.number}
                    </div>
                    <div className="mt-2 inline-block px-3 py-1 rounded-full text-sm bg-linear-to-r from-purple-400 to-pink-400 text-white font-bold">
                      {selectedCard.rarity}
                    </div>
                  </div>
                  {selectedCard.type && (
                    <div className="text-5xl">
                      {selectedCard.type === "Fire" && "🔥"}
                      {selectedCard.type === "Water" && "💧"}
                      {selectedCard.type === "Electric" && "⚡"}
                      {selectedCard.type === "Grass" && "🌿"}
                      {selectedCard.type === "Psychic" && "🔮"}
                    </div>
                  )}
                </div>
              </div>

              {/* Add Details Form */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm mb-2 font-medium">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(parseInt(e.target.value) || 1)
                      }
                      className="w-full px-4 py-3 bg-input-background border-2 border-border
                               rounded-lg focus:outline-none focus:border-primary
                               transition-colors duration-200"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedCard(null)}
                    className="flex-1 px-6 py-4 border-2 border-border rounded-lg
                             hover:bg-muted transition-all duration-200 text-lg"
                  >
                    Change Card
                  </button>
                  <button
                    type="button"
                    onClick={handleAddToCollection}
                    className="flex-1 px-6 py-4 bg-primary text-primary-foreground rounded-lg
                             hover:scale-105 transition-transform duration-200 shadow-lg
                             text-lg"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    ADD TO COLLECTION
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
