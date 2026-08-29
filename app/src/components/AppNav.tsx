import { Link, useLocation } from 'react-router-dom';
import { PRODUCT_NAME } from '../lib/constants';

const PRIMARY_LINKS = [
  { to: '/search', label: 'Search' },
  { to: '/contribute', label: 'Contribute' },
  { to: '/activity', label: 'Monad' },
  { to: '/demo', label: 'Demo' },
] as const;

const DESKTOP_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/costs', label: 'Transparency' },
] as const;

type AppNavProps = {
  variant?: 'landing' | 'app' | 'hero';
};

export function AppNav({ variant = 'app' }: AppNavProps) {
  const { pathname } = useLocation();
  const onHero = variant === 'hero';

  const linkBase = onHero ? 'text-white/85 hover:text-white' : 'text-[var(--muted)] hover:text-[var(--ink)]';
  const linkActive = onHero ? 'text-white' : 'text-[var(--ink)]';

  return (
    <header
      className={[
        'z-50',
        onHero
          ? 'absolute inset-x-0 top-0 border-0 bg-transparent'
          : 'sticky top-0 border-b border-[var(--sand)] bg-[var(--paper)]/92 backdrop-blur-xl',
      ].join(' ')}
    >
      <div
        className={[
          'mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-4 sm:gap-4 sm:px-8',
          onHero ? 'h-16 pt-2 sm:h-[4.5rem] sm:pt-3' : 'h-14 sm:h-16',
        ].join(' ')}
      >
        <Link
          to="/"
          className={[
            'shrink-0 font-display text-[18px] font-semibold tracking-tight',
            onHero ? 'text-white' : 'text-[var(--ink)]',
          ].join(' ')}
          aria-label={`${PRODUCT_NAME} home`}
        >
          Access4All
        </Link>

        <nav aria-label="Main" className="min-w-0 flex-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex items-center justify-end gap-0.5 sm:gap-5">
            {DESKTOP_LINKS.map((item) => {
              const active = pathname === item.to;
              return (
                <li key={item.to} className="hidden md:block">
                  <Link
                    to={item.to}
                    className={[
                      'inline-flex min-h-[44px] items-center px-2 text-[14px] font-medium sm:px-0',
                      active ? linkActive : linkBase,
                    ].join(' ')}
                    aria-current={active ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            {PRIMARY_LINKS.map((item) => {
              const active = pathname === item.to;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={[
                      'inline-flex min-h-[44px] items-center whitespace-nowrap px-2.5 text-[13px] font-medium sm:px-0 sm:text-[14px]',
                      active ? linkActive : linkBase,
                    ].join(' ')}
                    aria-current={active ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li className="ml-1 sm:ml-3">
              <Link
                to="/contribute"
                className={[
                  'inline-flex min-h-[40px] items-center rounded-full px-4 text-[13px] font-semibold sm:min-h-[44px] sm:px-5 sm:text-[14px]',
                  onHero
                    ? 'bg-white text-[var(--teal)] shadow-md hover:bg-[var(--cream)]'
                    : 'bg-[var(--teal)] text-white hover:bg-[var(--teal-deep)]',
                ].join(' ')}
              >
                Contribute
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
