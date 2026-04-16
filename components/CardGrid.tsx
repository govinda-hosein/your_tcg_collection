import type { OwnedCardViewModel } from "@/database/ownedCard.model";
import { useState } from "react";
import { CardDetailModal } from "./CardDetailModal";
import { CardItem } from "./CardItem";

interface CardGridProps {
  cards: OwnedCardViewModel[];
  onDelete: (id: string) => void;
  onUpdate: (
    id: string,
    updates: Partial<OwnedCardViewModel>,
  ) => Promise<void> | void;
  isLoggedIn: boolean;
}

export function CardGrid({
  cards,
  onDelete,
  onUpdate,
  isLoggedIn,
}: CardGridProps) {
  const [selectedCard, setSelectedCard] = useState<OwnedCardViewModel | null>(
    null,
  );

  if (cards.length === 0) {
    return (
      <div className="mt-12 text-center py-16 bg-card border-2 border-dashed border-border rounded-xl">
        <div className="text-6xl mb-4">📦</div>
        <h3
          className="text-xl mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          No Cards Found
        </h3>
        <p className="text-muted-foreground">
          Start building your collection by adding your first card!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-8">
        {/* Binder Page Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex-1 h-0.5 bg-linear-to-r from-transparent via-border to-transparent" />
          <span className="text-sm uppercase tracking-widest text-muted-foreground px-4">
            My Collection
          </span>
          <div className="flex-1 h-0.5 bg-linear-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Card Grid - Binder Style */}
        <div
          className="bg-card/50 border-2 border-border rounded-2xl p-6 shadow-lg backdrop-blur-sm
                      relative overflow-hidden"
        >
          {/* Binder holes decoration */}
          <div className="absolute left-4 top-0 bottom-0 flex flex-col justify-around py-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full bg-muted border-2 border-border shadow-inner"
              />
            ))}
          </div>

          {/* Cards */}
          <div className="pl-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cards.map((card, index) => (
              <CardItem
                key={card.cardId}
                card={card}
                onClick={() => setSelectedCard(card)}
                onDelete={onDelete}
                index={index}
                isLoggedIn={isLoggedIn}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Card Detail Modal */}
      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onUpdate={async (updates) => {
            await onUpdate(selectedCard.cardId, updates);
            setSelectedCard({ ...selectedCard, ...updates });
          }}
          onDelete={() => {
            onDelete(selectedCard.cardId);
            setSelectedCard(null);
          }}
          isLoggedIn={isLoggedIn}
        />
      )}
    </>
  );
}
