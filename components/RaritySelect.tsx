import { RARITY_COLORS } from "@/lib/constants";

const RARITY_OPTIONS = Object.keys(RARITY_COLORS).sort();

interface RaritySelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function RaritySelect({ value, onChange }: RaritySelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-4 py-3 bg-input-background border-2 border-border rounded-lg
                 text-sm focus:outline-none focus:border-primary
                 transition-colors duration-200 cursor-pointer"
    >
      <option value="">All Rarities</option>
      {RARITY_OPTIONS.map((rarity) => (
        <option key={rarity} value={rarity}>
          {rarity}
        </option>
      ))}
    </select>
  );
}
