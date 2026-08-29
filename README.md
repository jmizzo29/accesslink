# Access4All

**Verified accessible places, by the community.**

I stopped trusting “accessible” labels. Now I verify the features that matter.

Access4All is a community catalog of accessibility-verified hotels, Airbnb stays, airports, and wheelchair vans (WAV). Travelers filter by real features (not marketing tags), rank results against plain-English needs, and can anchor verifications on Monad testnet.

## Zero-env happy path

The demo catalog is seeded in the repo. **No environment variables are required** to search, open Harborview (`/property/prop-001`), contribute a place, run the 90-second demo, or view transparency and Monad activity.

```bash
npm install
cd app && npm install
cd ..
npm run dev
```

Then open http://localhost:5173

- Seeded curated stays live in `app/src/data/seed-listings.json` (and `api/seed-listings.json`).
- Seeded community reports live in `app/public/community-catalog.json`.
- The API (`/api/search`, `/api/match`, `/api/community/*`, `/api/listings/:id`) falls back to that corpus when Neon, GitHub, Wheelmap, Mapbox, or Monad keys are missing.
- The browser also searches the seed locally, so Vite-only local dev works even without the API process.

## Routes

| Path | Job |
| --- | --- |
| `/` | Home — hero, Why Access4All, Contribute + Search, 90-second judge path |
| `/search` | Location, type, 8 feature filters, Clear filters, Match my needs |
| `/property/:id` | Checklist, map, Monad verify — demo IDs never 404 |
| `/contribute` | Hotel / stay / WAV publish form |
| `/costs` | Public transparency |
| `/monitoring/costs` | Gated operator view |
| `/activity` | Monad testnet ledger (empty state is honest if writes are off) |
| `/demo` | Numbered 90-second judge path |
| `/judge` | Printable one-pager |

Search state is driven by URL params (`location`, `category`, `needs`, feature keys such as `rollInShower=1`, `demo=1`).

## Optional integrations

These stay optional. The happy path never depends on them.

| Variable | Used for |
| --- | --- |
| `VITE_BASE` | Asset prefix. Defaults to `/` (Vercel). Set `/portfolio/access4all/app/` only for the Restarto host. |
| `DATABASE_URL` / Supabase keys | Live listings instead of seed |
| `ACCESSIBILITY_CLOUD_TOKEN` | Wheelmap / accessibility.cloud enrichment |
| `VITE_MAPBOX_ACCESS_TOKEN` | Richer maps |
| `COMMUNITY_GITHUB_TOKEN` | Persist contributions to the shared catalog |
| `MONAD_PRIVATE_KEY` + contract address | Server-side on-chain writes |
| `COST_ADMIN_KEY` | Operator dashboard (defaults to a local demo key) |

## Build

```bash
npm run build
```

This runs `vite build` in `app/` with no secrets. `vercel.json` sets `VITE_BASE=/` so standalone Vercel previews load assets from the site root.

## Product notes

- Brand in the UI is **Access4All** only.
- Demo stays are labeled. Community reports are labeled. Open-map enrichment is labeled when a token is present.
- Monad write is optional. Activity shows an honest empty or local-ledger state when `writeEnabled` is false.
- PWA: `manifest.webmanifest` + production service worker for the static shell.

## License

MIT
