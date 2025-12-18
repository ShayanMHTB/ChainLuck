// nextjs/src/types/lottery.ts

// =============================================================================
// CORE LOTTERY TYPES (matching smart contract)
// =============================================================================

export interface LotteryTicket {
  id: string;
  walletAddress: string;
  ticketCount: 1 | 5 | 10 | 20 | 50;
  totalCost: number; // In USD
  guaranteedWin: number; // In USD
  purchaseDate: Date;
  transactionHash: string;
  blockNumber: number;
  status: 'pending' | 'confirmed' | 'failed';
  grandPrizeWins?: GrandPrizeWin[];
}

export interface GrandPrizeWin {
  amount: number; // In USD
  prizeIndex: number; // 0-4 (corresponding to $10K, $5K, $2K, $1K, $500)
  transactionHash: string;
  timestamp: Date;
}

export type WinTier =
  | 'none'
  | 'guaranteed'
  | 'grand_500'
  | 'grand_1000'
  | 'grand_2000'
  | 'grand_5000'
  | 'grand_10000';

export interface WinTierInfo {
  tier: WinTier;
  name: string;
  minAmount: number;
  maxAmount: number;
  probability: number; // Percentage (as decimal, e.g., 0.001 = 0.001%)
  color: string;
  requiresVRF: boolean;
}

// =============================================================================
// CONTRACT DATA TYPES
// =============================================================================

export interface ContractStats {
  totalTicketsSold: number;
  totalRevenue: number; // In USD
  instantPool: number; // In USD
  grandPrizePool: number; // In USD
  contractBalance: number; // In USD
}

export interface UserStats {
  walletAddress: string;
  totalSpent: number; // In USD
  totalWon: number; // In USD
  pendingWins: number; // In USD
  netResult: number; // In USD (positive = profit, negative = loss)
}

export interface GrandPrizeInfo {
  amounts: number[]; // Array of 5 prize amounts in USD
  odds: number[]; // Array of 5 odds (1 in X)
}

// =============================================================================
// LIVE DATA TYPES
// =============================================================================

export interface LotteryStats {
  totalTicketsSold: number;
  totalRevenue: number; // Total revenue in USD
  instantPool: number; // Available instant payout pool
  grandPrizePool: number; // Available grand prize pool
  contractBalance: number; // Total contract balance
  biggestWin: number; // Biggest recent win
  activeUsers: number; // Estimated active users (calculated)
  totalWinners: number; // Total number of recent winners
}

export interface RecentWinner {
  id: string;
  walletAddress: string;
  winAmount: number; // In USD
  prizeIndex: number; // 0-4 for grand prizes
  winDate: Date;
  transactionHash: string;
  winTier: WinTier;
}

// =============================================================================
// UI-SPECIFIC TYPES
// =============================================================================

export interface TicketPurchaseOptions {
  multiplier: 1 | 5 | 10 | 20 | 50;
  label: string;
  priceUSD: number;
  guaranteedWin: number; // Calculated guaranteed win amount
  popular?: boolean;
  bonus?: string;
}

export interface PurchaseState {
  isLoading: boolean;
  selectedMultiplier: 1 | 5 | 10 | 20 | 50;
  totalPrice: number;
  guaranteedWin: number;
  error?: string;
  success?: boolean;
  transactionHash?: string;
  grandPrizeWins?: GrandPrizeWin[];
}

export interface WalletState {
  isConnected: boolean;
  address?: string;
  usdcBalance?: number; // USDC balance in USD
  nativeBalance?: number; // Native token balance (ETH/MATIC) for gas
  isConnecting: boolean;
  error?: string;
}

// =============================================================================
// TRANSACTION TYPES
// =============================================================================

export interface TransactionState {
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  error?: string;
  hash?: string;
}

export interface ApprovalState extends TransactionState {
  isApproved: boolean;
  allowanceAmount: number;
  needsApproval: (amount: number) => boolean;
}

// =============================================================================
// EVENT TYPES (from smart contract events)
// =============================================================================

export interface TicketsPurchasedEvent {
  user: string;
  ticketCount: number;
  totalCost: number; // In USDC 6-decimal format
  guaranteedWin: number; // In USDC 6-decimal format
  timestamp: number; // Unix timestamp
  transactionHash: string;
  blockNumber: number;
}

export interface GrandPrizeWonEvent {
  user: string;
  amount: number; // In USDC 6-decimal format
  prizeIndex: number; // 0-4
  timestamp: number; // Unix timestamp
  transactionHash: string;
  blockNumber: number;
}

export interface WinsClaimedEvent {
  user: string;
  amount: number; // In USDC 6-decimal format
  timestamp: number; // Unix timestamp
  transactionHash: string;
  blockNumber: number;
}

// =============================================================================
// HOOK RETURN TYPES
// =============================================================================

export interface ChainLuckContractHook {
  // Contract data
  contractStats?: ContractStats;
  userStats?: UserStats;
  grandPrizeInfo?: GrandPrizeInfo;

  // Loading states
  isLoadingStats: boolean;
  isLoadingUserStats: boolean;

  // Purchase functionality
  purchaseTickets: (ticketCount: 1 | 5 | 10 | 20 | 50) => Promise<void>;
  isPurchasing: boolean;
  lastPurchaseResult?: TicketPurchaseResult;

  // Claim functionality
  claimPendingWins: () => Promise<void>;
  isClaiming: boolean;

  // Utility functions
  getTicketPriceUSD: (ticketCount: 1 | 5 | 10 | 20 | 50) => number;
  getGuaranteedWinUSD: (ticketCount: number) => number;

  // Manual refetch
  refetchStats: () => void;
  refetchUserStats: () => void;

  // Contract addresses
  contracts: ContractAddresses;
}

export interface USDCContractHook {
  // Balance data
  usdcBalance: number;
  usdcAllowance: number;

  // Loading states
  isLoadingBalance: boolean;
  isLoadingAllowance: boolean;

  // Approval functionality
  approveUSDCForLottery: (amount: number) => Promise<void>;
  isApproving: boolean;

  // Faucet functionality (testing only)
  getTestUSDC: () => Promise<void>;
  isFauceting: boolean;

  // Utility functions
  hasEnoughBalance: (requiredAmount: number) => boolean;
  hasEnoughAllowance: (requiredAmount: number) => boolean;
  needsApproval: (requiredAmount: number) => boolean;

  // Manual refetch
  refetchBalance: () => void;
  refetchAllowance: () => void;

  // Contract addresses
  contracts: ContractAddresses;
}

export interface LiveStatsHook {
  stats?: LotteryStats;
  isLoading: boolean;
  recentWinners: RecentWinner[];
}

// =============================================================================
// CONTRACT ADDRESS TYPES
// =============================================================================

export interface ContractAddresses {
  chainId: number;
  chainluckLottery: string;
  usdc: string;
}

// =============================================================================
// PURCHASE RESULT TYPES
// =============================================================================

export interface TicketPurchaseResult {
  success: boolean;
  hash?: string;
  error?: string;
  ticketCount?: number;
  totalCost?: number;
  guaranteedWin?: number;
  grandPrizeWins?: GrandPrizeWin[];
  timestamp?: Date;
}

// =============================================================================
// ANIMATION TYPES
// =============================================================================

export interface WinAnimationProps {
  ticketCount: number;
  guaranteedWin: number;
  grandPrizeWins: GrandPrizeWin[];
  totalWin: number;
  onAnimationComplete?: () => void;
}

export interface TicketRevealState {
  phase: 'revealing' | 'summary';
  currentTicket: number;
  showConfetti: boolean;
}

// =============================================================================
// VALIDATION TYPES
// =============================================================================

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface PurchaseValidation extends ValidationResult {
  hasWallet: boolean;
  hasBalance: boolean;
  hasAllowance: boolean;
  needsApproval: boolean;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type TicketCount = 1 | 5 | 10 | 20 | 50;

export type NetworkName = 'localhost' | 'mumbai' | 'polygon';

export type ContractFunction =
  | 'buyTickets'
  | 'claimWins'
  | 'getContractStats'
  | 'getUserStats'
  | 'getGrandPrizeInfo'
  | 'approve'
  | 'balanceOf'
  | 'allowance'
  | 'faucet';

// =============================================================================
// ERROR TYPES
// =============================================================================

export interface ContractError {
  code: string;
  message: string;
  data?: any;
}

export interface TransactionError extends ContractError {
  hash?: string;
  receipt?: any;
}

// =============================================================================
// CONSTANTS TYPES
// =============================================================================

export interface LotteryConstants {
  TICKET_PRICES: Record<TicketCount, number>;
  GUARANTEED_WIN_PERCENTAGE: number;
  GRAND_PRIZE_POOL_PERCENTAGE: number;
  PLATFORM_PROFIT_PERCENTAGE: number;
  GRAND_PRIZES: Array<{
    amount: number;
    odds: number;
  }>;
  MIN_INSTANT_POOL: number;
  MIN_GRAND_PRIZE_POOL: number;
  OWNER_WITHDRAWAL_THRESHOLD: number;
}
