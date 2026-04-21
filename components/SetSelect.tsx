import { Check, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface SetOption {
  id: string;
  name: string;
}

interface SetSelectProps {
  value: string;
  sets: SetOption[];
  onChange: (value: string) => void;
}

export function SetSelect({ value, sets, onChange }: SetSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const sortedSets = useMemo(
    () => [...sets].sort((a, b) => a.name.localeCompare(b.name)),
    [sets],
  );

  const selectedSet = useMemo(
    () => sortedSets.find((set) => set.id === value),
    [sortedSets, value],
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

  return (
    <div ref={containerRef} className="relative w-full sm:w-65">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full px-4 py-3 bg-input-background border-2 border-border rounded-lg
                   text-sm focus:outline-none focus:border-primary transition-colors duration-200
                   cursor-pointer flex items-center justify-between gap-3"
      >
        <span className="truncate">{selectedSet?.name ?? "All Sets"}</span>
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
          <button
            type="button"
            onClick={() => {
              onChange("");
              setIsOpen(false);
            }}
            className={`w-full px-3 py-2 rounded-md text-left text-sm flex items-center justify-between
                       hover:bg-muted/50 transition-colors duration-150 ${
                         value === "" ? "bg-muted/40" : ""
                       }`}
          >
            <span>All Sets</span>
            {value === "" ? <Check className="h-4 w-4 text-primary" /> : null}
          </button>

          <div className="my-1 h-px bg-border" />

          <div className="max-h-64 overflow-y-auto">
            {sortedSets.map((set) => (
              <button
                key={set.id}
                type="button"
                onClick={() => {
                  onChange(set.id);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 rounded-md text-left text-sm flex items-center justify-between
                           hover:bg-muted/50 transition-colors duration-150 ${
                             value === set.id ? "bg-muted/40" : ""
                           }`}
              >
                <span className="truncate">{set.name}</span>
                {value === set.id ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
