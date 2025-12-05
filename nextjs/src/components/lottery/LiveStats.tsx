// nextjs/src/components/lottery/LiveStats.tsx

'use client';

import { TrendingUp, Users, DollarSign, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useLiveStats } from '@/hooks/useChainLuckContract';
import { formatCurrency, formatNumber } from '@/data/constants';

export function LiveStats() {
  const { stats, isLoading, recentWinners } = useLiveStats();

  if (isLoading || !stats) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Live Indicator */}
      <div className="flex items-center justify-center space-x-2">
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-sm font-medium text-muted-foreground">
          LIVE STATS
        </span>
        <Badge variant="outline" className="text-xs">
          Real-time from blockchain
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Prize Pool */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span>Prize Pool</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.grandPrizePool)}
              </div>
              <div className="text-xs text-muted-foreground">
                Grand prizes available
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instant Pool */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span>Instant Pool</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(stats.instantPool)}
              </div>
              <div className="text-xs text-muted-foreground">
                Available for payouts
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span>Total Revenue</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-yellow-600">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <div className="text-xs text-muted-foreground">All time</div>
            </div>
          </CardContent>
        </Card>

        {/* Tickets Sold */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-500" />
              <span>Tickets Sold</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-purple-600">
                {formatNumber(stats.totalTicketsSold)}
              </div>
              <div className="text-xs text-muted-foreground">Total tickets</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contract Balance Highlight */}
      <Card className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <div className="text-sm text-muted-foreground">
              💼 Total Contract Balance
            </div>
            <div className="text-3xl font-bold text-primary">
              {formatCurrency(stats.contractBalance)}
            </div>
            <div className="text-xs text-muted-foreground">
              Fully secured on-chain
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Biggest Win Section */}
      {stats.biggestWin > 0 && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-sm text-muted-foreground">
                🏆 Biggest Recent Win
              </div>
              <div className="text-3xl font-bold text-yellow-600">
                {formatCurrency(stats.biggestWin)}
              </div>
              <div className="text-xs text-muted-foreground">
                Could be you next!
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Winners Count */}
      {recentWinners.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-sm text-muted-foreground">
                🎉 Recent Grand Prize Winners
              </div>
              <div className="text-2xl font-bold text-green-600">
                {recentWinners.length}
              </div>
              <div className="text-xs text-muted-foreground">
                In the last session
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats Bar */}
      <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center space-x-1">
          <span>🎟️</span>
          <span>{formatNumber(stats.totalTicketsSold)} tickets sold</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>⚡</span>
          <span>Instant guaranteed wins</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>🔒</span>
          <span>100% on-chain verified</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>🎯</span>
          <span>Smart contract randomness</span>
        </div>
      </div>

      {/* Pool Health Indicators */}
      <div className="grid grid-cols-2 gap-4 text-center text-xs">
        <div className="space-y-1">
          <div
            className={`font-semibold ${
              stats.instantPool >= 1000 ? 'text-green-600' : 'text-orange-600'
            }`}
          >
            Instant Pool Health
          </div>
          <div className="text-muted-foreground">
            {stats.instantPool >= 1000 ? '✅ Healthy' : '⚠️ Low'}
          </div>
        </div>
        <div className="space-y-1">
          <div
            className={`font-semibold ${
              stats.grandPrizePool >= 5000
                ? 'text-green-600'
                : 'text-orange-600'
            }`}
          >
            Grand Prize Pool Health
          </div>
          <div className="text-muted-foreground">
            {stats.grandPrizePool >= 5000 ? '✅ Healthy' : '⚠️ Low'}
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Live Indicator Skeleton */}
      <div className="flex items-center justify-center space-x-2">
        <Skeleton className="h-2 w-2 rounded-full" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-24" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Balance Card Skeleton */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <Skeleton className="h-4 w-32 mx-auto" />
            <Skeleton className="h-10 w-40 mx-auto" />
            <Skeleton className="h-3 w-24 mx-auto" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
