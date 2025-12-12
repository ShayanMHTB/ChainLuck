// nextjs/src/data/mockData.ts

import {
  LotteryStats,
  RecentWinner,
  UserStats,
  PrizePool,
  LotteryTicket,
  TicketResult,
} from '@/types/lottery';

// Mock wallet addresses for demo
const DEMO_WALLETS = [
  '0x1234...5678',
  '0xabcd...efgh',
  '0x9876...5432',
  '0xfedc...ba98',
  '0x1111...2222',
  '0x3333...4444',
  '0x5555...6666',
  '0x7777...8888',
  '0x9999...aaaa',
  '0xbbbb...cccc',
];

// Generate random wallet address for demo
export const generateMockWallet = (): string => {
  const randomIndex = Math.floor(Math.random() * DEMO_WALLETS.length);
  return DEMO_WALLETS[randomIndex];
};

// Mock lottery statistics
export const mockLotteryStats: LotteryStats = {
  totalTicketsSold: 12847,
  totalPaidOut: 89632.5,
  totalWinners: 3891,
  currentPrizePool: 15420.8,
  biggestWin: 750.0,
  activeUsers: 1247,
};

// Mock recent winners with realistic timestamps
export const mockRecentWinners: RecentWinner[] = [
  {
    id: '1',
    walletAddress: '0x1234...5678',
    winAmount: 750.0,
    winTier: 'grand',
    winDate: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    ticketCount: 20,
  },
  {
    id: '2',
    walletAddress: '0xabcd...efgh',
    winAmount: 85.5,
    winTier: 'big',
    winDate: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
    ticketCount: 10,
  },
  {
    id: '3',
    walletAddress: '0x9876...5432',
    winAmount: 23.2,
    winTier: 'medium',
    winDate: new Date(Date.now() - 1000 * 60 * 90), // 1.5 hours ago
    ticketCount: 5,
  },
  {
    id: '4',
    walletAddress: '0xfedc...ba98',
    winAmount: 4.75,
    winTier: 'small',
    winDate: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
    ticketCount: 1,
  },
  {
    id: '5',
    walletAddress: '0x1111...2222',
    winAmount: 15.8,
    winTier: 'medium',
    winDate: new Date(Date.now() - 1000 * 60 * 180), // 3 hours ago
    ticketCount: 5,
  },
  {
    id: '6',
    walletAddress: '0x3333...4444',
    winAmount: 62.4,
    winTier: 'big',
    winDate: new Date(Date.now() - 1000 * 60 * 240), // 4 hours ago
    ticketCount: 10,
  },
  {
    id: '7',
    walletAddress: '0x5555...6666',
    winAmount: 8.9,
    winTier: 'small',
    winDate: new Date(Date.now() - 1000 * 60 * 300), // 5 hours ago
    ticketCount: 1,
  },
  {
    id: '8',
    walletAddress: '0x7777...8888',
    winAmount: 340.0,
    winTier: 'grand',
    winDate: new Date(Date.now() - 1000 * 60 * 420), // 7 hours ago
    ticketCount: 20,
  },
];

// Mock user statistics for connected wallet
export const mockUserStats: UserStats = {
  walletAddress: '0x1234...5678',
  totalSpent: 125.0,
  totalWon: 89.4,
  ticketsPurchased: 25,
  biggestWin: 42.5,
  winRate: 32.5,
  referralEarnings: 16.0,
  referralCount: 4,
  joinDate: new Date('2024-12-15'),
  lastActivity: new Date(),
};

// Mock prize pools
export const mockPrizePools: PrizePool[] = [
  {
    id: 'pool-1',
    name: 'Main Prize Pool',
    currentAmount: 8945.6,
    minimumThreshold: 500.0,
    maximumPayout: 1000.0,
    isActive: true,
    lastUpdate: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
  },
  {
    id: 'pool-2',
    name: 'Medium Prize Pool',
    currentAmount: 3842.2,
    minimumThreshold: 2000.0,
    maximumPayout: 100.0,
    isActive: true,
    lastUpdate: new Date(Date.now() - 1000 * 60 * 8), // 8 minutes ago
  },
  {
    id: 'pool-3',
    name: 'Small Prize Pool',
    currentAmount: 2633.0,
    minimumThreshold: 500.0,
    maximumPayout: 25.0,
    isActive: true,
    lastUpdate: new Date(Date.now() - 1000 * 60 * 12), // 12 minutes ago
  },
];

// Function to generate mock ticket results
export const generateMockTicketResults = (
  ticketCount: number,
): TicketResult[] => {
  const results: TicketResult[] = [];

  for (let i = 0; i < ticketCount; i++) {
    const random = Math.random();
    let winAmount = 0.1; // Guaranteed minimum
    let winTier: TicketResult['winTier'] = 'guaranteed';

    // Simulate win probabilities based on your game mechanics
    if (random < 0.001) {
      // 0.1% Grand Prize
      winAmount = 500 + Math.random() * 500; // $500-1000
      winTier = 'grand';
    } else if (random < 0.006) {
      // 0.5% Big Win
      winAmount = 50 + Math.random() * 50; // $50-100
      winTier = 'big';
    } else if (random < 0.036) {
      // 3% Medium Win
      winAmount = 10 + Math.random() * 15; // $10-25
      winTier = 'medium';
    } else if (random < 0.186) {
      // 15% Small Win
      winAmount = 1 + Math.random() * 4; // $1-5
      winTier = 'small';
    }

    results.push({
      ticketNumber: i + 1,
      winAmount: Math.round(winAmount * 100) / 100, // Round to 2 decimal places
      winTier,
      isInstantWin: winAmount < 50, // Big wins require VRF, so not instant
    });
  }

  return results;
};

// Function to generate mock recent winner in real-time
export const generateLiveWinner = (): RecentWinner => {
  const random = Math.random();
  let winAmount: number;
  let winTier: RecentWinner['winTier'];
  let ticketCount: number;

  if (random < 0.02) {
    // 2% chance of big win for demo excitement
    winAmount = 50 + Math.random() * 450; // $50-500
    winTier = random < 0.005 ? 'grand' : 'big';
    ticketCount = Math.floor(Math.random() * 15) + 5; // 5-20 tickets
  } else if (random < 0.1) {
    // 8% medium win
    winAmount = 10 + Math.random() * 15; // $10-25
    winTier = 'medium';
    ticketCount = Math.floor(Math.random() * 8) + 2; // 2-10 tickets
  } else {
    // Small win
    winAmount = 1 + Math.random() * 4; // $1-5
    winTier = 'small';
    ticketCount = Math.floor(Math.random() * 3) + 1; // 1-4 tickets
  }

  return {
    id: `live-${Date.now()}`,
    walletAddress: generateMockWallet(),
    winAmount: Math.round(winAmount * 100) / 100,
    winTier,
    winDate: new Date(),
    ticketCount,
  };
};

// Mock transaction simulation
export const simulatePurchase = async (
  ticketCount: number,
  walletAddress: string,
): Promise<{ success: boolean; results?: TicketResult[]; error?: string }> => {
  // Simulate network delay
  await new Promise((resolve) =>
    setTimeout(resolve, 2000 + Math.random() * 3000),
  );

  // 95% success rate for demo
  if (Math.random() < 0.95) {
    const results = generateMockTicketResults(ticketCount);
    return { success: true, results };
  } else {
    return {
      success: false,
      error: 'Transaction failed. Please try again.',
    };
  }
};
