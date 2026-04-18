"use client";

import { ArrowLeft, Minus, Plus, ShoppingBasket, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

type BasketItem = {
  cardId: string;
  cardName: string;
  setName?: string;
  rarity?: string;
  quantity: number;
};

const BASKET_STORAGE_KEY = "tcg-basket-v1";

function sanitizeItems(value: unknown): BasketItem[] {
  if (!Array.isArray(value)) return [];
  const result: BasketItem[] = [];

  for (const raw of value) {
    if (!raw || typeof raw !== "object") continue;

    const item = raw as Partial<BasketItem>;
    const cardId = typeof item.cardId === "string" ? item.cardId.trim() : "";
    const cardName =
      typeof item.cardName === "string" ? item.cardName.trim() : "";
    const setName = typeof item.setName === "string" ? item.setName.trim() : "";
    const rarity = typeof item.rarity === "string" ? item.rarity.trim() : "";
    const quantity = Number.isFinite(item.quantity)
      ? Math.max(1, Math.floor(Number(item.quantity)))
      : 1;

    if (!cardId || !cardName) continue;

    result.push({
      cardId,
      cardName,
      setName,
      rarity,
      quantity,
    });
  }

  return result;
}

export default function BasketPage() {
  const [items, setItems] = useState<BasketItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(BASKET_STORAGE_KEY);
      if (!raw) {
        setIsHydrated(true);
        return;
      }
      const parsed = JSON.parse(raw);
      setItems(sanitizeItems(parsed));
    } catch {
      setItems([]);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(items));
  }, [items, isHydrated]);

  const totals = useMemo(() => {
    const distinctCards = items.length;
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    return { distinctCards, totalQuantity };
  }, [items]);

  const changeQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.cardId === id
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.cardId !== id));
  };

  const clearBasket = () => {
    setItems([]);
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

              {!isHydrated ? (
                <div className="rounded-xl border-2 border-dashed border-border p-8 text-center text-muted-foreground">
                  Loading basket...
                </div>
              ) : items.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-border p-8 text-center">
                  <ShoppingBasket className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">Your basket is empty.</p>
                  <p className="text-sm text-muted-foreground/80 mt-1">
                    Add cards from the left panel to start.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <article
                      key={item.cardId}
                      className="rounded-xl border-2 border-border bg-input-background/40 p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="font-semibold truncate">
                            {item.cardName}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">
                            ID: {item.cardId}
                            {item.setName ? ` • ${item.setName}` : ""}
                            {item.rarity ? ` • ${item.rarity}` : ""}
                          </p>
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
                            className="h-9 w-9 rounded-lg border border-border hover:bg-muted flex items-center justify-center"
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
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
