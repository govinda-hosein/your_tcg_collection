import { CARD_CONDITIONS, RARITY_COLORS } from "@/lib/constants";
import { Edit2, Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

import type { OwnedCardViewModel } from "@/database/ownedCard.model";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { useSession } from "next-auth/react";
import Image from "next/image";

interface CardDetailModalProps {
  card: OwnedCardViewModel;
  onClose: () => void;
  onUpdate: (updates: Partial<OwnedCardViewModel>) => Promise<void> | void;
  onSaveSuccess?: (updatedQuantity: number) => void;
  onDelete: () => void;
  isLoggedIn: boolean;
}

export function CardDetailModal({
  card,
  onClose,
  onUpdate,
  onSaveSuccess,
  onDelete,
  isLoggedIn,
}: CardDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState(card);
  const [quantityInput, setQuantityInput] = useState(String(card.quantity));
  const [priceInput, setPriceInput] = useState(String(card.price ?? 1));
  const [cardConditionInput, setCardConditionInput] = useState(
    card.cardCondition || "Mint",
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const pokemonCard = card.card;

  useEffect(() => {
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
    };
  }, []);

  const getNormalizedQuantity = () => {
    const parsed = Number.parseInt(quantityInput, 10);
    if (!Number.isFinite(parsed) || parsed < 1) return 1;
    return parsed;
  };

  const getNormalizedPrice = () => {
    const parsed = Number.parseFloat(priceInput);
    if (!Number.isFinite(parsed) || parsed < 0) return card.price ?? 1;
    return parsed;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const normalizedQuantity = getNormalizedQuantity();
      const normalizedPrice = getNormalizedPrice();
      const normalizedCondition = cardConditionInput.trim() || "Mint";
      const payload = {
        ...editData,
        quantity: normalizedQuantity,
        price: normalizedPrice,
        cardCondition: normalizedCondition,
      };
      await onUpdate(payload);
      onSaveSuccess?.(normalizedQuantity);
      setEditData(payload);
      setQuantityInput(String(normalizedQuantity));
      setPriceInput(String(normalizedPrice));
      setCardConditionInput(normalizedCondition);
      setIsEditing(false);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const rarityGradient =
    RARITY_COLORS[pokemonCard?.rarity ?? ""] || "from-gray-300 to-gray-200";
  const hasPrice = card.price !== null && card.price !== undefined;
  const { isEnabled } = useFeatureFlags();
  const showPriceFlag = isEnabled("show_price");
  const showConditionFlag = isEnabled("show_card_condition");

  const { data: session } = useSession();
  const isAdmin = !!session;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-3 md:p-6"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      {/* Modal */}
      <div
        className="relative bg-card rounded-2xl shadow-2xl max-w-6xl w-full
                    border-4 border-border overflow-hidden max-h-[94vh] overflow-y-auto"
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
        <div className="grid md:grid-cols-[1.2fr_1fr]">
          {/* Left: Card Image */}
          <div className="h-[55vh] relative overflow-hidden bg-black/5 flex items-center justify-center md:h-[78vh]">
            <Image
              src={
                pokemonCard?.images?.large ||
                pokemonCard?.images?.small ||
                "/placeholder.png"
              }
              alt={pokemonCard?.name || "Pokemon Card"}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-4 md:p-6"
            />
          </div>

          {/* Right: Card Details */}
          <div className="p-6 pt-0 md:p-8 md:pt-8 flex flex-col">
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

                  <div className="md:space-y-3 md:mt-6">
                    {isAdmin && (
                      <div className="flex items-center justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Card ID</span>
                        <span className="font-medium">{card.cardId}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Set</span>
                      <span className="font-medium">
                        {pokemonCard?.set?.name || "Unknown Set"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Set Number</span>
                      <span className="font-medium">
                        {pokemonCard?.number || "-"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Artist</span>
                      <span className="font-medium">
                        {pokemonCard?.artist || "Unknown Artist"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">In Stock</span>
                      <span className="font-bold text-xl">
                        ×{card.quantity}
                      </span>
                    </div>

                    {showPriceFlag && (
                      <div className="flex items-center justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Price</span>
                        <div className="rounded-full bg-emerald-700 px-2 py-1 text-xs font-bold text-white">
                          {hasPrice ? `$${card.price.toFixed(2)}` : "$1"}
                        </div>
                      </div>
                    )}

                    {showConditionFlag && (
                      <div className="flex items-center justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Condition</span>
                        <div className="rounded-full bg-slate-700 px-2 py-1 text-xs font-bold text-white">
                          {card.cardCondition || "Mint"}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {isLoggedIn && (
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => {
                        setQuantityInput(String(editData.quantity));
                        setPriceInput(String(editData.price ?? 1));
                        setCardConditionInput(editData.cardCondition || "Mint");
                        setIsEditing(true);
                      }}
                      className="flex-1 px-4 py-3 bg-accent text-accent-foreground rounded-lg
                               flex items-center justify-center gap-2 hover:scale-105
                               transition-transform duration-200"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex-1 px-4 py-3 bg-destructive text-destructive-foreground rounded-lg
                               flex items-center justify-center gap-2 hover:scale-105
                               transition-transform duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Edit Mode */}
                <div className="flex-1 space-y-4">
                  <h3
                    className="text-xl mb-4"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Edit Card Details
                  </h3>

                  <div>
                    <label className="block text-sm mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={quantityInput}
                      onChange={(e) => setQuantityInput(e.target.value)}
                      onBlur={() =>
                        setQuantityInput(String(getNormalizedQuantity()))
                      }
                      className="w-full px-4 py-2 bg-input-background border-2 border-border
                               rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>

                  {showPriceFlag && (
                    <div>
                      <label className="block text-sm mb-1">Price</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={priceInput}
                        onChange={(e) => setPriceInput(e.target.value)}
                        onBlur={() =>
                          setPriceInput(getNormalizedPrice().toFixed(2))
                        }
                        className="w-full px-4 py-2 bg-input-background border-2 border-border
                                 rounded-lg focus:outline-none focus:border-primary"
                      />
                    </div>
                  )}

                  {showConditionFlag && (
                    <div>
                      <label className="block text-sm mb-1">Condition</label>
                      <select
                        value={cardConditionInput}
                        onChange={(e) => setCardConditionInput(e.target.value)}
                        className="w-full px-4 py-2 bg-input-background border-2 border-border
                                 rounded-lg focus:outline-none focus:border-primary"
                      >
                        {!CARD_CONDITIONS.includes(
                          cardConditionInput as (typeof CARD_CONDITIONS)[number],
                        ) ? (
                          <option value={cardConditionInput}>
                            {cardConditionInput}
                          </option>
                        ) : null}

                        {CARD_CONDITIONS.map((condition) => (
                          <option key={condition} value={condition}>
                            {condition}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Edit Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setEditData(card);
                      setQuantityInput(String(card.quantity));
                      setPriceInput(String(card.price ?? 1));
                      setCardConditionInput(card.cardCondition || "Mint");
                      setIsEditing(false);
                    }}
                    disabled={isSaving}
                    className="flex-1 px-4 py-3 border-2 border-border rounded-lg
                             hover:bg-muted transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg
                             flex items-center justify-center gap-2 hover:scale-105
                             transition-transform duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {isSaving ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                        SAVING...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        SAVE
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-110 flex items-center justify-center p-4"
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteConfirm(false);
          }}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="relative w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold">Delete this card?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This will remove {pokemonCard?.name ?? "this card"} from your
              collection.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDelete();
                }}
                className="rounded-lg bg-destructive px-4 py-2 text-sm text-destructive-foreground hover:opacity-90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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
