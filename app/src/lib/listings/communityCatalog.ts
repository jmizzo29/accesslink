import { apiUrl } from '../api-base';
import type { AccessibilityFeatures, Listing, ListingCategory } from './types';

const LOCAL_KEY = 'a4a-community-catalog-v1';
const GITHUB_RAW =
  'https://raw.githubusercontent.com/jmizzo29/accesslink/main/app/public/community-catalog.json';

export type CommunityContributionInput = {
  name: string;
  location: string;
  city?: string;
  state?: string;
  address?: string;
  category: ListingCategory;
  summary: string;
  description?: string;
  accessibility: Partial<AccessibilityFeatures>;
  contributorName?: string;
  photoUrl?: string;
};

export type PublishResult = {
  listing: Listing;
  shared: boolean;
  message: string;
};

let remoteCache: Listing[] | null = null;
let remoteFetchPromise: Promise<Listing[]> | null = null;

function emptyAccessibility(): AccessibilityFeatures {
  return {
    wheelchairRamp: false,
    rollInShower: false,
    elevator: false,
    wideDoorways: false,
    accessibleParking: false,
    accessibleRestroom: false,
    accessibleEntrance: false,
    loweredBathroom: false,
    serviceAnimalsAllowed: false,
    ceilingHoist: false,
  };
}

function normalizeListing(raw: Partial<Listing> & { id?: string; name?: string }): Listing | null {
  if (!raw?.name && !(raw as { title?: string }).title) return null;
  const name = String(raw.name ?? (raw as { title?: string }).title ?? '').trim();
  if (!name) return null;
  const location = String(raw.location ?? '').trim();
  const city = String(raw.city ?? location.split(',')[0]?.trim() ?? location);
  const state = String(raw.state ?? location.split(',')[1]?.trim() ?? '');
  const category = (raw.category as ListingCategory) || 'hotel';
  const acc = { ...emptyAccessibility(), ...(raw.accessibility ?? {}) };

  return {
    id: String(raw.id ?? `community-${Date.now().toString(36)}`),
    name,
    location: location || city,
    address: raw.address ? String(raw.address) : undefined,
    city,
    state,
    category,
    price: Number(raw.price ?? 0),
    priceLabel:
      category === 'wav' ? 'WAV / transfer' : category === 'airport' ? 'public facility' : 'per night',
    rating: Number(raw.rating ?? 0),
    reviewCount: Number(raw.reviewCount ?? 0),
    verified: Boolean(raw.verified ?? false),
    summary: String(raw.summary ?? raw.description ?? 'Community-contributed accessible place.').slice(
      0,
      280,
    ),
    description: raw.description ? String(raw.description) : undefined,
    photos: Array.isArray(raw.photos) ? raw.photos : [],
    coordinates: raw.coordinates,
    accessibility: acc,
    provenance: 'community',
    verifiedOnChain: Boolean(raw.verifiedOnChain),
    monadTxHash: raw.monadTxHash,
    monadVerifiedAt: raw.monadVerifiedAt,
  };
}

export function readLocalCommunityCatalog(): Listing[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => normalizeListing(item as Partial<Listing>))
      .filter((x): x is Listing => Boolean(x));
  } catch {
    return [];
  }
}

function writeLocalCommunityCatalog(listings: Listing[]): void {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(listings.slice(0, 200)));
}

function rememberLocal(listing: Listing): void {
  const next = [listing, ...readLocalCommunityCatalog().filter((l) => l.id !== listing.id)];
  writeLocalCommunityCatalog(next);
  remoteCache = null;
  remoteFetchPromise = null;
}

async function fetchApiCatalog(): Promise<Listing[]> {
  try {
    const res = await fetch(apiUrl('/api/community/listings'));
    if (!res.ok) return [];
    const data = (await res.json()) as { listings?: unknown[] };
    const rows = Array.isArray(data.listings) ? data.listings : [];
    return rows
      .map((item) => normalizeListing(item as Partial<Listing>))
      .filter((x): x is Listing => Boolean(x));
  } catch {
    return [];
  }
}

async function fetchBundledCatalog(): Promise<Listing[]> {
  try {
    const base = import.meta.env.BASE_URL || '/';
    const res = await fetch(`${base}community-catalog.json`, { cache: 'no-cache' });
    if (!res.ok) return [];
    const data = (await res.json()) as { listings?: unknown[] } | unknown[];
    const rows = Array.isArray(data) ? data : data.listings ?? [];
    return rows
      .map((item) => normalizeListing(item as Partial<Listing>))
      .filter((x): x is Listing => Boolean(x));
  } catch {
    return [];
  }
}

async function fetchGithubCatalog(): Promise<Listing[]> {
  try {
    const res = await fetch(`${GITHUB_RAW}?t=${Date.now()}`, { cache: 'no-cache' });
    if (!res.ok) return [];
    const data = (await res.json()) as { listings?: unknown[] } | unknown[];
    const rows = Array.isArray(data) ? data : data.listings ?? [];
    return rows
      .map((item) => normalizeListing(item as Partial<Listing>))
      .filter((x): x is Listing => Boolean(x));
  } catch {
    return [];
  }
}

/** Shared catalog for everyone + this browser's offline copies. */
export async function loadCommunityCatalog(): Promise<Listing[]> {
  if (!remoteFetchPromise) {
    remoteFetchPromise = (async () => {
      const [api, bundled, github] = await Promise.all([
        fetchApiCatalog(),
        fetchBundledCatalog(),
        fetchGithubCatalog(),
      ]);
      const byId = new Map<string, Listing>();
      for (const listing of [...api, ...github, ...bundled]) {
        byId.set(listing.id, listing);
      }
      remoteCache = [...byId.values()];
      return remoteCache;
    })();
  }
  const remote = await remoteFetchPromise;
  const local = readLocalCommunityCatalog();
  const byId = new Map<string, Listing>();
  for (const listing of [...remote, ...local]) {
    byId.set(listing.id, listing);
  }
  return [...byId.values()];
}

export async function getCommunityListingByIdAsync(id: string): Promise<Listing | null> {
  const all = await loadCommunityCatalog();
  return all.find((l) => l.id === id) ?? null;
}

/** Publish for the world via API; always keep a local copy so search still works offline. */
export async function publishCommunityContribution(
  input: CommunityContributionInput,
): Promise<PublishResult> {
  const loc = input.location.trim();
  const city = (input.city || loc.split(',')[0] || '').trim();
  const state = (input.state || loc.split(',')[1] || '').trim();
  const payload = {
    name: input.name.trim(),
    location: loc,
    city,
    state,
    address: input.address?.trim(),
    category: input.category,
    summary: input.summary.trim(),
    description: [
      input.description?.trim(),
      input.contributorName?.trim() ? `Contributed by ${input.contributorName.trim()}.` : '',
    ]
      .filter(Boolean)
      .join(' '),
    accessibility: { ...emptyAccessibility(), ...input.accessibility },
    photos: input.photoUrl?.trim()
      ? [{ url: input.photoUrl.trim(), alt: `${input.name.trim()} — contributor photo` }]
      : [],
    contributorName: input.contributorName?.trim(),
  };

  try {
    const res = await fetch(apiUrl('/api/community/contribute'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = (await res.json()) as {
        listing: Listing;
        shared?: boolean;
        message?: string;
      };
      const listing = normalizeListing(data.listing);
      if (listing) {
        rememberLocal(listing);
        return {
          listing,
          shared: Boolean(data.shared),
          message:
            data.message ||
            (data.shared
              ? 'Published — everyone can search this place.'
              : 'Saved. Searchable for everyone once sync completes.'),
        };
      }
    }
  } catch {
    /* fall through to local */
  }

  const localListing = normalizeListing({
    id: `community-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    ...payload,
    provenance: 'community',
    verified: false,
  });
  if (!localListing) throw new Error('Could not save contribution');
  rememberLocal(localListing);
  return {
    listing: localListing,
    shared: false,
    message:
      'Saved on this device. The shared catalog is reconnecting — try Contribute again in a moment so everyone can see it.',
  };
}

export function mergeCommunityIntoResults(
  base: Listing[],
  community: Listing[],
  queryLocation: string,
  category: ListingCategory | '',
): Listing[] {
  const loc = queryLocation.trim().toLowerCase();
  let extras = [...community];

  if (category) {
    extras = extras.filter((p) => p.category === category);
  }

  if (loc) {
    extras = extras.filter((p) => {
      const haystack = `${p.location} ${p.city} ${p.state} ${p.name}`.toLowerCase();
      return (
        haystack.includes(loc) ||
        loc.split(',').some((part) => {
          const t = part.trim();
          return t.length > 1 && haystack.includes(t);
        })
      );
    });
  }

  const byId = new Map<string, Listing>();
  for (const listing of [...extras, ...base]) {
    if (!byId.has(listing.id)) byId.set(listing.id, listing);
  }
  return [...byId.values()];
}
