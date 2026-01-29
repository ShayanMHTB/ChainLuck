// nextjs/src/components/stats/PoolAnalytics.tsx

'use client';

import { AlertTriangle, CheckCircle, TrendingUp, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLiveStats } from '@/hooks/useChainLuckContract';
import { formatCurrency } from '@/data/constants';

export function PoolAnalytics() {
  const { stats, isLoading } = useLiveStats();

  if (isLoading || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pool Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Loading analytics...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Pool analytics calculations
  const totalPool = stats.instantPool + stats.grandPrizePool;
  const instantPoolRatio = (stats.instantPool / totalPool) * 100;
  const grandPoolRatio = (stats.grandPrizePool / totalPool) * 100;

  // Health thresholds
  const instantPoolHealth =
    stats.instantPool >= 1000
      ? 'healthy'
      : stats.instantPool >= 500
      ? 'warning'
      : 'critical';
  const grandPoolHealth =
    stats.grandPrizePool >= 5000
      ? 'healthy'
      : stats.grandPrizePool >= 2000
      ? 'warning'
      : 'critical';

  // Utilization rates
  const instantUtilization = Math.min((stats.instantPool / 2000) * 100, 100);
  const grandUtilization = Math.min((stats.grandPrizePool / 10000) * 100, 100);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <Activity className="h-5 w-5 text-blue-500" />
          <span>Pool Analytics</span>
          <Badge variant="outline" className="text-xs">
            Real-time
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pool Distribution */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Pool Distribution</h3>

          <div className="space-y-3">
            {/* Instant Pool */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getHealthIcon(instantPoolHealth)}
                  <span className="text-sm font-medium">Instant Pool</span>
                </div>
                <div className="text-right">
                  <div
                    className={`text-sm font-bold ${getHealthColor(
                      instantPoolHealth,
                    )}`}
                  >
                    {formatCurrency(stats.instantPool)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {instantPoolRatio.toFixed(1)}% of total
                  </div>
                </div>
              </div>
              <Progress value={instantUtilization} className="h-2" />
              <div className="text-xs text-muted-foreground">
                Utilization: {instantUtilization.toFixed(1)}% (Target: 100%)
              </div>
            </div>

            {/* Grand Prize Pool */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getHealthIcon(grandPoolHealth)}
                  <span className="text-sm font-medium">Grand Prize Pool</span>
                </div>
                <div className="text-right">
                  <div
                    className={`text-sm font-bold ${getHealthColor(
                      grandPoolHealth,
                    )}`}
                  >
                    {formatCurrency(stats.grandPrizePool)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {grandPoolRatio.toFixed(1)}% of total
                  </div>
                </div>
              </div>
              <Progress value={grandUtilization} className="h-2" />
              <div className="text-xs text-muted-foreground">
                Utilization: {grandUtilization.toFixed(1)}% (Target: 100%)
              </div>
            </div>
          </div>
        </div>

        {/* Health Status Summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Health Status</h3>

          <div className="grid grid-cols-1 gap-3">
            <div
              className={`p-3 rounded-lg border ${
                instantPoolHealth === 'healthy'
                  ? 'border-green-200 bg-green-50 dark:bg-green-950/20'
                  : instantPoolHealth === 'warning'
                  ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20'
                  : 'border-red-200 bg-red-50 dark:bg-red-950/20'
              }`}
            >
              <div className="flex items-center space-x-2">
                {getHealthIcon(instantPoolHealth)}
                <div>
                  <div className="text-sm font-medium">Instant Payouts</div>
                  <div className="text-xs text-muted-foreground">
                    {instantPoolHealth === 'healthy' &&
                      'Ready for all instant wins'}
                    {instantPoolHealth === 'warning' &&
                      'May delay large instant wins'}
                    {instantPoolHealth === 'critical' &&
                      'Instant wins may be queued'}
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`p-3 rounded-lg border ${
                grandPoolHealth === 'healthy'
                  ? 'border-green-200 bg-green-50 dark:bg-green-950/20'
                  : grandPoolHealth === 'warning'
                  ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20'
                  : 'border-red-200 bg-red-50 dark:bg-red-950/20'
              }`}
            >
              <div className="flex items-center space-x-2">
                {getHealthIcon(grandPoolHealth)}
                <div>
                  <div className="text-sm font-medium">Grand Prizes</div>
                  <div className="text-xs text-muted-foreground">
                    {grandPoolHealth === 'healthy' &&
                      'All grand prizes fully funded'}
                    {grandPoolHealth === 'warning' &&
                      'Some grand prizes may be reduced'}
                    {grandPoolHealth === 'critical' &&
                      'Grand prizes significantly reduced'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pool Economics */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Pool Economics</h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2 bg-muted/30 rounded">
              <div className="font-medium">Inflow Rate</div>
              <div className="text-muted-foreground">~15% from each ticket</div>
            </div>
            <div className="p-2 bg-muted/30 rounded">
              <div className="font-medium">Payout Rate</div>
              <div className="text-muted-foreground">~85% to winners</div>
            </div>
            <div className="p-2 bg-muted/30 rounded">
              <div className="font-medium">Reserve Buffer</div>
              <div className="text-muted-foreground">
                {formatCurrency(totalPool * 0.15)}
              </div>
            </div>
            <div className="p-2 bg-muted/30 rounded">
              <div className="font-medium">Safety Margin</div>
              <div className="text-muted-foreground">
                {((totalPool / 20000) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Auto-Management Info */}
        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-2">
            <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Automated Pool Management
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                Pools automatically rebalance from ticket sales. If pools run
                low, new ticket sales prioritize refilling before extracting
                platform profits.
              </div>
            </div>
          </div>
        </div>

        {/* Last Update */}
        <div className="text-center pt-3 border-t">
          <div className="text-xs text-muted-foreground">
            📊 Analytics updated every 30 seconds from smart contract
          </div>
          <div className="text-xs text-muted-foreground">
            Last update: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
