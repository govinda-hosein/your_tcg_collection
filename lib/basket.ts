export type BasketItem = {
  cardId: string;
  cardName: string;
  setName?: string;
  rarity?: string;
  quantity: number;
};

export type BasketTotals = {
  distinctCards: number;
  totalQuantity: number;
};

export const BASKET_STORAGE_KEY = "tcg-basket-v1";

export function sanitizeBasketItems(value: unknown): BasketItem[] {
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

export function readBasketFromStorage(): BasketItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(BASKET_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return sanitizeBasketItems(parsed);
  } catch {
    return [];
  }
}

export function writeBasketToStorage(items: BasketItem[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(items));
}

export function getBasketTotals(items: BasketItem[]): BasketTotals {
  return {
    distinctCards: items.length,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

export function changeBasketItemQuantity(
  items: BasketItem[],
  cardId: string,
  delta: number,
): BasketItem[] {
  return items
    .map((item) =>
      item.cardId === cardId
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item,
    )
    .filter((item) => item.quantity > 0);
}

export function removeBasketItem(
  items: BasketItem[],
  cardId: string,
): BasketItem[] {
  return items.filter((item) => item.cardId !== cardId);
}

export function clearBasketItems(): BasketItem[] {
  return [];
}
