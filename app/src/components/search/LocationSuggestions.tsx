import { useEffect, useState } from 'react';
import { fetchLocationSuggestions } from '../../lib/supabase/queries';
import { isSupabaseConfigured } from '../../lib/supabase/client';

type LocationSuggestionsProps = {
  value: string;
  onSelect: (location: string) => void;
};

export function LocationSuggestions({ value, onSelect }: LocationSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured() || value.trim().length < 2) {
      setSuggestions([]);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      fetchLocationSuggestions(value)
        .then(setSuggestions)
        .catch(() => setSuggestions([]));
    }, 250);

    return () => window.clearTimeout(timer);
  }, [value]);

  if (!isSupabaseConfigured() || suggestions.length === 0) return null;

  return (
    <ul
      className="absolute z-20 mt-2 max-h-56 w-full overflow-auto rounded-xl border border-[#d2d2d7] bg-white py-2 shadow-lg"
      role="listbox"
      aria-label="Location suggestions"
    >
      {suggestions.map((s) => (
        <li key={s} role="option">
          <button
            type="button"
            className="w-full px-4 py-2.5 text-left text-[15px] text-[#1d1d1f] hover:bg-[#f5f5f7]"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelect(s)}
          >
            {s}
          </button>
        </li>
      ))}
    </ul>
  );
}
