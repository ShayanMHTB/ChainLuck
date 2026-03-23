import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { sepolia, polygonAmoy } from 'wagmi/chains'
import { env } from '@/lib/env'

// Testnet-only: this app must never connect to mainnet.
// The contract uses pseudo-random RNG — safe only for testnet demos.
//
// RainbowKit throws synchronously if projectId is falsy, so we fall back to a
// placeholder. WalletConnect wallets won't connect without a real ID (get one
// at https://cloud.walletconnect.com and set VITE_WALLETCONNECT_PROJECT_ID).
export const wagmiConfig = getDefaultConfig({
  appName: 'ChainLuck',
  projectId: env.VITE_WALLETCONNECT_PROJECT_ID || 'placeholder-dev-only',
  chains: [sepolia, polygonAmoy],
  ssr: false,
})
