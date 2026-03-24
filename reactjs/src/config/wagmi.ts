import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http } from 'wagmi'
import { sepolia, polygonAmoy } from 'wagmi/chains'
import { env } from '@/lib/env'

// Testnet-only — the contract uses pseudo-random RNG, unsafe for real money.
//
// RainbowKit throws synchronously when projectId is falsy.  We fall back to a
// placeholder so the app boots without VITE_WALLETCONNECT_PROJECT_ID set.
// Injected wallets (MetaMask, Coinbase extension) still work with the placeholder.
// WalletConnect-based wallets (Rainbow mobile, Trust, etc.) need a real projectId:
//   1. Create a project at https://cloud.walletconnect.com (free)
//   2. Copy the Project ID
//   3. Add to .env.local → VITE_WALLETCONNECT_PROJECT_ID=your-id-here
export const wagmiConfig = getDefaultConfig({
  appName: 'ChainLuck',
  appDescription: 'Provably-fair on-chain lottery — verify the odds on-chain.',
  projectId: env.VITE_WALLETCONNECT_PROJECT_ID || 'placeholder-dev-only',
  chains: [sepolia, polygonAmoy],
  // Falls back to each chain's public RPC when env vars are not set.
  transports: {
    [sepolia.id]: http(env.VITE_RPC_URL_SEPOLIA || undefined),
    [polygonAmoy.id]: http(env.VITE_RPC_URL_POLYGON_AMOY || undefined),
  },
  ssr: false,
})
