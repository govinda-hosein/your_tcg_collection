import type {
  CardCondition,
  OwnedCardViewModel,
} from "@/database/ownedCard.model";
import { Edit2, Save, Trash2, X } from "lucide-react";

import { RARITY_COLORS } from "@/lib/constants";
import { useState } from "react";

interface CardDetailModalProps {
  card: OwnedCardViewModel;
  onClose: () => void;
  onUpdate: (updates: Partial<OwnedCardViewModel>) => void;
  onDelete: () => void;
}

export function CardDetailModal({
  card,
  onClose,
  onUpdate,
  onDelete,
}: CardDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(card);
  const pokemonCard = card.card;

  const handleSave = () => {
    onUpdate(editData);
    setIsEditing(false);
  };

  const rarityGradient =
    RARITY_COLORS[pokemonCard?.rarity ?? ""] || "from-gray-300 to-gray-200";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      {/* Modal */}
      <div
        className="relative bg-card rounded-2xl shadow-2xl max-w-2xl w-full
                    border-4 border-border overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: "modalZoomIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70
                   rounded-lg transition-colors duration-200"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Card Display */}
        <div className="grid md:grid-cols-2">
          {/* Left: Card Image */}
          <div
            className={`aspect-2/3 bg-linear-to-br ${rarityGradient} relative overflow-hidden`}
          >
            {/* Placeholder Pokemon Silhouette */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-9xl opacity-20">⚡</div>
            </div>

            {/* Holographic Animation */}
            {(pokemonCard?.rarity?.includes("Holo") ||
              pokemonCard?.rarity?.includes("Ultra") ||
              pokemonCard?.rarity?.includes("Secret")) && (
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  background: `
                       repeating-linear-gradient(
                         45deg,
                         transparent,
                         transparent 20px,
                         rgba(255, 255, 255, 0.2) 20px,
                         rgba(255, 255, 255, 0.2) 40px
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
                  animation: "shimmer 3s linear infinite",
                }}
              />
            )}

            {/* Card Set Number */}
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
                <div className="text-xs opacity-70">Set Number</div>
                <div className="text-lg font-bold">
                  {pokemonCard?.number || "-"}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Card Details */}
          <div className="p-6 flex flex-col">
            {!isEditing ? (
              <>
                {/* View Mode */}
                <div className="flex-1">
                  <h2
                    className="text-3xl mb-2"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {pokemonCard?.name || "Unknown Card"}
                  </h2>
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-sm
                                 bg-linear-to-r ${rarityGradient} text-white font-bold mb-4`}
                  >
                    {pokemonCard?.rarity || "Rare"}
                  </div>

                  <div className="space-y-3 mt-6">
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Set</span>
                      <span className="font-medium">
                        {pokemonCard?.set?.name || "Unknown Set"}
                      </span>
                    </div>

                    {pokemonCard?.types?.[0] && (
                      <div className="flex items-center justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Type</span>
                        <span className="font-medium">
                          {pokemonCard.types[0]}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Condition</span>
                      <span className="font-medium">{card.condition}</span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Quantity</span>
                      <span className="font-bold text-xl">
                        ×{card.quantity}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 px-4 py-3 bg-accent text-accent-foreground rounded-lg
                             flex items-center justify-center gap-2 hover:scale-105
                             transition-transform duration-200"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={onDelete}
                    className="flex-1 px-4 py-3 bg-destructive text-destructive-foreground rounded-lg
                             flex items-center justify-center gap-2 hover:scale-105
                             transition-transform duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Edit Mode */}
                <div className="flex-1 space-y-4">
                  <h3
                    className="text-xl mb-4"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    EDIT CARD
                  </h3>

                  <div>
                    <label className="block text-sm mb-1">Card Name</label>
                    <input
                      type="text"
                      value={editData.card?.name || ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          card: editData.card
                            ? { ...editData.card, name: e.target.value }
                            : editData.card,
                        })
                      }
                      className="w-full px-4 py-2 bg-input-background border-2 border-border
                               rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Condition</label>
                    <select
                      value={editData.condition}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          condition: e.target.value as CardCondition,
                        })
                      }
                      className="w-full px-4 py-2 bg-input-background border-2 border-border
                               rounded-lg focus:outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="Mint">Mint</option>
                      <option value="Near Mint">Near Mint</option>
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Played">Played</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={editData.quantity}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          quantity: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-full px-4 py-2 bg-input-background border-2 border-border
                               rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Edit Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setEditData(card);
                      setIsEditing(false);
                    }}
                    className="flex-1 px-4 py-3 border-2 border-border rounded-lg
                             hover:bg-muted transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg
                             flex items-center justify-center gap-2 hover:scale-105
                             transition-transform duration-200"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    <Save className="w-4 h-4" />
                    SAVE
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalZoomIn {
          from {
            opacity: 0;
            transform: scale(0.8) rotateY(10deg);
          }
          to {
            opacity: 1;
            transform: scale(1) rotateY(0deg);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
}
