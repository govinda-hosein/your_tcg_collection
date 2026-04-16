import { Sparkles } from "lucide-react";

interface CardSearchResultProps {
  card: {
    name: string;
    set: string;
    number: string;
    rarity: string;
    type?: string;
  };
  onClick: () => void;
}

const rarityColors: Record<string, string> = {
  Common: "from-gray-400 to-gray-300",
  Uncommon: "from-green-400 to-green-300",
  Rare: "from-blue-400 to-blue-300",
  "Holo Rare": "from-purple-400 to-pink-400",
  "Ultra Rare": "from-yellow-400 to-orange-400",
  "Secret Rare": "from-red-500 to-pink-500",
};

export function CardSearchResult({ card, onClick }: CardSearchResultProps) {
  const rarityGradient =
    rarityColors[card.rarity] || "from-gray-300 to-gray-200";
  const isHolo =
    card.rarity.includes("Holo") ||
    card.rarity.includes("Ultra") ||
    card.rarity.includes("Secret");

  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-3 flex items-center gap-4 hover:bg-muted/50
               transition-colors duration-200 border-b border-border last:border-b-0
               text-left group"
    >
      {/* Card Icon/Preview */}
      <div
        className={`w-16 h-20 rounded-lg bg-linear-to-br ${rarityGradient} shrink-0
                    flex items-center justify-center text-2xl shadow-md
                    group-hover:scale-105 transition-transform duration-200 relative`}
      >
        {isHolo && (
          <Sparkles className="absolute top-1 right-1 w-3 h-3 text-yellow-300" />
        )}
        <span className="opacity-60">⚡</span>
      </div>

      {/* Card Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-lg truncate">{card.name}</h3>
        <div className="text-sm text-muted-foreground">
          {card.set} • {card.number}
        </div>
        <div
          className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs
                       bg-linear-to-r ${rarityGradient} text-white font-medium`}
        >
          {card.rarity}
        </div>
      </div>

      {/* Type Badge */}
      {card.type && (
        <div className="text-2xl shrink-0">
          {card.type === "Fire" && "🔥"}
          {card.type === "Water" && "💧"}
          {card.type === "Electric" && "⚡"}
          {card.type === "Grass" && "🌿"}
          {card.type === "Psychic" && "🔮"}
          {card.type === "Fighting" && "👊"}
          {card.type === "Dark" && "🌙"}
          {card.type === "Steel" && "⚙️"}
          {card.type === "Dragon" && "🐉"}
          {card.type === "Fairy" && "✨"}
        </div>
      )}
    </button>
  );
}
