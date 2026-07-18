/**
 * Server-side geocoding via Nominatim (no API key).
 */

const CACHE = new Map();

export async function geocodeLocationServer(location) {
  const key = location.trim().toLowerCase();
  if (!key) return null;
  if (CACHE.has(key)) return CACHE.get(key);

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', location.trim());
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');

  const res = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Access4All/1.0 (restarto.ai portfolio demo)',
    },
  });

  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data) || !data[0]) return null;

  const result = {
    lat: Number(data[0].lat),
    lng: Number(data[0].lon),
    displayName: data[0].display_name,
  };
  CACHE.set(key, result);
  return result;
}
