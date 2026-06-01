import { ArrowDownWideNarrow, Check, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export const PRICE_SORT_VALUES = ["", "price_desc", "price_asc"] as const;

export type PriceSortValue = (typeof PRICE_SORT_VALUES)[number];

const PRICE_SORT_OPTIONS: Array<{
  value: PriceSortValue;
  label: string;
  icon?: "desc" | "asc";
}> = [
  {
    value: "",
    label: "Price Sort",
  },
  {
    value: "price_desc",
    label: "Price: High to Low",
    icon: "desc",
  },
  {
    value: "price_asc",
    label: "Price: Low to High",
    icon: "asc",
  },
];

interface PriceSortSelectProps {
  value: PriceSortValue;
  onChange: (value: PriceSortValue) => void;
}

export function PriceSortSelect({ value, onChange }: PriceSortSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = useMemo(
    () =>
      PRICE_SORT_OPTIONS.find((option) => option.value === value) ??
      PRICE_SORT_OPTIONS[0],
    [value],
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const renderSortIcon = (direction?: "desc" | "asc") => {
    if (!direction) {
      return null;
    }

    return (
      <ArrowDownWideNarrow
        className={`h-4 w-4 shrink-0 text-muted-foreground ${
          direction === "asc" ? "rotate-180" : ""
        }`}
        aria-hidden="true"
      />
    );
  };

  return (
    <div ref={containerRef} className="relative w-full sm:w-65">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full px-4 py-3 bg-input-background border-2 border-border rounded-lg
                   text-sm focus:outline-none focus:border-primary transition-colors duration-200
                   cursor-pointer flex items-center justify-between gap-3"
      >
        <span className="flex min-w-0 items-center gap-2">
          {renderSortIcon(selectedOption.icon)}
          <span className="truncate">{selectedOption.label}</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen ? (
        <div
          className="absolute z-30 mt-2 w-full bg-input-background border-2 border-border
                     rounded-lg shadow-lg p-1"
        >
          {PRICE_SORT_OPTIONS.map((option, index) => (
            <div key={option.value || "default"}>
              {index === 1 ? <div className="my-1 h-px bg-border" /> : null}
              <button
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 rounded-md text-left text-sm flex items-center justify-between
                           hover:bg-muted/50 transition-colors duration-150 ${
                             value === option.value ? "bg-muted/40" : ""
                           }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  {renderSortIcon(option.icon)}
                  <span className="truncate">{option.label}</span>
                </span>
                {value === option.value ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : null}
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
