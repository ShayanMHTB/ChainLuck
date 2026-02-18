# 🚀 ChainLuck Deployment Guide

## Deployment Overview

ChainLuck consists of two main components to deploy:

1. Smart Contracts (Blockchain)
2. Frontend Application (Web hosting)
3. Backend Services (Supabase)

## Prerequisites

### Development Environment

```bash
# Required versions
Node.js: v18+
npm: v9+
Git: v2.30+

# Required accounts
- GitHub account
- Metamask wallet with testnet ETH
- Supabase account (free tier works)
- Etherscan API key
- Chainlink VRF subscription
```

## Smart Contract Deployment

### Step 1: Environment Setup

```bash
cd hardhat
cp .env.example .env
```

Edit `.env`:

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
VRF_SUBSCRIPTION_ID=your_chainlink_subscription
```

### Step 2: Deploy Contract

```bash
# Compile contracts
npm run compile

# Deploy to Sepolia
npm run deploy

# Output will show:
# - Contract address
# - Transaction hash
# - Gas used
```

### Step 3: Verify Contract

```bash
npm run verify

# This enables Etherscan interaction
# Users can read contract directly
```

### Step 4: Fund Contract

```bash
# Fund prize pools
npm run fund

# Fund VRF subscription (via Chainlink UI)
# Add minimum 10 LINK tokens
```

### Step 5: Sync Configuration

```bash
# Updates frontend config with contract address
npm run sync:config
```

## Frontend Deployment

### Option 1: GitHub Pages (Recommended for MVP)

```bash
cd nextjs

# Build static export
npm run build

# Configure for GitHub Pages
# Add to next.config.ts:
output: 'export',
basePath: '/chainluck',
assetPrefix: '/chainluck/',

# Push to gh-pages branch
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages

# Enable in repo settings
# Settings -> Pages -> Source: gh-pages
```

### Option 2: Vercel (Better for production)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd nextjs
vercel

# Follow prompts:
# - Link to GitHub repo
# - Set environment variables
# - Choose production deployment
```

### Option 3: Self-Hosted (Advanced)

```bash
# Build production
npm run build

# Using PM2
npm install -g pm2
pm2 start npm --name "chainluck" -- start
pm2 save
pm2 startup

# Using Docker
docker build -t chainluck .
docker run -p 3000:3000 chainluck
```

## Supabase Setup

### Step 1: Create Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Save connection strings

### Step 2: Database Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  total_spent DECIMAL(10,2) DEFAULT 0,
  total_won DECIMAL(10,2) DEFAULT 0,
  referral_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tickets table
CREATE TABLE tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  ticket_number VARCHAR(66) NOT NULL,
  purchase_amount DECIMAL(10,2) NOT NULL,
  win_amount DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  tx_hash VARCHAR(66),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Referrals table
CREATE TABLE referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES users(id),
  referred_id UUID REFERENCES users(id),
  reward_amount DECIMAL(10,2) DEFAULT 4.00,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Pools table
CREATE TABLE pools (
  id INTEGER PRIMARY KEY,
  balance DECIMAL(12,2) DEFAULT 0,
  total_paid DECIMAL(12,2) DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_wallet ON users(wallet_address);
CREATE INDEX idx_ticket_user ON tickets(user_id);
CREATE INDEX idx_referral ON referrals(referrer_id, referred_id);
```

### Step 3: Edge Functions

```typescript
// supabase/functions/process-win/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { ticketId, winAmount } = await req.json();

  // Process win logic
  // Update database
  // Return response

  return new Response(JSON.stringify({ success: true }));
});
```

### Step 4: Environment Variables

```bash
# In nextjs/.env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
```

## Environment Configuration

### Development

```env
# .env.development
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/...
```

### Production

```env
# .env.production
NEXT_PUBLIC_CHAIN_ID=137
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_RPC_URL=https://polygon-rpc.com
```

## Monitoring Setup

### Contract Monitoring

```javascript
// Monitor contract events
const contract = new ethers.Contract(address, abi, provider);

contract.on('TicketPurchased', (user, amount) => {
  console.log(`New ticket: ${user} - ${amount}`);
  // Log to analytics
});
```

### Application Monitoring

- **Errors**: Sentry or LogRocket
- **Analytics**: Google Analytics or Mixpanel
- **Performance**: Vercel Analytics
- **Uptime**: UptimeRobot

## Security Checklist

### Pre-deployment

- [ ] Contract audited/tested thoroughly
- [ ] Private keys secured (never in code)
- [ ] Environment variables configured
- [ ] CORS settings configured
- [ ] Rate limiting implemented
- [ ] Input validation on all forms

### Post-deployment

- [ ] Contract verified on Etherscan
- [ ] VRF subscription funded
- [ ] Prize pools funded
- [ ] Test transactions successful
- [ ] Monitoring active
- [ ] Backup procedures in place

## Deployment Commands Summary

```bash
# Complete deployment sequence
cd hardhat
npm run deploy:all  # Compile, deploy, verify, fund

cd ../nextjs
npm run build
npm run start  # Test locally

# Deploy to production
vercel --prod
```

## Rollback Procedures

### Smart Contract

- Cannot rollback deployed contract
- Deploy new version if critical bug
- Pause contract if emergency function exists

### Frontend

```bash
# Vercel rollback
vercel rollback

# GitHub Pages rollback
git revert HEAD
git push origin gh-pages
```

## Maintenance Mode

### Enable Maintenance

```typescript
// In app layout
const MAINTENANCE = process.env.NEXT_PUBLIC_MAINTENANCE === 'true';

if (MAINTENANCE) {
  return <MaintenancePage />;
}
```

## Cost Estimates

### Monthly Costs (MVP)

| Service              | Cost  |
| -------------------- | ----- |
| GitHub Pages         | Free  |
| Supabase (Free tier) | Free  |
| Sepolia testnet      | Free  |
| Domain (optional)    | $10   |
| **Total**            | $0-10 |

### Production Costs

| Service       | Cost        |
| ------------- | ----------- |
| Vercel Pro    | $20         |
| Supabase Pro  | $25         |
| Polygon gas   | ~$50        |
| Chainlink VRF | ~$30        |
| Domain + SSL  | $15         |
| **Total**     | ~$140/month |

## Launch Checklist

### 48 Hours Before

- [ ] Final contract testing
- [ ] Security review
- [ ] Load testing
- [ ] Documentation complete

### 24 Hours Before

- [ ] Deploy contract to mainnet
- [ ] Verify contract
- [ ] Fund pools and VRF
- [ ] Deploy frontend to staging

### Launch Day

- [ ] Switch frontend to production
- [ ] Monitor initial transactions
- [ ] Check error logs
- [ ] Social media announcement
- [ ] Community support ready

### Post-Launch

- [ ] Monitor metrics
- [ ] Gather user feedback
- [ ] Fix any critical issues
- [ ] Plan next features
