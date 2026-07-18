import { LEGACY_PORTFOLIO_BASE, PORTFOLIO_BASE } from './constants';

/**
 * API root for community + Monad server routes.
 * Prefer VITE_API_BASE (dedicated Access4All API host) so Restarto static
 * pages can still publish shared contributions for everyone.
 */
export function resolveApiBase(): string {
  if (typeof window === 'undefined') return '';

  const env = (
    import.meta.env.VITE_API_BASE ||
    import.meta.env.VITE_API_BASE_URL ||
    ''
  ).replace(/\/$/, '');
  if (env) return env;

  const { pathname, hostname } = window.location;
  // Same-origin API when the app is hosted on the Access4All Vercel project
  if (hostname.includes('vercel.app') && hostname.includes('accesslink')) {
    return '';
  }

  if (!hostname.includes('restarto.ai')) return '';

  for (const marker of [PORTFOLIO_BASE, LEGACY_PORTFOLIO_BASE]) {
    if (pathname === marker || pathname.startsWith(`${marker}/`)) {
      // Restarto is static — without VITE_API_BASE, community write falls back locally
      return '';
    }
  }

  return '';
}

export function apiUrl(path: string): string {
  const base = resolveApiBase();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}
