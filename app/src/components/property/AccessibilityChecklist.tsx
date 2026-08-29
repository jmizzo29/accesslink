import { Check, X } from 'lucide-react';
import type { AccessibilityFeatures } from '../../lib/listings/types';
import { ACCESSIBILITY_FILTERS } from '../../lib/listings/filters';

type AccessibilityChecklistProps = {
  features: AccessibilityFeatures;
};

export function AccessibilityChecklist({ features }: AccessibilityChecklistProps) {
  const available = ACCESSIBILITY_FILTERS.filter((f) => features[f.key]).length;
  const total = ACCESSIBILITY_FILTERS.length;

  return (
    <section aria-labelledby="accessibility-checklist-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="accessibility-checklist-heading"
            className="font-display text-[28px] font-semibold tracking-tight sm:text-[32px]"
          >
            What travelers confirmed
          </h2>
          <p className="mt-2 text-[17px] text-[var(--muted)]">
            Features checked on site. Always confirm with the place before you book.
          </p>
        </div>
        <p className="rounded-full bg-[var(--teal-soft)] px-4 py-2 text-[14px] font-medium text-[var(--teal)]">
          {available} of {total} confirmed
        </p>
      </div>

      <ul className="mt-8 grid list-none gap-3 p-0 sm:grid-cols-2">
        {ACCESSIBILITY_FILTERS.map(({ key, label, description }) => {
          const has = features[key];
          return (
            <li
              key={key}
              className={[
                'flex items-start gap-3 rounded-2xl border px-4 py-4',
                has ? 'border-[var(--teal)]/20 bg-[var(--teal-soft)]' : 'border-[var(--sand)] bg-[var(--paper)]',
              ].join(' ')}
            >
              <span
                className={[
                  'mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                  has ? 'bg-[var(--teal)] text-white' : 'bg-[var(--sand)] text-[var(--faint)]',
                ].join(' ')}
                aria-hidden
              >
                {has ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
              </span>
              <span>
                <span className="block text-[15px] font-medium">{label}</span>
                <span className="mt-1 block text-[13px] leading-snug text-[var(--faint)]">
                  {description}
                </span>
                <span className="sr-only">{has ? 'Confirmed' : 'Not confirmed'}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
