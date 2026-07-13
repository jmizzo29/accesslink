# AccessLink — Accessible Travel Made Easy

**Find truly accessible travel options for wheelchair users. Search verified Airbnbs, hotels, and airports with community-powered accessibility data logged on the blockchain.**

## 🎯 Mission

Solve the core problem: wheelchair users can't easily find accommodations with verified accessibility features. AccessLink combines community reports, structured data, and blockchain verification for permanent trust.

## ✨ Features

### Core Features (MVP)
- **Accessible Property Search** — Filter by zero-step entry, roll-in showers, wide doors, WAV availability, elevator access
- **Accessibility Reports** — Submit detailed accessibility data with photos, measurements, and notes
- **Community Verification** — Verified listings marked with dates and proof
- **Blockchain Integration** — Verified records logged on Monad for permanent trust

### Tech Stack
- **Frontend:** Next.js 14 + React 18 + Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Blockchain:** Monad (simple smart contract for verified records)
- **Deployment:** Vercel
- **Accessibility:** WCAG 2.2 AA compliance target

## 🚀 Quick Start

### 1. Clone & Install
```bash
cd delivery-package/accesslink
npm install
```

### 2. Local Development (with mock data)
```bash
npm run dev
# Open http://localhost:3000
```

### 3. Setup Supabase (Optional for full features)
```bash
# Copy environment template
cp .env.local.example .env.local

# Edit .env.local with your Supabase credentials
# NEXT_PUBLIC_SUPABASE_URL=your-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

### 4. Deploy to Vercel
```bash
npm run build
npx vercel deploy --prod
```

## 📋 Core Workflows

### Search for Accessible Places
1. Navigate to the search section
2. Enter a city/location
3. Select accessibility filters (zero-step entry, roll-in shower, etc.)
4. Click Search
5. View verified listings with community data

### Submit an Accessibility Report
1. Click "Help Build the Database"
2. Enter property name and location
3. Describe accessibility features and any challenges
4. Check relevant accessibility feature boxes
5. Submit — report queued for community verification
6. Once verified, record is logged on Monad blockchain

## 🔗 Monad Integration

When a report is verified by the community:
1. A "Verified Access Record" is submitted to the AccessLinkVerified smart contract on Monad
2. Contract stores: property hash, location, timestamp, verifier address, and verification status
3. Record ID is stored in Supabase linking the off-chain and on-chain data
4. Users see "On-Chain Verified" badge next to verified listings

### Smart Contract
- **Address:** (set after deployment)
- **Network:** Monad (mainnet or testnet)
- **Functions:**
  - `submitRecord(propertyHash, location)` — Submit a report
  - `verifyRecord(recordId)` — Mark verified (admin/community)
  - `getRecord(recordId)` — Fetch verified record details
  - `getRecordCount()` — Total verified records

### Deploy Contract (hackathon setup)
```bash
export MONAD_PRIVATE_KEY=your-key
export MONAD_RPC_URL=https://mainnet.monad.xyz
npm run contract:deploy
```

## 📊 Database Schema (Supabase)

### `properties` table
```sql
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  zero_step_entry BOOLEAN DEFAULT FALSE,
  roll_in_shower BOOLEAN DEFAULT FALSE,
  wide_doors BOOLEAN DEFAULT FALSE,
  wav_available BOOLEAN DEFAULT FALSE,
  elevator_access BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE,
  verified_on_chain BOOLEAN DEFAULT FALSE,
  monad_record_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_location ON properties(location);
CREATE INDEX idx_verified ON properties(verified);
```

## 🔐 Security & Privacy

- No personal data collected (except email for notifications)
- Supabase Row-Level Security (RLS) policies enforce community ownership
- Monad transactions are publicly verifiable but property details remain off-chain
- All user submissions are anonymous initially, verified by community

## 🎨 Design Principles

- **Mobile-first responsive design** — 360px to 1920px
- **Accessibility-first** — Built for the community it serves
- **Clear hierarchy** — Professional, trustworthy look
- **Plain language** — No jargon, family-friendly
- **High contrast** — WCAG AA compliance for readability

## 📱 Responsive Breakpoints

- Mobile: 360px (tested)
- Tablet: 768px (tested)
- Desktop: 1280px+ (tested)

## 🛠️ Development

### Project Structure
```
accesslink/
├── app/              # Next.js pages and layout
├── components/       # React components
├── lib/             # Utilities (Supabase, Monad)
├── contracts/       # Solidity smart contract
├── scripts/         # Deployment and setup
├── public/          # Static assets
└── styles/          # Global CSS
```

### Key Files
- `app/page.tsx` — Landing page
- `components/SearchSection.tsx` — Search UI
- `components/ReportSection.tsx` — Report submission
- `lib/supabase-client.ts` — Database queries
- `lib/monad.ts` — Blockchain integration
- `contracts/AccessLinkVerified.sol` — Smart contract

### Build Commands
```bash
npm run dev         # Local dev server
npm run build       # Production build
npm run start       # Run production build
npm run lint        # Lint code
npm run verify      # Run verification tests
npm run contract:deploy # Deploy Monad contract
```

## 🚨 Known Limitations & Seams

1. **Photo uploads** — Currently text-only; image upload seam (s3 bucket setup needed)
2. **Real booking** — Links to external providers; not integrated yet
3. **Payment/trials** — Vercel trial seam; Stripe integration deferred
4. **AI matching** — Community curation only; ML matching deferred to v2
5. **Multilingual** — English-only MVP; i18n deferred
6. **Wallet auth** — Basic connect button; full account system deferred
7. **Monad testnet** — Using testnet for hackathon; production deployment seam

All seams are disclosed in `proof/LIMITATIONS.md` and the app shows honest messaging when features are unavailable.

## 📈 Metrics & Verification

- **Search performance** — <500ms for location query
- **Report submission** — <2s end-to-end
- **Blockchain confirmation** — ~15s on Monad testnet
- **Uptime target** — 99.5% on Vercel
- **Accessibility score** — WCAG 2.2 AA (Lighthouse audit)

## 🔗 Live Links (Post-Deployment)

- **App:** https://www.restarto.ai/portfolio/accesslink/app/
- **Landing:** https://www.restarto.ai/portfolio/accesslink/
- **GitHub:** (public repo link)

## 👥 Contributing

This is a hackathon project built in 6 days. Community contributions welcome after launch:

1. Fork the repo
2. Create a feature branch
3. Submit a PR with accessibility report verification improvements
4. Help moderate community data quality

## 📜 License

MIT — Open source for accessibility.

## ❤️ Accessibility Commitment

Built **by the community, for the community** of wheelchair users. Every design decision prioritizes usability, trust, and honest accessibility information.

---

**Built for the hackathon. Launching with community trust at the core.**
