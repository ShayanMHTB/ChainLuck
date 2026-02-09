// nextjs/src/lib/wagmi.ts

import { createConfig, http } from 'wagmi';
import {
  polygon,
  polygonMumbai,
  bsc,
  bscTestnet,
  mainnet,
  sepolia,
} from 'wagmi/chains';
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
  console.warn(
    'Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID - WalletConnect may not work',
  );
}

// =============================================================================
// APP METADATA
// =============================================================================
const APP_METADATA = {
  name: 'ChainLuck',
  description: 'Web3 Lottery Platform - Win Big with Pure Randomness',
  url:
    typeof window !== 'undefined'
      ? window.location.origin
      : 'http://localhost:3000',
  icons: ['https://chainluck.com/favicon.ico'],
};

// =============================================================================
// SEPOLIA CHAIN WITH PROPER GAS CONFIGURATION
// =============================================================================

// Override Sepolia with proper gas configuration
const sepoliaWithGas = {
  ...sepolia,
  fees: {
    baseFeeMultiplier: 1.2,
    defaultPriorityFee: '2000000000', // 2 gwei
  },
  // Add custom RPC with better gas estimation
  rpcUrls: {
    default: {
      http: [
        INFURA_KEY
          ? `https://sepolia.infura.io/v3/${INFURA_KEY}`
          : 'https://ethereum-sepolia-rpc.publicnode.com',
        'https://sepolia.gateway.tenderly.co',
        'https://rpc2.sepolia.org',
      ],
    },
    public: {
      http: [
        INFURA_KEY
          ? `https://sepolia.infura.io/v3/${INFURA_KEY}`
          : 'https://ethereum-sepolia-rpc.publicnode.com',
        'https://sepolia.gateway.tenderly.co',
        'https://rpc2.sepolia.org',
      ],
    },
  },
} as const;

/**
 * Supported chains in order of preference for development
 * SEPOLIA FIRST - Your deployed contracts are here
 */
export const supportedChains = [
  sepoliaWithGas, // PRIMARY - Your deployed contracts are here with proper gas
  polygonMumbai, // Secondary testnet option
  polygon, // Production target
  bsc,
  bscTestnet,
  mainnet,
] as const;

// CRITICAL: Set Sepolia as default for your testing
export const defaultChain = sepoliaWithGas;
export const productionChain = polygon;

// =============================================================================
// CONNECTOR CONFIGURATION
// =============================================================================

const connectors = [
  // MetaMask first - best for Sepolia
  metaMask({
    dappMetadata: APP_METADATA,
    infuraAPIKey: INFURA_KEY,
  }),

  // Universal injected connector - handles other wallet extensions
  injected({
    shimDisconnect: true,
  }),

  coinbaseWallet({
    appName: APP_METADATA.name,
    appLogoUrl: APP_METADATA.icons[0],
  }),

  // WalletConnect - only include if we have project ID
  ...(WALLETCONNECT_PROJECT_ID
    ? [
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
          },
        }),
      ]
    : []),
];

// =============================================================================
// RPC TRANSPORTS (SEPOLIA OPTIMIZED WITH PROPER GAS)
// =============================================================================

const transports = {
  // Sepolia - PRIMARY with aggressive gas configuration
  [sepoliaWithGas.id]: http(
    INFURA_KEY
      ? `https://sepolia.infura.io/v3/${INFURA_KEY}`
      : 'https://ethereum-sepolia-rpc.publicnode.com',
    {
      batch: false,
      poll: true,
      pollingInterval: 4000,
      timeout: 30000, // Increased timeout
      retryCount: 5, // More retries
      retryDelay: 2000,
    },
  ),

  [mainnet.id]: http(
    INFURA_KEY
      ? `https://mainnet.infura.io/v3/${INFURA_KEY}`
      : 'https://ethereum-rpc.publicnode.com',
  ),

  [polygon.id]: http('https://polygon-rpc.com'),
  [polygonMumbai.id]: http('https://rpc-mumbai.maticvigil.com'),
  [bsc.id]: http('https://bsc-dataseed.binance.org'),
  [bscTestnet.id]: http('https://data-seed-prebsc-1-s1.binance.org:8545'),
};

// =============================================================================
// WAGMI CONFIGURATION (SEPOLIA FOCUSED WITH GAS OPTIMIZATION)
// =============================================================================

export const wagmiConfig = createConfig({
  chains: supportedChains,
  connectors,
  transports,
  ssr: true,
  pollingInterval: 4000,
  batch: {
    multicall: false, // Keep disabled for testnet stability
  },
  // CRITICAL: Add default gas configuration for Sepolia
  syncConnectedChain: true,
});

// =============================================================================
// GAS ESTIMATION UTILITIES FOR SEPOLIA
// =============================================================================

export const SEPOLIA_GAS_CONFIG = {
  // Base gas prices in wei (higher for Sepolia reliability)
  gasPrice: '20000000000', // 20 gwei
  maxFeePerGas: '50000000000', // 50 gwei max
  maxPriorityFeePerGas: '2000000000', // 2 gwei priority

  // Gas limits for contract functions
  gasLimits: {
    approve: 100000,
    buyTickets: 500000, // Increased for lottery logic
    claimWins: 200000,
    faucet: 100000,
  },

  // Gas multipliers for safety
  gasMultiplier: 1.3, // 30% buffer
};

// Function to get gas config for Sepolia transactions
export function getSepoliaGasConfig(functionName?: string) {
  const baseConfig = {
    gasPrice: BigInt(SEPOLIA_GAS_CONFIG.gasPrice),
    maxFeePerGas: BigInt(SEPOLIA_GAS_CONFIG.maxFeePerGas),
    maxPriorityFeePerGas: BigInt(SEPOLIA_GAS_CONFIG.maxPriorityFeePerGas),
  };

  if (
    functionName &&
    SEPOLIA_GAS_CONFIG.gasLimits[
      functionName as keyof typeof SEPOLIA_GAS_CONFIG.gasLimits
    ]
  ) {
    return {
      ...baseConfig,
      gas: BigInt(
        SEPOLIA_GAS_CONFIG.gasLimits[
          functionName as keyof typeof SEPOLIA_GAS_CONFIG.gasLimits
        ],
      ),
    };
  }

  return baseConfig;
}

// =============================================================================
// CONTRACT ADDRESSES (UPDATED FOR SEPOLIA PRIORITY)
// =============================================================================

export const USDC_ADDRESSES = {
  [sepoliaWithGas.id]: '0x7f926FcD24c451Fa1a7b9c5887033DaE9ce7E672', // Your MockUSDC
  [polygon.id]: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  [polygonMumbai.id]: '0x2058A9D7613eEE744279e3856Ef0eAda5FCbaA7e',
  [bsc.id]: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
  [bscTestnet.id]: '0x64544969ed7EBf5f083679233325356EbE738930',
} as const;

export const CHAINLUCK_ADDRESSES = {
  [sepoliaWithGas.id]: '0x01A42965b8c813b8AfB3c6e455Ec7cD3C342F00B', // Your deployed contract
  [polygon.id]: '', // To be deployed
  [polygonMumbai.id]: '', // To be deployed
  [bsc.id]: '', // To be deployed
  [bscTestnet.id]: '', // To be deployed
} as const;

// =============================================================================
// CHAIN METADATA
// =============================================================================

const NATIVE_TOKENS = {
  [sepoliaWithGas.id]: 'SepoliaETH',
  [polygon.id]: 'MATIC',
  [polygonMumbai.id]: 'MATIC',
  [bsc.id]: 'BNB',
  [bscTestnet.id]: 'BNB',
  [mainnet.id]: 'ETH',
} as const;

const BLOCK_EXPLORERS = {
  [sepoliaWithGas.id]: 'https://sepolia.etherscan.io',
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
    chainluckAddress:
      CHAINLUCK_ADDRESSES[chainId as keyof typeof CHAINLUCK_ADDRESSES],
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

// =============================================================================
// DEBUG INFO
// =============================================================================

if (typeof window !== 'undefined') {
  console.log('🔧 Wagmi Config Debug (Sepolia Optimized):', {
    defaultChain: defaultChain.name,
    supportedChains: supportedChains.map((c) => c.name),
    sepoliaAddresses: {
      usdc: USDC_ADDRESSES[sepoliaWithGas.id],
      chainluck: CHAINLUCK_ADDRESSES[sepoliaWithGas.id],
    },
    gasConfig: SEPOLIA_GAS_CONFIG,
    hasInfura: !!INFURA_KEY,
    hasWalletConnect: !!WALLETCONNECT_PROJECT_ID,
  });
}
