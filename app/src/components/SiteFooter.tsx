import { Link } from 'react-router-dom';
import { PRODUCT_NAME, PRODUCT_TAGLINE } from '../lib/constants';

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--sand)] bg-[var(--paper)]">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-6 px-4 py-12 sm:px-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-[22px] font-semibold text-[var(--ink)]">{PRODUCT_NAME}</p>
          <p className="mt-2 max-w-md text-[15px] leading-relaxed text-[var(--muted)]">{PRODUCT_TAGLINE}</p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-8 gap-y-2 text-[15px] font-medium text-[var(--teal)]">
            <li>
              <Link to="/search" className="inline-flex min-h-[44px] items-center hover:underline">
                Search
              </Link>
            </li>
            <li>
              <Link to="/contribute" className="inline-flex min-h-[44px] items-center hover:underline">
                Contribute
              </Link>
            </li>
            <li>
              <Link to="/costs" className="inline-flex min-h-[44px] items-center hover:underline">
                How we work
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <p className="border-t border-[var(--sand)] px-4 py-4 text-center text-[13px] text-[var(--muted)]">
        Confirm features with the place before you book. Community reports are labeled.
      </p>
    </footer>
  );
}
