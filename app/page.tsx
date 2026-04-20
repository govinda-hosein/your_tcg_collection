"use client";

import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Plus,
  ShoppingBasket,
} from "lucide-react";
import { getSession, signOut } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

import { AppToast } from "@/components/AppToast";
import { CardGrid } from "@/components/CardGrid";
import { RaritySelect } from "@/components/RaritySelect";
import { SearchBar } from "@/components/SearchBar";
import type { OwnedCardViewModel } from "@/database/ownedCard.model";
import { useToast } from "@/hooks/useToast";
import { withBasePath } from "@/lib/url";
import Link from "next/link";

type CollectionStatsResponse = {
  totalQuantity: number;
};

const CARDS_PER_PAGE = 12;

function HomeContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const title = process.env.NEXT_PUBLIC_SITE_TITLE || "Your TCG Collection";
  const words = title.trim().split(/\s+/);
  const splitIndex = Math.ceil(words.length / 2);
  const titleStart = words.slice(0, splitIndex).join(" ");
  const titleEnd = words.slice(splitIndex).join(" ");

  const [cards, setCards] = useState<OwnedCardViewModel[]>([]);
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("search")?.trim() ?? "",
  );
  const [selectedRarity, setSelectedRarity] = useState("");
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toastMessage, showToast } = useToast(1700);
  const listTopRef = useRef<HTMLDivElement | null>(null);
  const shouldScrollToListRef = useRef(false);

  const rarityFromUrl = searchParams.get("rarity")?.trim() ?? "";
  const rawPageFromUrl = Number(searchParams.get("page") ?? "1");

  const fetchCards = async (rarity?: string) => {
    const baseApiPath = withBasePath("/api/owned-cards");
    const url = rarity
      ? `${baseApiPath}?rarity=${encodeURIComponent(rarity)}`
      : baseApiPath;
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error("Failed to fetch owned cards");
    return (await response.json()) as OwnedCardViewModel[];
  };

  const fetchStats = async () => {
    const response = await fetch(withBasePath("/api/owned-cards/stats"), {
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Failed to fetch collection stats");
    return (await response.json()) as CollectionStatsResponse;
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [session, data, stats] = await Promise.all([
          getSession(),
          fetchCards(rarityFromUrl || undefined),
          fetchStats(),
        ]);

        if (!isMounted) return;

        setSelectedRarity(rarityFromUrl);
        setIsLoggedIn(!!session?.user?.email);
        setCards(data);
        setTotalQuantity(stats.totalQuantity);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [rarityFromUrl]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams.toString());
    const normalizedSearch = searchQuery.trim();

    if (normalizedSearch) {
      nextParams.set("search", normalizedSearch);
    } else {
      nextParams.delete("search");
    }
    nextParams.delete("page");

    const currentQuery = searchParams.toString();
    const nextQuery = nextParams.toString();
    if (nextQuery === currentQuery) return;

    const timeout = globalThis.setTimeout(() => {
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false,
      });
    }, 400);

    return () => {
      globalThis.clearTimeout(timeout);
    };
  }, [searchQuery, pathname, router, searchParams]);

  const handleRarityChange = async (rarity: string) => {
    setSelectedRarity(rarity);
    setSearchQuery("");

    const nextParams = new URLSearchParams(searchParams.toString());
    if (rarity) {
      nextParams.set("rarity", rarity);
    } else {
      nextParams.delete("rarity");
    }
    nextParams.delete("search");
    nextParams.delete("page");

    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });

    try {
      const data = await fetchCards(rarity || undefined);
      setCards(data);
    } catch (error) {
      console.error("Error filtering by rarity:", error);
    }
  };

  const filteredCards = cards.filter((card) => {
    if (!searchQuery) return true;
    const cardName = card.card?.name?.toLowerCase() ?? "";
    const setName = card.card?.set?.name?.toLowerCase() ?? "";
    const query = searchQuery.toLowerCase();
    return cardName.includes(query) || setName.includes(query);
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCards.length / CARDS_PER_PAGE),
  );
  const pageFromUrl =
    Number.isFinite(rawPageFromUrl) && rawPageFromUrl > 0
      ? Math.floor(rawPageFromUrl)
      : 1;
  const currentPage = Math.min(pageFromUrl, totalPages);
  const pageStart = (currentPage - 1) * CARDS_PER_PAGE;
  const paginatedCards = filteredCards.slice(
    pageStart,
    pageStart + CARDS_PER_PAGE,
  );

  const setPage = (nextPage: number) => {
    const safePage = Math.max(1, Math.min(nextPage, totalPages));
    if (safePage === currentPage) return;

    const nextParams = new URLSearchParams(searchParams.toString());

    if (safePage === 1) {
      nextParams.delete("page");
    } else {
      nextParams.set("page", String(safePage));
    }
    shouldScrollToListRef.current = true;

    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  };

  useEffect(() => {
    if (pageFromUrl !== currentPage) {
      const nextParams = new URLSearchParams(searchParams.toString());

      if (currentPage === 1) {
        nextParams.delete("page");
      } else {
        nextParams.set("page", String(currentPage));
      }

      const nextQuery = nextParams.toString();
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false,
      });
    }
  }, [currentPage, pageFromUrl, pathname, router, searchParams]);

  useEffect(() => {
    if (!shouldScrollToListRef.current) return;

    listTopRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    shouldScrollToListRef.current = false;
  }, [currentPage]);

  const handleDeleteCard = async (id: string) => {
    try {
      const response = await fetch(
        `${withBasePath("/api/admin/owned-cards")}?cardId=${encodeURIComponent(id)}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        throw new Error("Failed to delete card");
      }

      setCards(cards.filter((card) => card.cardId !== id));
    } catch (error) {
      console.error("Error deleting card:", error);
    }
  };

  const handleUpdateCard = async (
    id: string,
    updates: Partial<OwnedCardViewModel>,
  ) => {
    const currentCard = cards.find((card) => card.cardId === id);
    const nextQuantity = updates.quantity ?? currentCard?.quantity;

    if (!Number.isInteger(nextQuantity) || (nextQuantity ?? 0) < 1) {
      console.error("Quantity must be an integer greater than 0");
      return;
    }

    try {
      const response = await fetch(withBasePath("/api/admin/owned-cards"), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardId: id,
          quantity: nextQuantity,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update card quantity");
      }

      const updatedCard = (await response.json()) as OwnedCardViewModel;
      setCards((prevCards) =>
        prevCards.map((card) => (card.cardId === id ? updatedCard : card)),
      );
    } catch (error) {
      console.error("Error updating card quantity:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary" />
          <p
            className="text-muted-foreground text-sm tracking-widest uppercase"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Loading Collection...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Vintage paper texture overlay */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1
              className="text-5xl mb-2 tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="text-primary">{titleStart}</span>
              {titleEnd ? " " : null}
              <span className="text-accent">{titleEnd}</span>
            </h1>
            <p className="text-muted-foreground">
              {process.env.NEXT_PUBLIC_SITE_DESCRIPTION}
            </p>
          </div>

          {isLoggedIn ? (
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground
                         hover:text-foreground border border-border rounded-lg
                         hover:bg-muted transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          ) : null}
        </div>

        {/* Controls */}
        <div className="mt-2 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between w-full">
          <div className="flex-1 flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full">
            <SearchBar value={searchQuery} onChange={handleSearchChange} />
            <RaritySelect
              value={selectedRarity}
              onChange={handleRarityChange}
            />
          </div>

          <div className="flex items-center gap-3">
            <Link
              className="px-6 py-3 rounded-lg border-2 border-accent/60 bg-accent/15 text-foreground
                shadow-md flex items-center gap-2 hover:border-accent hover:bg-accent/25
                     hover:-translate-y-0.5 transition-all duration-200"
              style={{ fontFamily: "var(--font-display)" }}
              href="/basket"
            >
              <ShoppingBasket className="w-5 h-5" />
              Your Basket
            </Link>

            {isLoggedIn ? (
              <Link
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg
                     flex items-center gap-2 shadow-lg hover:scale-105
                     transition-transform duration-200"
                style={{ fontFamily: "var(--font-display)" }}
                href="/add"
              >
                <Plus className="w-5 h-5" />
                ADD CARD
              </Link>
            ) : null}
          </div>
        </div>

        <div ref={listTopRef} />

        {/* Card Grid */}
        <CardGrid
          cards={paginatedCards}
          onDelete={handleDeleteCard}
          onUpdate={handleUpdateCard}
          isLoggedIn={isLoggedIn}
          totalQuantity={totalQuantity}
          onBasketAdd={({ cardName, addedQuantity, inBasketQuantity }) => {
            if (addedQuantity > 0) {
              const quantityLabel =
                addedQuantity > 1 ? `${addedQuantity}x ` : "";
              showToast(`Added ${quantityLabel}${cardName} to basket`);
              return;
            }

            showToast(
              `${cardName} is already at max stock (${inBasketQuantity}) in basket`,
            );
          }}
        />

        {filteredCards.length > 0 && totalPages > 1 ? (
          <div className="mt-6 flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-muted-foreground">
              Showing {pageStart + 1}-
              {Math.min(pageStart + CARDS_PER_PAGE, filteredCards.length)} of{" "}
              {filteredCards.length} cards
            </p>

            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </button>

              <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
                Page{" "}
                <span className="font-semibold text-foreground">
                  {currentPage}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {totalPages}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <AppToast message={toastMessage} variant="success" />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
