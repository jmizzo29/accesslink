# Access4All

**Verified accessible places, by the community.**

I stopped trusting “accessible” labels. Now I verify the features that matter.

Access4All is a community catalog of accessibility-verified hotels, Airbnb stays, airports, and wheelchair vans (WAV). Travelers filter by eight real features, rank results against plain-English needs, and share stay reports for the next traveler.

## Zero-env happy path

The **16 verified stays** ship in the repo as first-party product data. Search, home, and stay pages always include them — no login. New Contribute listings **append** to a shared store (Neon `DATABASE_URL`, or Vercel Blob / KV) so another device sees them. If that store is not connected, Contribute fails instead of pretending the listing is public.

```bash
npm install
cd app && npm install
cd ..
npm run dev
```

Then open http://localhost:5173

- Verified stays live in `app/src/data/seed-listings.json` (and `api/data/seed-listings.json`) with provenance `verified`.
- Community reports live in `app/public/community-catalog.json`.
- The API (`/api/search`, `/api/match`, `/api/community/*`, `/api/listings/:id`) always returns the in-repo verified catalog when Neon, GitHub, Wheelmap, or Mapbox keys are missing.
- The browser also searches that catalog locally, so Vite-only local dev works even without the API process.

## Routes

| Path | Job |
| --- | --- |
| `/` | Home — photo hero, featured stays, recently confirmed listings |
| `/search` | Location, type, 8 feature filters, Match my needs |
| `/property/:id` | Stay page — photos, story, checklist, map |
| `/contribute` | Write a stay report |
| `/costs` | How we work (public transparency) |
| `/monitoring/costs` | Gated cost detail |

Search state is driven by URL params (`location`, `category`, `needs`, feature keys such as `rollInShower=1`).

## Optional integrations

These stay optional. The happy path never depends on them.

| Variable | Used for |
| --- | --- |
| `VITE_BASE` | Asset prefix. Defaults to `/` (Vercel). |
| `DATABASE_URL` / `POSTGRES_URL` | Shared Contribute catalog (Neon). Preferred. |
| `BLOB_READ_WRITE_TOKEN` | Shared Contribute catalog (Vercel Blob) if Neon is absent |
| `KV_REST_API_*` / `UPSTASH_REDIS_REST_*` | Shared Contribute catalog (KV) if Neon and Blob are absent |
| `ACCESSIBILITY_CLOUD_TOKEN` | Wheelmap / accessibility.cloud enrichment |
| `VITE_MAPBOX_ACCESS_TOKEN` | Richer maps |
| `COMMUNITY_GITHUB_TOKEN` | Persist community contributions to the shared catalog |
| `COST_ADMIN_KEY` | Private cost page |

## Build

```bash
npm run build
```

This runs `vite build` in `app/` with no secrets. `vercel.json` sets `VITE_BASE=/` so standalone Vercel previews load assets from the site root.

## Product notes

- Brand in the UI is **Access4All** only.
- Verified stays are labeled. Community reports are labeled. Open-map enrichment is labeled when a token is present.
- PWA: `manifest.webmanifest` + production service worker for the static shell.

## License

MIT
