// nextjs/src/components/dashboard/ReferralPanel.tsx

'use client';

import { useState } from 'react';
import { Users, Copy, Check, Gift, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useChainLuckContract } from '@/hooks/useChainLuckContract';
import { useWallet } from '@/components/providers/WalletProvider';
import { formatCurrency } from '@/data/constants';

export function ReferralPanel() {
  const { address } = useWallet();
  const { userStats } = useChainLuckContract();
  const [copied, setCopied] = useState(false);

  // Mock referral data - replace with real contract data
  const referralStats = {
    totalEarned: 16.0, // $4 per successful referral
    successfulReferrals: 4,
    pendingReferrals: 1,
    maxReferrals: 5,
    unlocked: userStats && userStats.totalSpent >= 10, // Need $10+ spent to unlock
  };

  const referralLink = address
    ? `${
        typeof window !== 'undefined'
          ? window.location.origin
          : 'https://chainluck.com'
      }?ref=${address}`
    : '';

  const progressPercentage = userStats
    ? Math.min((userStats.totalSpent / 10) * 100, 100)
    : 0;

  const copyReferralLink = async () => {
    if (referralLink) {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <Users className="h-5 w-5 text-purple-500" />
          <span>Referral Rewards</span>
          {referralStats.unlocked ? (
            <Badge variant="secondary" className="text-green-600 bg-green-100">
              Unlocked
            </Badge>
          ) : (
            <Badge variant="outline">
              <Lock className="h-3 w-3 mr-1" />
              Locked
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {referralStats.unlocked ? (
          <>
            {/* Referral Stats */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  {formatCurrency(referralStats.totalEarned)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Total Earned
                </div>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  {referralStats.successfulReferrals}/
                  {referralStats.maxReferrals}
                </div>
                <div className="text-xs text-muted-foreground">
                  Referrals Used
                </div>
              </div>
            </div>

            {/* Referral Link */}
            <div className="space-y-3">
              <div className="text-sm font-medium">Your Referral Link</div>
              <div className="flex space-x-2">
                <Input
                  value={referralLink}
                  readOnly
                  className="text-xs font-mono"
                />
                <Button
                  onClick={copyReferralLink}
                  variant="outline"
                  size="sm"
                  className="px-3"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                Share this link to earn $4 per successful referral
              </div>
            </div>

            {/* How It Works */}
            <div className="space-y-3">
              <div className="text-sm font-medium">How Referrals Work</div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-start space-x-2">
                  <span className="text-purple-500 mt-1">1.</span>
                  <span>Share your referral link with friends</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-purple-500 mt-1">2.</span>
                  <span>They connect wallet and spend $10+ on tickets</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-purple-500 mt-1">3.</span>
                  <span>You receive $4 instantly to your wallet</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-purple-500 mt-1">4.</span>
                  <span>Maximum 5 referrals per account</span>
                </div>
              </div>
            </div>

            {/* Pending Referrals */}
            {referralStats.pendingReferrals > 0 && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-2 text-sm">
                  <Gift className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium">Pending Referrals</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {referralStats.pendingReferrals} friend(s) connected but
                  haven't spent $10+ yet
                </div>
              </div>
            )}

            {/* Remaining Slots */}
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-sm font-medium">
                {referralStats.maxReferrals - referralStats.successfulReferrals}{' '}
                slots remaining
              </div>
              <div className="text-xs text-muted-foreground">
                Earn up to{' '}
                {formatCurrency(
                  (referralStats.maxReferrals -
                    referralStats.successfulReferrals) *
                    4,
                )}{' '}
                more
              </div>
            </div>
          </>
        ) : (
          // Locked State
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Lock className="h-8 w-8 text-gray-400" />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Unlock Referral Rewards</div>
              <div className="text-xs text-muted-foreground">
                Spend $10+ on tickets to unlock the referral system
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Progress</span>
                <span>
                  {formatCurrency(userStats?.totalSpent || 0)} / $10.00
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {formatCurrency(Math.max(0, 10 - (userStats?.totalSpent || 0)))}{' '}
                more to unlock
              </div>
            </div>

            {/* Benefits Preview */}
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="text-xs text-muted-foreground space-y-1">
                <div>🎁 Earn $4 per successful referral</div>
                <div>👥 Refer up to 5 friends</div>
                <div>⚡ Instant rewards to your wallet</div>
                <div>🔄 Renewable monthly limits</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
