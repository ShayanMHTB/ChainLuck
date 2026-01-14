// nextjs/src/components/lottery/Stats/HeroStats.tsx

'use client';

import { TrendingUp, Users, DollarSign, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLiveStats } from '@/hooks/useChainLuckContract';
import { formatCurrency, formatNumber } from '@/data/constants';

export function HeroStats() {
  const { stats, isLoading } = useLiveStats();

  if (isLoading || !stats) {
    return <HeroStatsSkeleton />;
  }

  const heroStats = [
    {
      icon: DollarSign,
      label: 'Total Prize Pool',
      value: formatCurrency(stats.grandPrizePool + stats.instantPool),
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: Trophy,
      label: 'Biggest Recent Win',
      value:
        stats.biggestWin > 0 ? formatCurrency(stats.biggestWin) : 'None yet',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      icon: TrendingUp,
      label: 'Tickets Sold',
      value: formatNumber(stats.totalTicketsSold),
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Users,
      label: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {heroStats.map((stat, index) => (
        <Card key={index} className="text-center">
          <CardContent className="pt-6 pb-4">
            <div className="space-y-3">
              <div
                className={`mx-auto w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center`}
              >
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <div className={`text-xl lg:text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function HeroStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[...Array(4)].map((_, index) => (
        <Card key={index} className="text-center">
          <CardContent className="pt-6 pb-4">
            <div className="space-y-3">
              <Skeleton className="mx-auto w-12 h-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-16 mx-auto" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
