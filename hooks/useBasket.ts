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
import { useEffect, useMemo, useRef, useState } from "react";

export function useBasket() {
  const [items, setItems] = useState<BasketItem[]>(() =>
    readBasketFromStorage(),
  );
  const isFirstPersistRef = useRef(true);
  const isHydrated = true;

  useEffect(() => {
    if (isFirstPersistRef.current) {
      isFirstPersistRef.current = false;
      return;
    }
    writeBasketToStorage(items);
  }, [items]);

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
