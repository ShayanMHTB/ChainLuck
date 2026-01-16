// nextjs/src/components/providers/UserProvider.tsx

'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useWallet } from './WalletProvider';
import { useChainLuckContract } from '@/hooks/useChainLuckContract';
import {
  UserContextType,
  UserState,
  UserPreferences,
  DEFAULT_USER_PREFERENCES,
  STORAGE_KEYS,
} from '@/types/user';

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const { isConnected, address } = useWallet();
  const { userStats, isLoadingUserStats } = useChainLuckContract();

  // User state
  const [preferences, setPreferences] = useState<UserPreferences>(
    DEFAULT_USER_PREFERENCES,
  );
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  // Initialize user data on mount and wallet connection
  useEffect(() => {
    initializeUserData();
  }, []);

  // Update user state when wallet connection changes
  useEffect(() => {
    if (isConnected && address) {
      handleWalletConnected(address);
    } else {
      handleWalletDisconnected();
    }
  }, [isConnected, address]);

  // Initialize user data from localStorage
  const initializeUserData = () => {
    try {
      setIsLoading(true);

      // Load user preferences
      const storedPreferences = localStorage.getItem(
        STORAGE_KEYS.USER_PREFERENCES,
      );
      if (storedPreferences) {
        const parsed = JSON.parse(storedPreferences);
        setPreferences({ ...DEFAULT_USER_PREFERENCES, ...parsed });
      }

      // Load onboarding status
      const onboardingComplete = localStorage.getItem(
        STORAGE_KEYS.ONBOARDING_COMPLETE,
      );
      setHasCompletedOnboarding(onboardingComplete === 'true');
    } catch (error) {
      console.error('Error initializing user data:', error);
      setError('Failed to load user preferences');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle wallet connection
  const handleWalletConnected = (walletAddress: string) => {
    try {
      // Store last connected wallet
      localStorage.setItem(STORAGE_KEYS.LAST_WALLET_ADDRESS, walletAddress);

      // Clear any previous errors
      setError(undefined);
    } catch (error) {
      console.error('Error handling wallet connection:', error);
      setError('Failed to save wallet connection');
    }
  };

  // Handle wallet disconnection
  const handleWalletDisconnected = () => {
    // Keep preferences but clear wallet-specific data
    // Note: We don't clear preferences on disconnect
  };

  // Update user preferences
  const updatePreferences = (newPreferences: Partial<UserPreferences>) => {
    try {
      const updatedPreferences = { ...preferences, ...newPreferences };
      setPreferences(updatedPreferences);

      // Persist to localStorage
      localStorage.setItem(
        STORAGE_KEYS.USER_PREFERENCES,
        JSON.stringify(updatedPreferences),
      );
    } catch (error) {
      console.error('Error updating preferences:', error);
      setError('Failed to save preferences');
    }
  };

  // Mark onboarding as complete
  const markOnboardingComplete = () => {
    try {
      setHasCompletedOnboarding(true);
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
    } catch (error) {
      console.error('Error marking onboarding complete:', error);
      setError('Failed to save onboarding status');
    }
  };

  // Refresh user stats (triggers refetch from contract)
  const refreshUserStats = () => {
    // This is handled by TanStack Query in the useChainLuckContract hook
    // The data will automatically update when the query refetches
  };

  // Clear user data (on logout/disconnect)
  const clearUserData = () => {
    try {
      // Keep preferences but clear sensitive data
      localStorage.removeItem(STORAGE_KEYS.LAST_WALLET_ADDRESS);
      setError(undefined);
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  };

  // Computed properties
  const canAccessDashboard = isConnected && !!address;
  const canAccessReferrals =
    canAccessDashboard && userStats && userStats.totalSpent >= 10;
  const hasUnclaimedWins = userStats && userStats.pendingWins > 0;

  // Build user state
  const userState: UserState = {
    isConnected,
    walletAddress: address,
    preferences,
    isAuthenticated: isConnected && !!address,
    hasCompletedOnboarding,
    stats: userStats
      ? {
          walletAddress: address!,
          totalSpent: userStats.totalSpent,
          totalWon: userStats.totalWon,
          pendingWins: userStats.pendingWins,
          netResult: userStats.netResult,
          ticketsPurchased: 0, // TODO: Calculate from contract events
          biggestWin: 0, // TODO: Calculate from contract events
          winRate:
            userStats.totalSpent > 0
              ? (userStats.totalWon / userStats.totalSpent) * 100
              : 0,
          referralEarnings: 0, // TODO: Add referral tracking
          referralCount: 0, // TODO: Add referral tracking
          joinDate: new Date(), // TODO: Track first transaction date
          lastActivity: new Date(),
        }
      : undefined,
    isLoading: isLoading || isLoadingUserStats,
    error,
  };

  const contextValue: UserContextType = {
    ...userState,
    updatePreferences,
    markOnboardingComplete,
    refreshUserStats,
    clearUserData,
    canAccessDashboard,
    canAccessReferrals,
    hasUnclaimedWins: !!hasUnclaimedWins,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
}

// Custom hook to use user context
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
