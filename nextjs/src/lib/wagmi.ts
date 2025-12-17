// nextjs/src/lib/wagmi.ts

import { createConfig, http } from 'wagmi';
import { polygon, polygonMumbai, bsc, bscTestnet, mainnet } from 'wagmi/chains';
import {
  walletConnect,
  metaMask,
  coinbaseWallet,
  injected,
} from 'wagmi/connectors';

// =============================================================================
// ENVIRONMENT & VALIDATION
// =============================================================================

const WALLETCONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;
const INFURA_KEY = process.env.NEXT_PUBLIC_INFURA_KEY;

if (!WALLETCONNECT_PROJECT_ID) {
  throw new Error(
    'Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in environment',
  );
}

// =============================================================================
// APP METADATA
// =============================================================================

/**
 * TODO:
 *
 * 1. Update the URL to your official URL before production
 * 2. Update the icons URL to yoru official URL before production
 *
 * For now use NGrok for URL that is hosting the application
 */
const APP_METADATA = {
  name: 'ChainLuck',
  description: 'Web3 Lottery Platform - Win Big with Pure Randomness',
  url:
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://6e6c-2a00-1f-6f82-4801-bc88-a9d6-b07-c19d.ngrok-free.app',
  icons: ['https://chainluck.com/favicon.ico'],
};

// =============================================================================
// CHAIN CONFIGURATION
// =============================================================================

/**
 * TODO:
 *
 * 1.polygonMumbai  => Default testnet for development
 * 2.polygon        => Production chain
 * 3.mainnet        => Future support
 */

// Define localhost chain for development
const localhost = {
  id: 1337,
  name: 'Hardhat Local',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
  },
  blockExplorers: {
    default: { name: 'Local Explorer', url: 'http://localhost:8545' },
  },
  testnet: true,
} as const;

/**
 * Supported chains in order of preference for development
 */
export const supportedChains = [
  localhost, // Add localhost as first option
  polygonMumbai,
  polygon,
  bsc,
  bscTestnet,
  mainnet,
] as const;

// Set localhost as default for development
export const defaultChain = localhost;
export const productionChain = polygon;

// =============================================================================
// CONNECTOR CONFIGURATION
// =============================================================================

const connectors = [
  // Universal injected connector - handles any wallet extension or mobile app
  injected({
    shimDisconnect: true,
  }),

  // Specific wallet connectors for better UX
  metaMask({
    dappMetadata: APP_METADATA,
  }),

  coinbaseWallet({
    appName: APP_METADATA.name,
    appLogoUrl: APP_METADATA.icons[0],
  }),

  // WalletConnect - handles QR codes and mobile deep links
  walletConnect({
    projectId: WALLETCONNECT_PROJECT_ID,
    metadata: APP_METADATA,
    showQrModal: true,
    qrModalOptions: {
      themeMode: 'light',
      themeVariables: {
        '--wcm-accent-color': '#6EE7B7',
        '--wcm-accent-fill-color': '#047857',
        '--wcm-background-color': '#ffffff',
        '--wcm-foreground-color': '#000000',
        '--wcm-border-radius-master': '8px',
        '--wcm-z-index': '1000',
      },
      enableExplorer: true,
      mobileWallets: [
        {
          id: 'rainbow',
          name: 'Rainbow',
          links: {
            native: 'rainbow:',
            universal: 'https://rainbow.me',
          },
        },
        {
          id: 'metamask',
          name: 'MetaMask',
          links: {
            native: 'metamask:',
            universal: 'https://metamask.app.link',
          },
        },
        {
          id: 'trust',
          name: 'Trust Wallet',
          links: {
            native: 'trust:',
            universal: 'https://link.trustwallet.com',
          },
        },
        {
          id: 'coinbase',
          name: 'Coinbase Wallet',
          links: {
            native: 'cbwallet:',
            universal: 'https://go.cb-w.com',
          },
        },
      ],
    },
  }),
];

// =============================================================================
// RPC TRANSPORTS
// =============================================================================

const transports = {
  [polygonMumbai.id]: http('https://rpc-mumbai.maticvigil.com'),
  [polygon.id]: http('https://polygon-rpc.com'),
  [bsc.id]: http('https://bsc-dataseed1.binance.org'),
  [bscTestnet.id]: http('https://data-seed-prebsc-1-s1.binance.org:8545'),
  [mainnet.id]: http(
    INFURA_KEY
      ? `https://mainnet.infura.io/v3/${INFURA_KEY}`
      : 'https://ethereum-rpc.publicnode.com',
  ),
};

// =============================================================================
// WAGMI CONFIGURATION
// =============================================================================

export const wagmiConfig = createConfig({
  chains: supportedChains,
  connectors,
  transports,
  ssr: true,
});

// =============================================================================
// CONTRACT ADDRESSES
// =============================================================================

export const USDC_ADDRESSES = {
  [polygon.id]: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  [polygonMumbai.id]: '0x2058A9D7613eEE744279e3856Ef0eAda5FCbaA7e',
  [bsc.id]: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
  [bscTestnet.id]: '0x64544969ed7EBf5f083679233325356EbE738930',
} as const;

// =============================================================================
// CHAIN METADATA
// =============================================================================

const NATIVE_TOKENS = {
  [polygon.id]: 'MATIC',
  [polygonMumbai.id]: 'MATIC',
  [bsc.id]: 'BNB',
  [bscTestnet.id]: 'BNB',
  [mainnet.id]: 'ETH',
} as const;

const BLOCK_EXPLORERS = {
  [polygon.id]: 'https://polygonscan.com',
  [polygonMumbai.id]: 'https://mumbai.polygonscan.com',
  [bsc.id]: 'https://bscscan.com',
  [bscTestnet.id]: 'https://testnet.bscscan.com',
  [mainnet.id]: 'https://etherscan.io',
} as const;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function getChainInfo(chainId: number) {
  const chain = supportedChains.find((c) => c.id === chainId);
  return {
    chain,
    nativeToken: NATIVE_TOKENS[chainId as keyof typeof NATIVE_TOKENS],
    usdcAddress: USDC_ADDRESSES[chainId as keyof typeof USDC_ADDRESSES],
    blockExplorer: BLOCK_EXPLORERS[chainId as keyof typeof BLOCK_EXPLORERS],
  };
}

export function isSupportedChain(chainId: number): boolean {
  return supportedChains.some((chain) => chain.id === chainId);
}

export function getExplorerUrl(
  chainId: number,
  hash: string,
  type: 'tx' | 'address' = 'tx',
): string {
  const explorer = BLOCK_EXPLORERS[chainId as keyof typeof BLOCK_EXPLORERS];
  return explorer ? `${explorer}/${type}/${hash}` : '';
}
