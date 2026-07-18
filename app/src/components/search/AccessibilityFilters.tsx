import { Check, X } from 'lucide-react';
import type { AccessibilityFilterKey } from '../../lib/listings/types';
import { ACCESSIBILITY_FILTERS } from '../../lib/listings/filters';

type AccessibilityFiltersProps = {
  selected: Partial<Record<AccessibilityFilterKey, boolean>>;
  onChange: (key: AccessibilityFilterKey, checked: boolean) => void;
  onClear: () => void;
};

export function AccessibilityFilters({ selected, onChange, onClear }: AccessibilityFiltersProps) {
  const activeCount = Object.values(selected).filter(Boolean).length;

  return (
    <fieldset className="mt-8 border-t border-[#d2d2d7] pt-8">
      <legend className="flex w-full flex-wrap items-center justify-between gap-3">
        <span className="text-[15px] font-semibold text-[#1d1d1f]">Accessibility filters</span>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-[13px] font-medium text-[#0f4c5c] underline decoration-[#0f4c5c]/30 underline-offset-2 hover:decoration-[#0f4c5c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f4c5c]"
          >
            Clear {activeCount} filter{activeCount === 1 ? '' : 's'}
          </button>
        )}
      </legend>
      <p className="mt-2 text-[14px] text-[#6e6e73]">
        Show only listings that include every feature you select.
      </p>

      <ul className="mt-5 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
        {ACCESSIBILITY_FILTERS.map(({ key, label, description }) => {
          const checked = Boolean(selected[key]);
          const inputId = `filter-${key}`;
          return (
            <li key={key}>
              <label
                htmlFor={inputId}
                className={[
                  'flex min-h-[44px] cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors',
                  checked
                    ? 'border-[#0f4c5c] bg-[#0f4c5c]/5'
                    : 'border-[#d2d2d7] bg-[#f5f5f7] hover:border-[#86868b]',
                ].join(' ')}
              >
                <input
                  id={inputId}
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => onChange(key, e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-[#86868b] text-[#0f4c5c] focus:ring-[#0f4c5c]"
                />
                <span>
                  <span className="block text-[14px] font-medium text-[#1d1d1f]">{label}</span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-[#86868b]">
                    {description}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

export function FeaturePill({
  available,
  label,
}: {
  available: boolean;
  label: string;
}) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-medium',
        available ? 'bg-[#0f4c5c]/8 text-[#0f4c5c]' : 'bg-[#f5f5f7] text-[#86868b]',
      ].join(' ')}
    >
      {available ? (
        <Check className="h-3 w-3" aria-hidden />
      ) : (
        <X className="h-3 w-3" aria-hidden />
      )}
      {label}
    </span>
  );
}
