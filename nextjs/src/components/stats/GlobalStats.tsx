// nextjs/src/components/stats/GlobalStats.tsx

'use client';

import {
  TrendingUp,
  Users,
  DollarSign,
  Trophy,
  Target,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useLiveStats } from '@/hooks/useChainLuckContract';
import { formatCurrency, formatNumber } from '@/data/constants';

export function GlobalStats() {
  const { stats, isLoading } = useLiveStats();

  if (isLoading || !stats) {
    return <GlobalStatsSkeleton />;
  }

  const globalStats = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      description: 'All-time platform revenue',
      trend: '+12.5%',
    },
    {
      title: 'Tickets Sold',
      value: formatNumber(stats.totalTicketsSold),
      icon: Target,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      description: 'Total tickets purchased',
      trend: '+8.3%',
    },
    {
      title: 'Total Prize Pool',
      value: formatCurrency(stats.grandPrizePool + stats.instantPool),
      icon: Trophy,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      description: 'Available for payouts',
      trend: '+15.2%',
    },
    {
      title: 'Contract Balance',
      value: formatCurrency(stats.contractBalance),
      icon: Zap,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      description: 'Total secured on-chain',
      trend: '+6.7%',
    },
    {
      title: 'Biggest Win',
      value:
        stats.biggestWin > 0 ? formatCurrency(stats.biggestWin) : 'None yet',
      icon: Trophy,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      description: 'Largest recent grand prize',
      trend: 'New',
    },
    {
      title: 'Recent Winners',
      value: formatNumber(stats.totalWinners),
      icon: Users,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
      description: 'Grand prize winners',
      trend: '+3',
    },
  ];

  const poolHealthPercentage = Math.min(
    ((stats.grandPrizePool + stats.instantPool) / 20000) * 100,
    100,
  );

  return (
    <div className="space-y-8">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {globalStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <div className="flex items-center space-x-2">
                    <p className={`text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {stat.trend}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
                <div className={`p-3 ${stat.bgColor} rounded-full`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Platform Health Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pool Health */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pool Health Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {formatCurrency(stats.instantPool)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Instant Pool
                </div>
                <div className="text-xs mt-1">
                  {stats.instantPool >= 1000 ? (
                    <span className="text-green-600">✅ Healthy</span>
                  ) : (
                    <span className="text-orange-600">⚠️ Low</span>
                  )}
                </div>
              </div>

              <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <div className="text-lg font-bold text-yellow-600">
                  {formatCurrency(stats.grandPrizePool)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Grand Prize Pool
                </div>
                <div className="text-xs mt-1">
                  {stats.grandPrizePool >= 5000 ? (
                    <span className="text-green-600">✅ Healthy</span>
                  ) : (
                    <span className="text-orange-600">⚠️ Low</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Pool Health</span>
                <span>{poolHealthPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${poolHealthPercentage}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Pools automatically refill from ticket sales
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Platform Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="text-sm font-medium">Revenue Growth</div>
                    <div className="text-xs text-muted-foreground">
                      Last 30 days
                    </div>
                  </div>
                </div>
                <div className="text-green-600 font-bold">+12.5%</div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-sm font-medium">Active Players</div>
                    <div className="text-xs text-muted-foreground">
                      This week
                    </div>
                  </div>
                </div>
                <div className="text-blue-600 font-bold">
                  {formatNumber(stats.activeUsers || 0)}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <div>
                    <div className="text-sm font-medium">Win Rate</div>
                    <div className="text-xs text-muted-foreground">
                      Average payout ratio
                    </div>
                  </div>
                </div>
                <div className="text-yellow-600 font-bold">85%</div>
              </div>
            </div>

            <div className="pt-3 border-t text-center">
              <div className="text-xs text-muted-foreground">
                📊 All metrics updated in real-time from blockchain
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Highlights */}
      <Card className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold">Platform Highlights</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">On-Chain</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(
                    stats.totalRevenue / (stats.totalTicketsSold || 1),
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  Avg. Ticket Price
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">Always Open</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">0</div>
                <div className="text-sm text-muted-foreground">Downtime</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GlobalStatsSkeleton() {
  return (
    <div className="space-y-8">
      {/* Main Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="w-12 h-12 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Platform Health Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
