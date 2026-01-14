// nextjs/src/components/lottery/Stats/LiveFeed.tsx

'use client';

import { Clock, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRecentWinners } from '@/hooks/useChainLuckContract';
import { formatCurrency } from '@/data/constants';

export function LiveFeed() {
  const { recentWinners } = useRecentWinners();

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          <span>Live Activity</span>
          <Badge variant="outline" className="text-xs">
            Real-time
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentWinners.length === 0 ? (
          <div className="text-center py-6 space-y-3">
            <div className="text-3xl">🎲</div>
            <div className="text-sm text-muted-foreground">
              No recent grand prizes yet
            </div>
            <div className="text-xs text-muted-foreground">
              Be the first to win big!
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[200px]">
            <div className="space-y-3">
              {recentWinners.slice(0, 5).map((winner, index) => (
                <div
                  key={winner.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                >
                  <div className="space-y-1">
                    <div className="font-mono text-sm">
                      {formatWalletAddress(winner.user)}
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimeAgo(winner.timestamp)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {formatCurrency(winner.amount)}
                    </div>
                    {winner.amount >= 2000 && (
                      <div className="text-xs text-orange-500">🔥 Mega!</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Activity Footer */}
        <div className="mt-4 pt-4 border-t text-center">
          <div className="text-xs text-muted-foreground">
            ⚡ Updates automatically when new grand prizes are won
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
