"use client";

import {
  BasketItem,
  changeBasketItemQuantity,
  clearBasketItems,
  getBasketTotals,
  readBasketFromStorage,
  removeBasketItem,
  writeBasketToStorage,
} from "@/lib/basket";
import { useEffect, useMemo, useState } from "react";

export function useBasket() {
  const [items, setItems] = useState<BasketItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setItems(readBasketFromStorage());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    writeBasketToStorage(items);
  }, [items, isHydrated]);

  const totals = useMemo(() => getBasketTotals(items), [items]);

  const changeQuantity = (id: string, delta: number) => {
    setItems((prev) => changeBasketItemQuantity(prev, id, delta));
  };

  const removeItem = (id: string) => {
    setItems((prev) => removeBasketItem(prev, id));
  };

  const clearBasket = () => {
    setItems(clearBasketItems());
  };

  return {
    items,
    isHydrated,
    totals,
    changeQuantity,
    removeItem,
    clearBasket,
    setItems,
  };
}
