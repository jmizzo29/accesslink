import { LEGACY_PORTFOLIO_BASE, PORTFOLIO_BASE } from './constants';

/**
 * API root for community and catalog server routes.
 * Prefer VITE_API_BASE when the static app and API are on different hosts.
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
  if (hostname.includes('vercel.app')) {
    return '';
  }

  for (const marker of [PORTFOLIO_BASE, LEGACY_PORTFOLIO_BASE]) {
    if (pathname === marker || pathname.startsWith(`${marker}/`)) {
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
