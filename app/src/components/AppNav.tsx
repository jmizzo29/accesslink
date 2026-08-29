import { Link, useLocation } from 'react-router-dom';
import { PRODUCT_NAME } from '../lib/constants';

const LINKS = [
  { to: '/search', label: 'Search' },
  { to: '/contribute', label: 'Contribute' },
  { to: '/demo', label: 'Try it' },
] as const;

type AppNavProps = {
  variant?: 'landing' | 'app' | 'hero';
};

export function AppNav({ variant = 'app' }: AppNavProps) {
  const { pathname } = useLocation();
  const onHero = variant === 'hero';

  const linkBase = onHero ? 'text-white/88 hover:text-white' : 'text-[var(--muted)] hover:text-[var(--ink)]';
  const linkActive = onHero ? 'text-white' : 'text-[var(--ink)]';

  return (
    <header
      className={[
        'z-50',
        onHero
          ? 'absolute inset-x-0 top-0 border-0 bg-transparent'
          : 'sticky top-0 border-b border-[var(--sand)] bg-[var(--paper)]/94 backdrop-blur-xl',
      ].join(' ')}
    >
      <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between gap-4 px-4 sm:h-[4.25rem] sm:px-8">
        <Link
          to="/"
          className={[
            'shrink-0 font-display text-[20px] font-semibold tracking-tight',
            onHero ? 'text-white' : 'text-[var(--ink)]',
          ].join(' ')}
          aria-label={`${PRODUCT_NAME} home`}
        >
          Access4All
        </Link>

        <nav aria-label="Main">
          <ul className="flex items-center gap-1 sm:gap-5">
            {LINKS.map((item) => {
              const active = pathname === item.to;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={[
                      'inline-flex min-h-[44px] items-center px-2 text-[15px] font-medium',
                      active ? linkActive : linkBase,
                    ].join(' ')}
                    aria-current={active ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                to="/search"
                className={[
                  'ml-1 inline-flex min-h-[44px] items-center rounded-full px-5 text-[14px] font-semibold',
                  onHero
                    ? 'bg-white text-[var(--teal)] hover:bg-[var(--cream)]'
                    : 'bg-[var(--teal)] text-white hover:bg-[var(--teal-deep)]',
                ].join(' ')}
              >
                Find a place
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
