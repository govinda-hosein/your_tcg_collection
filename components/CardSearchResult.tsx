import type { PokemonCardViewModel } from "@/database";
import { RARITY_COLORS } from "@/lib/constants";
import { isHoloRarity } from "@/lib/functions";
import Image from "next/image";

interface CardSearchResultProps {
  card: PokemonCardViewModel;
  onClick: () => void;
}

export function CardSearchResult({ card, onClick }: CardSearchResultProps) {
  const rarityGradient =
    RARITY_COLORS[card.rarity] || "from-gray-300 to-gray-200";
  const isHolo = isHoloRarity(card.rarity);

  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-3 flex items-center gap-4
               transition-colors duration-200 border-b border-border last:border-b-0
               text-left group ${
                 isHolo
                   ? "hover:bg-linear-to-r hover:from-purple-500/10 hover:via-pink-500/10 hover:to-blue-500/10"
                   : "hover:bg-muted/50"
               }`}
    >
      {/* Card Icon/Preview */}
      <div
        className={`w-16 h-20 rounded-lg bg-linear-to-br ${rarityGradient} shrink-0
                    overflow-hidden shadow-md
                    group-hover:scale-105 transition-transform duration-200 relative`}
      >
        <Image
          src={card.images.small}
          alt={card.name}
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>

      {/* Card Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-lg truncate">{card.name}</h3>
        <div className="text-sm text-muted-foreground">
          {card.set?.name ?? "Unknown Set"} • {card.number}
        </div>
        <div
          className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs
                       bg-linear-to-r ${rarityGradient} text-white font-medium`}
        >
          {card.rarity}
        </div>
      </div>

      {/* Type Badge */}
      {card.types && card.types.length > 0 && (
        <div className="text-2xl shrink-0">
          {card.types[0] === "Fire" && "🔥"}
          {card.types[0] === "Water" && "💧"}
          {card.types[0] === "Electric" && "⚡"}
          {card.types[0] === "Grass" && "🌿"}
          {card.types[0] === "Psychic" && "🔮"}
          {card.types[0] === "Fighting" && "👊"}
          {card.types[0] === "Dark" && "🌙"}
          {card.types[0] === "Steel" && "⚙️"}
          {card.types[0] === "Dragon" && "🐉"}
          {card.types[0] === "Fairy" && "✨"}
        </div>
      )}
    </button>
  );
}
