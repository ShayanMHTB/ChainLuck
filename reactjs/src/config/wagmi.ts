import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { sepolia, polygonAmoy } from 'wagmi/chains'
import { env } from '@/lib/env'

// Testnet-only: this app must never connect to mainnet.
// The contract uses pseudo-random RNG — safe only for testnet demos.
export const wagmiConfig = getDefaultConfig({
  appName: 'ChainLuck',
  projectId: env.VITE_WALLETCONNECT_PROJECT_ID,
  chains: [sepolia, polygonAmoy],
  ssr: false,
})
