// nextjs/src/lib/contracts.ts
import { Address } from 'viem';

// =============================================================================
// CONTRACT ABIs (Keep existing - they're correct)
// =============================================================================
export const CHAINLUCK_LOTTERY_ABI = [
  // ... keep your existing ABI exactly as is
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
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'OwnableInvalidOwner',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'OwnableUnauthorizedAccount',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ReentrancyGuardReentrantCall',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
    ],
    name: 'SafeERC20FailedOperation',
    type: 'error',
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
        name: 'owner',
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
    name: 'OwnerWithdrawal',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'instantPool',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'grandPrizePool',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
    ],
    name: 'PoolsRefilled',
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
        name: 'grandPrizeWin',
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
        name: 'timestamp',
        type: 'uint256',
      },
    ],
    name: 'WinsClaimed',
    type: 'event',
  },
  {
    inputs: [],
    name: 'BASIS_POINTS',
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
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'GRAND_PRIZE_AMOUNTS',
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
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'GRAND_PRIZE_ODDS',
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
    name: 'GRAND_PRIZE_POOL_BP',
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
    name: 'GUARANTEED_WIN_BP',
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
    name: 'MIN_GRAND_PRIZE_POOL',
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
    name: 'MIN_INSTANT_POOL',
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
    name: 'OWNER_WITHDRAWAL_THRESHOLD',
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
    name: 'PLATFORM_PROFIT_BP',
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
  {
    inputs: [],
    name: 'emergencyWithdraw',
    outputs: [],
    stateMutability: 'nonpayable',
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
    name: 'grandPrizePool',
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
    name: 'instantPayoutPool',
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
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
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
        name: '',
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
        internalType: 'uint256',
        name: 'instantAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'grandPrizeAmount',
        type: 'uint256',
      },
    ],
    name: 'refillPools',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalRevenue',
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
    name: 'totalTicketsSold',
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
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
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
        name: '',
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
  {
    inputs: [],
    name: 'withdrawProfits',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export const MOCK_USDC_ABI = [
  // ... keep your existing USDC ABI exactly as is
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'allowance',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'needed',
        type: 'uint256',
      },
    ],
    name: 'ERC20InsufficientAllowance',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'balance',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'needed',
        type: 'uint256',
      },
    ],
    name: 'ERC20InsufficientBalance',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'approver',
        type: 'address',
      },
    ],
    name: 'ERC20InvalidApprover',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
    ],
    name: 'ERC20InvalidReceiver',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'ERC20InvalidSender',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
    ],
    name: 'ERC20InvalidSpender',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
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
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'value',
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
  {
    inputs: [],
    name: 'name',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
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
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'transfer',
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
        name: 'from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'transferFrom',
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
] as const;

// =============================================================================
// CONTRACT ADDRESSES (SEPOLIA PRIORITY - CRITICAL FIX)
// =============================================================================

export const CONTRACT_ADDRESSES = {
  // Sepolia testnet (PRIMARY for testing - YOUR DEPLOYED CONTRACTS)
  sepolia: {
    chainId: 11155111,
    chainluckLottery: '0x01A42965b8c813b8AfB3c6e455Ec7cD3C342F00B' as Address,
    usdc: '0x7f926FcD24c451Fa1a7b9c5887033DaE9ce7E672' as Address, // Your MockUSDC
  },
  // Local development (fallback for development)
  localhost: {
    chainId: 1337,
    chainluckLottery: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' as Address,
    usdc: '0x5FbDB2315678afecb367f032d93F642f64180aa3' as Address,
  },
  // Mumbai testnet (for future expansion)
  mumbai: {
    chainId: 80001,
    chainluckLottery: '' as Address, // To be deployed
    usdc: '0x2058A9D7613eEE744279e3856Ef0eAda5FCbaA7e' as Address, // Real USDC on Mumbai
  },
  // Polygon mainnet (for future production)
  polygon: {
    chainId: 137,
    chainluckLottery: '' as Address, // To be deployed
    usdc: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' as Address, // Real USDC on Polygon
  },
} as const;

// =============================================================================
// CONTRACT CONSTANTS (from smart contract - UPDATED FOR SEPOLIA)
// =============================================================================

export const LOTTERY_CONSTANTS = {
  // Ticket Prices (in USDC 6-decimal format) - UPDATED FROM YOUR CONTRACT
  PRICE_1_TICKET: 3_500000, // $3.50
  PRICE_5_TICKETS: 17_500000, // $17.50
  PRICE_10_TICKETS: 35_000000, // $35.00
  PRICE_20_TICKETS: 70_000000, // $70.00
  PRICE_50_TICKETS: 175_000000, // $175.00

  // Revenue allocation (basis points) - FROM YOUR CONTRACT
  GUARANTEED_WIN_BP: 750, // 7.5%
  GRAND_PRIZE_POOL_BP: 1500, // 15%
  PLATFORM_PROFIT_BP: 7750, // 77.5%
  BASIS_POINTS: 10000, // 100%

  // Grand prize amounts (in USDC 6-decimal format) - FROM YOUR CONTRACT
  GRAND_PRIZE_AMOUNTS: [
    10000_000000, // $10,000
    5000_000000, // $5,000
    2000_000000, // $2,000
    1000_000000, // $1,000
    500_000000, // $500
  ],

  // Grand prize odds (1 in X) - FROM YOUR CONTRACT
  GRAND_PRIZE_ODDS: [
    10_000_000, // 1 in 10M for $10,000
    5_000_000, // 1 in 5M for $5,000
    2_000_000, // 1 in 2M for $2,000
    1_000_000, // 1 in 1M for $1,000
    500_000, // 1 in 500K for $500
  ],

  // Pool thresholds - FROM YOUR CONTRACT
  MIN_INSTANT_POOL: 1000_000000, // $1,000
  MIN_GRAND_PRIZE_POOL: 5000_000000, // $5,000
  OWNER_WITHDRAWAL_THRESHOLD: 2000_000000, // $2,000
} as const;

// =============================================================================
// UTILITY FUNCTIONS (SEPOLIA FIRST PRIORITY)
// =============================================================================

/**
 * Get contract addresses for the current chain
 * PRIORITY: Sepolia first for testing with your deployed contracts
 */
export function getContractAddresses(chainId: number) {
  console.log('🔍 Getting contract addresses for chainId:', chainId);

  switch (chainId) {
    case 11155111: // Sepolia - PRIMARY
      console.log('✅ Using Sepolia contracts (PRIMARY)');
      return CONTRACT_ADDRESSES.sepolia;
    case 1337: // Localhost
      console.log('🏠 Using localhost contracts');
      return CONTRACT_ADDRESSES.localhost;
    case 80001: // Mumbai
      console.log('🟣 Using Mumbai contracts');
      return CONTRACT_ADDRESSES.mumbai;
    case 137: // Polygon
      console.log('🟣 Using Polygon contracts');
      return CONTRACT_ADDRESSES.polygon;
    default:
      console.warn('⚠️ Unknown chainId, falling back to Sepolia:', chainId);
      return CONTRACT_ADDRESSES.sepolia; // Fallback to Sepolia (your deployed contracts)
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
      console.error('❌ Invalid ticket count:', ticketCount);
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

/**
 * Validate if chain has deployed contracts
 */
export function isContractDeployed(chainId: number): boolean {
  const addresses = getContractAddresses(chainId);
  return !!addresses.chainluckLottery && !!addresses.usdc;
}

/**
 * Get explorer URL for transaction or address
 */
export function getExplorerUrl(
  chainId: number,
  hash: string,
  type: 'tx' | 'address' = 'tx',
): string {
  const explorers: Record<number, string> = {
    11155111: 'https://sepolia.etherscan.io', // Sepolia
    1337: 'http://localhost:8545', // Localhost (no explorer)
    80001: 'https://mumbai.polygonscan.com', // Mumbai
    137: 'https://polygonscan.com', // Polygon
  };

  const explorer = explorers[chainId];
  if (!explorer || chainId === 1337) {
    return '#'; // No explorer for localhost
  }

  return `${explorer}/${type}/${hash}`;
}

// =============================================================================
// DEBUG INFO FOR SEPOLIA
// =============================================================================

if (typeof window !== 'undefined') {
  console.log('🔧 Contracts Config Debug:', {
    sepoliaAddresses: CONTRACT_ADDRESSES.sepolia,
    constantsCheck: {
      ticket1Price: formatUSDCAmount(LOTTERY_CONSTANTS.PRICE_1_TICKET),
      ticket5Price: formatUSDCAmount(LOTTERY_CONSTANTS.PRICE_5_TICKETS),
      guaranteedWinBP: LOTTERY_CONSTANTS.GUARANTEED_WIN_BP,
      grandPrizeAmounts:
        LOTTERY_CONSTANTS.GRAND_PRIZE_AMOUNTS.map(formatUSDCAmount),
    },
    utilityTest: {
      ticket1USD: getTicketPriceUSD(1),
      ticket5USD: getTicketPriceUSD(5),
      guaranteedWin1: getGuaranteedWinUSD(1),
      guaranteedWin5: getGuaranteedWinUSD(5),
    },
  });
}
