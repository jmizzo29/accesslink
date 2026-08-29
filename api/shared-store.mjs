/**
 * Durable shared listing store — no traveler login.
 * Order: Neon (DATABASE_URL) → Vercel Blob → Upstash/Vercel KV.
 * Writes fail if none of these are configured. Seed listings stay in-repo.
 */

const CATALOG_KEY = 'access4all/shared-listings.json';
const KV_KEY = 'a4a-shared-listings';

export function postgresUrl() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.NEON_DATABASE_URL ||
    ''
  ).trim();
}

export function blobToken() {
  return (process.env.BLOB_READ_WRITE_TOKEN || '').trim();
}

export function kvConfig() {
  const url = (
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    ''
  ).trim();
  const token = (
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    ''
  ).trim();
  return url && token ? { url, token } : null;
}

export function describeStore() {
  if (postgresUrl()) return { configured: true, backend: 'neon' };
  if (blobToken()) return { configured: true, backend: 'blob' };
  if (kvConfig()) return { configured: true, backend: 'kv' };
  return { configured: false, backend: 'none' };
}

export function isSharedStoreConfigured() {
  return describeStore().configured;
}

function emptyCatalog() {
  return { version: 1, updatedAt: new Date().toISOString(), listings: [] };
}

async function readNeon() {
  const url = postgresUrl();
  if (!url) return null;
  const { neon } = await import('@neondatabase/serverless');
  const sql = neon(url);
  await sql`
    CREATE TABLE IF NOT EXISTS a4a_shared_listings (
      id TEXT PRIMARY KEY,
      payload TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  const rows = await sql`SELECT payload FROM a4a_shared_listings ORDER BY updated_at DESC`;
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    listings: rows
      .map((row) => {
        try {
          return typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;
        } catch {
          return null;
        }
      })
      .filter(Boolean),
  };
}

async function writeNeon(catalog) {
  const url = postgresUrl();
  if (!url) return false;
  const { neon } = await import('@neondatabase/serverless');
  const sql = neon(url);
  await sql`
    CREATE TABLE IF NOT EXISTS a4a_shared_listings (
      id TEXT PRIMARY KEY,
      payload TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  for (const listing of catalog.listings) {
    if (!listing?.id) continue;
    await sql`
      INSERT INTO a4a_shared_listings (id, payload, updated_at)
      VALUES (${listing.id}, ${JSON.stringify(listing)}, now())
      ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = now()
    `;
  }
  return true;
}

async function readBlob() {
  const token = blobToken();
  if (!token) return null;
  const { list } = await import('@vercel/blob');
  const listed = await list({ prefix: CATALOG_KEY, token, limit: 10 });
  const hit = listed.blobs?.find((b) => b.pathname === CATALOG_KEY) || listed.blobs?.[0];
  if (!hit?.url) return emptyCatalog();
  const res = await fetch(hit.url, { cache: 'no-store' });
  if (!res.ok) return emptyCatalog();
  const parsed = await res.json();
  return {
    version: 1,
    updatedAt: parsed.updatedAt || new Date().toISOString(),
    listings: Array.isArray(parsed.listings) ? parsed.listings : [],
  };
}

async function writeBlob(catalog) {
  const token = blobToken();
  if (!token) return false;
  const { put } = await import('@vercel/blob');
  await put(CATALOG_KEY, JSON.stringify(catalog), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    token,
    contentType: 'application/json',
  });
  return true;
}

async function readKv() {
  const kv = kvConfig();
  if (!kv) return null;
  const res = await fetch(`${kv.url}/get/${encodeURIComponent(KV_KEY)}`, {
    headers: { Authorization: `Bearer ${kv.token}` },
    cache: 'no-store',
  });
  if (!res.ok) return emptyCatalog();
  const data = await res.json();
  const parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
  if (!parsed) return emptyCatalog();
  return {
    version: 1,
    updatedAt: parsed.updatedAt || new Date().toISOString(),
    listings: Array.isArray(parsed.listings) ? parsed.listings : [],
  };
}

async function writeKv(catalog) {
  const kv = kvConfig();
  if (!kv) return false;
  const res = await fetch(`${kv.url}/set/${encodeURIComponent(KV_KEY)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${kv.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(catalog),
  });
  return res.ok;
}

export async function readSharedCatalog() {
  if (postgresUrl()) return readNeon();
  if (blobToken()) return readBlob();
  if (kvConfig()) return readKv();
  return null;
}

export async function writeSharedCatalog(catalog) {
  if (postgresUrl()) return writeNeon(catalog);
  if (blobToken()) return writeBlob(catalog);
  if (kvConfig()) return writeKv(catalog);
  return false;
}
