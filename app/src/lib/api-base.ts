import { LEGACY_PORTFOLIO_BASE, PORTFOLIO_BASE } from './constants';

/** Resolve API root for portfolio static deploy vs local dev. */
export function resolveApiBase(): string {
  if (typeof window === 'undefined') return '';

  const env = import.meta.env.VITE_API_BASE?.replace(/\/$/, '');
  if (env) return env;

  const { pathname, hostname } = window.location;
  if (!hostname.includes('restarto.ai')) return '';

  for (const marker of [PORTFOLIO_BASE, LEGACY_PORTFOLIO_BASE]) {
    if (pathname === marker || pathname.startsWith(`${marker}/`)) {
      return marker;
    }
  }

  return '';
}

export function apiUrl(path: string): string {
  const base = resolveApiBase();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}
