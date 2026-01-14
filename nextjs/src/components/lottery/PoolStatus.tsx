// nextjs/src/components/lottery/Stats/PoolStatus.tsx

'use client';

import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLiveStats } from '@/hooks/useChainLuckContract';
import { formatCurrency } from '@/data/constants';

export function PoolStatus() {
  const { stats, isLoading } = useLiveStats();

  if (isLoading || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Pool Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const instantPoolHealth = stats.instantPool >= 1000 ? 'healthy' : 'low';
  const grandPoolHealth = stats.grandPrizePool >= 5000 ? 'healthy' : 'low';

  const instantPoolPercentage = Math.min((stats.instantPool / 2000) * 100, 100);
  const grandPoolPercentage = Math.min(
    (stats.grandPrizePool / 10000) * 100,
    100,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <Shield className="h-5 w-5 text-blue-500" />
          <span>Pool Status</span>
          <Badge variant="outline" className="text-xs">
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Instant Pool */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Instant Pool</span>
            <div className="flex items-center space-x-2">
              {instantPoolHealth === 'healthy' ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              )}
              <span className="text-sm font-bold">
                {formatCurrency(stats.instantPool)}
              </span>
            </div>
          </div>
          <Progress value={instantPoolPercentage} className="h-2" />
          <div className="text-xs text-muted-foreground">
            {instantPoolHealth === 'healthy'
              ? '✅ Healthy - Ready for instant payouts'
              : '⚠️ Low - Instant payouts may be delayed'}
          </div>
        </div>

        {/* Grand Prize Pool */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Grand Prize Pool</span>
            <div className="flex items-center space-x-2">
              {grandPoolHealth === 'healthy' ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              )}
              <span className="text-sm font-bold">
                {formatCurrency(stats.grandPrizePool)}
              </span>
            </div>
          </div>
          <Progress value={grandPoolPercentage} className="h-2" />
          <div className="text-xs text-muted-foreground">
            {grandPoolHealth === 'healthy'
              ? '🏆 Healthy - Grand prizes fully funded'
              : '⚠️ Low - Grand prizes may be reduced'}
          </div>
        </div>

        {/* Total Pool Summary */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Available</span>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(stats.instantPool + stats.grandPrizePool)}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            🔒 Secured on-chain in smart contract
          </div>
        </div>

        {/* Health Indicator */}
        <div className="text-center p-3 rounded-lg bg-muted/30">
          <div className="text-sm font-medium">
            {instantPoolHealth === 'healthy' &&
            grandPoolHealth === 'healthy' ? (
              <span className="text-green-600">🟢 All Systems Healthy</span>
            ) : (
              <span className="text-orange-600">🟡 Monitoring Pool Levels</span>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Pools refill automatically from ticket sales
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
