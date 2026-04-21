"use client";

import {
  ArrowLeft,
  Copy,
  Minus,
  Plus,
  Share2,
  ShoppingBasket,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { AppToast } from "@/components/AppToast";
import type { OwnedCardViewModel } from "@/database/ownedCard.model";
import { useBasket } from "@/hooks/useBasket";
import { useToast } from "@/hooks/useToast";
import { BasketItem, decodeBasketParam, encodeBasketToUrl } from "@/lib/basket";
import { RARITY_COLORS } from "@/lib/constants";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function BasketPage() {
  const {
    items,
    isHydrated,
    totals,
    changeQuantity,
    removeItem,
    clearBasket,
    setItems,
  } = useBasket();
  const { toastMessage, showToast } = useToast(1700);
  const searchParams = useSearchParams();
  const router = useRouter();

  const [sharedBasketItems, setSharedBasketItems] = useState<
    BasketItem[] | null
  >(null);
  const [isLoadingShared, setIsLoadingShared] = useState(false);
  const [animatingButton, setAnimatingButton] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  const openImageModal = async (item: BasketItem) => {
    // If we already have the large image, use it
    if (item.cardImageLarge) {
      setSelectedImageUrl(item.cardImageLarge);
      return;
    }

    // Otherwise, fetch the card to get the large image
    try {
      const response = await fetch(`${BASE_PATH}/api/owned-cards`);
      if (!response.ok) return;
      const allCards = (await response.json()) as OwnedCardViewModel[];
      const card = allCards.find((c) => c.cardId === item.cardId);
      if (card?.card.images?.large) {
        setSelectedImageUrl(card.card.images.large);
      } else {
        setSelectedImageUrl(item.cardImage ?? null);
      }
    } catch {
      setSelectedImageUrl(item.cardImage ?? null);
    }
  };

  const animateButton = (buttonId: string) => {
    setAnimatingButton(buttonId);
    setTimeout(() => setAnimatingButton(null), 200);
  };

  // On mount: detect ?basket= param, resolve card details, and prompt the user
  useEffect(() => {
    const basketParam = searchParams.get("basket");
    if (!basketParam) return;

    // Remove the param from the URL immediately so refreshes don't re-trigger
    router.replace("/basket", { scroll: false });

    const decoded = decodeBasketParam(basketParam);
    if (decoded.length === 0) return;

    setIsLoadingShared(true);
    fetch(`${BASE_PATH}/api/owned-cards`)
      .then((res) => {
        if (!res.ok) throw new Error(`API error ${res.status}`);
        return res.json();
      })
      .then((ownedCards: OwnedCardViewModel[]) => {
        const resolved: BasketItem[] = decoded.flatMap(
          ({ cardId, quantity }) => {
            const owned = ownedCards.find((c) => c.cardId === cardId);
            if (!owned) return [];
            const clampedQty = Math.min(quantity, owned.quantity);
            return [
              {
                cardId: owned.cardId,
                cardName: owned.card.name,
                cardImage: owned.card.images?.small ?? "",
                cardImageLarge: owned.card.images?.large ?? "",
                setName: owned.card.set?.name ?? "",
                rarity: owned.card.rarity ?? "",
                quantity: clampedQty,
                maxQuantity: owned.quantity,
              },
            ];
          },
        );
        if (resolved.length > 0) {
          setSharedBasketItems(resolved);
        }
      })
      .catch((err) => {
        console.error("Failed to load shared basket:", err);
        showToast("Failed to load shared basket");
      })
      .finally(() => setIsLoadingShared(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleShareBasket = async () => {
    if (items.length === 0) {
      showToast("Your basket is empty");
      return;
    }
    animateButton("share");
    const encoded = encodeBasketToUrl(items);
    const url = `${window.location.origin}${BASE_PATH}/basket?basket=${encoded}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast("Share link copied!");
    } catch {
      showToast("Failed to copy share link");
    }
  };

  const handleCopyToClipboard = async () => {
    if (items.length === 0) {
      showToast("Your basket is empty");
      return;
    }
    animateButton("copy");

    const clipboardText = items
      .map(
        (item, index) =>
          `${index + 1}. ${item.cardName} | Qty: ${item.quantity}${
            item.setName ? ` | Set: ${item.setName}` : ""
          }${item.rarity ? ` | Rarity: ${item.rarity}` : ""}`,
      )
      .join("\n");

    try {
      await navigator.clipboard.writeText(clipboardText);
      showToast(`Copied ${items.length} cards to clipboard`);
    } catch {
      showToast("Failed to copy basket");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Collection
          </Link>
        </div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1
              className="text-4xl sm:text-5xl tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="text-primary">YOUR</span>{" "}
              <span className="text-accent">BASKET</span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              When you&apos;re ready, you can export your basket and contact the
              owner to make arrangements.
            </p>
          </div>
        </div>

        {isLoadingShared && (
          <div className="mb-4 rounded-xl border-2 border-accent/40 bg-accent/10 p-4 text-sm text-muted-foreground">
            Loading shared basket&hellip;
          </div>
        )}

        {sharedBasketItems && (
          <div className="mb-4 rounded-xl border-2 border-accent/40 bg-accent/10 p-4">
            <p className="font-medium mb-1">
              A shared basket with{" "}
              <span
                className="text-accent"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {sharedBasketItems.length} card
                {sharedBasketItems.length !== 1 ? "s" : ""}
              </span>{" "}
              was found in this link.
            </p>
            <p className="text-sm text-muted-foreground mb-3">
              This will replace your current basket.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setItems(sharedBasketItems);
                  setSharedBasketItems(null);
                  showToast("Basket replaced with shared basket");
                }}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                Yes, replace
              </button>
              <button
                type="button"
                onClick={() => setSharedBasketItems(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <section className="max-w-175 bg-card border-4 border-border rounded-2xl shadow-xl overflow-hidden">
          <div className="h-3 bg-linear-to-r from-accent to-primary" />
          <div className="p-5 sm:p-6">
            <div className="mb-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <h2
                  className="text-xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Cards in Basket
                </h2>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs text-primary">
                  <ShoppingBasket className="h-3.5 w-3.5" />
                  <span className="uppercase tracking-wide">Qty</span>
                  <span
                    className="font-semibold text-foreground"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {totals.totalQuantity}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShareBasket}
                  disabled={items.length === 0}
                  className={`inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50 disabled:hover:bg-transparent transition-transform ${
                    animatingButton === "share" ? "scale-110" : ""
                  }`}
                >
                  <Share2 className="h-4 w-4" />
                  Share Link
                </button>

                <button
                  type="button"
                  onClick={handleCopyToClipboard}
                  disabled={items.length === 0}
                  className={`inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50 disabled:hover:bg-transparent transition-transform ${
                    animatingButton === "copy" ? "scale-110" : ""
                  }`}
                >
                  <Copy className="h-4 w-4" />
                  Copy to Clipboard
                </button>

                <button
                  type="button"
                  onClick={() => {
                    animateButton("clear");
                    clearBasket();
                  }}
                  disabled={items.length === 0}
                  className={`inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50 disabled:hover:bg-transparent transition-transform ${
                    animatingButton === "clear" ? "scale-110" : ""
                  }`}
                >
                  <Trash2 className="h-4 w-4" />
                  Clear
                </button>
              </div>
            </div>

            {!isHydrated ? (
              <div className="rounded-xl border-2 border-dashed border-border p-8 text-center text-muted-foreground">
                Loading basket...
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-border p-8 text-center">
                <ShoppingBasket className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">Your basket is empty.</p>
                <p className="text-sm text-muted-foreground/80 mt-1">
                  Add cards from the home page.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <article
                    key={item.cardId}
                    className="rounded-xl border-2 border-border bg-input-background/40 p-4"
                  >
                    <div className="grid grid-cols-[80px_1fr] gap-3 items-stretch">
                      <div className="relative w-20 min-h-28 self-stretch overflow-hidden rounded-md border border-border bg-card/60">
                        {item.cardImage ? (
                          <button
                            type="button"
                            onClick={() => openImageModal(item)}
                            className="h-full w-full hover:opacity-75 transition-opacity"
                          >
                            <Image
                              src={item.cardImage}
                              alt={item.cardName}
                              fill
                              className="object-contain"
                            />
                          </button>
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                            No Img
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 space-y-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold truncate">
                            {item.cardName}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {item.setName || "Unknown Set"}
                          </p>
                          {item.rarity ? (
                            <div className="mt-1.5">
                              <span
                                className={`inline-flex text-xs px-2 py-0.5 rounded-full bg-linear-to-r ${
                                  RARITY_COLORS[item.rarity] ||
                                  "from-gray-300 to-gray-200"
                                } text-white font-medium`}
                              >
                                {item.rarity}
                              </span>
                            </div>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => changeQuantity(item.cardId, -1)}
                            className="h-9 w-9 rounded-lg border border-border hover:bg-muted flex items-center justify-center"
                            aria-label={`Decrease quantity for ${item.cardName}`}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-12 text-center font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => changeQuantity(item.cardId, 1)}
                            disabled={
                              item.maxQuantity !== undefined &&
                              item.quantity >= item.maxQuantity
                            }
                            className="h-9 w-9 rounded-lg border border-border hover:bg-muted flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                            aria-label={`Increase quantity for ${item.cardName}`}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(item.cardId)}
                            className="ml-1 h-9 w-9 rounded-lg border border-destructive/40 text-destructive hover:bg-destructive/10 flex items-center justify-center"
                            aria-label={`Remove ${item.cardName} from basket`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {selectedImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/70 backdrop-blur-md"
          onClick={() => setSelectedImageUrl(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh]">
            <button
              type="button"
              onClick={() => setSelectedImageUrl(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="h-6 w-6 text-white" />
            </button>
            <div className="h-[70vh] relative bg-black/5 flex items-center justify-center rounded-lg overflow-hidden">
              <Image
                src={selectedImageUrl}
                alt="Card preview"
                fill
                sizes="(max-width: 768px) 100vw, 80vw"
                className="object-contain p-4 md:p-6"
              />
            </div>
          </div>
        </div>
      )}

      <AppToast message={toastMessage} variant="success" />
    </div>
  );
}
