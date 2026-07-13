# AccessLink — Setup & Deployment Guide

## Prerequisites

- Node.js 18+ and npm
- Vercel account (free tier works)
- Supabase account (free tier)
- GitHub account
- Monad testnet wallet (for blockchain testing)

## Phase 1: Local Development (Day 1-2)

### 1.1 Clone and Install
```bash
cd delivery-package/accesslink
npm install
```

### 1.2 Create Supabase Project
1. Go to https://supabase.com
2. Sign up / Login
3. Create a new project
4. Get your credentials from Project Settings → API
   - Copy `NEXT_PUBLIC_SUPABASE_URL` 
   - Copy `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 1.3 Setup Database
1. In Supabase, go to SQL Editor
2. Create a new query and copy contents of `schema.sql`
3. Run the query to create tables and sample data

### 1.4 Configure Environment
```bash
# Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_MONAD_RPC=https://mainnet.monad.xyz
NEXT_PUBLIC_CONTRACT_ADDRESS=0x... (leave empty for now)
EOF
```

### 1.5 Run Locally
```bash
npm run dev
# Open http://localhost:3000
# Test search (should show 4 sample properties)
# Test report submission (should save to database)
```

## Phase 2: Smart Contract (Day 3-4)

### 2.1 Monad Testnet Setup
1. Get testnet MON tokens:
   - Visit https://monad.xyz/faucet
   - Enter your wallet address
   - Claim test tokens

2. Add Monad to your wallet:
   - **RPC:** https://testnet.monad.xyz
   - **Chain ID:** 10143
   - **Symbol:** MON
   - **Explorer:** https://monad.xyz/testnet

### 2.2 Deploy Contract
```bash
# Set your private key (WITHOUT 0x prefix)
export MONAD_PRIVATE_KEY=your-private-key
export MONAD_RPC_URL=https://testnet.monad.xyz

npm run contract:deploy
```

This will output your contract address. Update `.env.local`:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

### 2.3 Test Contract
Visit the app and submit a report. When verified by an admin:
1. Report is logged to Supabase
2. A transaction is sent to Monad
3. "On-Chain Verified" badge appears on the listing
4. Record is permanent on blockchain

## Phase 3: Prepare for Production (Day 5)

### 3.1 Create GitHub Repo
```bash
cd delivery-package/accesslink
git init
git add .
git commit -m "Initial commit: AccessLink MVP"
git remote add origin https://github.com/your-username/accesslink.git
git push -u origin main
```

Make sure to set the repo to **PUBLIC** for the hackathon.

### 3.2 Production Supabase Setup
1. Create a second Supabase project for production
2. Run schema.sql again
3. Update environment variables for production

### 3.3 Update .env for Production
```
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
NEXT_PUBLIC_MONAD_RPC=https://mainnet.monad.xyz  # Switch to mainnet
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...  # Mainnet contract address
```

## Phase 4: Vercel Deployment (Day 6)

### 4.1 Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Or use the Vercel web UI:
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Select the accesslink repo
5. Add environment variables
6. Click Deploy

### 4.2 Post-Deployment Verification
```bash
# Check live site
curl https://your-vercel-url.com/

# Test API endpoints
curl https://your-vercel-url.com/api/search?location=NYC

# Verify database connection
# (Go to app and test search/submit)
```

## Testing Checklist

### Search Feature
- [ ] Load home page
- [ ] See 4 sample properties
- [ ] Search by location
- [ ] Filter by accessibility features
- [ ] See "On-Chain Verified" badges

### Report Submission
- [ ] Fill out form with property details
- [ ] Select accessibility features
- [ ] Submit successfully
- [ ] See success message
- [ ] New report appears in database

### Blockchain Integration
- [ ] Connect wallet to Monad testnet
- [ ] Submit a report
- [ ] Admin verifies report
- [ ] Transaction sent to Monad
- [ ] "On-Chain Verified" badge appears
- [ ] Can view record on Monad explorer

### Mobile Responsiveness
- [ ] Test on 360px (mobile)
- [ ] Test on 768px (tablet)
- [ ] Test on 1280px+ (desktop)
- [ ] All buttons accessible, font readable
- [ ] Forms usable on mobile

### Accessibility (WCAG 2.2 AA)
- [ ] Run Lighthouse audit
- [ ] Check color contrast ratios
- [ ] Test with keyboard navigation
- [ ] Screen reader compatible

## Troubleshooting

### "Cannot connect to Supabase"
- Check API URL and key in .env.local
- Verify network connectivity
- Check Supabase project is not paused

### "MetaMask/wallet connection fails"
- Ensure Monad testnet is added to wallet
- Use testnet RPC URL, not mainnet
- Check wallet has MON tokens for gas

### "Report not appearing in search"
- Check `verified` status in database
- Ensure location matches search query
- Check RLS policies are not blocking reads

### "Vercel deploy fails"
- Check all environment variables are set
- Ensure package.json build command works locally
- Verify all dependencies are in package.json

## Performance Targets

- **Page load:** < 2 seconds
- **Search query:** < 500ms
- **Report submission:** < 2 seconds
- **Blockchain confirmation:** ~15 seconds (Monad)

## Security Checklist

- [ ] No API keys in frontend code
- [ ] All secrets in environment variables
- [ ] Supabase RLS policies enabled
- [ ] HTTPS enforced on Vercel
- [ ] No hardcoded user data

## Deployed URLs (After Launch)

- **Live App:** https://www.restarto.ai/portfolio/accesslink/app/
- **Landing:** https://www.restarto.ai/portfolio/accesslink/
- **GitHub:** https://github.com/your-username/accesslink
- **Monad Contract:** https://monad.xyz/explorer/address/0x...

---

**Ready to deploy!** This guide should get you live on Vercel with a working Supabase + Monad integration in 6 days.
