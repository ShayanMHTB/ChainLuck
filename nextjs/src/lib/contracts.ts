// nextjs/src/lib/contracts.ts

import { Address } from 'viem';

// =============================================================================
// CONTRACT ABIs
// =============================================================================

export const CHAINLUCK_LOTTERY_ABI = [
  // Constructor
  {
    inputs: [
      {
        internalType: 'address',
        name: '_usdc',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },

  // Events
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'ticketCount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'totalCost',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'guaranteedWin',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
    ],
    name: 'TicketsPurchased',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'prizeIndex',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
    ],
    name: 'GrandPrizeWon',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
    ],
    name: 'WinsClaimed',
    type: 'event',
  },

  // Write Functions
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'ticketCount',
        type: 'uint256',
      },
    ],
    name: 'buyTickets',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'claimWins',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },

  // Read Functions
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'ticketCount',
        type: 'uint256',
      },
    ],
    name: 'getTicketPrice',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getContractStats',
    outputs: [
      {
        internalType: 'uint256',
        name: 'totalSold',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'totalRev',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'instantPool',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'grandPool',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'contractBalance',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'getUserStats',
    outputs: [
      {
        internalType: 'uint256',
        name: 'totalSpent',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'totalWon',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'pending',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'netResult',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getGrandPrizeInfo',
    outputs: [
      {
        internalType: 'uint256[5]',
        name: 'amounts',
        type: 'uint256[5]',
      },
      {
        internalType: 'uint256[5]',
        name: 'odds',
        type: 'uint256[5]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },

  // Public Variables
  {
    inputs: [],
    name: 'USDC',
    outputs: [
      {
        internalType: 'contract IERC20',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'pendingWins',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'userTotalSpent',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'userTotalWon',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },

  // Constants
  {
    inputs: [],
    name: 'PRICE_1_TICKET',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'PRICE_5_TICKETS',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'PRICE_10_TICKETS',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'PRICE_20_TICKETS',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'PRICE_50_TICKETS',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const MOCK_USDC_ABI = [
  // ERC20 Standard Functions
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
    ],
    name: 'allowance',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },

  // Mock-specific functions
  {
    inputs: [],
    name: 'faucet',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

// =============================================================================
// CONTRACT ADDRESSES
// =============================================================================

export const CONTRACT_ADDRESSES = {
  // Local development (Hardhat)
  localhost: {
    chainId: 1337,
    chainluckLottery: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' as Address,
    usdc: '0x5FbDB2315678afecb367f032d93F642f64180aa3' as Address,
  },

  // Mumbai testnet (will be added later)
  mumbai: {
    chainId: 80001,
    chainluckLottery: '' as Address, // To be deployed
    usdc: '0x2058A9D7613eEE744279e3856Ef0eAda5FCbaA7e' as Address, // Real USDC on Mumbai
  },

  // Polygon mainnet (will be added later)
  polygon: {
    chainId: 137,
    chainluckLottery: '' as Address, // To be deployed
    usdc: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' as Address, // Real USDC on Polygon
  },
} as const;

// =============================================================================
// CONTRACT CONSTANTS (from smart contract)
// =============================================================================

export const LOTTERY_CONSTANTS = {
  // Ticket Prices (in USDC 6-decimal format)
  PRICE_1_TICKET: 3_500000, // $3.50
  PRICE_5_TICKETS: 17_500000, // $17.50
  PRICE_10_TICKETS: 35_000000, // $35.00
  PRICE_20_TICKETS: 70_000000, // $70.00
  PRICE_50_TICKETS: 175_000000, // $175.00

  // Revenue allocation (basis points)
  GUARANTEED_WIN_BP: 750, // 7.5%
  GRAND_PRIZE_POOL_BP: 1500, // 15%
  PLATFORM_PROFIT_BP: 7750, // 77.5%
  BASIS_POINTS: 10000, // 100%

  // Grand prize amounts (in USDC 6-decimal format)
  GRAND_PRIZE_AMOUNTS: [
    10000_000000, // $10,000
    5000_000000, // $5,000
    2000_000000, // $2,000
    1000_000000, // $1,000
    500_000000, // $500
  ],

  // Grand prize odds (1 in X)
  GRAND_PRIZE_ODDS: [
    10_000_000, // 1 in 10M for $10,000
    5_000_000, // 1 in 5M for $5,000
    2_000_000, // 1 in 2M for $2,000
    1_000_000, // 1 in 1M for $1,000
    500_000, // 1 in 500K for $500
  ],

  // Pool thresholds
  MIN_INSTANT_POOL: 1000_000000, // $1,000
  MIN_GRAND_PRIZE_POOL: 5000_000000, // $5,000
  OWNER_WITHDRAWAL_THRESHOLD: 2000_000000, // $2,000
} as const;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get contract addresses for the current chain
 */
export function getContractAddresses(chainId: number) {
  console.log('🔍 Getting contract addresses for chainId:', chainId);

  switch (chainId) {
    case 1337:
      console.log('✅ Using localhost contracts');
      return CONTRACT_ADDRESSES.localhost;
    case 80001:
      console.log('✅ Using Mumbai contracts');
      return CONTRACT_ADDRESSES.mumbai;
    case 137:
      console.log('✅ Using Polygon contracts');
      return CONTRACT_ADDRESSES.polygon;
    default:
      console.warn('⚠️ Unknown chainId, falling back to localhost:', chainId);
      return CONTRACT_ADDRESSES.localhost; // Fallback to localhost for development
  }
}

/**
 * Convert USDC amount from 6-decimal format to human readable number
 */
export function formatUSDCAmount(amount: bigint | number): number {
  const amountBigInt = typeof amount === 'number' ? BigInt(amount) : amount;
  return Number(amountBigInt) / 1_000_000; // Convert from 6 decimals to dollars
}

/**
 * Convert human readable dollar amount to USDC 6-decimal format
 */
export function parseUSDCAmount(dollars: number): bigint {
  return BigInt(Math.floor(dollars * 1_000_000)); // Convert to 6 decimals
}

/**
 * Get ticket price in dollars for a given ticket count
 */
export function getTicketPriceUSD(ticketCount: 1 | 5 | 10 | 20 | 50): number {
  switch (ticketCount) {
    case 1:
      return formatUSDCAmount(LOTTERY_CONSTANTS.PRICE_1_TICKET);
    case 5:
      return formatUSDCAmount(LOTTERY_CONSTANTS.PRICE_5_TICKETS);
    case 10:
      return formatUSDCAmount(LOTTERY_CONSTANTS.PRICE_10_TICKETS);
    case 20:
      return formatUSDCAmount(LOTTERY_CONSTANTS.PRICE_20_TICKETS);
    case 50:
      return formatUSDCAmount(LOTTERY_CONSTANTS.PRICE_50_TICKETS);
    default:
      return 0;
  }
}

/**
 * Calculate guaranteed win amount for ticket count
 */
export function getGuaranteedWinUSD(ticketCount: number): number {
  const ticketPrice = getTicketPriceUSD(ticketCount as 1 | 5 | 10 | 20 | 50);
  return (
    (ticketPrice * LOTTERY_CONSTANTS.GUARANTEED_WIN_BP) /
    LOTTERY_CONSTANTS.BASIS_POINTS
  );
}

/**
 * Format odds as human readable string
 */
export function formatOdds(odds: number): string {
  return `1 in ${odds.toLocaleString()}`;
}

/**
 * Get grand prize info with human readable formatting
 */
export function getGrandPrizeInfo() {
  return LOTTERY_CONSTANTS.GRAND_PRIZE_AMOUNTS.map((amount, index) => ({
    amount: formatUSDCAmount(amount),
    odds: LOTTERY_CONSTANTS.GRAND_PRIZE_ODDS[index],
    formattedOdds: formatOdds(LOTTERY_CONSTANTS.GRAND_PRIZE_ODDS[index]),
  }));
}
