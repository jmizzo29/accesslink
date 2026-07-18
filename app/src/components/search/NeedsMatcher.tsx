import { useState, type FormEvent } from 'react';
import { Sparkles } from 'lucide-react';
import { parseNeedsLocally } from '../../lib/match/parseNeeds';
import { ACCESSIBILITY_FILTERS } from '../../lib/listings/filters';

type NeedsMatcherProps = {
  value: string;
  onChange: (value: string) => void;
  onMatch: () => void;
  matching: boolean;
  parsedFeatures: string[];
};

export function NeedsMatcher({
  value,
  onChange,
  onMatch,
  matching,
  parsedFeatures,
}: NeedsMatcherProps) {
  const [showHint, setShowHint] = useState(false);
  const localParsed = parseNeedsLocally(value);

  const featureLabels = Object.fromEntries(
    ACCESSIBILITY_FILTERS.map((f) => [f.key, f.label]),
  ) as Record<string, string>;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onMatch();
  }

  return (
    <section
      className="mt-8 rounded-2xl border border-[#0f4c5c]/15 bg-gradient-to-br from-[#f0f9fa] to-white p-6 sm:p-8"
      aria-labelledby="needs-heading"
    >
      <div className="flex items-start gap-3">
        <Sparkles className="mt-1 h-5 w-5 shrink-0 text-[#0f4c5c]" aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 id="needs-heading" className="text-[21px] font-semibold tracking-tight text-[#1d1d1f]">
            Match my needs
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-[#6e6e73]">
            Describe what you need in plain English — we rank listings by fit, not marketing tags.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6">
        <label htmlFor="needs-input" className="sr-only">
          Describe your accessibility needs
        </label>
        <textarea
          id="needs-input"
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowHint(true)}
          placeholder="e.g. I need zero-step entry, a roll-in shower, and wide doorways for a power wheelchair"
          className="w-full resize-y rounded-xl border border-[#d2d2d7] bg-white px-4 py-3.5 text-[17px] text-[#1d1d1f] placeholder:text-[#86868b] focus:border-[#0f4c5c] focus:outline-none focus:ring-2 focus:ring-[#0f4c5c]/20"
        />
        {showHint && !value && (
          <p className="mt-2 text-[13px] text-[#86868b]">
            Try: roll-in shower, elevator, step-free entrance, 32-inch doorways
          </p>
        )}
        {(parsedFeatures.length > 0 || localParsed.parsed) && (
          <p className="mt-3 text-[13px] text-[#0f4c5c]">
            Detected:{' '}
            {(parsedFeatures.length ? parsedFeatures : localParsed.featureList)
              .map((k) => featureLabels[k] ?? k)
              .join(' · ')}
          </p>
        )}
        <button
          type="submit"
          disabled={matching || value.trim().length < 8}
          className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#0f4c5c] px-6 text-[15px] font-medium text-white transition-colors hover:bg-[#0a3540] disabled:opacity-50"
        >
          {matching ? 'Ranking…' : 'Rank results for me'}
        </button>
      </form>
    </section>
  );
}
