export type GeocodeResult = {
  lat: number;
  lng: number;
  displayName: string;
};

const cache = new Map<string, GeocodeResult | null>();

export async function geocodeLocation(query: string): Promise<GeocodeResult | null> {
  const key = query.trim().toLowerCase();
  if (!key) return null;
  if (cache.has(key)) return cache.get(key) ?? null;

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query.trim());
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');

  try {
    const res = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Access4All/1.0 (accessible travel search; contact@restarto.ai)',
      },
    });
    if (!res.ok) {
      cache.set(key, null);
      return null;
    }
    const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
    if (!data.length) {
      cache.set(key, null);
      return null;
    }
    const hit = data[0];
    const result: GeocodeResult = {
      lat: Number(hit.lat),
      lng: Number(hit.lon),
      displayName: hit.display_name,
    };
    cache.set(key, result);
    return result;
  } catch {
    cache.set(key, null);
    return null;
  }
}
