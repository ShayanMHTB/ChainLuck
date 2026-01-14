// nextjs/src/components/lottery/Results/PendingWins.tsx

'use client';

import { Wallet, Clock, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useChainLuckContract } from '@/hooks/useChainLuckContract';
import { useWallet } from '@/components/providers/WalletProvider';
import { formatCurrency } from '@/data/constants';

export function PendingWins() {
  const { isConnected } = useWallet();
  const { userStats, claimPendingWins, isClaiming } = useChainLuckContract();

  if (!isConnected || !userStats) {
    return null;
  }

  const hasPendingWins = userStats.pendingWins > 0;

  return (
    <Card
      className={
        hasPendingWins
          ? 'border-green-200 bg-green-50/50 dark:bg-green-950/20'
          : ''
      }
    >
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <Wallet className="h-5 w-5 text-green-500" />
          <span>Your Pending Wins</span>
          {hasPendingWins && (
            <Badge variant="secondary" className="text-green-600 bg-green-100">
              Ready to Claim
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasPendingWins ? (
          <div className="space-y-4">
            {/* Pending Amount */}
            <div className="text-center p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-200">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(userStats.pendingWins)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Available to withdraw
                </div>
              </div>
            </div>

            {/* Claim Button */}
            <Button
              onClick={claimPendingWins}
              disabled={isClaiming}
              className="w-full h-12 text-base"
              size="lg"
            >
              {isClaiming ? (
                <>
                  <Clock className="mr-2 h-5 w-5 animate-spin" />
                  Claiming Wins...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Claim {formatCurrency(userStats.pendingWins)}
                </>
              )}
            </Button>

            {/* Additional Info */}
            <div className="text-center space-y-2">
              <div className="text-xs text-muted-foreground">
                🎉 Congratulations on your wins!
              </div>
              <div className="text-xs text-muted-foreground">
                💰 Funds will be transferred directly to your wallet
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 space-y-3">
            <div className="text-4xl">💼</div>
            <div className="text-sm text-muted-foreground">
              No pending wins at the moment
            </div>
            <div className="text-xs text-muted-foreground">
              Wins appear here after ticket purchases
            </div>
          </div>
        )}

        {/* User Stats Summary */}
        <div className="mt-6 pt-4 border-t grid grid-cols-3 gap-4 text-center text-xs">
          <div>
            <div className="font-semibold text-foreground">
              {formatCurrency(userStats.totalSpent)}
            </div>
            <div className="text-muted-foreground">Total Spent</div>
          </div>
          <div>
            <div className="font-semibold text-foreground">
              {formatCurrency(userStats.totalWon)}
            </div>
            <div className="text-muted-foreground">Total Won</div>
          </div>
          <div>
            <div
              className={`font-semibold ${
                userStats.netResult >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {userStats.netResult >= 0 ? '+' : ''}
              {formatCurrency(userStats.netResult)}
            </div>
            <div className="text-muted-foreground">Net Result</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
