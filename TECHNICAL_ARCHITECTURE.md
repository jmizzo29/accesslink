# AccessLink — Technical Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      USER BROWSER                           │
│  Next.js App (React + Tailwind) — Responsive UI             │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┴──────────────────────────────────┐
        │                                             │
   ┌────▼─────┐                              ┌───────▼────┐
   │ Vercel   │◄─── Git Push ───────────────►│  GitHub    │
   │ Deploy   │                              │  (public)  │
   │ (Next.js)│                              └───────────┘
   └────┬─────┘
        │
        ├───────────────────────────────────────────┐
        │                                           │
   ┌────▼─────────────────┐          ┌─────────────▼────┐
   │   API Routes         │          │   Client SDK     │
   │ /api/search          │          │ Supabase JS      │
   │ /api/verify          │          │ Ethers.js        │
   └────┬────────────────┬┘          └──────────────────┘
        │                │
        │                └───────────────────┐
        │                                    │
   ┌────▼────────────────────────────────┐  │
   │      Supabase (PostgreSQL)          │  │
   │  ├─ properties table                │  │
   │  ├─ verified_records table          │  │
   │  └─ Row-Level Security (RLS)        │  │
   └─────────────────────────────────────┘  │
                                             │
                                    ┌────────▼─────────────────┐
                                    │   Monad Blockchain       │
                                    │  AccessLinkVerified.sol  │
                                    │  ├─ submitRecord()       │
                                    │  ├─ verifyRecord()       │
                                    │  └─ getRecord()          │
                                    └──────────────────────────┘
```

## Data Flow

### 1. User Searches for Accessible Places

```
Frontend (SearchSection.tsx)
  └─ User enters location + selects filters
     └─ onClick: handleSearch()
        └─ calls: searchListings(filters)
           └─ Supabase Client (lib/supabase-client.ts)
              └─ query: properties table
                 └─ WHERE location ILIKE '%New York%'
                 └─ AND zero_step_entry = true
                 └─ AND verified = true
                 └─ ORDER BY created_at DESC
              └─ Response: Array of properties
           └─ PropertyCard components render
```

### 2. User Submits Accessibility Report

```
Frontend (ReportSection.tsx)
  └─ User fills form + clicks submit
     └─ handleSubmit()
        └─ calls: submitReport(data)
           └─ Supabase Client
              └─ INSERT into properties table
                 ├─ title, location, description
                 ├─ zero_step_entry, roll_in_shower, etc.
                 ├─ verified: false (awaits community review)
                 └─ created_at: NOW()
              └─ Response: Inserted property record
           └─ Show success message
```

### 3. Admin/Community Verifies Report

```
Admin Dashboard (future implementation)
  └─ View pending reports
     └─ Click "Verify"
        └─ API call: POST /api/verify
           └─ Backend (app/api/verify/route.ts)
              └─ UPDATE properties
                 └─ SET verified = true
                 └─ WHERE id = propertyId
              └─ Trigger: Log to Monad
                 └─ calls: getMonadInstance()
                    └─ submitRecord(propertyData)
                       └─ calls: monad.submitRecord()
                          └─ Smart Contract (AccessLinkVerified.sol)
                             ├─ Generate property hash
                             ├─ Emit RecordVerified event
                             └─ Store on Monad blockchain
                          └─ TX hash returned
                       └─ Store TX hash in verified_records table
              └─ Property now shows "On-Chain Verified" badge
```

## Component Hierarchy

```
app/page.tsx (root)
  ├─ Header
  │  ├─ Logo + Navigation
  │  └─ Connect Wallet button
  ├─ Hero
  │  ├─ Value Prop Headline
  │  └─ Feature Cards (Search, Verified, On-Chain)
  ├─ SearchSection
  │  ├─ Location Input
  │  ├─ Filters (collapsible)
  │  ├─ Search Button
  │  └─ Results Grid
  │     └─ PropertyCard (× N)
  │        ├─ Image Placeholder
  │        ├─ Title + Location
  │        ├─ Accessibility Features
  │        ├─ Verified Badge
  │        └─ View Details Button
  ├─ ReportSection
  │  ├─ Section Title
  │  ├─ Form
  │  │  ├─ Property Name Input
  │  │  ├─ Location Input
  │  │  ├─ Notes Textarea
  │  │  ├─ Accessibility Checkboxes
  │  │  └─ Submit Button
  │  └─ Success/Error Messages
  └─ Footer
     ├─ About
     ├─ Resources
     └─ Social Links
```

## Database Schema

### properties table
```sql
id                  UUID PK
title               TEXT NOT NULL         -- "Downtown Hotel"
location            TEXT NOT NULL         -- "NYC"
description         TEXT                  -- User notes
zero_step_entry     BOOLEAN DEFAULT FALSE
roll_in_shower      BOOLEAN DEFAULT FALSE
wide_doors          BOOLEAN DEFAULT FALSE
wav_available       BOOLEAN DEFAULT FALSE
elevator_access     BOOLEAN DEFAULT FALSE
verified            BOOLEAN DEFAULT FALSE -- Community verified
verified_on_chain   BOOLEAN DEFAULT FALSE -- Logged to Monad
monad_record_id     TEXT UNIQUE           -- Link to blockchain
created_at          TIMESTAMP DEFAULT NOW()
updated_at          TIMESTAMP DEFAULT NOW()

Indexes:
  idx_location (location)                -- For search performance
  idx_verified (verified)                -- Filter to verified only
  idx_created_at (created_at DESC)       -- For sorting
```

### verified_records table
```sql
id                  UUID PK
property_id         UUID FK → properties.id
monad_tx_hash       TEXT                  -- Tx hash on Monad
monad_record_id     TEXT UNIQUE           -- Unique record ID
verified_by         TEXT                  -- Verifier address
verified_at         TIMESTAMP             -- When verified
created_at          TIMESTAMP DEFAULT NOW()
```

## Smart Contract (Solidity)

```solidity
contract AccessLinkVerified {
  struct VerifiedRecord {
    bytes32 propertyHash;          // keccak256 of property data
    string location;               // Property location
    uint256 timestamp;             // Block timestamp
    address verifiedBy;            // Who verified it
    bool verified;                 // Verification status
  }

  mapping(bytes32 => VerifiedRecord) public records;
  bytes32[] public recordIds;

  // Events
  event RecordVerified(bytes32 indexed recordId, ...);
  event RecordSubmitted(bytes32 indexed recordId, ...);

  // Functions
  function submitRecord(bytes32 propertyHash, string location)
    → bytes32 recordId
  
  function verifyRecord(bytes32 recordId)
    → void (marks as verified)
  
  function getRecord(bytes32 recordId)
    → VerifiedRecord (returns full record)
  
  function getRecordCount()
    → uint256 (total records on chain)
}
```

## API Endpoints

### GET /api/search
```
Query Parameters:
  location: string (optional)
  zeroStepEntry: 'true'|'false'
  rollInShower: 'true'|'false'
  wideDoors: 'true'|'false'
  wavAvailable: 'true'|'false'
  elevatorAccess: 'true'|'false'

Response:
{
  success: boolean,
  count: number,
  properties: Property[]
}

Property {
  id: string,
  title: string,
  location: string,
  description: string,
  zero_step_entry: boolean,
  roll_in_shower: boolean,
  wide_doors: boolean,
  wav_available: boolean,
  elevator_access: boolean,
  verified: boolean,
  verified_on_chain: boolean,
  created_at: string (ISO)
}
```

### POST /api/verify
```
Body:
{
  propertyId: string (UUID)
}

Response:
{
  success: boolean,
  property: Property,
  message: string
}
```

## Environment Variables

```bash
# Supabase (Required for search/submit)
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# Monad (Required for blockchain)
NEXT_PUBLIC_MONAD_RPC=https://mainnet.monad.xyz
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...

# Deployment
MONAD_PRIVATE_KEY=... (for contract deployment only)
```

## File Structure & Responsibilities

| Path | Purpose |
|------|---------|
| `app/layout.tsx` | Root HTML + metadata |
| `app/page.tsx` | Landing page composition |
| `app/globals.css` | Base styles, accessibility, responsive |
| `components/*.tsx` | React components (Header, Hero, Search, etc.) |
| `lib/supabase-client.ts` | Database queries |
| `lib/monad.ts` | Blockchain integration |
| `app/api/search/route.ts` | Search endpoint |
| `app/api/verify/route.ts` | Verify + Monad submit |
| `contracts/AccessLinkVerified.sol` | Smart contract |
| `scripts/deploy-contract.mjs` | Contract deployment |
| `schema.sql` | Database setup |
| `public/favicon.svg` | Icon |
| `package.json` | Dependencies |
| `next.config.js` | Next.js config |
| `tsconfig.json` | TypeScript config |
| `tailwind.config.js` | Tailwind config |

## Key Libraries

| Library | Purpose | Version |
|---------|---------|---------|
| `next` | React framework | 14.2.0 |
| `react` | UI library | 18.3.0 |
| `tailwindcss` | Styling | 3.4.0 |
| `@supabase/supabase-js` | Database client | 2.45.0 |
| `ethers` | Web3 provider | 6.13.0 |
| `lucide-react` | Icons | 0.408.0 |
| `sonner` | Toast notifications | 1.4.41 |

## Performance Considerations

### Search Query Optimization
```sql
-- Indexed on location for ILIKE searches
CREATE INDEX idx_properties_location ON properties(location);

-- Index on verified to filter quickly
CREATE INDEX idx_properties_verified ON properties(verified);

-- Latest first ordering
CREATE INDEX idx_properties_created_at ON properties(created_at DESC);
```

### Frontend Optimization
- Tailwind CSS (no runtime CSS-in-JS)
- Static rendering where possible
- Image optimization (next/image)
- API route caching via Vercel CDN

### Blockchain Optimization
- Property hash stored once (immutable)
- Event logging instead of duplicate storage
- Monad's fast finality (~2 seconds)

## Security Model

### Frontend
- No private keys stored in browser
- Wallet connect via Web3Modal (user-controlled)
- Environment variables for API keys

### Backend
- Supabase RLS policies enforce data ownership
- API routes validate inputs
- No admin actions from frontend without auth

### Database
```sql
-- Public can view verified properties
CREATE POLICY "view_verified_properties" ON properties
  FOR SELECT USING (verified = true);

-- Anyone can submit (unverified)
CREATE POLICY "anyone_can_submit_report" ON properties
  FOR INSERT WITH CHECK (true);
```

### Blockchain
- Smart contract functions are deterministic
- Verification is transparent and immutable
- Events are public (accountability)

## Testing Strategy

### Unit Tests (verify.mjs)
- Database queries (search, submit)
- Blockchain hash generation
- Component exports

### Manual Testing (Checklist)
- [ ] Search displays sample data
- [ ] Report submission saves to DB
- [ ] Filters work correctly
- [ ] Mobile responsive (360px+)
- [ ] Keyboard navigation works
- [ ] Blockchain verification logs correctly

### E2E Testing (Playwright)
- Load home page → see properties
- Search NYC → get results
- Submit report → verify in DB
- Verify report → see Monad TX
- Mobile device testing

## Deployment Flow

```
Local Development
  ↓ (npm run build)
Production Build
  ↓ (git push origin agent/accesslink)
GitHub Branch
  ↓ (Manual: merge to main)
Vercel Deploy
  ↓ (via GitHub webhook)
Live at vercel-url.com
  ↓ (Custom domain: www.restarto.ai/portfolio/accesslink)
Public Access
```

## Success Metrics

| Metric | Target | Validation |
|--------|--------|-----------|
| Page Load | <2s | Vercel Analytics |
| Search Response | <500ms | Network tab |
| Lighthouse Score | >90 | Audit report |
| WCAG AA | ✓ | axe-core scan |
| Mobile UX | ✓ | Real device test |
| Blockchain Confirm | ~15s | Monad explorer |

---

**All systems designed for production. Ready to deploy on Day 6.**
