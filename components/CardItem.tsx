import type { OwnedCardViewModel } from "@/database/ownedCard.model";
import {
  addBasketItem,
  readBasketFromStorage,
  writeBasketToStorage,
} from "@/lib/basket";
import { RARITY_COLORS } from "@/lib/constants";
import { isHoloRarity } from "@/lib/functions";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type BasketAddEvent = {
  cardName: string;
  addedQuantity: number;
  inBasketQuantity: number;
};

interface CardItemProps {
  card: OwnedCardViewModel;
  onClick: () => void;
  onDelete: (id: string) => void;
  index: number;
  isLoggedIn: boolean;
  onBasketAdd?: (event: BasketAddEvent) => void;
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

export function CardItem({ card, onClick, index, onBasketAdd }: CardItemProps) {
  const pokemonCard = card.card;
  const rarityGradient =
    RARITY_COLORS[pokemonCard?.rarity ?? ""] || "from-gray-300 to-gray-200";
  const isHolo = isHoloRarity(pokemonCard?.rarity);
  const [basketQuantityToAdd, setBasketQuantityToAdd] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [inBasketQuantity, setInBasketQuantity] = useState(0);

  const quantityOptions = useMemo(
    () => Array.from({ length: Math.max(1, card.quantity) }, (_, i) => i + 1),
    [card.quantity],
  );

  useEffect(() => {
    const existingItems = readBasketFromStorage();
    const currentInBasket =
      existingItems.find((item) => item.cardId === card.cardId)?.quantity ?? 0;
    setInBasketQuantity(Math.min(currentInBasket, card.quantity));
  }, [card.cardId, card.quantity]);

  const handleAddToBasket = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    const existingItems = readBasketFromStorage();
    const previousInBasket =
      existingItems.find((item) => item.cardId === card.cardId)?.quantity ?? 0;
    const nextItems = addBasketItem(
      existingItems,
      {
        cardId: card.cardId,
        cardName: pokemonCard?.name || "Unknown Card",
        setName: pokemonCard?.set?.name || "",
        rarity: pokemonCard?.rarity || "",
      },
      basketQuantityToAdd,
      card.quantity,
    );

    writeBasketToStorage(nextItems);
    const nextInBasket =
      nextItems.find((item) => item.cardId === card.cardId)?.quantity ?? 0;
    const addedQuantity = Math.max(0, nextInBasket - previousInBasket);

    setInBasketQuantity(nextInBasket);
    onBasketAdd?.({
      cardName: pokemonCard?.name || "Unknown Card",
      addedQuantity,
      inBasketQuantity: nextInBasket,
    });

    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1200);
  };

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
              src={pokemonCard?.images?.large || "/placeholder.png"}
              alt={pokemonCard?.name || "Pokemon Card"}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 25vw"
              className="object-contain"
            />
          </div>
        </div>

        {/* Card Info */}
        <div className="p-3 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-muted-foreground mb-2">
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
            <span className="text-[11px] text-muted-foreground font-medium">
              In Basket: {inBasketQuantity}
            </span>
          </div>

          <div
            className="mt-2 flex items-center gap-2"
            onClick={(event) => event.stopPropagation()}
          >
            {card.quantity > 1 ? (
              <select
                value={basketQuantityToAdd}
                onChange={(event) =>
                  setBasketQuantityToAdd(parseInt(event.target.value, 10) || 1)
                }
                className="w-14 rounded-md border border-border bg-white px-1 py-1 text-xs"
                aria-label={`Select quantity for ${pokemonCard?.name || "card"}`}
              >
                {quantityOptions.map((qty) => (
                  <option key={qty} value={qty}>
                    {qty}
                  </option>
                ))}
              </select>
            ) : null}

            <button
              type="button"
              onClick={handleAddToBasket}
              className="flex-1 rounded-md border border-accent/50 bg-accent/10 px-2 py-1.5 text-xs font-semibold
                         hover:bg-accent/20 transition-colors duration-200"
            >
              {justAdded ? "Added" : "Add to Basket"}
            </button>
          </div>
        </div>
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
