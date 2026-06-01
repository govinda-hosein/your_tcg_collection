"use client";

import { ArrowLeft, Loader2, Search, Trash2, X, ZoomIn } from "lucide-react";

import { AppToast } from "@/components/AppToast";
import { CardSearchResult } from "@/components/CardSearchResult";
import {
  CreateCardModal,
  type CreateCardFormData,
} from "@/components/CreateCardModal";
import type { PokemonCardViewModel } from "@/database";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { useToast } from "@/hooks/useToast";
import { FEATURE_FLAG_NAMES } from "@/lib/featureFlags.config";
import { withBasePath } from "@/lib/url";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

type CollectrUnmatchedRow = {
  rowNumber: number;
  set: string;
  productName: string;
  cardNumber: string;
  cardId: string;
  row: string[];
};

const INITIAL_CREATE_CARD_FORM: CreateCardFormData = {
  name: "",
  number: "",
  artist: "",
  image_url: "",
  set: "",
  rarity: "",
};

export default function AddCardPage() {
  const router = useRouter();
  const { isEnabled } = useFeatureFlags();
  const [isCreateCardModalOpen, setIsCreateCardModalOpen] = useState(false);
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [showDeleteSelectedCardConfirm, setShowDeleteSelectedCardConfirm] =
    useState(false);
  const [isDeletingSelectedCard, setIsDeletingSelectedCard] = useState(false);
  const [createCardForm, setCreateCardForm] = useState<CreateCardFormData>(
    INITIAL_CREATE_CARD_FORM,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PokemonCardViewModel[]>(
    [],
  );
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCard, setSelectedCard] = useState<PokemonCardViewModel | null>(
    null,
  );
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [deleteAllInventoryFirst, setDeleteAllInventoryFirst] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [collectrAddedCount, setCollectrAddedCount] = useState<number | null>(
    null,
  );
  const [collectrUnmatchedRows, setCollectrUnmatchedRows] = useState<
    CollectrUnmatchedRow[]
  >([]);
  const [isSaving, setIsSaving] = useState(false);
  const [quantityInput, setQuantityInput] = useState("1");
  const { toastMessage, showToast } = useToast(1700);
  const showImportFromCollectr = isEnabled(FEATURE_FLAG_NAMES[0]);
  const showDeleteAllInventory = isEnabled("show_delete_all_inventory");
  const showCreateCard = isEnabled("show_create_card");
  const showDeletePokemonCard = isEnabled("show_delete_pokemon_card");

  const getNormalizedQuantity = () => {
    const parsed = Number.parseInt(quantityInput, 10);
    if (!Number.isFinite(parsed) || parsed < 1) return 1;
    return parsed;
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `${withBasePath("/api/pokemon-cards")}?name=${encodeURIComponent(query)}`,
      );

      if (!response.ok) {
        setSearchResults([]);
        return;
      }

      const cards = (await response.json()) as PokemonCardViewModel[];

      setSearchResults(cards);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectCard = (card: PokemonCardViewModel) => {
    setSelectedCard(card);
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleAddToCollection = async () => {
    if (!selectedCard) return;
    const quantity = getNormalizedQuantity();

    setIsSaving(true);

    try {
      const response = await fetch(withBasePath("/api/admin/owned-cards"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardId: selectedCard.id,
          quantity,
        }),
      });

      if (!response.ok) {
        console.error(
          "Failed to add card to collection",
          await response.json(),
        );
        return;
      }

      showToast(
        `Added ${quantity > 1 ? `${quantity}x ` : ""}${selectedCard.name} to collection`,
      );
      setSelectedCard(null);
      setQuantityInput("1");
    } catch (error) {
      console.error("Failed to add card to collection", error);
    } finally {
      setIsSaving(false);
    }
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
  };

  const closeImportModal = () => {
    setIsImportModalOpen(false);
    setImportFile(null);
    setDeleteAllInventoryFirst(false);
  };

  const closeCreateCardModal = () => {
    setIsCreateCardModalOpen(false);
    setCreateCardForm(INITIAL_CREATE_CARD_FORM);
  };

  const handleCreateCard = async () => {
    if (
      !createCardForm.name.trim() ||
      !createCardForm.number.trim() ||
      !createCardForm.image_url.trim() ||
      !createCardForm.set.trim()
    ) {
      showToast("Name, Number, Image URL, and Set are required");
      return;
    }

    setIsCreatingCard(true);
    try {
      const response = await fetch(withBasePath("/api/admin/pokemon-cards"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createCardForm),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        showToast(errorData.error ?? "Create card request failed");
        return;
      }

      showToast("Create card payload sent");
      closeCreateCardModal();
    } catch (error) {
      console.error("Create card request failed", error);
      showToast("Create card request failed");
    } finally {
      setIsCreatingCard(false);
    }
  };

  const handleDeleteSelectedCard = async () => {
    if (!selectedCard) {
      return;
    }

    const cardId = selectedCard.id?.trim() ?? "";

    if (!cardId) {
      showToast("Selected card is missing an id");
      return;
    }

    setIsDeletingSelectedCard(true);
    try {
      const response = await fetch(withBasePath("/api/admin/pokemon-cards"), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: cardId,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        showToast(errorData.error ?? "Delete card request failed");
        return;
      }

      showToast("Pokemon card deleted");
      setSelectedCard(null);
      setQuantityInput("1");
      setShowDeleteSelectedCardConfirm(false);
    } catch (error) {
      console.error("Delete card request failed", error);
      showToast("Delete card request failed");
    } finally {
      setIsDeletingSelectedCard(false);
    }
  };

  const handleCollectrImport = async () => {
    if (!importFile) {
      showToast("Select a CSV file first");
      return;
    }

    setIsImporting(true);
    try {
      setCollectrAddedCount(null);
      setCollectrUnmatchedRows([]);

      const formData = new FormData();
      formData.append("file", importFile);
      formData.append(
        "deleteAllInventoryFirst",
        String(deleteAllInventoryFirst),
      );

      const response = await fetch(
        withBasePath("/api/owned-cards/import/collectr"),
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        showToast(errorData.error ?? "Import failed");
        return;
      }

      const data = (await response.json()) as {
        addedCount?: number;
        unmatchedRows?: CollectrUnmatchedRow[];
      };
      setCollectrAddedCount(data.addedCount ?? 0);
      setCollectrUnmatchedRows(data.unmatchedRows ?? []);
      closeImportModal();
    } catch (error) {
      console.error("Collectr import failed", error);
      showToast("Import failed");
    } finally {
      setIsImporting(false);
    }
  };

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

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push("/")}
          className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground
                   transition-colors duration-200 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Collection
        </button>

        {/* Header */}
        <div className="mb-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1
              className="text-5xl mb-2 tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="text-primary">ADD</span>{" "}
              <span className="text-accent">CARD</span>
            </h1>
            <p className="text-muted-foreground">
              Search and add cards to your collection
            </p>
          </div>

          {showImportFromCollectr ? (
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center justify-center rounded-lg border-2 border-border bg-accent/10 px-4 py-2.5 text-sm font-medium hover:bg-accent/20 transition-colors"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Import from Collectr
            </button>
          ) : null}
        </div>

        {showCreateCard ? (
          <div className="mb-2">
            <button
              type="button"
              onClick={() => setIsCreateCardModalOpen(true)}
              className="inline-flex items-center justify-center rounded-lg border-2 border-border bg-primary/10 px-4 py-2.5 text-sm font-medium hover:bg-primary/20 transition-colors"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Create Card
            </button>
          </div>
        ) : null}

        {collectrAddedCount !== null && (
          <div className="mb-6 rounded-2xl border-4 border-emerald-700 bg-emerald-100 p-4 text-emerald-950 shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2
                  className="text-xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Collectr Import Complete
                </h2>
                <p className="text-sm text-emerald-900">
                  {collectrAddedCount} card
                  {collectrAddedCount === 1 ? "" : "s"} added or updated.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCollectrAddedCount(null)}
                className="rounded-md border border-emerald-800 px-2 py-1 text-xs hover:bg-emerald-200 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {collectrUnmatchedRows.length > 0 && (
          <div className="mb-6 rounded-2xl border-4 border-amber-700 bg-amber-100 p-4 text-amber-950 shadow-lg">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <h2
                  className="text-xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Unmatched Import Rows
                </h2>
                <p className="text-sm text-amber-900">
                  {collectrUnmatchedRows.length} row
                  {collectrUnmatchedRows.length === 1 ? "" : "s"} could not be
                  matched to a card.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCollectrUnmatchedRows([])}
                className="rounded-md border border-amber-800 px-2 py-1 text-xs hover:bg-amber-200 transition-colors"
              >
                Dismiss
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto rounded-lg border border-amber-300 bg-amber-50">
              <ul className="divide-y divide-amber-200 text-sm">
                {collectrUnmatchedRows.map((item) => (
                  <li key={`${item.rowNumber}-${item.cardId}`} className="p-3">
                    <div>
                      Row {item.rowNumber}:{" "}
                      {item.productName || "Unknown Product"}
                    </div>
                    <div className="text-xs text-amber-900/80">
                      {item.set || "Unknown Set"} - Built card id:{" "}
                      {item.cardId || "N/A"}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Search Section */}
        <div
          className="bg-card border-4 border-border rounded-2xl shadow-2xl overflow-hidden mb-6"
          style={{
            animation: "slideInUp 0.5s ease-out",
          }}
        >
          {/* Decorative Header */}
          <div className="bg-linear-to-r from-primary via-secondary to-accent h-3" />

          <div className="p-4">
            <label className="block text-sm mb-2 font-medium">
              Search for a Card
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Type a Pokemon name... (e.g., Pikachu, Charizard)"
                className="w-full pl-12 pr-4 py-4 bg-input-background border-2 border-border
                         rounded-lg focus:outline-none focus:border-primary
                         transition-colors duration-200 text-lg"
                autoFocus
              />
              {isSearching && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary animate-spin" />
              )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-4 border-2 border-border rounded-lg overflow-hidden bg-input-background max-h-96 overflow-y-auto">
                {searchResults.map((card, index) => (
                  <CardSearchResult
                    key={`${card.name}-${card.set?.name ?? "Unknown Set"}-${index}`}
                    card={card}
                    onClick={() => handleSelectCard(card)}
                  />
                ))}
              </div>
            )}

            {!isSearching &&
              searchQuery.length >= 2 &&
              searchResults.length === 0 && (
                <div className="mt-4 text-center py-8 text-muted-foreground">
                  No cards found matching &quot;{searchQuery}&quot;
                </div>
              )}
          </div>
        </div>

        {/* Selected Card Section */}
        {selectedCard && (
          <div
            className="bg-card border-4 border-border rounded-2xl shadow-2xl overflow-hidden"
            style={{
              animation: "slideInUp 0.5s ease-out",
            }}
          >
            {/* Decorative Header */}
            <div className="bg-linear-to-r from-accent to-primary h-3" />

            <div className="p-4">
              <div className="mb-6 flex items-center justify-between gap-3">
                <h2
                  className="text-2xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  SELECTED CARD
                </h2>

                {showDeletePokemonCard ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteSelectedCardConfirm(true)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors"
                    aria-label="Delete selected Pokemon card"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </div>

              {/* Card Preview */}
              <div className="bg-linear-to-br from-purple-100 to-pink-100 rounded-xl p-2 mb-6 border-2 border-border">
                <div className="flex items-center justify-between gap-6">
                  <button
                    type="button"
                    onClick={() => setIsImageModalOpen(true)}
                    className="relative h-48 w-36 shrink-0 overflow-hidden rounded-lg border-2 border-border bg-card shadow-md"
                    aria-label={`Zoom image for ${selectedCard.name}`}
                  >
                    <Image
                      src={selectedCard.images.large}
                      alt={selectedCard.name}
                      fill
                      unoptimized
                      sizes="144px"
                      className="object-cover"
                    />
                    <div
                      className="absolute right-2 top-2 rounded-lg bg-black/60 p-2 text-white
                               transition-colors duration-200 hover:bg-black/75"
                      aria-hidden="true"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </div>
                  </button>
                  <div>
                    <h3 className="text-2xl font-bold mb-1">
                      {selectedCard.name}
                    </h3>
                    <div className="text-muted-foreground">
                      {selectedCard.set?.name ?? "Unknown Set"} •{" "}
                      {selectedCard.number}
                    </div>
                    <div className="mt-2 inline-block px-3 py-1 rounded-full text-sm bg-linear-to-r from-purple-400 to-pink-400 text-white font-bold">
                      {selectedCard.rarity}
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Details Form */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm mb-2 font-medium">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={quantityInput}
                      onChange={(e) => setQuantityInput(e.target.value)}
                      onBlur={() =>
                        setQuantityInput(String(getNormalizedQuantity()))
                      }
                      className="w-full px-4 py-3 bg-input-background border-2 border-border
                               rounded-lg focus:outline-none focus:border-primary
                               transition-colors duration-200"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCard(null);
                      setQuantityInput("1");
                    }}
                    className="flex-1 px-6 py-4 border-2 border-border rounded-lg
                             hover:bg-muted transition-all duration-200 text-lg"
                  >
                    Change Card
                  </button>
                  <button
                    type="button"
                    onClick={handleAddToCollection}
                    disabled={isSaving}
                    className="flex-1 px-6 py-4 bg-primary text-primary-foreground rounded-lg
                             hover:scale-105 disabled:hover:scale-100 disabled:opacity-60
                             transition-transform duration-200 shadow-lg
                             text-lg"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {isSaving ? "ADDING..." : "ADD TO COLLECTION"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedCard && isImageModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={closeImageModal}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div
            className="relative z-10 rounded-2xl border-4 border-border bg-card p-3 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeImageModal}
              className="absolute right-3 top-3 z-10 rounded-lg bg-black/60 p-2 text-white
                       transition-colors duration-200 hover:bg-black/75"
              aria-label="Close image preview"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative aspect-2/3 h-[85vh] max-h-[85vh] max-w-[calc(100vw-2rem)] bg-black/10">
              <Image
                src={selectedCard.images.large}
                alt={selectedCard.name}
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      )}

      {isImportModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={closeImportModal}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative z-10 w-full max-w-md rounded-2xl border-4 border-border bg-card p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeImportModal}
              className="absolute right-3 top-3 rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-muted transition-colors"
              aria-label="Close import modal"
            >
              <X className="h-4 w-4" />
            </button>

            <h2
              className="text-2xl mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Import from Collectr
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Upload a CSV export file.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 font-medium">
                  CSV file
                </label>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setImportFile(file);
                  }}
                  className="w-full rounded-lg border-2 border-border bg-input-background px-3 py-2 text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground file:transition-colors hover:file:bg-primary/90"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  {importFile
                    ? `Selected: ${importFile.name}`
                    : "No file selected"}
                </p>
              </div>

              {showDeleteAllInventory ? (
                <label className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={deleteAllInventoryFirst}
                    onChange={(event) =>
                      setDeleteAllInventoryFirst(event.target.checked)
                    }
                    className="mt-0.5 h-4 w-4"
                  />
                  <span>
                    Delete all inventory before import
                    <span className="block text-xs text-muted-foreground">
                      This clears existing owned cards, then imports from the
                      CSV.
                    </span>
                  </span>
                </label>
              ) : null}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeImportModal}
                  className="flex-1 rounded-lg border-2 border-border px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCollectrImport}
                  disabled={!importFile || isImporting}
                  className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm text-primary-foreground disabled:opacity-60"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {isImporting ? "UPLOADING..." : "UPLOAD CSV"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCreateCardModalOpen && (
        <CreateCardModal
          isOpen={isCreateCardModalOpen}
          formData={createCardForm}
          isSubmitting={isCreatingCard}
          onClose={closeCreateCardModal}
          onFieldChange={(field, value) =>
            setCreateCardForm((prev) => ({ ...prev, [field]: value }))
          }
          onSubmit={handleCreateCard}
        />
      )}

      {selectedCard && showDeleteSelectedCardConfirm ? (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border-2 border-border bg-card p-6 shadow-xl">
            <h2
              className="text-lg font-semibold mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Delete Pokemon Card?
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              Are you sure you want to delete {selectedCard.name} from Pokemon
              cards?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDeleteSelectedCard}
                disabled={isDeletingSelectedCard}
                className="flex-1 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {isDeletingSelectedCard ? "Deleting..." : "Yes, Delete"}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteSelectedCardConfirm(false)}
                disabled={isDeletingSelectedCard}
                className="flex-1 rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <AppToast message={toastMessage} variant="success" />
    </div>
  );
}
