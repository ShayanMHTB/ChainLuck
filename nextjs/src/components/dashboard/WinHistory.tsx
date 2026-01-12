// nextjs/src/components/dashboard/WinHistory.tsx

'use client';

import { useState } from 'react';
import { Clock, ExternalLink, Trophy, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWallet } from '@/components/providers/WalletProvider';
import { formatCurrency } from '@/data/constants';

// Mock win history data - replace with real data from contract events
const mockWinHistory = [
  {
    id: '1',
    date: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    ticketCount: 5,
    totalSpent: 17.5,
    totalWon: 0.875, // Guaranteed win
    grandPrizes: [],
    txHash: '0x1234...5678',
    status: 'claimed',
  },
  {
    id: '2',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    ticketCount: 10,
    totalSpent: 35.0,
    totalWon: 502.625, // Guaranteed + grand prize
    grandPrizes: [{ amount: 500, tier: '$500 Grand Prize' }],
    txHash: '0xabcd...efgh',
    status: 'claimed',
  },
  {
    id: '3',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    ticketCount: 1,
    totalSpent: 3.5,
    totalWon: 0.175,
    grandPrizes: [],
    txHash: '0x9876...5432',
    status: 'claimed',
  },
];

type FilterType = 'all' | 'wins' | 'big-wins';

export function WinHistory() {
  const { chainInfo } = useWallet();
  const [filter, setFilter] = useState<FilterType>('all');

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const openInExplorer = (txHash: string) => {
    if (chainInfo.blockExplorer) {
      window.open(`${chainInfo.blockExplorer}/tx/${txHash}`, '_blank');
    }
  };

  const filteredHistory = mockWinHistory.filter((entry) => {
    switch (filter) {
      case 'wins':
        return entry.totalWon > entry.totalSpent;
      case 'big-wins':
        return entry.grandPrizes.length > 0;
      default:
        return true;
    }
  });

  const totalWins = mockWinHistory.length;
  const profitableWins = mockWinHistory.filter(
    (entry) => entry.totalWon > entry.totalSpent,
  ).length;
  const grandPrizeWins = mockWinHistory.filter(
    (entry) => entry.grandPrizes.length > 0,
  ).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl flex items-center space-x-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <span>Win History</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select
              value={filter}
              onValueChange={(value: FilterType) => setFilter(value)}
            >
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plays</SelectItem>
                <SelectItem value="wins">Profitable</SelectItem>
                <SelectItem value="big-wins">Grand Prizes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-lg font-bold">{totalWins}</div>
            <div className="text-xs text-muted-foreground">Total Plays</div>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-lg font-bold text-green-600">
              {profitableWins}
            </div>
            <div className="text-xs text-muted-foreground">Profitable</div>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-lg font-bold text-yellow-600">
              {grandPrizeWins}
            </div>
            <div className="text-xs text-muted-foreground">Grand Prizes</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredHistory.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <div className="text-4xl">📊</div>
            <div className="text-sm text-muted-foreground">
              {filter === 'all' && 'No ticket history yet'}
              {filter === 'wins' && 'No profitable plays yet'}
              {filter === 'big-wins' && 'No grand prizes yet'}
            </div>
            <div className="text-xs text-muted-foreground">
              Start playing to build your history!
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {filteredHistory.map((entry) => {
                const isProfit = entry.totalWon > entry.totalSpent;
                const hasGrandPrize = entry.grandPrizes.length > 0;

                return (
                  <div
                    key={entry.id}
                    className={`p-4 rounded-lg border transition-all ${
                      hasGrandPrize
                        ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20'
                        : isProfit
                        ? 'border-green-200 bg-green-50 dark:bg-green-950/20'
                        : 'border-border bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="text-sm font-medium">
                          {entry.ticketCount} Ticket
                          {entry.ticketCount > 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeAgo(entry.date)}</span>
                        </div>
                        {hasGrandPrize && (
                          <Badge
                            variant="secondary"
                            className="text-yellow-600 bg-yellow-100"
                          >
                            🏆 Grand Prize
                          </Badge>
                        )}
                        {isProfit && !hasGrandPrize && (
                          <Badge
                            variant="secondary"
                            className="text-green-600 bg-green-100"
                          >
                            ✅ Profit
                          </Badge>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openInExplorer(entry.txHash)}
                        className="h-6 px-2"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Financial Summary */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Spent</div>
                        <div className="font-medium">
                          {formatCurrency(entry.totalSpent)}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Won</div>
                        <div className="font-medium text-green-600">
                          {formatCurrency(entry.totalWon)}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Net</div>
                        <div
                          className={`font-medium ${
                            isProfit ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {isProfit ? '+' : ''}
                          {formatCurrency(entry.totalWon - entry.totalSpent)}
                        </div>
                      </div>
                    </div>

                    {/* Grand Prize Details */}
                    {hasGrandPrize && (
                      <div className="mt-3 pt-3 border-t border-yellow-200">
                        <div className="text-xs text-muted-foreground mb-2">
                          Grand Prizes Won:
                        </div>
                        {entry.grandPrizes.map((prize, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 text-sm"
                          >
                            <span className="text-yellow-600">🏆</span>
                            <span className="font-medium">{prize.tier}</span>
                            <span className="text-yellow-600 font-bold">
                              {formatCurrency(prize.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Transaction Hash */}
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Transaction:
                        </span>
                        <span className="font-mono text-muted-foreground">
                          {entry.txHash.slice(0, 10)}...{entry.txHash.slice(-8)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* Footer Note */}
        <div className="mt-6 pt-4 border-t text-center">
          <div className="text-xs text-muted-foreground">
            📊 History shows your last 50 transactions • All data from
            blockchain
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
