import { Link } from 'react-router-dom';
import { Accessibility } from 'lucide-react';
import { PRODUCT_NAME } from '../lib/constants';

export function MarketingNav() {
  return (
    <header className="a4a-app-header sticky top-0 z-50 px-4 py-4 sm:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-md text-xl font-extrabold tracking-tight text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          aria-label={`${PRODUCT_NAME} home`}
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white"
            aria-hidden
          >
            <Accessibility className="h-4 w-4" />
          </span>
          <span>
            Access<span className="text-accent">4</span>All
          </span>
        </Link>

        <nav className="marketing-nav" aria-label="Main navigation">
          <ul className="flex items-center gap-1 sm:gap-4">
            {[
              { to: '/', label: 'Home' },
              { to: '/search', label: 'Search' },
              { to: '/costs', label: 'Dashboard' },
            ].map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition-colors min-h-[44px] inline-flex items-center"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
