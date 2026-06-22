"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { TYPE_COLORS } from "@/lib/constants";

interface PokemonTypeSelectProps {
  value: string;
  onChange: (type: string) => void;
}

const POKEMON_TYPES = Object.keys(TYPE_COLORS);

export function PokemonTypeSelect({ value, onChange }: PokemonTypeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const computedOptions = useMemo(() => {
    return POKEMON_TYPES.map((type) => ({
      label: type,
      color: TYPE_COLORS[type],
    })).sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  const selectedOption = useMemo(
    () => computedOptions.find((option) => option.label === value),
    [value, computedOptions],
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
        <span className="flex items-center gap-2 min-w-0">
          {selectedOption ? (
            <div
              className="h-3.5 w-3.5 rounded-full shrink-0"
              style={{ backgroundColor: selectedOption.color }}
              aria-hidden="true"
            />
          ) : null}
          <span className="truncate">
            {selectedOption?.label ?? "All Types"}
          </span>
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
            <span>All Types</span>
            {value === "" ? <Check className="h-4 w-4 text-primary" /> : null}
          </button>

          <div className="my-1 h-px bg-border" />

          <div className="max-h-64 overflow-y-auto">
            {computedOptions.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => {
                  onChange(option.label);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 rounded-md text-left text-sm flex items-center justify-between
                           hover:bg-muted/50 transition-colors duration-150 ${
                             value === option.label ? "bg-muted/40" : ""
                           }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <div
                    className="h-3.5 w-3.5 shrink-0 rounded-full"
                    style={{ backgroundColor: option.color }}
                    aria-hidden="true"
                  />
                  <span className="truncate">{option.label}</span>
                </span>
                {value === option.label ? (
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
