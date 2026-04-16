import type { OwnedCardViewModel } from "@/database/ownedCard.model";
import { RARITY_COLORS } from "@/lib/constants";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface CardItemProps {
  card: OwnedCardViewModel;
  onClick: () => void;
  onDelete: (id: string) => void;
  index: number;
  isLoggedIn: boolean;
}

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

export function CardItem({
  card,
  onClick,
  onDelete,
  index,
  isLoggedIn,
}: CardItemProps) {
  const pokemonCard = card.card;
  const rarityGradient =
    RARITY_COLORS[pokemonCard?.rarity ?? ""] || "from-gray-300 to-gray-200";
  const isHolo =
    pokemonCard?.rarity?.includes("Holo") ||
    pokemonCard?.rarity?.includes("Ultra") ||
    pokemonCard?.rarity?.includes("Secret");

  const [showConfirm, setShowConfirm] = useState(false);
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
        <div className={`aspect-2/3  relative overflow-hidden`}>
          {/* Placeholder Pokemon Silhouette */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/5">
            <Image
              src={pokemonCard?.images?.small || "/placeholder.png"}
              alt={pokemonCard?.name || "Pokemon Card"}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 25vw"
              className="object-contain"
            />
          </div>
        </div>

        {/* Card Info */}
        <div className="p-3 bg-white">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <h3 className="font-bold text-sm mb-1 truncate">
              {pokemonCard?.name || "Unknown Card"}
            </h3>
            {/* Type Badge */}
            {pokemonCard?.types?.[0] && (
              <div
                className="px-2 py-1 rounded-md text-xs font-bold text-white shadow-lg"
                style={{
                  backgroundColor: typeColors[pokemonCard.types[0]] || "#666",
                }}
              >
                {pokemonCard.types[0]}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{pokemonCard?.set?.name || "Unknown Set"}</span>
            <span>{pokemonCard?.number || "-"}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
            <span>In Stock</span>
            {/* Quantity Badge */}
            <div
              className=" bg-black/70 text-white
                          px-2 py-1 rounded-full text-xs font-bold"
            >
              x{card.quantity}
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span
              className={`text-xs px-2 py-0.5 rounded-full bg-linear-to-r ${rarityGradient}
                           text-white font-medium`}
            >
              {pokemonCard?.rarity || "Rare"}
            </span>
          </div>
        </div>

        {/* Delete Button */}
        {isLoggedIn ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowConfirm(true);
            }}
            className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground
                     rounded-full opacity-0 group-hover:opacity-100
                     hover:scale-110 transition-all duration-200 shadow-lg z-10"
            aria-label="Delete card"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => {
            e.stopPropagation();
            setShowConfirm(false);
          }}
        >
          <div
            className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-2">Remove card?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to remove{" "}
              <span className="font-semibold">
                {pokemonCard?.name ?? "this card"}
              </span>{" "}
              from your collection? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 rounded-lg text-sm font-medium border border-border hover:bg-muted transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowConfirm(false);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg text-sm font-medium bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowConfirm(false);
                  onDelete(card.cardId);
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

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
