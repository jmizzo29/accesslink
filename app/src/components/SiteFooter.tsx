import { Link } from 'react-router-dom';
import { PRODUCT_NAME, PRODUCT_TAGLINE } from '../lib/constants';

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--sand)] bg-[var(--paper)]">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-10 sm:px-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-[18px] font-semibold text-[var(--ink)]">{PRODUCT_NAME}</p>
          <p className="mt-1 max-w-md text-[14px] text-[var(--muted)]">{PRODUCT_TAGLINE}</p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[14px] font-medium text-[var(--teal)]">
            <li>
              <Link to="/search" className="inline-flex items-center hover:underline">
                Search
              </Link>
            </li>
            <li>
              <Link to="/contribute" className="inline-flex items-center hover:underline">
                Contribute
              </Link>
            </li>
            <li>
              <Link to="/demo" className="inline-flex items-center hover:underline">
                Demo
              </Link>
            </li>
            <li>
              <Link to="/costs" className="inline-flex items-center hover:underline">
                Transparency
              </Link>
            </li>
            <li>
              <Link to="/activity" className="inline-flex items-center hover:underline">
                Monad
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <p className="border-t border-[var(--sand)] px-4 py-4 text-center text-[12px] text-[var(--faint)]">
        Beta — confirm accessibility with the property before you book. Demo stays are labeled.
      </p>
    </footer>
  );
}
