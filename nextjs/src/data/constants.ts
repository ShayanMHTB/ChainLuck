// nextjs/src/data/constants.ts

import { WinTierInfo, TicketPurchaseOptions } from '@/types/lottery';

// =============================================================================
// LOTTERY CONFIGURATION (from smart contract)
// =============================================================================

export const LOTTERY_CONFIG = {
  // Ticket pricing (matches smart contract exactly)
  TICKET_PRICES: {
    1: 3.5, // $3.50 for 1 ticket
    5: 17.5, // $17.50 for 5 tickets
    10: 35.0, // $35.00 for 10 tickets
    20: 70.0, // $70.00 for 20 tickets
    50: 175.0, // $175.00 for 50 tickets
  },

  // Revenue allocation (from smart contract)
  GUARANTEED_WIN_PERCENTAGE: 7.5, // 7.5% guaranteed win
  GRAND_PRIZE_POOL_PERCENTAGE: 15, // 15% to grand prize pool
  PLATFORM_PROFIT_PERCENTAGE: 77.5, // 77.5% platform profit

  // Grand prizes (from smart contract)
  GRAND_PRIZES: [
    { amount: 10000, odds: 10_000_000 }, // $10,000 - 1 in 10M
    { amount: 5000, odds: 5_000_000 }, // $5,000 - 1 in 5M
    { amount: 2000, odds: 2_000_000 }, // $2,000 - 1 in 2M
    { amount: 1000, odds: 1_000_000 }, // $1,000 - 1 in 1M
    { amount: 500, odds: 500_000 }, // $500 - 1 in 500K
  ],

  // Pool thresholds (from smart contract)
  MIN_INSTANT_POOL: 1000, // $1,000
  MIN_GRAND_PRIZE_POOL: 5000, // $5,000
  OWNER_WITHDRAWAL_THRESHOLD: 2000, // $2,000
} as const;

// =============================================================================
// WIN TIER DEFINITIONS (updated to match contract behavior)
// =============================================================================

export const WIN_TIERS: WinTierInfo[] = [
  {
    tier: 'none',
    name: 'No Additional Win',
    minAmount: 0,
    maxAmount: 0,
    probability: 0, // Everyone gets guaranteed win, additional wins vary
    color: 'text-muted-foreground',
    requiresVRF: false,
  },
  {
    tier: 'guaranteed',
    name: 'Guaranteed Win',
    minAmount: 0.26, // 7.5% of $3.50
    maxAmount: 13.13, // 7.5% of $175.00
    probability: 100, // Everyone gets this
    color: 'text-green-500',
    requiresVRF: false,
  },
  {
    tier: 'grand_500',
    name: 'Grand Prize $500',
    minAmount: 500,
    maxAmount: 500,
    probability: 0.0002, // 1 in 500,000
    color: 'text-yellow-500',
    requiresVRF: true,
  },
  {
    tier: 'grand_1000',
    name: 'Grand Prize $1,000',
    minAmount: 1000,
    maxAmount: 1000,
    probability: 0.0001, // 1 in 1,000,000
    color: 'text-orange-500',
    requiresVRF: true,
  },
  {
    tier: 'grand_2000',
    name: 'Grand Prize $2,000',
    minAmount: 2000,
    maxAmount: 2000,
    probability: 0.00005, // 1 in 2,000,000
    color: 'text-red-500',
    requiresVRF: true,
  },
  {
    tier: 'grand_5000',
    name: 'Grand Prize $5,000',
    minAmount: 5000,
    maxAmount: 5000,
    probability: 0.00002, // 1 in 5,000,000
    color: 'text-purple-500',
    requiresVRF: true,
  },
  {
    tier: 'grand_10000',
    name: 'Grand Prize $10,000',
    minAmount: 10000,
    maxAmount: 10000,
    probability: 0.00001, // 1 in 10,000,000
    color: 'text-pink-500',
    requiresVRF: true,
  },
];

// =============================================================================
// TICKET PURCHASE OPTIONS (updated to match contract)
// =============================================================================

export const TICKET_OPTIONS: TicketPurchaseOptions[] = [
  {
    multiplier: 1,
    label: '1 Ticket',
    priceUSD: LOTTERY_CONFIG.TICKET_PRICES[1],
    guaranteedWin:
      LOTTERY_CONFIG.TICKET_PRICES[1] *
      (LOTTERY_CONFIG.GUARANTEED_WIN_PERCENTAGE / 100),
  },
  {
    multiplier: 5,
    label: '5 Tickets',
    priceUSD: LOTTERY_CONFIG.TICKET_PRICES[5],
    guaranteedWin:
      LOTTERY_CONFIG.TICKET_PRICES[5] *
      (LOTTERY_CONFIG.GUARANTEED_WIN_PERCENTAGE / 100),
    popular: true,
    bonus: 'Most Popular',
  },
  {
    multiplier: 10,
    label: '10 Tickets',
    priceUSD: LOTTERY_CONFIG.TICKET_PRICES[10],
    guaranteedWin:
      LOTTERY_CONFIG.TICKET_PRICES[10] *
      (LOTTERY_CONFIG.GUARANTEED_WIN_PERCENTAGE / 100),
    bonus: 'Better Odds',
  },
  {
    multiplier: 20,
    label: '20 Tickets',
    priceUSD: LOTTERY_CONFIG.TICKET_PRICES[20],
    guaranteedWin:
      LOTTERY_CONFIG.TICKET_PRICES[20] *
      (LOTTERY_CONFIG.GUARANTEED_WIN_PERCENTAGE / 100),
    bonus: 'Great Value',
  },
  {
    multiplier: 50,
    label: '50 Tickets',
    priceUSD: LOTTERY_CONFIG.TICKET_PRICES[50],
    guaranteedWin:
      LOTTERY_CONFIG.TICKET_PRICES[50] *
      (LOTTERY_CONFIG.GUARANTEED_WIN_PERCENTAGE / 100),
    bonus: 'Maximum Luck',
  },
];

// =============================================================================
// APP CONFIGURATION
// =============================================================================

export const APP_CONFIG = {
  APP_NAME: 'ChainLuck',
  APP_DESCRIPTION:
    'Decentralized Lottery Platform - Instant Wins, Provably Fair',
  SITE_URL: 'https://chainluck.com',
  SUPPORT_EMAIL: 'support@chainluck.com',
  TWITTER_HANDLE: '@ChainLuckLottery',

  // Version info
  VERSION: '1.0.0',
  BUILD_DATE: new Date().toISOString(),
} as const;

// =============================================================================
// NETWORK CONFIGURATION
// =============================================================================

export const NETWORK_CONFIG = {
  SUPPORTED_CHAINS: ['localhost', 'mumbai', 'polygon'] as const,
  DEFAULT_CHAIN: 'localhost' as const,
  TESTNET_MODE: true,

  // Chain IDs
  CHAIN_IDS: {
    localhost: 1337,
    mumbai: 80001,
    polygon: 137,
  },
} as const;

// =============================================================================
// UI CONFIGURATION
// =============================================================================

export const UI_CONFIG = {
  // Animation timings
  ANIMATION_DURATION: 300,
  CONFETTI_DURATION: 3000,
  TICKET_REVEAL_DELAY: 800,

  // Data refresh intervals
  STATS_UPDATE_INTERVAL: 30000, // 30 seconds
  USER_STATS_UPDATE_INTERVAL: 15000, // 15 seconds
  BALANCE_UPDATE_INTERVAL: 10000, // 10 seconds

  // Display limits
  RECENT_WINNERS_LIMIT: 10,
  MAX_WALLET_ADDRESS_LENGTH: 8,

  // Notification settings
  TOAST_DURATION: 4000,
  SUCCESS_TOAST_DURATION: 5000,
  ERROR_TOAST_DURATION: 6000,
} as const;

// =============================================================================
// ERROR MESSAGES
// =============================================================================

export const ERROR_MESSAGES = {
  // Wallet errors
  WALLET_NOT_CONNECTED: 'Please connect your wallet to continue',
  WALLET_CONNECTION_FAILED: 'Failed to connect wallet. Please try again.',
  WRONG_NETWORK: 'Please switch to the correct network',

  // Balance errors
  INSUFFICIENT_USDC_BALANCE: 'Insufficient USDC balance for this purchase',
  INSUFFICIENT_ALLOWANCE: 'Please approve USDC spending first',

  // Transaction errors
  TRANSACTION_FAILED: 'Transaction failed. Please try again.',
  TRANSACTION_REJECTED: 'Transaction was rejected by user',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  GAS_ESTIMATION_FAILED: 'Failed to estimate gas. Please try again.',

  // Validation errors
  INVALID_TICKET_COUNT: 'Please select a valid number of tickets',
  INVALID_AMOUNT: 'Please enter a valid amount',
  NO_PENDING_WINS: 'No pending wins to claim',

  // Contract errors
  CONTRACT_INTERACTION_FAILED: 'Failed to interact with contract',
  INSUFFICIENT_POOL_FUNDS: 'Insufficient pool funds for payout',
  PURCHASE_LIMIT_EXCEEDED: 'Purchase limit exceeded',
} as const;

// =============================================================================
// SUCCESS MESSAGES
// =============================================================================

export const SUCCESS_MESSAGES = {
  // Wallet
  WALLET_CONNECTED: 'Wallet connected successfully!',
  NETWORK_SWITCHED: 'Network switched successfully!',

  // Transactions
  TICKETS_PURCHASED: 'Tickets purchased successfully!',
  WINS_CLAIMED: 'Wins claimed successfully!',
  USDC_APPROVED: 'USDC approval successful!',
  TEST_USDC_RECEIVED: 'Test USDC received successfully!',

  // Achievements
  FIRST_PURCHASE: 'Welcome to ChainLuck! First purchase completed!',
  BIG_WIN: 'Congratulations on your big win!',
  GRAND_PRIZE: '🏆 GRAND PRIZE WON! 🏆',
} as const;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Calculate guaranteed win amount for a ticket count
 */
export function calculateGuaranteedWin(
  ticketCount: 1 | 5 | 10 | 20 | 50,
): number {
  const price = LOTTERY_CONFIG.TICKET_PRICES[ticketCount];
  return price * (LOTTERY_CONFIG.GUARANTEED_WIN_PERCENTAGE / 100);
}

/**
 * Format currency with proper decimals
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format large numbers with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(Math.floor(num));
}

/**
 * Format odds as readable string
 */
export function formatOdds(odds: number): string {
  return `1 in ${formatNumber(odds)}`;
}

/**
 * Get win tier info by tier name
 */
export function getWinTierInfo(tierName: string): WinTierInfo | undefined {
  return WIN_TIERS.find((tier) => tier.tier === tierName);
}

/**
 * Calculate total prize pool from grand prizes
 */
export function calculateTotalPrizePool(): number {
  return LOTTERY_CONFIG.GRAND_PRIZES.reduce(
    (total, prize) => total + prize.amount,
    0,
  );
}

/**
 * Check if amount qualifies as "big win"
 */
export function isBigWin(amount: number): boolean {
  return amount >= 500; // Grand prize territory
}

/**
 * Get ticket count options
 */
export function getTicketCountOptions(): (1 | 5 | 10 | 20 | 50)[] {
  return [1, 5, 10, 20, 50];
}

/**
 * Validate ticket count
 */
export function isValidTicketCount(
  count: number,
): count is 1 | 5 | 10 | 20 | 50 {
  return getTicketCountOptions().includes(count as any);
}
