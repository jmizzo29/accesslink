import { Link, useLocation } from 'react-router-dom';
import { PRODUCT_NAME } from '../lib/constants';

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/search', label: 'Search' },
  { to: '/contribute', label: 'Contribute' },
] as const;

type AppNavProps = {
  variant?: 'landing' | 'app' | 'hero';
};

export function AppNav({ variant = 'app' }: AppNavProps) {
  const { pathname } = useLocation();
  const onHero = variant === 'hero';
  const onHome = pathname === '/';

  const linkBase = onHero ? 'text-white/88 hover:text-white' : 'text-[var(--muted)] hover:text-[var(--ink)]';
  const linkActive = onHero ? 'text-white' : 'text-[var(--ink)]';

  return (
    <header
      className={[
        'z-[60]',
        onHero
          ? 'absolute inset-x-0 top-0 border-0 bg-transparent'
          : 'sticky top-0 border-b border-[var(--sand)] bg-[var(--paper)]/94 backdrop-blur-xl',
      ].join(' ')}
    >
      <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between gap-6 px-4 sm:h-[4.25rem] sm:px-8">
        <Link
          to="/"
          className={[
            'inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center rounded-md px-1 font-display text-[20px] font-semibold tracking-tight underline-offset-4 hover:underline',
            onHero ? 'text-white' : 'text-[var(--ink)]',
          ].join(' ')}
          aria-label={`${PRODUCT_NAME} home`}
          aria-current={onHome ? 'page' : undefined}
        >
          {PRODUCT_NAME}
        </Link>

        <nav aria-label="Main">
          <ul className="flex items-center gap-2 sm:gap-8">
            {LINKS.map((item) => {
              const active = item.to === '/' ? onHome : pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={[
                      'inline-flex min-h-[44px] items-center rounded-md px-2 text-[15px] font-medium sm:px-3',
                      active ? `${linkActive} underline decoration-2 underline-offset-4` : linkBase,
                    ].join(' ')}
                    aria-current={active ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
