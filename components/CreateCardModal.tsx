import { RARITY_COLORS } from "@/lib/constants";
import { X } from "lucide-react";

export type CreateCardFormData = {
  name: string;
  number: string;
  artist: string;
  image_url: string;
  set: string;
  rarity: string;
};

type CreateCardModalProps = {
  isOpen: boolean;
  formData: CreateCardFormData;
  isSubmitting: boolean;
  onClose: () => void;
  onFieldChange: (field: keyof CreateCardFormData, value: string) => void;
  onSubmit: () => void;
};

export function CreateCardModal({
  isOpen,
  formData,
  isSubmitting,
  onClose,
  onFieldChange,
  onSubmit,
}: CreateCardModalProps) {
  const rarityOptions = Object.keys(RARITY_COLORS).sort((a, b) =>
    a.localeCompare(b),
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-lg rounded-2xl border-4 border-border bg-card p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-muted transition-colors"
          aria-label="Close create card modal"
        >
          <X className="h-4 w-4" />
        </button>

        <h2
          className="text-2xl mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Create Pokemon Card
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          If the card that you are about to create is from a collectr export,
          ensure that you use the exact same name, number and set to ensure the
          import feature works. The image URL should be a direct link to the
          card image (e.g. from imgur or another image hosting service).
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1 font-medium">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(event) => onFieldChange("name", event.target.value)}
              className="w-full rounded-lg border-2 border-border bg-input-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 font-medium">Number</label>
            <input
              type="text"
              required
              value={formData.number}
              onChange={(event) => onFieldChange("number", event.target.value)}
              className="w-full rounded-lg border-2 border-border bg-input-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 font-medium">Image URL</label>
            <input
              type="text"
              required
              value={formData.image_url}
              onChange={(event) =>
                onFieldChange("image_url", event.target.value)
              }
              className="w-full rounded-lg border-2 border-border bg-input-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 font-medium">Set</label>
            <input
              type="text"
              required
              value={formData.set}
              onChange={(event) => onFieldChange("set", event.target.value)}
              className="w-full rounded-lg border-2 border-border bg-input-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 font-medium">Artist</label>
            <input
              type="text"
              value={formData.artist}
              onChange={(event) => onFieldChange("artist", event.target.value)}
              className="w-full rounded-lg border-2 border-border bg-input-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 font-medium">Rarity</label>
            <select
              value={formData.rarity}
              onChange={(event) => onFieldChange("rarity", event.target.value)}
              className="w-full rounded-lg border-2 border-border bg-input-background px-3 py-2 text-sm"
            >
              <option value="">Select rarity</option>
              {rarityOptions.map((rarity) => (
                <option key={rarity} value={rarity}>
                  {rarity}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border-2 border-border px-4 py-2.5 text-sm hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm text-primary-foreground disabled:opacity-60"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {isSubmitting ? "SUBMITTING..." : "Create Card"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
