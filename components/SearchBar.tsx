import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="flex-1 flex flex-col sm:flex-row gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search cards by name or set..."
          className="w-full pl-11 pr-4 py-3 bg-input-background border-2 border-border
                   rounded-lg focus:outline-none focus:border-primary
                   transition-colors duration-200"
        />
      </div>
    </div>
  );
}
