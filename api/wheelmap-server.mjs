/**
 * Server-side Wheelmap / accessibility.cloud + OSM Overpass enrichment.
 * Token: ACCESSIBILITY_CLOUD_TOKEN or VITE_ACCESSIBILITY_CLOUD_TOKEN
 */

import { geocodeLocationServer } from './geocode-server.mjs';

const CLOUD_BASE = 'https://accessibility-cloud-v2.freetls.fastly.net';
const MATCH_RADIUS_M = 350;
const MAX_CLOUD_ONLY = 12;

function cloudToken() {
  const token =
    process.env.ACCESSIBILITY_CLOUD_TOKEN ||
    process.env.VITE_ACCESSIBILITY_CLOUD_TOKEN ||
    '';
  const trimmed = token.trim();
  if (!trimmed || trimmed.includes('your-app-token') || trimmed.includes('YOUR_APP_TOKEN')) {
    return null;
  }
  return trimmed;
}

function haversineMeters(a, b) {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function normalizeName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function namesLikelyMatch(a, b) {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (!na || !nb) return false;
  return na.includes(nb) || nb.includes(na);
}

function wheelchairFromCloud(props) {
  const raw = props?.accessibility?.accessibleWith?.wheelchair;
  if (raw === true || raw === 'true') return 'full';
  if (raw === 'partial' || raw === 'limited') return 'partial';
  if (raw === false || raw === 'false') return 'none';
  return 'unknown';
}

function mapCloudCategory(category) {
  const c = String(category || '').toLowerCase();
  if (c.includes('airport') || c.includes('transport')) return 'airport';
  if (c.includes('hotel') || c.includes('lodging') || c.includes('motel')) return 'hotel';
  return 'airbnb';
}

function cloudFeatureToListing(feature) {
  const props = feature.properties ?? {};
  const coords = feature.geometry?.coordinates;
  if (!coords || coords.length < 2) return null;

  const lng = Number(coords[0]);
  const lat = Number(coords[1]);
  const name = props.name || 'Open-data place';
  const address = props.address || props.city || '';
  const rating = wheelchairFromCloud(props);
  const wheelchair = rating === 'full' || rating === 'partial';

  return {
    id: `ac-cloud-${props._id || props.id || `${lat}-${lng}`}`,
    name,
    location: address || 'Open data',
    address: address || name,
    city: String(props.city || address.split(',')[0] || '').trim(),
    state: '',
    category: mapCloudCategory(props.category),
    price: 0,
    priceLabel: 'open data',
    rating: 0,
    reviewCount: 0,
    verified: false,
    summary:
      rating === 'full'
        ? 'Wheelchair accessible per Wheelmap / accessibility.cloud open data.'
        : rating === 'partial'
          ? 'Partially wheelchair accessible per Wheelmap open data — confirm before visiting.'
          : 'Place from Wheelmap / OpenStreetMap — verify accessibility on site.',
    description: props.description || '',
    photos: [],
    coordinates: { lat, lng },
    accessibility: {
      wheelchairRamp: wheelchair,
      rollInShower: false,
      elevator: false,
      wideDoorways: wheelchair,
      accessibleParking: false,
      accessibleRestroom: wheelchair,
      accessibleEntrance: wheelchair,
      loweredBathroom: false,
      serviceAnimalsAllowed: true,
      ceilingHoist: false,
    },
    provenance: 'open-data',
    wheelchairRating: rating,
    accessibilityCloudId: props._id || props.id,
  };
}

async function fetchCloudPlaces({ lat, lng, category, wheelchairFilter, limit = 40 }) {
  const token = cloudToken();
  if (!token) return [];

  const url = new URL(`${CLOUD_BASE}/place-infos.json`);
  url.searchParams.set('appToken', token);
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lng));
  url.searchParams.set('accuracy', '10000');
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('includeRelated', 'source');

  if (wheelchairFilter) url.searchParams.set('filter', wheelchairFilter);
  if (category === 'hotel') url.searchParams.set('includeCategories', 'hotel,accommodation,lodging');
  if (category === 'airbnb') url.searchParams.set('includeCategories', 'accommodation,vacation_rental');
  if (category === 'airport') url.searchParams.set('includeCategories', 'airport,transport');

  const res = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.features ?? [];
}

async function fetchOsmWheelchairPlaces({ lat, lng, limit = 15 }) {
  const query = `
    [out:json][timeout:12];
    (
      node["tourism"~"hotel|motel|hostel"]["wheelchair"~"yes|limited"](around:8000,${lat},${lng});
      way["tourism"~"hotel|motel|hostel"]["wheelchair"~"yes|limited"](around:8000,${lat},${lng});
      node["amenity"="toilets"]["wheelchair"="yes"](around:5000,${lat},${lng});
    );
    out center ${limit};
  `;

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Access4All/1.0 (https://www.restarto.ai)',
      Accept: 'application/json',
    },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!res.ok) return [];
  const data = await res.json();
  const elements = data.elements ?? [];

  return elements
    .map((el) => {
      const tags = el.tags ?? {};
      const name = tags.name || tags['addr:street'] || 'OSM accessible place';
      const latVal = el.lat ?? el.center?.lat;
      const lngVal = el.lon ?? el.center?.lon;
      if (latVal == null || lngVal == null) return null;

      const partial = tags.wheelchair === 'limited';
      return {
        id: `osm-${el.type}-${el.id}`,
        name,
        location: [tags['addr:city'], tags['addr:state']].filter(Boolean).join(', ') || 'OpenStreetMap',
        address: [tags['addr:street'], tags['addr:city']].filter(Boolean).join(', ') || name,
        city: tags['addr:city'] || '',
        state: tags['addr:state'] || '',
        category: tags.amenity === 'toilets' ? 'airport' : 'hotel',
        price: 0,
        priceLabel: 'open data',
        rating: 0,
        reviewCount: 0,
        verified: false,
        summary: partial
          ? 'Partially wheelchair accessible per OpenStreetMap tags.'
          : 'Wheelchair accessible per OpenStreetMap community tags.',
        description: '',
        photos: [],
        coordinates: { lat: Number(latVal), lng: Number(lngVal) },
        accessibility: {
          wheelchairRamp: true,
          rollInShower: false,
          elevator: false,
          wideDoorways: true,
          accessibleParking: false,
          accessibleRestroom: tags.amenity === 'toilets',
          accessibleEntrance: true,
          loweredBathroom: false,
          serviceAnimalsAllowed: true,
          ceilingHoist: false,
        },
        provenance: 'open-data',
        wheelchairRating: partial ? 'partial' : 'full',
      };
    })
    .filter(Boolean);
}

function enrichListingFromCloud(listing, feature) {
  const mapped = cloudFeatureToListing(feature);
  if (!mapped) return listing;
  return {
    ...listing,
    wheelchairRating: mapped.wheelchairRating,
    accessibilityCloudId: mapped.accessibilityCloudId,
    provenance: listing.verified ? listing.provenance : 'open-data',
    summary: mapped.wheelchairRating === 'full'
      ? `${listing.summary} · Wheelmap confirms wheelchair access.`
      : listing.summary,
  };
}

function findNearestFeature(listing, features) {
  let nearest = null;
  let nearestScore = Number.POSITIVE_INFINITY;
  for (const feature of features) {
    const coords = feature.geometry?.coordinates;
    if (!coords) continue;
    const lng = Number(coords[0]);
    const lat = Number(coords[1]);
    const dist = haversineMeters(listing.coordinates, { lat, lng });
    if (dist > MATCH_RADIUS_M) continue;
    const score = dist + (namesLikelyMatch(listing.name, feature.properties?.name) ? 0 : 200);
    if (score < nearestScore) {
      nearestScore = score;
      nearest = feature;
    }
  }
  return nearest;
}

function isDuplicate(existing, candidate) {
  return existing.some((item) => {
    if (item.id === candidate.id) return true;
    const dist = haversineMeters(item.coordinates, candidate.coordinates);
    return dist < MATCH_RADIUS_M && namesLikelyMatch(item.name, candidate.name);
  });
}

function wheelchairFilterFromFeatures(required) {
  if (required?.wheelchairRamp || required?.accessibleEntrance) {
    return 'at-least-partially-accessible-by-wheelchair';
  }
  return undefined;
}

/**
 * Enrich API listing results with Wheelmap + OSM open data.
 */
export async function enrichListingsServer(listings, query = {}) {
  const location = String(query.location || '').trim();
  const category = query.category || '';

  let center = listings.find((l) => l.coordinates?.lat && l.coordinates?.lng)?.coordinates;
  if (!center && location) {
    const geo = await geocodeLocationServer(location);
    if (geo) center = { lat: geo.lat, lng: geo.lng };
  }
  if (!center) {
    return {
      results: listings,
      cloudEnriched: false,
      cloudPlacesAdded: 0,
      enrichmentSource: 'none',
    };
  }

  const wheelchairFilter = wheelchairFilterFromFeatures(query.accessibility);
  let features = await fetchCloudPlaces({
    lat: center.lat,
    lng: center.lng,
    category,
    wheelchairFilter,
  });

  let enrichmentSource = features.length ? 'wheelmap' : 'none';

  if (!features.length) {
    const osmPlaces = await fetchOsmWheelchairPlaces({ lat: center.lat, lng: center.lng });
    if (osmPlaces.length) {
      enrichmentSource = 'osm';
      const existing = [...listings];
      const added = [];
      for (const place of osmPlaces) {
        if (category && place.category !== category) continue;
        if (isDuplicate(existing, place)) continue;
        added.push(place);
        if (added.length >= MAX_CLOUD_ONLY) break;
      }
      return {
        results: [...listings, ...added],
        cloudEnriched: true,
        cloudPlacesAdded: added.length,
        enrichmentSource,
      };
    }
  }

  if (!features.length) {
    return {
      results: listings,
      cloudEnriched: false,
      cloudPlacesAdded: 0,
      enrichmentSource: 'none',
    };
  }

  const enriched = listings.map((listing) => {
    const match = findNearestFeature(
      {
        ...listing,
        coordinates: listing.coordinates?.lat
          ? listing.coordinates
          : center,
      },
      features,
    );
    return match ? enrichListingFromCloud(listing, match) : listing;
  });

  const cloudOnly = [];
  for (const feature of features) {
    const mapped = cloudFeatureToListing(feature);
    if (!mapped) continue;
    if (category && mapped.category !== category) continue;
    if (isDuplicate(enriched, mapped)) continue;
    cloudOnly.push(mapped);
    if (cloudOnly.length >= MAX_CLOUD_ONLY) break;
  }

  return {
    results: [...enriched, ...cloudOnly],
    cloudEnriched: true,
    cloudPlacesAdded: cloudOnly.length,
    enrichmentSource,
  };
}

export function wheelmapConfigured() {
  return Boolean(cloudToken());
}
