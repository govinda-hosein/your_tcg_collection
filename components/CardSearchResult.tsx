import type { PokemonCardViewModel } from "@/database";
import { RARITY_COLORS } from "@/lib/constants";
import { isHoloRarity } from "@/lib/functions";
import { withBasePath } from "@/lib/url";
import Image from "next/image";

interface CardSearchResultProps {
  card: PokemonCardViewModel;
  onClick: () => void;
}

const TYPE_ICON_PATHS: Record<string, string> = {
  Fire: "/icons/energy-fire.png",
  Water: "/icons/energy-water.png",
  Lightning: "/icons/energy-lightning.png",
  Grass: "/icons/energy-grass.png",
  Psychic: "/icons/energy-psychic.png",
  Fighting: "/icons/energy-fighting.png",
  Darkness: "/icons/energy-darkness.png",
  Metal: "/icons/energy-metal.png",
  Dragon: "/icons/energy-dragon.png",
  Colorless: "/icons/energy-normal.png",
};

export function CardSearchResult({ card, onClick }: CardSearchResultProps) {
  const rarityGradient =
    RARITY_COLORS[card.rarity] || "from-gray-300 to-gray-200";
  const isHolo = isHoloRarity(card.rarity);
  const primaryType = card.types?.[0] ?? "";
  const typeImageUrl = TYPE_ICON_PATHS[primaryType]
    ? withBasePath(TYPE_ICON_PATHS[primaryType])
    : "";

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
          unoptimized
          sizes="64px"
          className="object-cover"
        />
      </div>

      {/* Card Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-xl truncate">{card.name}</h3>
        <div className="font-semibold text-lg text-muted-foreground">
          {card.set?.name ?? "Unknown Set"} • {card.number}
        </div>
      </div>

      {/* Type Badge */}
      {typeImageUrl ? (
        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md">
          <Image
            src={typeImageUrl}
            alt={`${card.types?.[0] ?? "Unknown"} type icon`}
            fill
            unoptimized
            sizes="32px"
            className="object-cover"
          />
        </div>
      ) : null}
    </button>
  );
}
