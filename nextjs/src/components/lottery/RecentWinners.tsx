// nextjs/src/components/lottery/RecentWinners.tsx

'use client';

import { Trophy, Clock, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRecentWinners } from '@/hooks/useChainLuckContract';
import { useWallet } from '@/components/providers/WalletProvider';
import { formatCurrency, LOTTERY_CONFIG } from '@/data/constants';

export function RecentWinners() {
  const { recentWinners } = useRecentWinners();
  const { chainInfo } = useWallet();

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const formatWalletAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getPrizeInfo = (prizeIndex: number) => {
    const prizeData = LOTTERY_CONFIG.GRAND_PRIZES[prizeIndex];
    if (!prizeData) return { name: 'Unknown Prize', color: 'text-gray-500' };

    const colors = [
      'text-pink-500', // $10,000
      'text-purple-500', // $5,000
      'text-red-500', // $2,000
      'text-orange-500', // $1,000
      'text-yellow-500', // $500
    ];

    return {
      name: `Grand Prize ${prizeData.amount.toLocaleString()}`,
      color: colors[prizeIndex] || 'text-gray-500',
    };
  };

  const openInExplorer = (hash: string) => {
    if (chainInfo.blockExplorer) {
      window.open(`${chainInfo.blockExplorer}/tx/${hash}`, '_blank');
    }
  };

  if (recentWinners.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span>Recent Winners</span>
            <Badge variant="outline" className="text-xs">
              Live
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-3">
            <div className="text-4xl">🎰</div>
            <div className="text-sm text-muted-foreground">
              No recent grand prize winners yet.
            </div>
            <div className="text-xs text-muted-foreground">
              Be the first to win big!
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span>Recent Winners</span>
          <Badge variant="outline" className="text-xs">
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {recentWinners.map((winner, index) => {
              const prizeInfo = getPrizeInfo(winner.prizeIndex);
              const isRecent = index < 3; // Highlight first 3 as recent

              return (
                <div
                  key={winner.id}
                  className={`
                    p-3 rounded-lg border transition-all duration-300
                    ${
                      isRecent
                        ? 'bg-primary/5 border-primary/20 shadow-sm'
                        : 'bg-muted/30 border-border'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm font-medium">
                          {formatWalletAddress(winner.walletAddress)}
                        </span>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${prizeInfo.color} bg-transparent border`}
                        >
                          {prizeInfo.name}
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeAgo(winner.winDate)}</span>
                        </span>
                        {chainInfo.blockExplorer && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 px-1 text-xs"
                            onClick={() =>
                              openInExplorer(winner.transactionHash)
                            }
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View TX
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`font-bold ${prizeInfo.color}`}>
                        {formatCurrency(winner.winAmount)}
                      </div>
                      {winner.winAmount >= 2000 && (
                        <div className="text-xs text-muted-foreground">
                          🔥 Mega Win!
                        </div>
                      )}
                      {winner.winAmount >= 1000 && winner.winAmount < 2000 && (
                        <div className="text-xs text-muted-foreground">
                          🏆 Big Win!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Footer Stats */}
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-center text-xs text-muted-foreground">
            <div>
              <div className="font-semibold text-foreground">
                {recentWinners.filter((w) => w.winAmount >= 10000).length}
              </div>
              <div>$10K+ Wins</div>
            </div>
            <div>
              <div className="font-semibold text-foreground">
                {recentWinners.filter((w) => w.winAmount >= 1000).length}
              </div>
              <div>$1K+ Wins</div>
            </div>
            <div>
              <div className="font-semibold text-foreground">
                {recentWinners.length}
              </div>
              <div>Total Recent</div>
            </div>
          </div>
        </div>

        {/* Odds Reminder */}
        <div className="mt-4 pt-4 border-t bg-muted/30 rounded-lg p-3">
          <div className="text-center space-y-2">
            <div className="text-sm font-medium">🎯 Your Chances</div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Every ticket has a chance at these grand prizes!</div>
              <div className="grid grid-cols-1 gap-1">
                {LOTTERY_CONFIG.GRAND_PRIZES.map((prize, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{formatCurrency(prize.amount)}:</span>
                    <span>1 in {prize.odds.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Loading skeleton component
export function RecentWinnersLoading() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-6 w-12" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-3 rounded-lg border space-y-2">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
