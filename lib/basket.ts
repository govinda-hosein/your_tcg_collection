export type BasketItem = {
  cardId: string;
  cardName: string;
  cardImage?: string;
  setName?: string;
  rarity?: string;
  quantity: number;
  maxQuantity?: number;
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
    const cardImage =
      typeof item.cardImage === "string" ? item.cardImage.trim() : "";
    const setName = typeof item.setName === "string" ? item.setName.trim() : "";
    const rarity = typeof item.rarity === "string" ? item.rarity.trim() : "";
    const quantity = Number.isFinite(item.quantity)
      ? Math.max(1, Math.floor(Number(item.quantity)))
      : 1;
    const maxQuantity =
      typeof item.maxQuantity === "number" && Number.isFinite(item.maxQuantity)
        ? Math.max(1, Math.floor(item.maxQuantity))
        : undefined;

    if (!cardId || !cardName) continue;

    result.push({
      cardId,
      cardName,
      cardImage,
      setName,
      rarity,
      quantity,
      ...(maxQuantity !== undefined ? { maxQuantity } : {}),
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
    .map((item) => {
      if (item.cardId !== cardId) return item;
      const newQuantity = Math.max(1, item.quantity + delta);
      const clamped =
        item.maxQuantity !== undefined
          ? Math.min(newQuantity, item.maxQuantity)
          : newQuantity;
      return { ...item, quantity: clamped };
    })
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

export function addBasketItem(
  items: BasketItem[],
  item: Omit<BasketItem, "quantity">,
  quantityToAdd = 1,
  maxQuantity?: number,
): BasketItem[] {
  const safeQuantityToAdd = Math.max(1, Math.floor(quantityToAdd));
  const safeMax =
    typeof maxQuantity === "number" && Number.isFinite(maxQuantity)
      ? Math.max(1, Math.floor(maxQuantity))
      : undefined;

  const existing = items.find((entry) => entry.cardId === item.cardId);
  const currentQuantity = existing?.quantity ?? 0;
  const nextQuantityRaw = currentQuantity + safeQuantityToAdd;
  const nextQuantity =
    typeof safeMax === "number"
      ? Math.min(nextQuantityRaw, safeMax)
      : nextQuantityRaw;

  if (existing) {
    return items.map((entry) =>
      entry.cardId === item.cardId
        ? {
            ...entry,
            cardName: item.cardName,
            cardImage: item.cardImage,
            setName: item.setName,
            rarity: item.rarity,
            quantity: nextQuantity,
            ...(safeMax !== undefined ? { maxQuantity: safeMax } : {}),
          }
        : entry,
    );
  }

  return [
    ...items,
    {
      ...item,
      quantity: nextQuantity,
      ...(safeMax !== undefined ? { maxQuantity: safeMax } : {}),
    },
  ];
}

/**
 * Encodes basket items into a compact URL-safe string: "cardId:qty,cardId:qty,..."
 * Only cardId and quantity are encoded; card details are resolved from the API on the receiving end.
 */
export function encodeBasketToUrl(items: BasketItem[]): string {
  return items.map((item) => `${item.cardId}:${item.quantity}`).join(",");
}

/**
 * Decodes a basket URL param (produced by encodeBasketToUrl) back into cardId/quantity pairs.
 * Uses lastIndexOf to safely handle cardIds that could contain colons.
 */
export function decodeBasketParam(
  param: string,
): Array<{ cardId: string; quantity: number }> {
  if (!param) return [];
  return param.split(",").flatMap((segment) => {
    const lastColon = segment.lastIndexOf(":");
    if (lastColon === -1) return [];
    const cardId = segment.slice(0, lastColon).trim();
    const quantity = parseInt(segment.slice(lastColon + 1), 10);
    if (!cardId || !Number.isFinite(quantity) || quantity < 1) return [];
    return [{ cardId, quantity: Math.floor(quantity) }];
  });
}
