// nextjs/src/hooks/useChainLuckContract.ts

import { useEffect, useState } from 'react';
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
  useAccount,
  useChainId,
  useGasPrice,
  useEstimateGas,
} from 'wagmi';
import { toast } from 'sonner';
import {
  CHAINLUCK_LOTTERY_ABI,
  MOCK_USDC_ABI,
  getContractAddresses,
  formatUSDCAmount,
  parseUSDCAmount,
  getTicketPriceUSD,
  getGuaranteedWinUSD,
  isContractDeployed,
} from '@/lib/contracts';
import { getSepoliaGasConfig, SEPOLIA_GAS_CONFIG } from '@/lib/wagmi';

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
  ticketCount?: number;
  totalCost?: number;
  guaranteedWin?: number;
  grandPrizeWins?: Array<{
    amount: number;
    prizeIndex: number;
  }>;
  timestamp?: Date;
}

export interface GrandPrizeInfo {
  amounts: number[];
  odds: number[];
}

// =============================================================================
// ENHANCED ERROR PARSING FOR SEPOLIA
// =============================================================================

function parseContractError(error: any): string {
  if (!error) return 'Unknown error occurred';

  const message = error.message || error.toString();
  console.error('🚨 Contract Error Details:', { error, message });

  // Gas-related errors (common on Sepolia)
  if (message.includes('gas') || message.includes('Gas')) {
    if (message.includes('insufficient funds for gas')) {
      return 'Insufficient SepoliaETH for gas fees. Please get more SepoliaETH from a faucet.';
    }
    if (message.includes('gas limit')) {
      return 'Transaction requires more gas. This might be a network issue, please try again.';
    }
    if (message.includes('gas price')) {
      return 'Gas price too low for Sepolia network. The transaction will be retried with higher gas.';
    }
    return 'Gas estimation failed. Please try again with higher gas settings.';
  }

  // Network-specific errors
  if (message.includes('network') || message.includes('Network')) {
    if (message.includes('Sepolia')) {
      return 'Sepolia network issue. Please check your connection and try again.';
    }
    return 'Network error. Please check your connection and try again.';
  }

  // Transaction errors
  if (message.includes('transaction underpriced')) {
    return 'Transaction fee too low for Sepolia. Please try again.';
  }

  if (message.includes('nonce too low') || message.includes('nonce')) {
    return 'Transaction nonce issue. Please reset your MetaMask account or try again.';
  }

  if (message.includes('replacement transaction underpriced')) {
    return 'Previous transaction pending. Please wait or increase gas price.';
  }

  // Contract-specific errors
  if (
    message.includes('insufficient allowance') ||
    message.includes('ERC20InsufficientAllowance')
  ) {
    return 'USDC spending not approved. Please approve USDC first.';
  }

  if (
    message.includes('insufficient balance') ||
    message.includes('ERC20InsufficientBalance')
  ) {
    return 'Insufficient USDC balance for this purchase.';
  }

  if (message.includes('User rejected') || message.includes('user rejected')) {
    return 'Transaction was cancelled by user.';
  }

  if (message.includes('revert') || message.includes('execution reverted')) {
    const revertMatch = message.match(/revert (.+?)(?:\s|$|\.)/);
    if (revertMatch) {
      return `Transaction failed: ${revertMatch[1]}`;
    }
    return 'Transaction was reverted by the contract.';
  }

  // Chain errors
  if (message.includes('chain') || message.includes('Chain')) {
    return 'Please make sure you are connected to Sepolia testnet.';
  }

  // Default fallback
  return 'Transaction failed. Please try again with higher gas settings.';
}

// =============================================================================
// GAS ESTIMATION HELPER
// =============================================================================

function useSepoliaGasEstimation() {
  const { data: gasPrice } = useGasPrice({
    chainId: 11155111, // Sepolia
  });

  const getGasSettings = (functionName?: string) => {
    // Use current gas price with safety multiplier
    const currentGasPrice = gasPrice || BigInt(SEPOLIA_GAS_CONFIG.gasPrice);
    const safeGasPrice = (currentGasPrice * BigInt(150)) / BigInt(100); // 50% buffer

    const gasConfig = {
      gasPrice: safeGasPrice,
      maxFeePerGas: safeGasPrice * BigInt(2), // Allow 2x current gas price
      maxPriorityFeePerGas: BigInt(SEPOLIA_GAS_CONFIG.maxPriorityFeePerGas),
    };

    // Add gas limit if function specified
    if (
      functionName &&
      SEPOLIA_GAS_CONFIG.gasLimits[
        functionName as keyof typeof SEPOLIA_GAS_CONFIG.gasLimits
      ]
    ) {
      return {
        ...gasConfig,
        gas:
          (BigInt(
            SEPOLIA_GAS_CONFIG.gasLimits[
              functionName as keyof typeof SEPOLIA_GAS_CONFIG.gasLimits
            ],
          ) *
            BigInt(130)) /
          BigInt(100), // 30% buffer
      };
    }

    return gasConfig;
  };

  return { getGasSettings };
}

// =============================================================================
// MAIN CONTRACT HOOK
// =============================================================================

export function useChainLuckContract() {
  const { address } = useAccount();
  const chainId = useChainId();
  const contracts = getContractAddresses(chainId);
  const { getGasSettings } = useSepoliaGasEstimation();

  // Check if contracts are deployed on current chain
  const contractsDeployed = isContractDeployed(chainId);

  // Debug logging
  useEffect(() => {
    console.log('🎲 ChainLuck Contract Hook Debug:', {
      chainId,
      chainName: chainId === 11155111 ? 'Sepolia' : 'Other',
      address,
      contracts,
      contractsDeployed,
      lotteryAddress: contracts.chainluckLottery,
      usdcAddress: contracts.usdc,
    });
  }, [chainId, address, contracts, contractsDeployed]);

  // =============================================================================
  // CONTRACT STATS
  // =============================================================================

  const {
    data: contractStatsRaw,
    isLoading: isLoadingStats,
    refetch: refetchStats,
    error: statsError,
  } = useReadContract({
    address: contracts.chainluckLottery,
    abi: CHAINLUCK_LOTTERY_ABI,
    functionName: 'getContractStats',
    query: {
      enabled: !!contracts.chainluckLottery && contractsDeployed,
      refetchInterval: 30000,
      retry: 3,
      retryDelay: 2000,
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
    error: userStatsError,
  } = useReadContract({
    address: contracts.chainluckLottery,
    abi: CHAINLUCK_LOTTERY_ABI,
    functionName: 'getUserStats',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!contracts.chainluckLottery && contractsDeployed,
      refetchInterval: 15000,
      retry: 3,
      retryDelay: 2000,
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

  const { data: grandPrizeInfoRaw, error: grandPrizeError } = useReadContract({
    address: contracts.chainluckLottery,
    abi: CHAINLUCK_LOTTERY_ABI,
    functionName: 'getGrandPrizeInfo',
    query: {
      enabled: !!contracts.chainluckLottery && contractsDeployed,
      retry: 3,
      retryDelay: 2000,
    },
  });

  const grandPrizeInfo: GrandPrizeInfo | undefined = grandPrizeInfoRaw
    ? {
        amounts: grandPrizeInfoRaw[0].map((amount) => formatUSDCAmount(amount)),
        odds: grandPrizeInfoRaw[1].map((odd) => Number(odd)),
      }
    : undefined;

  // =============================================================================
  // TICKET PURCHASE WITH PROPER GAS HANDLING
  // =============================================================================

  const {
    writeContract: buyTickets,
    data: purchaseHash,
    error: purchaseError,
    isPending: isPurchasing,
    reset: resetPurchase,
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
    if (isConfirmed && receipt && purchaseHash) {
      console.log('✅ Purchase Confirmed:', receipt);

      // Parse events from receipt to get win information
      let guaranteedWin = 0;
      let grandPrizeWins: Array<{ amount: number; prizeIndex: number }> = [];

      try {
        // Look for TicketsPurchased event
        guaranteedWin = getGuaranteedWinUSD(1); // Fallback value

        // TODO: Parse actual events from receipt logs
        // For now, use estimated values
      } catch (error) {
        console.error('❌ Error parsing events:', error);
        guaranteedWin = getGuaranteedWinUSD(1);
      }

      const result: TicketPurchaseResult = {
        success: true,
        hash: receipt.transactionHash,
        ticketCount: 1, // Would get from transaction data
        totalCost: getTicketPriceUSD(1), // Would get from transaction data
        guaranteedWin,
        grandPrizeWins,
        timestamp: new Date(),
      };

      setLastPurchaseResult(result);

      // Refetch stats after successful purchase
      setTimeout(() => {
        refetchStats();
        refetchUserStats();
      }, 2000);

      // Show success notification
      const totalWin =
        guaranteedWin +
        grandPrizeWins.reduce((sum, win) => sum + win.amount, 0);

      if (grandPrizeWins.length > 0) {
        toast.success('🏆 GRAND PRIZE WON! 🏆', {
          description: `You won $${totalWin.toFixed(
            2,
          )} including a grand prize!`,
          duration: 8000,
        });
      } else {
        toast.success('🎉 Tickets purchased successfully!', {
          description: `You won $${guaranteedWin.toFixed(2)} guaranteed!`,
          duration: 5000,
        });
      }
    }
  }, [isConfirmed, receipt, purchaseHash, refetchStats, refetchUserStats]);

  // Handle purchase errors
  useEffect(() => {
    if (purchaseError || confirmError) {
      const error = purchaseError || confirmError;
      console.error('❌ Purchase Error:', error);

      const friendlyError = parseContractError(error);

      const result: TicketPurchaseResult = {
        success: false,
        error: friendlyError,
        timestamp: new Date(),
      };

      setLastPurchaseResult(result);

      toast.error('Purchase failed', {
        description: friendlyError,
        duration: 8000,
      });
    }
  }, [purchaseError, confirmError]);

  const purchaseTickets = async (ticketCount: 1 | 5 | 10 | 20 | 50) => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!contractsDeployed) {
      toast.error(
        'Contracts not deployed on this network. Please switch to Sepolia.',
      );
      return;
    }

    if (chainId !== 11155111) {
      toast.error('Please switch to Sepolia testnet to use ChainLuck');
      return;
    }

    console.log(
      '🎫 Attempting to purchase tickets with Sepolia gas optimization:',
      {
        ticketCount,
        address,
        chainId,
        contractAddress: contracts.chainluckLottery,
        estimatedCost: getTicketPriceUSD(ticketCount),
      },
    );

    try {
      // Reset previous results
      setLastPurchaseResult(null);
      resetPurchase();

      // Get optimized gas settings for Sepolia
      const gasSettings = getGasSettings('buyTickets');

      console.log('💰 Using Sepolia gas settings:', {
        gasPrice: gasSettings.gasPrice?.toString(),
        maxFeePerGas: gasSettings.maxFeePerGas?.toString(),
        maxPriorityFeePerGas: gasSettings.maxPriorityFeePerGas?.toString(),
        gas: gasSettings.gas?.toString(),
      });

      buyTickets({
        address: contracts.chainluckLottery,
        abi: CHAINLUCK_LOTTERY_ABI,
        functionName: 'buyTickets',
        args: [BigInt(ticketCount)],
        // CRITICAL: Add gas settings for Sepolia
        ...gasSettings,
      });
    } catch (error) {
      console.error('❌ Error initiating purchase:', error);

      const result: TicketPurchaseResult = {
        success: false,
        error: parseContractError(error),
        timestamp: new Date(),
      };

      setLastPurchaseResult(result);
      toast.error('Failed to initiate purchase', {
        description: parseContractError(error),
      });
    }
  };

  // =============================================================================
  // CLAIM WINS WITH PROPER GAS HANDLING
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
      console.log('✅ Claim Confirmed');
      setTimeout(() => {
        refetchUserStats();
      }, 2000);
      toast.success('🎉 Wins claimed successfully!', {
        description: 'Funds have been transferred to your wallet',
        duration: 5000,
      });
    }
  }, [isClaimConfirmed, refetchUserStats]);

  // Handle claim errors
  useEffect(() => {
    if (claimError || claimConfirmError) {
      const error = claimError || claimConfirmError;
      console.error('❌ Claim Error:', error);

      toast.error('Claim failed', {
        description: parseContractError(error),
        duration: 6000,
      });
    }
  }, [claimError, claimConfirmError]);

  const claimPendingWins = async () => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!contractsDeployed) {
      toast.error(
        'Contracts not deployed on this network. Please switch to Sepolia.',
      );
      return;
    }

    if (!userStats?.pendingWins || userStats.pendingWins === 0) {
      toast.error('No pending wins to claim');
      return;
    }

    console.log('💰 Attempting to claim wins:', {
      address,
      pendingAmount: userStats.pendingWins,
      contractAddress: contracts.chainluckLottery,
    });

    try {
      // Get optimized gas settings for Sepolia
      const gasSettings = getGasSettings('claimWins');

      claimWins({
        address: contracts.chainluckLottery,
        abi: CHAINLUCK_LOTTERY_ABI,
        functionName: 'claimWins',
        // CRITICAL: Add gas settings for Sepolia
        ...gasSettings,
      });
    } catch (error) {
      console.error('❌ Error claiming wins:', error);
      toast.error('Failed to initiate claim', {
        description: parseContractError(error),
      });
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
    enabled: contractsDeployed,
    onLogs: (logs) => {
      console.log('🎫 Tickets Purchased Event:', logs);
      // Refetch stats when any user purchases tickets
      setTimeout(() => {
        refetchStats();
      }, 1000);
    },
  });

  // Listen for grand prize wins
  useWatchContractEvent({
    address: contracts.chainluckLottery,
    abi: CHAINLUCK_LOTTERY_ABI,
    eventName: 'GrandPrizeWon',
    enabled: contractsDeployed,
    onLogs: (logs) => {
      console.log('🏆 Grand Prize Won Event:', logs);

      logs.forEach((log) => {
        const { user, amount, prizeIndex } = log.args;
        if (user && amount !== undefined && prizeIndex !== undefined) {
          toast.success('🏆 Grand Prize Won!', {
            description: `Someone won ${formatUSDCAmount(amount).toFixed(2)}!`,
            duration: 6000,
          });
        }
      });

      setTimeout(() => {
        refetchStats();
      }, 1000);
    },
  });

  // Listen for wins claimed
  useWatchContractEvent({
    address: contracts.chainluckLottery,
    abi: CHAINLUCK_LOTTERY_ABI,
    eventName: 'WinsClaimed',
    enabled: contractsDeployed && !!address,
    onLogs: (logs) => {
      console.log('💰 Wins Claimed Event:', logs);
      // Only show notification if it's the current user
      logs.forEach((log) => {
        const { user } = log.args;
        if (user && user.toLowerCase() === address?.toLowerCase()) {
          // User specific claim - refetch their stats
          setTimeout(() => {
            refetchUserStats();
          }, 1000);
        }
      });
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

    // Network status
    contractsDeployed,
    chainId,
    isSepoliaNetwork: chainId === 11155111,

    // Reset function for clearing previous results
    resetPurchaseResult: () => setLastPurchaseResult(null),

    // Debug info
    debug: {
      statsError,
      userStatsError,
      grandPrizeError,
      contractAddress: contracts.chainluckLottery,
      usdcAddress: contracts.usdc,
    },
  };
}

// =============================================================================
// USDC CONTRACT HOOK (Enhanced for Sepolia Gas)
// =============================================================================

export function useUSDCContract() {
  const { address } = useAccount();
  const chainId = useChainId();
  const contracts = getContractAddresses(chainId);
  const contractsDeployed = isContractDeployed(chainId);
  const { getGasSettings } = useSepoliaGasEstimation();

  // Debug logging
  useEffect(() => {
    console.log('💵 USDC Contract Hook Debug:', {
      chainId,
      chainName: chainId === 11155111 ? 'Sepolia' : 'Other',
      address,
      usdcContract: contracts.usdc,
      contractsDeployed,
    });
  }, [chainId, address, contracts, contractsDeployed]);

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
      enabled: !!address && !!contracts.usdc && contractsDeployed,
      refetchInterval: 10000,
      retry: 3,
      retryDelay: 2000,
    },
  });

  const usdcBalance = balanceRaw ? formatUSDCAmount(balanceRaw) : 0;

  // Get USDC allowance for lottery contract
  const {
    data: allowanceRaw,
    isLoading: isLoadingAllowance,
    refetch: refetchAllowance,
    error: allowanceError,
  } = useReadContract({
    address: contracts.usdc,
    abi: MOCK_USDC_ABI,
    functionName: 'allowance',
    args: address ? [address, contracts.chainluckLottery] : undefined,
    query: {
      enabled:
        !!address &&
        !!contracts.usdc &&
        !!contracts.chainluckLottery &&
        contractsDeployed,
      refetchInterval: 10000,
      retry: 3,
      retryDelay: 2000,
    },
  });

  const usdcAllowance = allowanceRaw ? formatUSDCAmount(allowanceRaw) : 0;

  // =============================================================================
  // USDC APPROVAL WITH PROPER GAS HANDLING
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
      console.log('✅ USDC Approval Confirmed');
      setTimeout(() => {
        refetchAllowance();
      }, 2000);
      toast.success('✅ USDC approval successful!', {
        description: 'You can now purchase tickets',
        duration: 5000,
      });
    }
  }, [isApproveConfirmed, refetchAllowance]);

  // Handle approval errors
  useEffect(() => {
    if (approveError || approveConfirmError) {
      const error = approveError || approveConfirmError;
      console.error('❌ Approval Error:', error);

      toast.error('Approval failed', {
        description: parseContractError(error),
        duration: 6000,
      });
    }
  }, [approveError, approveConfirmError]);

  const approveUSDCForLottery = async (amount: number) => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!contractsDeployed) {
      toast.error(
        'Contracts not deployed on this network. Please switch to Sepolia.',
      );
      return;
    }

    if (chainId !== 11155111) {
      toast.error('Please switch to Sepolia testnet to use ChainLuck');
      return;
    }

    console.log('🔓 Approving USDC with Sepolia gas optimization:', {
      amount,
      address,
      chainId,
      usdcContract: contracts.usdc,
      spender: contracts.chainluckLottery,
    });

    try {
      const amountInWei = parseUSDCAmount(amount);
      const gasSettings = getGasSettings('approve');

      console.log('💰 Using Sepolia gas settings for approval:', gasSettings);

      approveUSDC({
        address: contracts.usdc,
        abi: MOCK_USDC_ABI,
        functionName: 'approve',
        args: [contracts.chainluckLottery, amountInWei],
        // CRITICAL: Add gas settings for Sepolia
        ...gasSettings,
      });
    } catch (error) {
      console.error('❌ Error approving USDC:', error);
      toast.error('Failed to initiate approval', {
        description: parseContractError(error),
      });
    }
  };

  // =============================================================================
  // FAUCET WITH PROPER GAS HANDLING
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
      console.log('✅ Faucet Confirmed');
      setTimeout(() => {
        refetchBalance();
      }, 2000);
      toast.success('🎉 Test USDC received!', {
        description: 'You received 10,000 USDC for testing',
        duration: 5000,
      });
    }
  }, [isFaucetConfirmed, refetchBalance]);

  // Handle faucet errors
  useEffect(() => {
    if (faucetError || faucetConfirmError) {
      const error = faucetError || faucetConfirmError;
      console.error('❌ Faucet Error:', error);

      toast.error('Faucet failed', {
        description: parseContractError(error),
        duration: 6000,
      });
    }
  }, [faucetError, faucetConfirmError]);

  const getTestUSDC = async () => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!contractsDeployed) {
      toast.error(
        'Contracts not deployed on this network. Please switch to Sepolia.',
      );
      return;
    }

    // Check if we're using MockUSDC (Sepolia testnet)
    if (chainId !== 11155111) {
      toast.error('Faucet only available on Sepolia testnet');
      return;
    }

    console.log('🚰 Using USDC Faucet with Sepolia gas optimization:', {
      address,
      chainId,
      usdcContract: contracts.usdc,
    });

    try {
      const gasSettings = getGasSettings('faucet');

      useFaucet({
        address: contracts.usdc,
        abi: MOCK_USDC_ABI,
        functionName: 'faucet',
        // CRITICAL: Add gas settings for Sepolia
        ...gasSettings,
      });
    } catch (error) {
      console.error('❌ Error using faucet:', error);
      toast.error('Failed to use faucet', {
        description: parseContractError(error),
      });
    }
  };

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  const hasEnoughBalance = (requiredAmount: number): boolean => {
    const sufficient = usdcBalance >= requiredAmount;
    console.log('💰 Balance Check:', {
      usdcBalance,
      requiredAmount,
      sufficient,
    });
    return sufficient;
  };

  const hasEnoughAllowance = (requiredAmount: number): boolean => {
    const sufficient = usdcAllowance >= requiredAmount;
    console.log('🔓 Allowance Check:', {
      usdcAllowance,
      requiredAmount,
      sufficient,
    });
    return sufficient;
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

    // Network status
    contractsDeployed,
    chainId,
    isSepoliaNetwork: chainId === 11155111,

    // Debug info
    debug: {
      balanceError,
      allowanceError,
      faucetError,
      contractAddress: contracts.usdc,
      lotteryAddress: contracts.chainluckLottery,
    },
  };
}

// =============================================================================
// RECENT WINNERS HOOK
// =============================================================================

export function useRecentWinners() {
  const chainId = useChainId();
  const contracts = getContractAddresses(chainId);
  const contractsDeployed = isContractDeployed(chainId);

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
    enabled: contractsDeployed,
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
