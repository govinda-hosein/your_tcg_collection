"use client";

import {
  ArrowLeft,
  LogIn,
  LogOut,
  Settings,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Suspense, useEffect, useState } from "react";

import { AppToast } from "@/components/AppToast";
import { useToast } from "@/hooks/useToast";
import {
  FEATURE_FLAG_NAMES,
  type FeatureFlags,
} from "@/lib/featureFlags.config";
import { withBasePath } from "@/lib/url";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const COLLECTR_IMPORT_CONFIG_NAME = FEATURE_FLAG_NAMES[0];
const SHOW_PRICE_CONFIG_NAME = FEATURE_FLAG_NAMES[1];
const SHOW_DELETE_ALL_INVENTORY_CONFIG_NAME = FEATURE_FLAG_NAMES[2];
const SHOW_CARD_CONDITION_CONFIG_NAME = FEATURE_FLAG_NAMES[3];
const SHOW_CREATE_CARD_CONFIG_NAME = FEATURE_FLAG_NAMES[4];
const SHOW_DELETE_POKEMON_CARD_CONFIG_NAME = FEATURE_FLAG_NAMES[5];
const SHOW_POKEMON_TYPE_FILTER_CONFIG_NAME = FEATURE_FLAG_NAMES[6];

function AdminLoginContentInner() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const authError = searchParams.get("error");
  const [showImportFromCollectr, setShowImportFromCollectr] = useState<
    boolean | null
  >(null);
  const [showPrice, setShowPrice] = useState<boolean | null>(null);
  const [showDeleteAllInventory, setShowDeleteAllInventory] = useState<
    boolean | null
  >(null);
  const [showCardCondition, setShowCardCondition] = useState<boolean | null>(
    null,
  );
  const [showCreateCard, setShowCreateCard] = useState<boolean | null>(null);
  const [showDeletePokemonCard, setShowDeletePokemonCard] = useState<
    boolean | null
  >(null);
  const [showPokemonTypeFilter, setShowPokemonTypeFilter] = useState<
    boolean | null
  >(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [isSavingSetting, setIsSavingSetting] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const { toastMessage, showToast } = useToast(1700);

  const applyFlags = (flags: FeatureFlags) => {
    setShowImportFromCollectr(flags[COLLECTR_IMPORT_CONFIG_NAME]);
    setShowPrice(flags[SHOW_PRICE_CONFIG_NAME]);
    setShowDeleteAllInventory(flags[SHOW_DELETE_ALL_INVENTORY_CONFIG_NAME]);
    setShowCardCondition(flags[SHOW_CARD_CONDITION_CONFIG_NAME]);
    setShowCreateCard(flags[SHOW_CREATE_CARD_CONFIG_NAME]);
    setShowDeletePokemonCard(flags[SHOW_DELETE_POKEMON_CARD_CONFIG_NAME]);
    setShowPokemonTypeFilter(flags[SHOW_POKEMON_TYPE_FILTER_CONFIG_NAME]);
  };

  useEffect(() => {
    if (!session) {
      setShowImportFromCollectr(null);
      setShowPrice(null);
      setShowDeleteAllInventory(null);
      setShowCardCondition(null);
      setShowCreateCard(null);
      setShowDeletePokemonCard(null);
      setShowPokemonTypeFilter(null);
      setSettingsError(null);
      return;
    }

    let isCancelled = false;

    const loadSettings = async () => {
      try {
        const response = await fetch(withBasePath("/api/admin/config"), {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load settings");
        }

        const data = (await response.json()) as { flags?: FeatureFlags };
        if (isCancelled) return;

        if (data.flags) {
          applyFlags(data.flags);
          setSettingsError(null);
        }
      } catch {
        if (isCancelled) return;
        setSettingsError(
          "Could not load settings. Please refresh and try again.",
        );
      }
    };

    void loadSettings();

    return () => {
      isCancelled = true;
    };
  }, [session]);

  const handleToggleCollectrImport = async () => {
    if (showImportFromCollectr === null || isSavingSetting) return;

    setSettingsError(null);
    setIsSavingSetting(true);

    const nextEnabled = !showImportFromCollectr;
    setShowImportFromCollectr(nextEnabled);

    try {
      const response = await fetch(withBasePath("/api/admin/config"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: COLLECTR_IMPORT_CONFIG_NAME,
          enabled: nextEnabled,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      const data = (await response.json()) as { enabled?: boolean };
      setShowImportFromCollectr(!!data.enabled);
    } catch {
      setShowImportFromCollectr(!nextEnabled);
      setSettingsError("Could not save setting. Please try again.");
    } finally {
      setIsSavingSetting(false);
    }
  };

  const handleToggleShowPrice = async () => {
    if (showPrice === null || isSavingSetting) return;

    setSettingsError(null);
    setIsSavingSetting(true);

    const nextEnabled = !showPrice;
    setShowPrice(nextEnabled);

    try {
      const response = await fetch(withBasePath("/api/admin/config"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: SHOW_PRICE_CONFIG_NAME,
          enabled: nextEnabled,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      const data = (await response.json()) as { enabled?: boolean };
      setShowPrice(!!data.enabled);
    } catch {
      setShowPrice(!nextEnabled);
      setSettingsError("Could not save setting. Please try again.");
    } finally {
      setIsSavingSetting(false);
    }
  };

  const handleToggleShowDeleteAllInventory = async () => {
    if (showDeleteAllInventory === null || isSavingSetting) return;

    setSettingsError(null);
    setIsSavingSetting(true);

    const nextEnabled = !showDeleteAllInventory;
    setShowDeleteAllInventory(nextEnabled);

    try {
      const response = await fetch(withBasePath("/api/admin/config"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: SHOW_DELETE_ALL_INVENTORY_CONFIG_NAME,
          enabled: nextEnabled,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      const data = (await response.json()) as { enabled?: boolean };
      setShowDeleteAllInventory(!!data.enabled);
    } catch {
      setShowDeleteAllInventory(!nextEnabled);
      setSettingsError("Could not save setting. Please try again.");
    } finally {
      setIsSavingSetting(false);
    }
  };

  const handleToggleShowCardCondition = async () => {
    if (showCardCondition === null || isSavingSetting) return;

    setSettingsError(null);
    setIsSavingSetting(true);

    const nextEnabled = !showCardCondition;
    setShowCardCondition(nextEnabled);

    try {
      const response = await fetch(withBasePath("/api/admin/config"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: SHOW_CARD_CONDITION_CONFIG_NAME,
          enabled: nextEnabled,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      const data = (await response.json()) as { enabled?: boolean };
      setShowCardCondition(!!data.enabled);
    } catch {
      setShowCardCondition(!nextEnabled);
      setSettingsError("Could not save setting. Please try again.");
    } finally {
      setIsSavingSetting(false);
    }
  };

  const handleToggleShowCreateCard = async () => {
    if (showCreateCard === null || isSavingSetting) return;

    setSettingsError(null);
    setIsSavingSetting(true);

    const nextEnabled = !showCreateCard;
    setShowCreateCard(nextEnabled);

    try {
      const response = await fetch(withBasePath("/api/admin/config"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: SHOW_CREATE_CARD_CONFIG_NAME,
          enabled: nextEnabled,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      const data = (await response.json()) as { enabled?: boolean };
      setShowCreateCard(!!data.enabled);
    } catch {
      setShowCreateCard(!nextEnabled);
      setSettingsError("Could not save setting. Please try again.");
    } finally {
      setIsSavingSetting(false);
    }
  };

  const handleToggleShowDeletePokemonCard = async () => {
    if (showDeletePokemonCard === null || isSavingSetting) return;

    setSettingsError(null);
    setIsSavingSetting(true);

    const nextEnabled = !showDeletePokemonCard;
    setShowDeletePokemonCard(nextEnabled);

    try {
      const response = await fetch(withBasePath("/api/admin/config"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: SHOW_DELETE_POKEMON_CARD_CONFIG_NAME,
          enabled: nextEnabled,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      const data = (await response.json()) as { enabled?: boolean };
      setShowDeletePokemonCard(!!data.enabled);
    } catch {
      setShowDeletePokemonCard(!nextEnabled);
      setSettingsError("Could not save setting. Please try again.");
    } finally {
      setIsSavingSetting(false);
    }
  };

  const handleToggleShowPokemonTypeFilter = async () => {
    if (showPokemonTypeFilter === null || isSavingSetting) return;

    setSettingsError(null);
    setIsSavingSetting(true);

    const nextEnabled = !showPokemonTypeFilter;
    setShowPokemonTypeFilter(nextEnabled);

    try {
      const response = await fetch(withBasePath("/api/admin/config"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: SHOW_POKEMON_TYPE_FILTER_CONFIG_NAME,
          enabled: nextEnabled,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      const data = (await response.json()) as { enabled?: boolean };
      setShowPokemonTypeFilter(!!data.enabled);
    } catch {
      setShowPokemonTypeFilter(!nextEnabled);
      setSettingsError("Could not save setting. Please try again.");
    } finally {
      setIsSavingSetting(false);
    }
  };

  const handleDeleteAllInventory = async () => {
    setIsDeletingAll(true);
    try {
      const response = await fetch(
        withBasePath("/api/admin/owned-cards/delete-all"),
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        showToast(errorData.error ?? "Failed to delete all inventory");
        return;
      }

      const data = (await response.json()) as { deletedCount?: number };
      const deletedCount = data.deletedCount ?? 0;

      setShowDeleteAllConfirm(false);
      showToast(
        `Deleted ${deletedCount} inventory entr${deletedCount === 1 ? "y" : "ies"}`,
      );
    } catch (error) {
      console.error("Error deleting all inventory:", error);
      showToast("Failed to delete all inventory");
    } finally {
      setIsDeletingAll(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden px-4 py-8">
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border
                   bg-card/90 text-foreground shadow-md backdrop-blur-sm hover:bg-muted
                   transition-colors duration-200"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back Home
        </Link>
      </div>

      <div className="relative z-10 min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border-2 border-border bg-card/90 shadow-lg backdrop-blur-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1
                className="text-2xl tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Admin Access
              </h1>
              <p className="text-sm text-muted-foreground">
                Sign in with an authorized Google account
              </p>
            </div>
          </div>

          {authError ? (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Access denied. Only configured admin email addresses can sign in.
            </div>
          ) : null}

          {session ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
                Welcome, {session.user?.name || session.user?.email || "Admin"}!
              </div>

              <div className="rounded-xl border-2 border-border bg-card/95 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2
                      className="text-base tracking-tight"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Settings
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Manage admin-controlled feature flags.
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Settings className="w-4 h-4" />
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-input-background/50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">
                        Show Import From Collectr
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleCollectrImport}
                      disabled={isSavingSetting}
                      aria-label="Toggle Show Import From Collectr setting"
                      aria-pressed={!!showImportFromCollectr}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full border transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                        showImportFromCollectr
                          ? "bg-primary border-primary/80"
                          : "bg-muted border-border"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                          showImportFromCollectr
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {settingsError ? (
                    <div className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
                      {settingsError}
                    </div>
                  ) : null}
                </div>

                <div className="rounded-lg border border-border bg-input-background/50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">Show Price</p>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleShowPrice}
                      disabled={isSavingSetting}
                      aria-label="Toggle Show Price setting"
                      aria-pressed={!!showPrice}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full border transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                        showPrice
                          ? "bg-primary border-primary/80"
                          : "bg-muted border-border"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                          showPrice ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {settingsError ? (
                    <div className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
                      {settingsError}
                    </div>
                  ) : null}
                </div>

                <div className="rounded-lg border border-border bg-input-background/50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">
                        Show Delete All Inventory
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleShowDeleteAllInventory}
                      disabled={isSavingSetting}
                      aria-label="Toggle Show Delete All Inventory setting"
                      aria-pressed={!!showDeleteAllInventory}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full border transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                        showDeleteAllInventory
                          ? "bg-primary border-primary/80"
                          : "bg-muted border-border"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                          showDeleteAllInventory
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {settingsError ? (
                    <div className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
                      {settingsError}
                    </div>
                  ) : null}
                </div>

                <div className="rounded-lg border border-border bg-input-background/50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">Show Card Condition</p>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleShowCardCondition}
                      disabled={isSavingSetting}
                      aria-label="Toggle Show Card Condition setting"
                      aria-pressed={!!showCardCondition}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full border transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                        showCardCondition
                          ? "bg-primary border-primary/80"
                          : "bg-muted border-border"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                          showCardCondition ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {settingsError ? (
                    <div className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
                      {settingsError}
                    </div>
                  ) : null}
                </div>

                <div className="rounded-lg border border-border bg-input-background/50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">Show Create Card</p>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleShowCreateCard}
                      disabled={isSavingSetting}
                      aria-label="Toggle Show Create Card setting"
                      aria-pressed={!!showCreateCard}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full border transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                        showCreateCard
                          ? "bg-primary border-primary/80"
                          : "bg-muted border-border"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                          showCreateCard ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {settingsError ? (
                    <div className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
                      {settingsError}
                    </div>
                  ) : null}
                </div>

                <div className="rounded-lg border border-border bg-input-background/50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">
                        Show Delete Pokemon Card
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleShowDeletePokemonCard}
                      disabled={isSavingSetting}
                      aria-label="Toggle Show Delete Pokemon Card setting"
                      aria-pressed={!!showDeletePokemonCard}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full border transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                        showDeletePokemonCard
                          ? "bg-primary border-primary/80"
                          : "bg-muted border-border"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                          showDeletePokemonCard
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {settingsError ? (
                    <div className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
                      {settingsError}
                    </div>
                  ) : null}
                </div>

                <div className="rounded-lg border border-border bg-input-background/50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">
                        Show Pokemon Type Filter
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleShowPokemonTypeFilter}
                      disabled={isSavingSetting}
                      aria-label="Toggle Show Pokemon Type Filter setting"
                      aria-pressed={!!showPokemonTypeFilter}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full border transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                        showPokemonTypeFilter
                          ? "bg-primary border-primary/80"
                          : "bg-muted border-border"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                          showPokemonTypeFilter
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {settingsError ? (
                    <div className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
                      {settingsError}
                    </div>
                  ) : null}
                </div>

                {showDeleteAllInventory ? (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-destructive">
                          Delete All Inventory
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Permanently removes every owned-card inventory entry.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowDeleteAllConfirm(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-destructive/60 bg-destructive/10 px-3 py-2 text-sm text-destructive hover:bg-destructive/20 transition-colors"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete All
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              <button
                onClick={() => signOut({ callbackUrl: withBasePath("/admin") })}
                className="w-full px-5 py-3 bg-destructive text-destructive-foreground rounded-lg
                         flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01]
                         transition-transform duration-200"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <LogOut className="w-5 h-5" />
                SIGN OUT
              </button>
            </div>
          ) : (
            <button
              onClick={() =>
                signIn("google", { callbackUrl: withBasePath("/admin") })
              }
              className="w-full px-5 py-3 bg-primary text-primary-foreground rounded-lg
                       flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01]
                       transition-transform duration-200"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <LogIn className="w-5 h-5" />
              CONTINUE WITH GOOGLE
            </button>
          )}
        </div>
      </div>

      {showDeleteAllConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border-2 border-border bg-card p-6 shadow-xl">
            <h2
              className="text-lg font-semibold mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Delete All Inventory?
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              This will permanently delete all entries in your inventory. This
              action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDeleteAllInventory}
                disabled={isDeletingAll}
                className="flex-1 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {isDeletingAll ? "Deleting..." : "Yes, Delete All"}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteAllConfirm(false)}
                disabled={isDeletingAll}
                className="flex-1 rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <AppToast message={toastMessage} variant="success" />
    </main>
  );
}

function AdminLoginContent() {
  return (
    <Suspense fallback={null}>
      <AdminLoginContentInner />
    </Suspense>
  );
}

export default function AdminPage() {
  return <AdminLoginContent />;
}
