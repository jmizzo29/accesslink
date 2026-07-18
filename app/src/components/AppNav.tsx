import { Link, useLocation } from 'react-router-dom';
import { PRODUCT_NAME } from '../lib/constants';

const PRIMARY_LINKS = [
  { to: '/search', label: 'Search' },
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
  const isLanding = variant === 'landing' || onHero;

  const linkBase = onHero
    ? 'text-white/85 hover:text-white'
    : 'text-[#6e6e73] hover:text-[#1d1d1f]';
  const linkActive = onHero ? 'text-white' : 'text-[#1d1d1f]';

  return (
    <header
      className={[
        'marketing-nav sticky top-0 z-50 border-b',
        onHero
          ? 'border-white/10 bg-slate-900/30 backdrop-blur-md'
          : isLanding
            ? 'border-black/5 bg-white/90 backdrop-blur-xl'
            : 'border-[#d2d2d7] bg-white',
      ].join(' ')}
    >
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-3 px-4 sm:h-16 sm:gap-4 sm:px-8">
        <Link
          to="/"
          className={[
            'shrink-0 text-[17px] font-semibold tracking-tight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4',
            onHero ? 'text-white focus-visible:outline-white' : 'text-[#1d1d1f] focus-visible:outline-[#0f4c5c]',
          ].join(' ')}
          aria-label={`${PRODUCT_NAME} home`}
        >
          Access4All
        </Link>

        <nav aria-label="Main navigation" className="min-w-0 flex-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex items-center justify-end gap-0.5 sm:gap-5">
            {DESKTOP_LINKS.map((item) => {
              const active = pathname === item.to;
              return (
                <li key={item.to} className="hidden md:block">
                  <Link
                    to={item.to}
                    className={[
                      'inline-flex min-h-[44px] items-center px-2 text-[14px] font-medium transition-colors sm:px-0',
                      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4',
                      onHero ? 'focus-visible:outline-white' : 'focus-visible:outline-[#0f4c5c]',
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
                      'inline-flex min-h-[44px] items-center whitespace-nowrap px-2.5 text-[13px] font-medium transition-colors sm:px-0 sm:text-[14px]',
                      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4',
                      onHero ? 'focus-visible:outline-white' : 'focus-visible:outline-[#0f4c5c]',
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
                to="/search"
                className={[
                  'inline-flex min-h-[40px] items-center rounded-full px-4 text-[13px] font-semibold transition-colors sm:min-h-[44px] sm:px-5 sm:text-[14px]',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4',
                  onHero
                    ? 'bg-white text-[#0f4c5c] hover:bg-white/90 focus-visible:outline-white'
                    : 'bg-[#0f4c5c] text-white hover:bg-[#0a3540] focus-visible:outline-[#0f4c5c]',
                ].join(' ')}
              >
                Explore
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
