// nextjs/src/components/dashboard/UserStats.tsx

'use client';

import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Trophy,
  Target,
  Percent,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useChainLuckContract } from '@/hooks/useChainLuckContract';
import { formatCurrency, formatNumber } from '@/data/constants';

export function UserStats() {
  const { userStats, isLoadingUserStats } = useChainLuckContract();

  if (isLoadingUserStats || !userStats) {
    return <UserStatsSkeleton />;
  }

  const isProfit = userStats.netResult >= 0;
  const winRate =
    userStats.totalSpent > 0
      ? (userStats.totalWon / userStats.totalSpent) * 100
      : 0;

  const stats = [
    {
      title: 'Total Spent',
      value: formatCurrency(userStats.totalSpent),
      icon: DollarSign,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      description: 'Total amount invested in tickets',
    },
    {
      title: 'Total Won',
      value: formatCurrency(userStats.totalWon),
      icon: Trophy,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      description: 'Total winnings from all tickets',
    },
    {
      title: 'Net Result',
      value: formatCurrency(Math.abs(userStats.netResult)),
      icon: isProfit ? TrendingUp : TrendingDown,
      color: isProfit ? 'text-green-500' : 'text-red-500',
      bgColor: isProfit ? 'bg-green-500/10' : 'bg-red-500/10',
      description: isProfit ? 'Total profit' : 'Total loss',
      prefix: isProfit ? '+' : '-',
    },
    {
      title: 'Win Rate',
      value: `${winRate.toFixed(1)}%`,
      icon: Percent,
      color:
        winRate >= 100
          ? 'text-green-500'
          : winRate >= 50
          ? 'text-yellow-500'
          : 'text-red-500',
      bgColor:
        winRate >= 100
          ? 'bg-green-500/10'
          : winRate >= 50
          ? 'bg-yellow-500/10'
          : 'bg-red-500/10',
      description: 'Return on investment percentage',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Your Statistics</CardTitle>
          <Badge variant="outline">Personal Performance</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center space-y-3">
              <div
                className={`mx-auto w-16 h-16 ${stat.bgColor} rounded-full flex items-center justify-center`}
              >
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  {stat.title}
                </div>
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.prefix && <span>{stat.prefix}</span>}
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Insights */}
        <div className="mt-8 pt-6 border-t">
          <h3 className="text-lg font-semibold mb-4">Performance Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Profitability Status */}
            <div
              className={`p-4 rounded-lg border ${
                isProfit
                  ? 'border-green-200 bg-green-50 dark:bg-green-950/20'
                  : 'border-red-200 bg-red-50 dark:bg-red-950/20'
              }`}
            >
              <div className="flex items-center space-x-3">
                {isProfit ? (
                  <TrendingUp className="h-6 w-6 text-green-500" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-500" />
                )}
                <div>
                  <div className="font-medium">
                    {isProfit
                      ? "🎉 You're in Profit!"
                      : '📊 Building Experience'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {isProfit
                      ? `You've earned ${formatCurrency(
                          userStats.netResult,
                        )} profit`
                      : `Keep playing - luck can change quickly!`}
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Wins Status */}
            <div
              className={`p-4 rounded-lg border ${
                userStats.pendingWins > 0
                  ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20'
                  : 'border-gray-200 bg-gray-50 dark:bg-gray-950/20'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Target
                  className={`h-6 w-6 ${
                    userStats.pendingWins > 0
                      ? 'text-yellow-500'
                      : 'text-gray-500'
                  }`}
                />
                <div>
                  <div className="font-medium">
                    {userStats.pendingWins > 0
                      ? '💰 Pending Wins'
                      : '🎯 All Caught Up'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {userStats.pendingWins > 0
                      ? `${formatCurrency(
                          userStats.pendingWins,
                        )} ready to claim`
                      : 'No pending wins at the moment'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Win Rate Analysis */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <div className="text-center space-y-2">
            <div className="text-sm font-medium">🎯 Performance Analysis</div>
            <div className="text-xs text-muted-foreground">
              {winRate >= 100 &&
                "Excellent! You're beating the odds consistently."}
              {winRate >= 80 &&
                winRate < 100 &&
                "Great performance! You're doing well."}
              {winRate >= 60 &&
                winRate < 80 &&
                'Good returns! Keep up the momentum.'}
              {winRate >= 40 &&
                winRate < 60 &&
                'Decent performance with room for improvement.'}
              {winRate < 40 &&
                'Building experience - every ticket has a chance to win big!'}
            </div>
            <div className="text-xs text-muted-foreground">
              Remember: Every ticket guarantees a win, and grand prizes can
              change everything!
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function UserStatsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-6 w-24" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="text-center space-y-3">
              <Skeleton className="mx-auto w-16 h-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-20 mx-auto" />
                <Skeleton className="h-6 w-16 mx-auto" />
                <Skeleton className="h-3 w-24 mx-auto" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
