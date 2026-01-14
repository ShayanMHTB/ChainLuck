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
import { formatCurrency } from '@/data/constants';

interface PurchaseFlowProps {
  selectedMultiplier: TicketCount;
  totalPrice: number;
  onPurchaseComplete?: (result: TicketPurchaseResult) => void;
}

type PurchaseStep = 'ready' | 'processing' | 'success' | 'error';

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
    approveUSDCForLottery,
    isApproving,
    getTestUSDC,
    isFauceting,
    hasEnoughBalance,
  } = useUSDCContract();

  const [currentStep, setCurrentStep] = useState<PurchaseStep>('ready');
  const [showAnimation, setShowAnimation] = useState(false);
  const [needsApprovalRetry, setNeedsApprovalRetry] = useState(false);

  const guaranteedWin = getGuaranteedWinUSD(selectedMultiplier);

  // Update step based on state changes
  useEffect(() => {
    if (lastPurchaseResult) {
      if (lastPurchaseResult.success) {
        setCurrentStep('success');
        setShowAnimation(true);
        setNeedsApprovalRetry(false);
        onPurchaseComplete?.(lastPurchaseResult);
      } else {
        // Check if error is due to insufficient allowance
        const errorMessage = lastPurchaseResult.error?.toLowerCase() || '';
        if (
          errorMessage.includes('allowance') ||
          errorMessage.includes('approve') ||
          errorMessage.includes('erc20: insufficient allowance')
        ) {
          setNeedsApprovalRetry(true);
          setCurrentStep('ready');
        } else {
          setCurrentStep('error');
          setNeedsApprovalRetry(false);
        }
      }
      return;
    }

    if (isPurchasing || isApproving) {
      setCurrentStep('processing');
      return;
    }

    setCurrentStep('ready');
  }, [isPurchasing, isApproving, lastPurchaseResult, onPurchaseComplete]);

  const handleConnect = async () => {
    await connect();
  };

  const handlePurchase = async () => {
    if (!hasEnoughBalance(totalPrice)) {
      return; // Button should be disabled anyway
    }

    setNeedsApprovalRetry(false);
    await purchaseTickets(selectedMultiplier);
  };

  const handleApproveAndRetry = async () => {
    // Approve a reasonable amount to avoid repeated approvals
    const approvalAmount = Math.max(totalPrice * 3, 1000); // 3x current purchase or $1000 minimum
    await approveUSDCForLottery(approvalAmount);

    // After approval, automatically retry the purchase
    setTimeout(() => {
      if (!isPurchasing && !isApproving) {
        handlePurchase();
      }
    }, 1000);
  };

  const handleTryAgain = () => {
    setCurrentStep('ready');
    setShowAnimation(false);
    setNeedsApprovalRetry(false);
  };

  const getStepProgress = (): number => {
    switch (currentStep) {
      case 'ready':
        return 0;
      case 'processing':
        return 50;
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
        {/* Progress Bar - Only show when processing */}
        {currentStep === 'processing' && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Processing Transaction</span>
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
              {currentStep === 'processing' && 'Processing transaction...'}
              {currentStep === 'ready' && 'Ready to purchase tickets'}
              {currentStep === 'error' && 'Transaction failed'}
              {currentStep === 'success' && 'Purchase successful!'}
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

        {/* Balance Information - Only show if connected */}
        {isConnected && (
          <div className="bg-muted/30 rounded-lg p-3">
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
          </div>
        )}

        {/* Error Display */}
        {currentStep === 'error' && lastPurchaseResult?.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{lastPurchaseResult.error}</AlertDescription>
          </Alert>
        )}

        {/* Approval Needed Alert */}
        {needsApprovalRetry && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div>
                  Transaction failed because USDC spending needs to be approved
                  first.
                </div>
                <Button
                  onClick={handleApproveAndRetry}
                  disabled={isApproving}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {isApproving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Approving USDC...
                    </>
                  ) : (
                    'Approve USDC & Buy Tickets'
                  )}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Insufficient Balance Alert */}
        {isConnected && !hasEnoughBalance(totalPrice) && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <div>
                Insufficient USDC balance. You have{' '}
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
                    'Get Test USDC (10,000 USDC)'
                  )}
                </Button>
              )}
              {currentChainId !== 1337 && (
                <div className="text-sm text-muted-foreground">
                  Please add USDC to your wallet to continue
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
          ) : currentStep === 'error' && !needsApprovalRetry ? (
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
                currentStep === 'processing' ||
                !hasEnoughBalance(totalPrice) ||
                needsApprovalRetry
              }
              className="w-full h-12 text-base"
              size="lg"
            >
              {currentStep === 'processing' ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing Transaction...
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
