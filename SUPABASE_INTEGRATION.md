# Access4All — Supabase integration guide

Connect the Vite + React app to a live Supabase Postgres database for search, property details, and community accessibility reports.

## Prerequisites

- [Supabase](https://supabase.com) project (free tier works)
- Node.js 20+
- Access4All app at `delivery-package/accesslink/app/`

## Step 1 — Create tables

1. Open your Supabase project → **SQL Editor**
2. Paste and run `supabase/migrations/001_access4all_schema.sql`
3. Confirm tables `properties` and `reports` appear under **Table Editor**

The migration includes:

- `properties` — searchable listings with accessibility boolean columns
- `reports` — community issue submissions
- Starter **RLS policies** (public read on properties, anon insert on reports)
- Sample seed rows (optional — comment out if not wanted)

## Step 2 — Configure environment variables

```bash
cd delivery-package/accesslink/app
cp .env.example .env.local
```

Set from **Project Settings → API**:

| Variable | Value |
|----------|--------|
| `VITE_SUPABASE_URL` | Project URL (`https://xxxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | `anon` `public` key |

Restart the dev server after changing env:

```bash
npm run dev
```

## Step 3 — Verify the app

1. Open **Search** — header should show `Data: Live database`
2. Search `Orlando` + filter **Roll-in shower**
3. Click **View Details** on a result → full property page with photos, checklist, map
4. Submit a **Report an issue** form — row appears in `reports` table (status `pending`)

Without env vars, the app honestly falls back to **sample data** in `app/src/lib/listings/mockData.ts`.

## Architecture

```
app/src/lib/supabase/
  client.ts          — singleton browser client (VITE_* env)
  database.types.ts  — Postgres row types
  mappers.ts         — row ↔ Listing mapping
  queries.ts         — search, getById, submitReport, suggestions
  index.ts           — public exports

app/src/lib/listings/repository.ts
  — Supabase → portfolio API → local mock (fail-open fallback)
```

## Example queries

### Search with filters (TypeScript)

```ts
import { searchPropertiesFromSupabase } from './lib/supabase/queries';

const { results, total } = await searchPropertiesFromSupabase({
  location: 'Orlando, FL',
  category: 'hotel',
  requiredFeatures: {
    rollInShower: true,
    elevator: true,
  },
});
```

### Fetch property by ID

```ts
import { getPropertyByIdFromSupabase } from './lib/supabase/queries';

const listing = await getPropertyByIdFromSupabase('uuid-from-properties-table');
```

### Submit accessibility report

```ts
import { submitReportToSupabase } from './lib/supabase/queries';

await submitReportToSupabase({
  propertyId: listing.id,
  issueType: 'inaccurate_feature',
  notes: 'Listed roll-in shower was not in our room.',
  reporterEmail: 'traveler@example.com',
  features: { rollInShower: true },
});
```

### Raw SQL — search properties

```sql
select *
from properties
where location ilike '%Orlando%'
  and roll_in_shower = true
  and elevator = true
order by verified desc, rating desc;
```

### Raw SQL — pending reports

```sql
select r.*, p.title as property_title
from reports r
left join properties p on p.id = r.property_id
where r.status = 'pending'
order by r.created_at desc;
```

## Row Level Security (production)

The migration enables RLS with starter policies. Before production:

1. **Properties** — restrict `insert`/`update` to `service_role` or staff `authenticated` users
2. **Reports** — keep `insert` for `anon`; restrict `select` to reviewers only
3. Add a `published boolean` column and filter `select` with `using (published = true)`
4. Rate-limit report inserts (Supabase Edge Function or DB trigger)

Policy comments in `001_access4all_schema.sql` mark where to tighten.

## Map integration

Property detail pages use **OpenStreetMap embed** (no API key). External links open **Google Maps** and **Mapbox** search.

For production Mapbox GL:

1. Add `VITE_MAPBOX_ACCESS_TOKEN` to `.env.local`
2. Swap `PropertyMap.tsx` iframe for `mapbox-gl` (see [Mapbox React guide](https://docs.mapbox.com/mapbox-gl-js/guides/))

## Vercel deployment

In Vercel project → **Settings → Environment Variables**, add:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Rebuild after saving. The anon key is safe in client bundles; never deploy `SUPABASE_SERVICE_ROLE_KEY` to the browser.

## Extending

| Task | Where |
|------|--------|
| Add accessibility column | SQL migration + `ACCESSIBILITY_COLUMN_MAP` in `mappers.ts` + `ACCESSIBILITY_FILTERS` |
| Admin review queue | Query `reports` where `status = 'pending'` |
| Full-text search | Use `to_tsvector` index already on `properties` |
| Auth / user profiles | Supabase Auth + RLS `auth.uid()` policies |

## Files delivered

- `app/src/lib/supabase/client.ts` — Supabase client
- `app/src/lib/supabase/queries.ts` — search, detail, report
- `app/src/lib/listings/repository.ts` — unified data layer
- `app/src/pages/PropertyDetailPage.tsx` — full detail + map + report
- `app/src/components/property/*` — gallery, checklist, map, report form
- `supabase/migrations/001_access4all_schema.sql` — schema + RLS
- `app/.env.example` — env template
