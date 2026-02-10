# 🏗️ ChainLuck Architecture

## Overview

ChainLuck is a decentralized lottery platform built on blockchain technology, offering instant-result lotteries with transparent odds and immediate payouts.

## System Architecture

```bash
┌─────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                   │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Next.js   │  │  RainbowKit  │  │   Wagmi      │  │
│  │   App Dir   │  │   Wallets    │  │  Contracts   │  │
│  └─────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Blockchain Layer                      │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  ChainLuck  │  │  Chainlink   │  │   Sepolia    │  │
│  │   Contract  │  │     VRF      │  │   Testnet    │  │
│  └─────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   Backend Services                       │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Supabase   │  │     Edge     │  │  Analytics   │  │
│  │   Database  │  │  Functions   │  │   (Future)   │  │
│  └─────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend Layer

- **Framework**: Next.js 15.3.4 with App Router
- **Language**: TypeScript 5.x
- **Styling**: TailwindCSS v4 + shadcn/ui components
- **State Management**: React Context + Local State
- **Internationalization**: next-intl (English/Farsi)
- **Web3 Integration**:
  - Wagmi v2 for contract interactions
  - RainbowKit for wallet connections
  - Viem for blockchain utilities

### Blockchain Layer

- **Network**: Sepolia Testnet (moving to Polygon/BSC for production)
- **Smart Contract**: Solidity 0.8.20
- **Development**: Hardhat Framework
- **Randomness**: Chainlink VRF v2 for provable fairness
- **Contract Features**:
  - Ticket purchase mechanism
  - Instant win calculation
  - Prize pool management
  - Referral tracking
  - Owner withdrawal functions

### Backend Services (To Be Implemented)

- **Database**: Supabase PostgreSQL
- **Edge Functions**: Supabase Edge Functions
- **Real-time**: Supabase Realtime subscriptions
- **Storage**: IPFS for ticket metadata (future)

## Component Architecture

### Frontend Components Structure

```bash
src/components/
├── auth/           # Wallet authentication
├── common/         # Shared UI components
├── dashboard/      # User dashboard views
├── lottery/        # Game mechanics UI
├── providers/      # React context providers
├── stats/          # Analytics displays
└── ui/            # shadcn/ui primitives
```

### Smart Contract Architecture

```bash
ChainLuck.sol
├── State Variables
│   ├── ticketPrice (5 USDC)
│   ├── pools (prize distribution)
│   ├── userTickets (purchase tracking)
│   └── pendingWins (VRF queue)
├── Core Functions
│   ├── buyTicket()
│   ├── calculateWin()
│   ├── claimWinnings()
│   └── processVRFResult()
└── Admin Functions
    ├── withdrawProfits()
    ├── managePools()
    └── updateParameters()
```

## Data Flow

### Ticket Purchase Flow

1. User connects wallet (RainbowKit)
2. User selects tickets and submits transaction
3. Smart contract processes payment
4. Instant win calculation (small wins) or VRF request (big wins)
5. Winnings credited to user's balance
6. User can claim to wallet

### Referral Flow

1. User generates referral link after spending $10+
2. New user signs up with referral code
3. New user purchases $10+ in tickets
4. Referrer receives $4 instant bonus
5. System tracks in both contract and database

## Security Architecture

### Smart Contract Security

- OpenZeppelin standard implementations
- Reentrancy guards on withdrawals
- Access control for admin functions
- Slippage protection on prize calculations

### Frontend Security

- Input validation and sanitization
- Transaction simulation before execution
- Rate limiting on API calls
- Secure wallet connection handling

## Scalability Considerations

### Current Limitations (MVP)

- Single prize pool
- Basic VRF implementation
- Limited to one blockchain
- Manual admin operations

### Future Scaling

- 20 prize pools for risk distribution
- Batch VRF processing
- Multi-chain deployment
- Automated pool management
- Distributed storage for metadata

## Performance Optimizations

### Gas Optimization

- Batch operations where possible
- Efficient storage patterns
- Minimal external calls
- Optimized compiler settings (200 runs)

### Frontend Performance

- Next.js SSG/SSR optimization
- Code splitting and lazy loading
- Image optimization
- Turbopack for faster builds

## Monitoring & Analytics

### On-chain Monitoring

- Contract event indexing
- Transaction success rates
- Gas usage tracking
- VRF cost analysis

### Off-chain Analytics

- User behavior tracking
- Conversion funnel analysis
- Revenue monitoring
- Referral performance

## Development Workflow

### Local Development

```bash
# Contracts
cd hardhat
npm run node        # Local blockchain
npm run deploy      # Deploy contracts
npm run test        # Run tests

# Frontend
cd nextjs
npm run dev         # Start dev server
```

### Deployment Pipeline

1. Smart contract deployment to testnet
2. Contract verification on Etherscan
3. Frontend build and optimization
4. Deploy to hosting (Vercel/GitHub Pages)
5. Configure environment variables
6. Test end-to-end flow
