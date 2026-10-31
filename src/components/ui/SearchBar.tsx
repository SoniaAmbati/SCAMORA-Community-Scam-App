"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, X } from "lucide-react";

interface SearchBarProps {
  initialValue?: string;
  onSearch?: (query: string) => void;
  className?: string;
  autoFocus?: boolean;
}

export function SearchBar({ initialValue = "", onSearch, className = "", autoFocus = false }: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const router = useRouter();

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = query.trim();
    if (!clean) return;

    if (onSearch) {
      onSearch(clean);
    } else {
      router.push(`/lookup?query=${encodeURIComponent(clean)}`);
    }
  };

  const sampleSuggestions = [
    { label: "Phone", value: "+91 98765 43210" },
    { label: "UPI", value: "xyz@upi" },
    { label: "Fake link", value: "fake-update.in" },
    { label: "Verified bank", value: "1800 11 2211" }
  ];

  return (
    <div className={`w-full max-w-xl space-y-2.5 ${className}`}>
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-4 w-4 h-4 text-[#9299A3] pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="+91 98765 43210"
            autoFocus={autoFocus}
            className="w-full h-12 pl-11 pr-24 rounded-full bg-[#121A26] border border-[#1E2B3C] text-sm text-[#F0EEE8] placeholder:text-[#9299A3]/60 focus:outline-none focus:border-[#398BFF]/70 focus:ring-1 focus:ring-[#398BFF]/50 transition-all shadow-inner"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-24 p-1 text-[#9299A3] hover:text-[#F0EEE8]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="absolute right-1.5 h-9 px-5 rounded-full bg-[#F0EEE8] hover:bg-white text-[#090D14] text-xs font-semibold tracking-wide transition-all shadow hover:shadow-lg active:scale-95 cursor-pointer"
        >
          Check
        </button>
      </form>

      {/* Quick sample chips */}
      <div className="flex items-center gap-1.5 text-[11px] text-[#9299A3] px-2 flex-wrap">
        <span>Try sample:</span>
        {sampleSuggestions.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              setQuery(item.value);
              if (onSearch) onSearch(item.value);
              else router.push(`/lookup?query=${encodeURIComponent(item.value)}`);
            }}
            className="px-2 py-0.5 rounded-full border border-[#1E2B3C] bg-[#0E1520] hover:border-[#398BFF]/50 hover:text-[#F0EEE8] transition-colors"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
