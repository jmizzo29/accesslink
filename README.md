# Access4All

**Verified accessible places, by the community.**

I stopped trusting “accessible” labels. Now I verify the features that matter.

Access4All is a community catalog of accessibility-verified hotels, Airbnb stays, airports, and wheelchair vans (WAV). Travelers filter by eight real features, rank results against plain-English needs, and share stay reports for the next traveler.

## Zero-env happy path

The catalog is seeded in the repo. **No environment variables are required** to search, open Harborview (`/property/prop-001`), or contribute a place.

```bash
npm install
cd app && npm install
cd ..
npm run dev
```

Then open http://localhost:5173

- Seeded stays live in `app/src/data/seed-listings.json` (and `api/data/seed-listings.json`).
- Seeded community reports live in `app/public/community-catalog.json`.
- The API (`/api/search`, `/api/match`, `/api/community/*`, `/api/listings/:id`) falls back to that corpus when Neon, GitHub, Wheelmap, or Mapbox keys are missing.
- The browser also searches the seed locally, so Vite-only local dev works even without the API process.

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
| `DATABASE_URL` / Supabase keys | Live listings instead of seed |
| `ACCESSIBILITY_CLOUD_TOKEN` | Wheelmap / accessibility.cloud enrichment |
| `VITE_MAPBOX_ACCESS_TOKEN` | Richer maps |
| `COMMUNITY_GITHUB_TOKEN` | Persist contributions to the shared catalog |
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
