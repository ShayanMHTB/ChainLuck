// nextjs/src/components/lottery/PurchaseFlow.tsx

'use client';

import { useState, useEffect } from 'react';
import {
  Wallet,
  ShoppingCart,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useWallet } from '@/components/providers/WalletProvider';
import { useChainLuckContract } from '@/hooks/useChainLuckContract';
import { useUSDCContract } from '@/hooks/useChainLuckContract';
import { WinAnimation } from '@/components/lottery/WinAnimation';
import { TicketCount, TicketPurchaseResult } from '@/types/lottery';
import { formatCurrency, calculateGuaranteedWin } from '@/data/constants';

interface PurchaseFlowProps {
  selectedMultiplier: TicketCount;
  totalPrice: number;
  onPurchaseComplete?: (result: TicketPurchaseResult) => void;
}

type PurchaseStep =
  | 'review'
  | 'approve'
  | 'purchase'
  | 'confirming'
  | 'success'
  | 'error';

export function PurchaseFlow({
  selectedMultiplier,
  totalPrice,
  onPurchaseComplete,
}: PurchaseFlowProps) {
  const { isConnected, address, connect, chainInfo } = useWallet();
  const currentChainId = chainInfo.chain?.id || 1337;
  const {
    purchaseTickets,
    isPurchasing,
    lastPurchaseResult,
    getGuaranteedWinUSD,
  } = useChainLuckContract();

  const {
    usdcBalance,
    usdcAllowance,
    approveUSDCForLottery,
    isApproving,
    getTestUSDC,
    isFauceting,
    hasEnoughBalance,
    hasEnoughAllowance,
    needsApproval,
  } = useUSDCContract();

  const [currentStep, setCurrentStep] = useState<PurchaseStep>('review');
  const [showAnimation, setShowAnimation] = useState(false);

  const guaranteedWin = getGuaranteedWinUSD(selectedMultiplier);

  // Update step based on state changes
  useEffect(() => {
    if (!isConnected) {
      setCurrentStep('review');
      return;
    }

    if (lastPurchaseResult) {
      if (lastPurchaseResult.success) {
        setCurrentStep('success');
        setShowAnimation(true);
        onPurchaseComplete?.(lastPurchaseResult);
      } else {
        setCurrentStep('error');
      }
      return;
    }

    if (isPurchasing) {
      setCurrentStep('confirming');
      return;
    }

    if (isApproving) {
      setCurrentStep('approve');
      return;
    }

    // Check if we need approval
    if (isConnected && needsApproval(totalPrice)) {
      setCurrentStep('approve');
      return;
    }

    setCurrentStep('review');
  }, [
    isConnected,
    isPurchasing,
    isApproving,
    lastPurchaseResult,
    needsApproval,
    totalPrice,
    onPurchaseComplete,
  ]);

  const handleConnect = async () => {
    await connect();
  };

  const handleApprove = async () => {
    // Approve a larger amount to avoid repeated approvals
    const approvalAmount = Math.max(totalPrice, 1000); // At least $1000
    await approveUSDCForLottery(approvalAmount);
  };

  const handlePurchase = async () => {
    if (!hasEnoughBalance(totalPrice)) {
      // Show insufficient balance error or offer faucet
      return;
    }

    await purchaseTickets(selectedMultiplier);
  };

  const handleTryAgain = () => {
    setCurrentStep('review');
    setShowAnimation(false);
  };

  const getStepProgress = (): number => {
    switch (currentStep) {
      case 'review':
        return 0;
      case 'approve':
        return 25;
      case 'purchase':
        return 50;
      case 'confirming':
        return 75;
      case 'success':
        return 100;
      case 'error':
        return 0;
      default:
        return 0;
    }
  };

  // Show win animation if successful
  if (showAnimation && lastPurchaseResult?.success) {
    return (
      <Card>
        <CardContent className="pt-6">
          <WinAnimation
            ticketCount={selectedMultiplier}
            guaranteedWin={guaranteedWin}
            grandPrizeWins={lastPurchaseResult.grandPrizeWins || []}
            totalWin={
              guaranteedWin +
              (lastPurchaseResult.grandPrizeWins?.reduce(
                (sum, win) => sum + win.amount,
                0,
              ) || 0)
            }
            onAnimationComplete={() => {
              // Keep animation visible for user to see
            }}
          />
          <div className="mt-6 text-center">
            <Button onClick={handleTryAgain} className="w-full">
              Play Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {/* Progress Bar */}
        {isConnected && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Purchase Progress</span>
              <span>{getStepProgress()}%</span>
            </div>
            <Progress value={getStepProgress()} className="h-2" />
          </div>
        )}

        {/* Purchase Summary */}
        <div className="space-y-3">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-semibold">Purchase Summary</h3>
            <p className="text-sm text-muted-foreground">
              {currentStep === 'approve' && 'Approve USDC spending first'}
              {currentStep === 'purchase' && 'Ready to purchase tickets'}
              {currentStep === 'confirming' && 'Confirming transaction...'}
              {currentStep === 'review' && 'Review your ticket selection'}
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Tickets:</span>
              <span className="font-medium">{selectedMultiplier}x</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Price per ticket:</span>
              <span className="font-medium">
                {formatCurrency(totalPrice / selectedMultiplier)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Guaranteed win:</span>
              <span className="font-medium text-green-600">
                {formatCurrency(guaranteedWin)}
              </span>
            </div>
            <div className="border-t pt-2 flex justify-between items-center">
              <span className="font-medium">Total:</span>
              <span className="font-bold text-lg">
                {formatCurrency(totalPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Balance Information */}
        {isConnected && (
          <div className="bg-muted/30 rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>Your USDC Balance:</span>
              <span
                className={`font-medium ${
                  hasEnoughBalance(totalPrice)
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {formatCurrency(usdcBalance)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>USDC Allowance:</span>
              <span
                className={`font-medium ${
                  hasEnoughAllowance(totalPrice)
                    ? 'text-green-600'
                    : 'text-orange-600'
                }`}
              >
                {formatCurrency(usdcAllowance)}
              </span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {(currentStep === 'error' || lastPurchaseResult?.error) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {lastPurchaseResult?.error ||
                'Purchase failed. Please try again.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Insufficient Balance Alert */}
        {isConnected && !hasEnoughBalance(totalPrice) && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <div>
                Insufficient USDC balance for this purchase. You have{' '}
                {formatCurrency(usdcBalance)}, but need{' '}
                {formatCurrency(totalPrice)}.
              </div>
              {currentChainId === 1337 && (
                <Button
                  onClick={getTestUSDC}
                  disabled={isFauceting}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {isFauceting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Getting Test USDC...
                    </>
                  ) : (
                    'Get Test USDC'
                  )}
                </Button>
              )}
              {currentChainId !== 1337 && (
                <div className="text-sm text-muted-foreground">
                  Faucet is only available on localhost network (Chain ID 1337)
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {!isConnected ? (
            <Button
              onClick={handleConnect}
              className="w-full h-12 text-base"
              size="lg"
            >
              <Wallet className="mr-2 h-5 w-5" />
              Connect Wallet to Play
            </Button>
          ) : currentStep === 'approve' ? (
            <Button
              onClick={handleApprove}
              disabled={isApproving || !hasEnoughBalance(totalPrice)}
              className="w-full h-12 text-base"
              size="lg"
            >
              {isApproving ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Approving USDC...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Approve USDC Spending
                </>
              )}
            </Button>
          ) : currentStep === 'error' ? (
            <Button
              onClick={handleTryAgain}
              className="w-full h-12 text-base"
              size="lg"
              variant="outline"
            >
              Try Again
            </Button>
          ) : (
            <Button
              onClick={handlePurchase}
              disabled={
                isPurchasing ||
                !hasEnoughBalance(totalPrice) ||
                needsApproval(totalPrice)
              }
              className="w-full h-12 text-base"
              size="lg"
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {currentStep === 'confirming'
                    ? 'Confirming...'
                    : 'Processing...'}
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Buy {selectedMultiplier} Ticket
                  {selectedMultiplier > 1 ? 's' : ''} -{' '}
                  {formatCurrency(totalPrice)}
                </>
              )}
            </Button>
          )}

          {/* Wallet Info */}
          {isConnected && address && (
            <div className="text-center text-xs text-muted-foreground">
              Connected: {address.slice(0, 6)}...{address.slice(-4)}
            </div>
          )}
        </div>

        {/* Trust Indicators */}
        <div className="pt-4 border-t space-y-3">
          <div className="text-xs text-center text-muted-foreground">
            🔒 Secure • ⚡ Instant guaranteed wins • 🎯 Provably fair randomness
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground text-center">
            <div className="space-y-1">
              <div className="font-medium text-foreground">Instant</div>
              <div>Guaranteed wins paid immediately</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-foreground">Fair</div>
              <div>Smart contract randomness</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-foreground">Secure</div>
              <div>100% on-chain transactions</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
