/** Normalize a place query so "NYC", "New York City", and "new york, ny" all hit the corpus. */

const ALIASES: Record<string, string[]> = {
  nyc: ['new york', 'manhattan', 'brooklyn', 'jfk', 'lga'],
  'new york city': ['new york'],
  'new york': ['nyc', 'manhattan', 'brooklyn'],
  manhattan: ['new york', 'nyc'],
  brooklyn: ['new york'],
  sf: ['san francisco', 'sfo'],
  sfo: ['san francisco', 'sf'],
  'san francisco': ['sf', 'sfo', 'mission bay'],
  chi: ['chicago'],
  chicago: ['chi', 'lincoln park', 'wicker park'],
  mia: ['miami', 'miami beach'],
  miami: ['mia', 'miami beach'],
  'miami beach': ['miami'],
  orlando: ['mco'],
  mco: ['orlando'],
  pdx: ['portland'],
  portland: ['pdx', 'pearl'],
  atx: ['austin'],
  austin: ['atx'],
  sea: ['seattle'],
  seattle: ['sea', 'sea-tac', 'seatac'],
};

export function normalizePlace(value: string): string {
  return value
    .toLowerCase()
    .replace(/[.]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function locationMatches(haystack: string, query: string): boolean {
  const loc = normalizePlace(query);
  if (!loc) return true;
  const hay = normalizePlace(haystack);
  if (hay.includes(loc)) return true;

  const parts = loc.split(',').map((p) => p.trim()).filter((p) => p.length > 1);
  if (parts.some((part) => hay.includes(part))) return true;

  const tokens = loc.split(/[\s,]+/).filter((t) => t.length > 1);
  for (const token of tokens) {
    if (hay.includes(token)) return true;
    const extras = ALIASES[token] ?? [];
    if (extras.some((alias) => hay.includes(alias))) return true;
  }

  for (const [alias, targets] of Object.entries(ALIASES)) {
    if (loc.includes(alias) && targets.some((t) => hay.includes(t))) return true;
  }

  return false;
}

export function listingMatchesLocation(
  listing: { location?: string; city?: string; state?: string; name?: string; address?: string },
  query: string,
): boolean {
  if (!query.trim()) return true;
  const haystack = [listing.location, listing.city, listing.state, listing.name, listing.address]
    .filter(Boolean)
    .join(' ');
  return locationMatches(haystack, query);
}
