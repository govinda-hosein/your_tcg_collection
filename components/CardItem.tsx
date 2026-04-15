import { Sparkles, Trash2 } from "lucide-react";

import { PokemonCard } from "@/app/page";

interface CardItemProps {
  card: PokemonCard;
  onClick: () => void;
  onDelete: (id: string) => void;
  index: number;
}

const rarityColors: Record<string, string> = {
  Common: "from-gray-400 to-gray-300",
  Uncommon: "from-green-400 to-green-300",
  Rare: "from-blue-400 to-blue-300",
  "Holo Rare": "from-purple-400 to-pink-400",
  "Ultra Rare": "from-yellow-400 to-orange-400",
  "Secret Rare": "from-red-500 to-pink-500",
};

const typeColors: Record<string, string> = {
  Fire: "#ef233c",
  Water: "#3d5a80",
  Electric: "#ffd60a",
  Grass: "#06ffa5",
  Psychic: "#8338ec",
  Fighting: "#d62828",
  Dark: "#2b2d42",
  Steel: "#a0a0a0",
  Dragon: "#ff006e",
  Fairy: "#ffc6ff",
};

export function CardItem({ card, onClick, onDelete, index }: CardItemProps) {
  const rarityGradient =
    rarityColors[card.rarity] || "from-gray-300 to-gray-200";
  const isHolo =
    card.rarity.includes("Holo") ||
    card.rarity.includes("Ultra") ||
    card.rarity.includes("Secret");

  return (
    <div
      className="group relative cursor-pointer"
      style={{
        animation: `fadeInScale 0.5s ease-out ${index * 0.05}s forwards`,
        opacity: 0,
      }}
      onClick={onClick}
    >
      {/* Card Sleeve Effect */}
      <div
        className="absolute -inset-2 bg-linear-to-br from-white/40 to-transparent
                    rounded-2xl blur-sm group-hover:blur-md transition-all duration-300"
      />

      {/* Card Container */}
      <div
        className="relative bg-white rounded-xl shadow-md overflow-hidden
                    border-4 border-white group-hover:shadow-2xl
                    group-hover:-translate-y-2 group-hover:rotate-1
                    transition-all duration-300"
      >
        {/* Holographic Effect Overlay */}
        {isHolo && (
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-30
                       transition-opacity duration-300 pointer-events-none"
            style={{
              background: `
                   repeating-linear-gradient(
                     45deg,
                     transparent,
                     transparent 10px,
                     rgba(255, 255, 255, 0.3) 10px,
                     rgba(255, 255, 255, 0.3) 20px
                   ),
                   linear-gradient(
                     135deg,
                     #667eea 0%,
                     #764ba2 25%,
                     #f093fb 50%,
                     #4facfe 75%,
                     #00f2fe 100%
                   )
                 `,
            }}
          />
        )}

        {/* Card Image Placeholder */}
        <div
          className={`aspect-2/3 bg-linear-to-br ${rarityGradient} relative overflow-hidden`}
        >
          {/* Placeholder Pokemon Silhouette */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl opacity-20">⚡</div>
          </div>

          {/* Type Badge */}
          {card.type && (
            <div
              className="absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-bold text-white shadow-lg"
              style={{ backgroundColor: typeColors[card.type] || "#666" }}
            >
              {card.type}
            </div>
          )}

          {/* Holo Sparkle Indicator */}
          {isHolo && (
            <div className="absolute top-2 left-2">
              <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            </div>
          )}

          {/* Quantity Badge */}
          {card.quantity > 1 && (
            <div
              className="absolute bottom-2 right-2 bg-black/70 text-white
                          px-2 py-1 rounded-full text-xs font-bold"
            >
              x{card.quantity}
            </div>
          )}
        </div>

        {/* Card Info */}
        <div className="p-3 bg-white">
          <h3 className="font-bold text-sm mb-1 truncate">{card.name}</h3>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{card.set}</span>
            <span>{card.number}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span
              className={`text-xs px-2 py-0.5 rounded-full bg-linear-to-r ${rarityGradient}
                           text-white font-medium`}
            >
              {card.rarity}
            </span>
            <span className="text-xs text-muted-foreground">
              {card.condition}
            </span>
          </div>
        </div>

        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(card.id);
          }}
          className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground
                   rounded-full opacity-0 group-hover:opacity-100
                   hover:scale-110 transition-all duration-200 shadow-lg z-10"
          aria-label="Delete card"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
