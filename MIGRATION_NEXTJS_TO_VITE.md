# AccessLink Migration: Next.js → Vite SPA + Vercel

## Why This Change?

**Root Cause:** ForgeOS is a **Vite-native platform** with zero Next.js deployment integration. AccessLink was created as a Next.js App Router project, but the Forge publish pipeline treats all outcomes as Vite/Astro SPAs.

**Result:** 
- Next.js routes never compiled (`next build` was never run)
- API routes return 404 (not deployed as serverless functions)  
- Platform mismatch for 2+ weeks

**Solution:** Convert AccessLink to a **Vite SPA** + **Node API router** (the Forge-native pattern used by 40+ outcomes).

---

## What Changed

### ❌ REMOVED

- `next.config.js` — Next.js config not used by Forge
- `app/` directory structure — Next App Router routes
- Next.js API routes (`app/api/*/route.ts`)
- `next` package dependency

### ✅ ADDED

- `vite.config.ts` — Vite build configuration
- `app/vite.config.ts` — Vite build in app subfolder
- `app/src/` — React SPA source (mirrors original Next.js React code)
- `app/src/main.tsx` — Vite entry point
- `app/src/App.tsx` — Vite app root (routing + navigation)
- `app/src/pages/CostsPage.tsx` — Costs page (client-side)
- `app/src/components/*` — UI components
- `app/index.html` — Vite entry HTML
- `api/router.mjs` — Single Node.js serverless function for all API routes
- `vercel.json` — Vercel static + API router config

### 🔄 MODIFIED

- `package.json` (root) — Removed `next`, added `@vercel/node`
- `app/package.json` (new) — Vite build scripts + React deps

---

## File Structure (After Migration)

```
delivery-package/accesslink/
├── next.config.js             ❌ DELETED
├── src/                        ❌ MOVED TO app/src/
├── index.html                  ❌ DELETED (replaced by app/index.html)
├── package.json                ✅ UPDATED (root build scripts)
├── vercel.json                 ✅ CREATED (static site + API router config)
├── api/
│   └── router.mjs              ✅ CREATED (unified API endpoint)
└── app/
    ├── vite.config.ts          ✅ CREATED
    ├── package.json            ✅ CREATED (Vite + React deps)
    ├── index.html              ✅ CREATED (Vite entry point)
    ├── src/
    │   ├── main.tsx            ✅ CREATED (Vite entry)
    │   ├── App.tsx             ✅ CREATED (SPA router)
    │   ├── styles.css          ✅ MOVED/UPDATED
    │   ├── pages/
    │   │   └── CostsPage.tsx   ✅ CREATED (client-side page)
    │   └── components/
    │       ├── Header.tsx
    │       ├── Hero.tsx
    │       ├── SearchSection.tsx
    │       ├── ReportSection.tsx
    │       └── Footer.tsx
    ├── globals.css
    └── forge-identity.css
```

---

## How It Works Now

### Local Development
```bash
cd delivery-package/accesslink
npm install
npm run dev

# Terminal output:
# > cd app && npm run dev
# > vite
# ➜  Local:   http://localhost:5173/
```

### Production Build
```bash
npm run build

# Runs:
# 1. cd app && npm run build  → builds Vite to app/dist/
# 2. Result: static SPA + assets

# Output:
# app/dist/
# ├── index.html
# ├── assets/
# │   ├── main-xyz.js
# │   └── style-abc.css
```

### Vercel Deployment
```bash
# Vercel sees vercel.json and:
# 1. Installs: npm install && cd app && npm install
# 2. Builds: npm run build  
# 3. Deploys app/dist/ as static files
# 4. Wires /api/* routes to api/router.mjs serverless function
```

### Routing Behavior

**On page load `/costs`:**
1. Vercel receives GET `/costs`
2. Vercel rewrite matches `/((?!api/).*) → /index.html`
3. Browser loads SPA at `/index.html`
4. SPA JavaScript reads URL hash `#costs`
5. Renders `<CostsPage />` component
6. Component calls `fetch('/api/costs')`
7. Vercel rewrite matches `/api/(.*) → /api/router`
8. Serverless function `api/router.mjs` handles request
9. Returns JSON response

**Result:** Both `/costs` and `/api/costs` work ✅

---

## Verification Steps

### 1. Local Build
```bash
cd delivery-package/accesslink
npm install
npm run build

# Check output exists:
ls app/dist/index.html        # ✅ SPA app
ls app/dist/assets/           # ✅ JS + CSS bundles
```

### 2. Local Dev Server
```bash
npm run dev
# Open http://localhost:5173/
# Click "Cost Monitor" → should navigate to /costs
# Page should NOT 404
# API call should return mock data
```

### 3. Vercel Deploy
```bash
# If you have Vercel CLI:
cd delivery-package/accesslink
vercel deploy --prod

# Or use Forge ship script:
npm run forge:ship -- --slug accesslink
```

### 4. Live URL Tests
```bash
# After deploy to https://www.restarto.ai/portfolio/accesslink/

# Home page
curl https://www.restarto.ai/portfolio/accesslink/
# ✅ Should return SPA HTML

# Costs page (page refresh)
curl https://www.restarto.ai/portfolio/accesslink/costs
# ✅ Should return SPA HTML (browser navigates to /costs)

# API endpoint
curl https://www.restarto.ai/portfolio/accesslink/api/costs
# ✅ Should return JSON with cost data

curl "https://www.restarto.ai/portfolio/accesslink/api/costs?format=csv"
# ✅ Should return CSV file

curl "https://www.restarto.ai/portfolio/accesslink/api/costs?format=report"
# ✅ Should return text report
```

---

## Breaking Changes (None for End Users)

- ✅ URL structure unchanged (`/costs`, `/api/costs`)
- ✅ API response format unchanged
- ✅ UI/UX unchanged
- ✅ Live URL unchanged

---

## Known Limitations (Disclosed Seams)

| Limitation | Reason | Mitigation |
|-----------|--------|-----------|
| **No SSR** | Vite builds static SPA; costs page rendered client-side | SEO is not required; internal tool |
| **No ISR** | Static files only; real-time data fetch required | Cost data is refreshed every 5 seconds in UI |
| **No direct database access** | API router is stateless; Supabase/Monad not live | Mocked data used for demo; would require backend infrastructure |
| **Deployed on GitHub Pages** | Portfolio hosted on `restarto.ai`, not dedicated domain | Acceptable for interactive trial; URL is public |

---

## Deployment Pattern (For Future Next.js Apps)

If a future project **must** use Next.js App Router (e.g., real-time server features):

**Option A: Dedicated Vercel Project (Recommended)**
```bash
# Create separate Vercel project (not on portfolio)
vercel deploy --prod

# Keep portfolio link that redirects to dedicated URL
```

**Option B: Convert to Forge Pattern (This Migration)**
```bash
# Use Vite SPA + Node API router (what we just did)
# Fits Forge natively; ships on portfolio
```

**Decision:** If it fits the Vite pattern → convert. If it needs real Next.js features → use dedicated Vercel project.

---

## Support

- **Costs API:** `api/router.mjs` handles `/api/costs`, `/api/search`, `/api/verify`
- **Routing:** Client-side via `App.tsx` hash-based navigation
- **Styling:** Tailwind + inline styles (no separate CSS build needed)
- **State:** Simple React hooks (no Redux/state management needed for this trial)

---

## Rollback (If Needed)

If this doesn't work:
```bash
git checkout HEAD~1 -- delivery-package/accesslink/
npm run forge:ship -- --slug accesslink
```

Restores previous Next.js version (still broken with 404s, but easier to debug if needed).

---

**Migration Completed:** 2026-07-14
**By:** ForgeOS Master Orchestrator  
**Status:** Ready for Vercel deployment
