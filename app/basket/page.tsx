"use client";

import {
  ArrowLeft,
  Copy,
  Minus,
  Plus,
  ShoppingBasket,
  Trash2,
} from "lucide-react";

import { AppToast } from "@/components/AppToast";
import { useBasket } from "@/hooks/useBasket";
import { useToast } from "@/hooks/useToast";
import { RARITY_COLORS } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";

export default function BasketPage() {
  const { items, isHydrated, totals, changeQuantity, removeItem, clearBasket } =
    useBasket();
  const { toastMessage, showToast } = useToast(1700);

  const handleCopyToClipboard = async () => {
    if (items.length === 0) {
      showToast("Your basket is empty");
      return;
    }

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

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.3fr] gap-6">
          <section className="bg-card border-4 border-border rounded-2xl shadow-xl overflow-hidden">
            <div className="h-3 bg-linear-to-r from-accent to-primary" />
            <div className="p-5 sm:p-6">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                    onClick={handleCopyToClipboard}
                    disabled={items.length === 0}
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50 disabled:hover:bg-transparent"
                  >
                    <Copy className="h-4 w-4" />
                    Copy to Clipboard
                  </button>

                  <button
                    type="button"
                    onClick={clearBasket}
                    disabled={items.length === 0}
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50 disabled:hover:bg-transparent"
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
                            <Image
                              src={item.cardImage}
                              alt={item.cardName}
                              fill
                              className="object-contain"
                            />
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
      </div>

      <AppToast message={toastMessage} variant="success" />
    </div>
  );
}
