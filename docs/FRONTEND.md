# 🎨 ChainLuck Frontend Documentation

## Frontend Overview

The ChainLuck frontend is a modern Next.js application with Web3 integration, providing a seamless lottery experience with instant results and real-time updates.

## Technology Stack

### Core Technologies

- **Framework**: Next.js 15.3.4 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: TailwindCSS v4 + shadcn/ui
- **Web3**: Wagmi v2 + RainbowKit
- **State**: React Context API
- **Internationalization**: next-intl (EN/FA)

## Project Structure

```bash
nextjs/src/
├── app/[lang]/          # Internationalized routes
│   ├── page.tsx         # Home/lottery page
│   ├── dashboard/       # User dashboard
│   ├── stats/           # Platform statistics
│   └── about/           # About page
├── components/
│   ├── auth/           # Wallet connection
│   ├── common/         # Header, Footer, etc.
│   ├── dashboard/      # User-specific components
│   ├── lottery/        # Game components
│   ├── providers/      # Context providers
│   ├── stats/          # Analytics displays
│   └── ui/            # shadcn/ui components
├── contracts/          # Contract ABIs and config
├── hooks/              # Custom React hooks
├── lib/               # Utilities and clients
└── types/             # TypeScript definitions
```

## Key Components

### Wallet Integration

```typescript
// components/providers/WalletProvider.tsx
- Handles wallet connections via RainbowKit
- Supports MetaMask, Rainbow, WalletConnect
- Manages connection state globally
```

### Lottery Purchase Flow

```typescript
// components/lottery/PurchaseFlow.tsx
1. TicketSelector - Choose number of tickets
2. Transaction simulation - Preview gas costs
3. Confirmation modal - Review before purchase
4. Transaction execution - Blockchain interaction
5. Result display - Instant win notification
```

### User Dashboard

```typescript
// components/dashboard/
- UserStats: Total spent, won, ROI
- WinHistory: Past lottery results
- ReferralPanel: Invite links and earnings
- ActivityFeed: Recent platform activity
```

## Web3 Integration

### Wagmi Configuration

```typescript
// lib/wagmi.ts
const config = createConfig({
  chains: [sepolia, polygon, bsc],
  transports: {
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
  },
});
```

### Contract Hooks

```typescript
// hooks/useChainLuckContract.ts
export function useChainLuckContract() {
  const { data: ticketPrice } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: ChainLuckABI,
    functionName: 'ticketPrice',
  });

  const { write: buyTicket } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: ChainLuckABI,
    functionName: 'buyTicket',
  });

  return { ticketPrice, buyTicket };
}
```

## State Management

### User Context

```typescript
// providers/UserProvider.tsx
interface UserState {
  wallet: string;
  totalSpent: number;
  totalWon: number;
  tickets: Ticket[];
  referrals: Referral[];
}
```

### Real-time Updates

```typescript
// Using contract events
contract.on('TicketPurchased', updateUserStats);
contract.on('WinProcessed', showWinAnimation);
```

## UI/UX Components

### Design System

- **Colors**: Dark theme with neon accents
- **Typography**: Inter for UI, Space Mono for numbers
- **Animations**: Framer Motion for smooth transitions
- **Components**: 40+ shadcn/ui components

### Key UI Features

```typescript
// components/lottery/
- WinAnimation: Celebration effects for wins
- LiveFeed: Real-time winner updates
- PoolStatus: Current pool balances
- PendingWins: VRF-pending results
```

## Internationalization

### Supported Languages

```typescript
// locales/
- en.json - English (default)
- fa.json - Farsi/Persian
```

### Usage

```typescript
import { useTranslations } from 'next-intl';

function Component() {
  const t = useTranslations('lottery');
  return <h1>{t('title')}</h1>;
}
```

## Performance Optimization

### Next.js Optimizations

- **Turbopack**: Faster development builds
- **Image Optimization**: Next/Image for all images
- **Code Splitting**: Automatic per-route
- **Static Generation**: Where possible

### Web3 Optimizations

- **Contract calls batching**: Reduce RPC requests
- **Caching**: Store static contract data
- **Simulation**: Preview transactions before sending

## Development Workflow

### Setup

```bash
cd nextjs
npm install
cp .env.example .env
# Configure environment variables
```

### Development

```bash
npm run dev
# Opens http://localhost:3000
# Hot reload enabled
```

### Testing

```bash
# Unit tests (to be implemented)
npm run test

# E2E tests (to be implemented)
npm run test:e2e
```

### Building

```bash
npm run build
npm run start  # Test production build
```

## Environment Variables

### Required Variables

```env
# Blockchain
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# WalletConnect
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=xxx
```

## Error Handling

### Transaction Errors

```typescript
try {
  await buyTicket();
} catch (error) {
  if (error.code === 'INSUFFICIENT_FUNDS') {
    toast.error('Insufficient balance');
  } else if (error.code === 'USER_REJECTED') {
    toast.error('Transaction cancelled');
  }
}
```

### Network Errors

- Auto-retry with exponential backoff
- Fallback RPC providers
- User-friendly error messages

## Mobile Responsiveness

### Breakpoints

```css
- Mobile: 320px - 768px
- Tablet: 768px - 1024px
- Desktop: 1024px+
```

### Mobile-First Design

- Touch-friendly buttons (min 44px)
- Simplified navigation
- Optimized forms
- Gesture support

## Browser Support

### Supported Browsers

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers with Web3

### Wallet Support

- MetaMask (all platforms)
- Rainbow (mobile)
- WalletConnect (universal)
- Coinbase Wallet
- Trust Wallet

## Security Best Practices

### Frontend Security

- **Input Validation**: All user inputs sanitized
- **XSS Protection**: Content Security Policy headers
- **Transaction Verification**: Show details before signing
- **Phishing Protection**: Verify contract addresses

### Wallet Security

```typescript
// Always verify network
if (chainId !== EXPECTED_CHAIN_ID) {
  await switchNetwork(EXPECTED_CHAIN_ID);
}

// Validate addresses
if (!isAddress(userAddress)) {
  throw new Error('Invalid address');
}
```

## Analytics Integration

### Events to Track

```typescript
// User actions
-wallet_connected -
  ticket_purchased -
  win_claimed -
  referral_shared -
  // Funnel metrics
  landing_page_view -
  purchase_initiated -
  purchase_completed -
  user_retained;
```

## Accessibility

### WCAG 2.1 Compliance

- **Color Contrast**: 4.5:1 minimum
- **Keyboard Navigation**: Full support
- **Screen Readers**: ARIA labels
- **Focus Indicators**: Visible focus states

### Implementation

```tsx
<button
  aria-label="Buy lottery ticket"
  aria-describedby="ticket-price"
  role="button"
  tabIndex={0}
>
  Buy Ticket
</button>
```

## Testing Strategy

### Unit Tests

```typescript
// Using Jest + React Testing Library
describe('TicketPurchase', () => {
  it('should display correct ticket price');
  it('should handle purchase flow');
  it('should show win animation');
});
```

### Integration Tests

```typescript
// Testing Web3 interactions
describe('WalletConnection', () => {
  it('should connect MetaMask');
  it('should switch networks');
  it('should handle disconnection');
});
```

## Common Issues & Solutions

### Issue: Wallet Connection Fails

```typescript
// Solution: Check and switch network
const switchToCorrectNetwork = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x' + chainId.toString(16) }],
    });
  } catch (error) {
    // Handle error
  }
};
```

### Issue: Transaction Pending Forever

```typescript
// Solution: Implement timeout
const txWithTimeout = async (promise, timeoutMs = 60000) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Transaction timeout')), timeoutMs),
  );
  return Promise.race([promise, timeout]);
};
```

## Future Enhancements

### Planned Features

- **Progressive Web App**: Offline support
- **Push Notifications**: Win alerts
- **Social Features**: Leaderboards, achievements
- **Advanced Analytics**: User insights dashboard
- **NFT Integration**: Winner badges
- **Multi-language**: More language support

### Performance Improvements

- **SSG for Static Pages**: Faster loads
- **Service Workers**: Cache strategies
- **WebAssembly**: Complex calculations
- **GraphQL**: Optimized data fetching

## Development Tools

### Recommended Extensions

- **VS Code Extensions**:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript React code snippets

### Browser Extensions

- **MetaMask**: Essential for testing
- **React DevTools**: Component debugging
- **Redux DevTools**: State inspection

## Deployment Checklist

### Pre-deployment

- [ ] Build passes without errors
- [ ] Environment variables set
- [ ] Contract addresses updated
- [ ] Images optimized
- [ ] SEO meta tags configured
- [ ] Error tracking configured

### Post-deployment

- [ ] Test wallet connections
- [ ] Verify transaction flow
- [ ] Check responsive design
- [ ] Monitor error logs
- [ ] Test referral system
- [ ] Verify analytics tracking

## Troubleshooting Guide

### Common Problems

**Problem**: "Cannot read properties of undefined"

```typescript
// Solution: Add optional chaining
const balance = userStats?.balance ?? 0;
```

**Problem**: "Network Error"

```typescript
// Solution: Implement retry logic
const retryRequest = async (fn, retries = 3) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 1000));
      return retryRequest(fn, retries - 1);
    }
    throw error;
  }
};
```

**Problem**: "Gas estimation failed"

```typescript
// Solution: Manual gas limit
const tx = await contract.buyTicket({
  gasLimit: 150000,
  value: ticketPrice,
});
```

## Resources

### Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Wagmi Documentation](https://wagmi.sh)
- [RainbowKit Docs](https://www.rainbowkit.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

### Community Support

- Discord: [Join our server]
- Telegram: [@chainluck]
- Twitter: [@chainluck]
- Email: <support@chainluck.io>
