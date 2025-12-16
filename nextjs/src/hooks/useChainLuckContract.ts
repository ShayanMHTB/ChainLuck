// nextjs/src/hooks/useChainLuckContract.ts

import { useEffect, useState } from 'react';
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
  useAccount,
  useChainId,
} from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { toast } from 'sonner';
import {
  CHAINLUCK_LOTTERY_ABI,
  MOCK_USDC_ABI,
  getContractAddresses,
  formatUSDCAmount,
  parseUSDCAmount,
  getTicketPriceUSD,
  getGuaranteedWinUSD,
} from '@/lib/contracts';

// =============================================================================
// TYPES
// =============================================================================

export interface ContractStats {
  totalTicketsSold: number;
  totalRevenue: number;
  instantPool: number;
  grandPrizePool: number;
  contractBalance: number;
}

export interface UserStats {
  totalSpent: number;
  totalWon: number;
  pendingWins: number;
  netResult: number;
}

export interface TicketPurchaseResult {
  success: boolean;
  hash?: string;
  error?: string;
  guaranteedWin?: number;
  grandPrizeWins?: Array<{
    amount: number;
    prizeIndex: number;
  }>;
}

export interface GrandPrizeInfo {
  amounts: number[];
  odds: number[];
}

// =============================================================================
// MAIN CONTRACT HOOK
// =============================================================================

export function useChainLuckContract() {
  const { address } = useAccount();
  const chainId = useChainId();
  const contracts = getContractAddresses(chainId);

  // =============================================================================
  // CONTRACT STATS
  // =============================================================================

  const {
    data: contractStatsRaw,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useReadContract({
    address: contracts.chainluckLottery,
    abi: CHAINLUCK_LOTTERY_ABI,
    functionName: 'getContractStats',
    query: {
      refetchInterval: 30000, // Refetch every 30 seconds
    },
  });

  const contractStats: ContractStats | undefined = contractStatsRaw
    ? {
        totalTicketsSold: Number(contractStatsRaw[0]),
        totalRevenue: formatUSDCAmount(contractStatsRaw[1]),
        instantPool: formatUSDCAmount(contractStatsRaw[2]),
        grandPrizePool: formatUSDCAmount(contractStatsRaw[3]),
        contractBalance: formatUSDCAmount(contractStatsRaw[4]),
      }
    : undefined;

  // =============================================================================
  // USER STATS
  // =============================================================================

  const {
    data: userStatsRaw,
    isLoading: isLoadingUserStats,
    refetch: refetchUserStats,
  } = useReadContract({
    address: contracts.chainluckLottery,
    abi: CHAINLUCK_LOTTERY_ABI,
    functionName: 'getUserStats',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 15000, // Refetch every 15 seconds
    },
  });

  const userStats: UserStats | undefined = userStatsRaw
    ? {
        totalSpent: formatUSDCAmount(userStatsRaw[0]),
        totalWon: formatUSDCAmount(userStatsRaw[1]),
        pendingWins: formatUSDCAmount(userStatsRaw[2]),
        netResult: formatUSDCAmount(userStatsRaw[3]),
      }
    : undefined;

  // =============================================================================
  // GRAND PRIZE INFO
  // =============================================================================

  const { data: grandPrizeInfoRaw } = useReadContract({
    address: contracts.chainluckLottery,
    abi: CHAINLUCK_LOTTERY_ABI,
    functionName: 'getGrandPrizeInfo',
  });

  const grandPrizeInfo: GrandPrizeInfo | undefined = grandPrizeInfoRaw
    ? {
        amounts: grandPrizeInfoRaw[0].map((amount) => formatUSDCAmount(amount)),
        odds: grandPrizeInfoRaw[1].map((odd) => Number(odd)),
      }
    : undefined;

  // =============================================================================
  // TICKET PURCHASE
  // =============================================================================

  const {
    writeContract: buyTickets,
    data: purchaseHash,
    error: purchaseError,
    isPending: isPurchasing,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash: purchaseHash,
  });

  const [lastPurchaseResult, setLastPurchaseResult] =
    useState<TicketPurchaseResult | null>(null);

  // Handle purchase completion
  useEffect(() => {
    if (isConfirmed && receipt) {
      // Parse events from receipt to get win information
      const guaranteedWin = getGuaranteedWinUSD(1); // Will be updated based on actual ticket count

      const result: TicketPurchaseResult = {
        success: true,
        hash: receipt.transactionHash,
        guaranteedWin,
        grandPrizeWins: [], // Will be populated from events
      };

      setLastPurchaseResult(result);

      // Refetch stats after successful purchase
      refetchStats();
      refetchUserStats();

      toast.success('Tickets purchased successfully!', {
        description: `You won at least $${guaranteedWin.toFixed(2)}!`,
      });
    }
  }, [isConfirmed, receipt, refetchStats, refetchUserStats]);

  // Handle purchase errors
  useEffect(() => {
    if (purchaseError || confirmError) {
      const error = purchaseError || confirmError;
      const result: TicketPurchaseResult = {
        success: false,
        error: error?.message || 'Transaction failed',
      };

      setLastPurchaseResult(result);

      toast.error('Purchase failed', {
        description: result.error,
      });
    }
  }, [purchaseError, confirmError]);

  const purchaseTickets = async (ticketCount: 1 | 5 | 10 | 20 | 50) => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      buyTickets({
        address: contracts.chainluckLottery,
        abi: CHAINLUCK_LOTTERY_ABI,
        functionName: 'buyTickets',
        args: [BigInt(ticketCount)],
      });
    } catch (error) {
      console.error('Error purchasing tickets:', error);
      toast.error('Failed to initiate purchase');
    }
  };

  // =============================================================================
  // CLAIM WINS
  // =============================================================================

  const {
    writeContract: claimWins,
    data: claimHash,
    error: claimError,
    isPending: isClaiming,
  } = useWriteContract();

  const {
    isLoading: isClaimConfirming,
    isSuccess: isClaimConfirmed,
    error: claimConfirmError,
  } = useWaitForTransactionReceipt({
    hash: claimHash,
  });

  // Handle claim completion
  useEffect(() => {
    if (isClaimConfirmed) {
      refetchUserStats();
      toast.success('Wins claimed successfully!');
    }
  }, [isClaimConfirmed, refetchUserStats]);

  // Handle claim errors
  useEffect(() => {
    if (claimError || claimConfirmError) {
      const error = claimError || claimConfirmError;
      toast.error('Claim failed', {
        description: error?.message || 'Failed to claim wins',
      });
    }
  }, [claimError, claimConfirmError]);

  const claimPendingWins = async () => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!userStats?.pendingWins || userStats.pendingWins === 0) {
      toast.error('No pending wins to claim');
      return;
    }

    try {
      claimWins({
        address: contracts.chainluckLottery,
        abi: CHAINLUCK_LOTTERY_ABI,
        functionName: 'claimWins',
      });
    } catch (error) {
      console.error('Error claiming wins:', error);
      toast.error('Failed to initiate claim');
    }
  };

  // =============================================================================
  // EVENT LISTENERS
  // =============================================================================

  // Listen for ticket purchases
  useWatchContractEvent({
    address: contracts.chainluckLottery,
    abi: CHAINLUCK_LOTTERY_ABI,
    eventName: 'TicketsPurchased',
    onLogs: (logs) => {
      // Refetch stats when any user purchases tickets
      refetchStats();
    },
  });

  // Listen for grand prize wins
  useWatchContractEvent({
    address: contracts.chainluckLottery,
    abi: CHAINLUCK_LOTTERY_ABI,
    eventName: 'GrandPrizeWon',
    onLogs: (logs) => {
      logs.forEach((log) => {
        const { user, amount, prizeIndex } = log.args;
        if (user && amount !== undefined && prizeIndex !== undefined) {
          toast.success('🏆 Grand Prize Won!', {
            description: `Someone won $${formatUSDCAmount(amount).toFixed(2)}!`,
            duration: 6000,
          });
        }
      });
      refetchStats();
    },
  });

  // =============================================================================
  // RETURN OBJECT
  // =============================================================================

  return {
    // Contract data
    contractStats,
    userStats,
    grandPrizeInfo,

    // Loading states
    isLoadingStats,
    isLoadingUserStats,

    // Purchase functionality
    purchaseTickets,
    isPurchasing: isPurchasing || isConfirming,
    lastPurchaseResult,

    // Claim functionality
    claimPendingWins,
    isClaiming: isClaiming || isClaimConfirming,

    // Utility functions
    getTicketPriceUSD,
    getGuaranteedWinUSD,

    // Manual refetch
    refetchStats,
    refetchUserStats,

    // Contract addresses
    contracts,
  };
}

// =============================================================================
// USDC CONTRACT HOOK
// =============================================================================

export function useUSDCContract() {
  const { address } = useAccount();
  const chainId = useChainId(); // This gets chainId from wagmi
  const contracts = getContractAddresses(chainId);

  console.log('🔍 USDC Hook Debug:', {
    address,
    chainId,
    usdcAddress: contracts.usdc,
    lotteryAddress: contracts.chainluckLottery,
  });

  // Get USDC balance
  const {
    data: balanceRaw,
    isLoading: isLoadingBalance,
    refetch: refetchBalance,
    error: balanceError,
  } = useReadContract({
    address: contracts.usdc,
    abi: MOCK_USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  const usdcBalance = balanceRaw ? formatUSDCAmount(balanceRaw) : 0;

  console.log('💰 USDC Balance Debug:', {
    balanceRaw: balanceRaw?.toString(),
    usdcBalance,
    isLoadingBalance,
    balanceError: balanceError?.message,
  });

  // Get USDC allowance for lottery contract
  const {
    data: allowanceRaw,
    isLoading: isLoadingAllowance,
    refetch: refetchAllowance,
  } = useReadContract({
    address: contracts.usdc,
    abi: MOCK_USDC_ABI,
    functionName: 'allowance',
    args: address ? [address, contracts.chainluckLottery] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 10000,
    },
  });

  const usdcAllowance = allowanceRaw ? formatUSDCAmount(allowanceRaw) : 0;

  // =============================================================================
  // USDC APPROVAL
  // =============================================================================

  const {
    writeContract: approveUSDC,
    data: approveHash,
    error: approveError,
    isPending: isApproving,
  } = useWriteContract();

  const {
    isLoading: isApproveConfirming,
    isSuccess: isApproveConfirmed,
    error: approveConfirmError,
  } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Handle approval completion
  useEffect(() => {
    if (isApproveConfirmed) {
      refetchAllowance();
      toast.success('USDC approval successful!');
    }
  }, [isApproveConfirmed, refetchAllowance]);

  // Handle approval errors
  useEffect(() => {
    if (approveError || approveConfirmError) {
      const error = approveError || approveConfirmError;
      toast.error('Approval failed', {
        description: error?.message || 'Failed to approve USDC',
      });
    }
  }, [approveError, approveConfirmError]);

  const approveUSDCForLottery = async (amount: number) => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      const amountInWei = parseUSDCAmount(amount);
      approveUSDC({
        address: contracts.usdc,
        abi: MOCK_USDC_ABI,
        functionName: 'approve',
        args: [contracts.chainluckLottery, amountInWei],
      });
    } catch (error) {
      console.error('Error approving USDC:', error);
      toast.error('Failed to initiate approval');
    }
  };

  // =============================================================================
  // FAUCET (for testing only)
  // =============================================================================

  const {
    writeContract: useFaucet,
    data: faucetHash,
    error: faucetError,
    isPending: isFauceting,
  } = useWriteContract();

  const {
    isLoading: isFaucetConfirming,
    isSuccess: isFaucetConfirmed,
    error: faucetConfirmError,
  } = useWaitForTransactionReceipt({
    hash: faucetHash,
  });

  // Handle faucet completion
  useEffect(() => {
    if (isFaucetConfirmed) {
      refetchBalance();
      toast.success('Test USDC received!', {
        description: 'You received 10,000 USDC for testing',
      });
    }
  }, [isFaucetConfirmed, refetchBalance]);

  // Handle faucet errors
  useEffect(() => {
    if (faucetError || faucetConfirmError) {
      const error = faucetError || faucetConfirmError;
      toast.error('Faucet failed', {
        description: error?.message || 'Failed to get test USDC',
      });
    }
  }, [faucetError, faucetConfirmError]);

  const getTestUSDC = async () => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    // Check if we're on localhost/hardhat network
    if (chainId !== 1337) {
      toast.error('Faucet only available on localhost network (Chain ID 1337)');
      return;
    }

    try {
      useFaucet({
        address: contracts.usdc,
        abi: MOCK_USDC_ABI,
        functionName: 'faucet',
      });
    } catch (error) {
      console.error('Error using faucet:', error);
      toast.error('Failed to use faucet');
    }
  };

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  const hasEnoughBalance = (requiredAmount: number): boolean => {
    return usdcBalance >= requiredAmount;
  };

  const hasEnoughAllowance = (requiredAmount: number): boolean => {
    return usdcAllowance >= requiredAmount;
  };

  const needsApproval = (requiredAmount: number): boolean => {
    return !hasEnoughAllowance(requiredAmount);
  };

  // =============================================================================
  // RETURN OBJECT
  // =============================================================================

  return {
    // Balance data
    usdcBalance,
    usdcAllowance,

    // Loading states
    isLoadingBalance,
    isLoadingAllowance,

    // Approval functionality
    approveUSDCForLottery,
    isApproving: isApproving || isApproveConfirming,

    // Faucet functionality (testing only)
    getTestUSDC,
    isFauceting: isFauceting || isFaucetConfirming,

    // Utility functions
    hasEnoughBalance,
    hasEnoughAllowance,
    needsApproval,

    // Manual refetch
    refetchBalance,
    refetchAllowance,

    // Contract addresses
    contracts,
  };
}

// =============================================================================
// RECENT WINNERS HOOK
// =============================================================================

export function useRecentWinners() {
  const chainId = useChainId();
  const contracts = getContractAddresses(chainId);
  const [recentWinners, setRecentWinners] = useState<
    Array<{
      id: string;
      user: string;
      amount: number;
      prizeIndex: number;
      timestamp: Date;
      transactionHash: string;
    }>
  >([]);

  // Listen for grand prize wins and add to recent winners
  useWatchContractEvent({
    address: contracts.chainluckLottery,
    abi: CHAINLUCK_LOTTERY_ABI,
    eventName: 'GrandPrizeWon',
    onLogs: (logs) => {
      const newWinners = logs.map((log) => ({
        id: `${log.transactionHash}-${log.logIndex}`,
        user: log.args.user || '',
        amount: formatUSDCAmount(log.args.amount || 0n),
        prizeIndex: Number(log.args.prizeIndex || 0),
        timestamp: new Date(Number(log.args.timestamp || 0) * 1000),
        transactionHash: log.transactionHash,
      }));

      setRecentWinners(
        (prev) => [...newWinners, ...prev].slice(0, 10), // Keep only last 10 winners
      );
    },
  });

  return {
    recentWinners,
  };
}

// =============================================================================
// LIVE STATS HOOK
// =============================================================================

export function useLiveStats() {
  const { contractStats, isLoadingStats } = useChainLuckContract();
  const { recentWinners } = useRecentWinners();

  // Calculate additional stats
  const stats = contractStats
    ? {
        ...contractStats,
        activeUsers: 0, // This would need to be calculated from recent activity
        biggestWin:
          recentWinners.length > 0
            ? Math.max(...recentWinners.map((w) => w.amount))
            : 0,
        totalWinners: recentWinners.length, // This is just recent winners, not total
      }
    : undefined;

  return {
    stats,
    isLoading: isLoadingStats,
    recentWinners,
  };
}
