// nextjs/src/types/user.ts

export interface UserPreferences {
  language: 'en' | 'fa';
  theme: 'light' | 'dark' | 'system';
  currency: 'USD';
  notifications: {
    winAlerts: boolean;
    newFeatures: boolean;
    referralUpdates: boolean;
  };
}

export interface UserStats {
  walletAddress: string;
  totalSpent: number;
  totalWon: number;
  pendingWins: number;
  netResult: number;
  ticketsPurchased: number;
  biggestWin: number;
  winRate: number;
  referralEarnings: number;
  referralCount: number;
  joinDate: Date;
  lastActivity: Date;
}

export interface UserState {
  // Wallet connection
  isConnected: boolean;
  walletAddress?: string;

  // User preferences (persisted)
  preferences: UserPreferences;

  // Authentication state
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;

  // User statistics (from blockchain)
  stats?: UserStats;

  // UI state
  isLoading: boolean;
  error?: string;
}

export interface UserContextType extends UserState {
  // Actions
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  markOnboardingComplete: () => void;
  refreshUserStats: () => void;
  clearUserData: () => void;

  // Computed properties
  canAccessDashboard: boolean;
  canAccessReferrals: boolean;
  hasUnclaimedWins: boolean;
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  language: 'en',
  theme: 'system',
  currency: 'USD',
  notifications: {
    winAlerts: true,
    newFeatures: true,
    referralUpdates: true,
  },
};

export const STORAGE_KEYS = {
  USER_PREFERENCES: 'chainluck_user_preferences',
  ONBOARDING_COMPLETE: 'chainluck_onboarding_complete',
  LAST_WALLET_ADDRESS: 'chainluck_last_wallet',
} as const;
