// nextjs/src/components/lottery/DebugPanel.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCw, Zap } from 'lucide-react';
import {
  useChainLuckContract,
  useUSDCContract,
} from '@/hooks/useChainLuckContract';
import { useWallet } from '@/components/providers/WalletProvider';
import { formatCurrency } from '@/data/constants';
import { directTxClient } from '@/lib/viemClient';
import { toast } from 'sonner';

export function DebugPanel() {
  const { isConnected, address } = useWallet();
  const { contractStats, userStats, refetchStats, refetchUserStats } =
    useChainLuckContract();
  const {
    usdcBalance,
    usdcAllowance,
    getTestUSDC,
    isFauceting,
    approveUSDCForLottery,
    isApproving,
    refetchBalance,
    refetchAllowance,
    contracts,
    debug,
  } = useUSDCContract();

  const [debugInfo, setDebugInfo] = useState<string>('');
  const [isDirectTxLoading, setIsDirectTxLoading] = useState(false);

  const logDebugInfo = (info: string) => {
    console.log('🐛 Debug:', info);
    setDebugInfo(
      (prev) => prev + '\n' + new Date().toLocaleTimeString() + ': ' + info,
    );
  };

  const handleFaucet = async () => {
    logDebugInfo('Attempting to use USDC faucet...');
    await getTestUSDC();
  };

  const handleApprove = async () => {
    logDebugInfo('Attempting to approve $1000 USDC...');
    await approveUSDCForLottery(1000);
  };

  const handleRefresh = () => {
    logDebugInfo('Refreshing balances...');
    refetchBalance();
    refetchAllowance();
    refetchStats();
    refetchUserStats();
  };

  // Direct transaction bypasses
  const handleDirectApproval = async () => {
    setIsDirectTxLoading(true);
    logDebugInfo('🚀 Attempting DIRECT USDC approval (bypassing Wagmi)...');

    try {
      const result = await directTxClient.approveUSDC(
        contracts.chainluckLottery,
        1000,
      );

      if (result.success) {
        logDebugInfo('✅ Direct approval successful!');
        toast.success('Direct USDC approval successful!');
        // Refresh balances after success
        setTimeout(() => {
          refetchAllowance();
          refetchBalance();
        }, 2000);
      } else {
        logDebugInfo(`❌ Direct approval failed: ${result.error}`);
        toast.error(`Direct approval failed: ${result.error}`);
      }
    } catch (error: any) {
      logDebugInfo(`❌ Direct approval error: ${error.message}`);
      toast.error(`Direct approval error: ${error.message}`);
    } finally {
      setIsDirectTxLoading(false);
    }
  };

  const handleDirectPurchase = async () => {
    setIsDirectTxLoading(true);
    logDebugInfo('🚀 Attempting DIRECT ticket purchase (bypassing Wagmi)...');

    try {
      const result = await directTxClient.buyTickets(5);

      if (result.success) {
        logDebugInfo('✅ Direct purchase successful!');
        toast.success('🎉 Direct ticket purchase successful!');
        // Refresh everything after success
        setTimeout(() => {
          refetchBalance();
          refetchAllowance();
          refetchStats();
          refetchUserStats();
        }, 2000);
      } else {
        logDebugInfo(`❌ Direct purchase failed: ${result.error}`);
        toast.error(`Direct purchase failed: ${result.error}`);
      }
    } catch (error: any) {
      logDebugInfo(`❌ Direct purchase error: ${error.message}`);
      toast.error(`Direct purchase error: ${error.message}`);
    } finally {
      setIsDirectTxLoading(false);
    }
  };

  const handleDirectFaucet = async () => {
    setIsDirectTxLoading(true);
    logDebugInfo('🚀 Attempting DIRECT faucet (bypassing Wagmi)...');

    try {
      const result = await directTxClient.getUSDCFaucet();

      if (result.success) {
        logDebugInfo('✅ Direct faucet successful!');
        toast.success('Direct USDC faucet successful!');
        // Refresh balances after success
        setTimeout(() => {
          refetchBalance();
        }, 2000);
      } else {
        logDebugInfo(`❌ Direct faucet failed: ${result.error}`);
        toast.error(`Direct faucet failed: ${result.error}`);
      }
    } catch (error: any) {
      logDebugInfo(`❌ Direct faucet error: ${error.message}`);
      toast.error(`Direct faucet error: ${error.message}`);
    } finally {
      setIsDirectTxLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>🔧 Debug Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Connect your wallet to see debug information
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>🔧 Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium">USDC Balance</div>
            <div className="text-muted-foreground">
              {formatCurrency(usdcBalance)}
            </div>
          </div>
          <div>
            <div className="font-medium">USDC Allowance</div>
            <div className="text-muted-foreground">
              {formatCurrency(usdcAllowance)}
            </div>
          </div>
        </div>

        {/* Contract Addresses */}
        <div className="text-xs space-y-1">
          <div>
            <strong>Your Address:</strong> {address}
          </div>
          <div>
            <strong>USDC Contract:</strong> {contracts.usdc}
          </div>
          <div>
            <strong>Lottery Contract:</strong> {contracts.chainluckLottery}
          </div>
        </div>

        {/* Error Info */}
        {(debug.balanceError || debug.allowanceError || debug.faucetError) && (
          <Alert variant="destructive">
            <AlertDescription>
              <div className="text-xs space-y-1">
                {debug.balanceError && (
                  <div>Balance Error: {debug.balanceError.message}</div>
                )}
                {debug.allowanceError && (
                  <div>Allowance Error: {debug.allowanceError.message}</div>
                )}
                {debug.faucetError && (
                  <div>Faucet Error: {debug.faucetError.message}</div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Wagmi Buttons */}
        <div className="space-y-2">
          <div className="text-sm font-medium">
            Wagmi Transactions (Broken):
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleFaucet}
              disabled={isFauceting}
              size="sm"
              variant="outline"
            >
              {isFauceting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Getting USDC...
                </>
              ) : (
                'Get 10K USDC (Faucet)'
              )}
            </Button>

            <Button
              onClick={handleApprove}
              disabled={isApproving}
              size="sm"
              variant="outline"
            >
              {isApproving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                'Approve $1000 USDC'
              )}
            </Button>

            <Button onClick={handleRefresh} size="sm" variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Direct Viem Buttons */}
        <div className="space-y-2 border-t pt-4">
          <div className="text-sm font-medium text-green-600">
            Direct Viem Transactions (Should Work):
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleDirectFaucet}
              disabled={isDirectTxLoading}
              size="sm"
              variant="default"
              className="bg-green-600 hover:bg-green-700"
            >
              {isDirectTxLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Direct Faucet
                </>
              )}
            </Button>

            <Button
              onClick={handleDirectApproval}
              disabled={isDirectTxLoading}
              size="sm"
              variant="default"
              className="bg-green-600 hover:bg-green-700"
            >
              {isDirectTxLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Direct Approve $1000
                </>
              )}
            </Button>

            <Button
              onClick={handleDirectPurchase}
              disabled={isDirectTxLoading}
              size="sm"
              variant="default"
              className="bg-green-600 hover:bg-green-700"
            >
              {isDirectTxLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Direct Buy 5 Tickets
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Contract Stats */}
        {contractStats && (
          <div className="text-xs space-y-1 pt-4 border-t">
            <div className="font-medium">Contract Stats:</div>
            <div>Total Tickets Sold: {contractStats.totalTicketsSold}</div>
            <div>Instant Pool: {formatCurrency(contractStats.instantPool)}</div>
            <div>
              Grand Prize Pool: {formatCurrency(contractStats.grandPrizePool)}
            </div>
          </div>
        )}

        {/* User Stats */}
        {userStats && (
          <div className="text-xs space-y-1">
            <div className="font-medium">Your Stats:</div>
            <div>Total Spent: {formatCurrency(userStats.totalSpent)}</div>
            <div>Total Won: {formatCurrency(userStats.totalWon)}</div>
            <div>Pending Wins: {formatCurrency(userStats.pendingWins)}</div>
          </div>
        )}

        {/* Debug Log */}
        {debugInfo && (
          <div className="text-xs bg-muted p-2 rounded max-h-32 overflow-y-auto">
            <div className="font-medium mb-1">Debug Log:</div>
            <pre className="whitespace-pre-wrap">{debugInfo}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
