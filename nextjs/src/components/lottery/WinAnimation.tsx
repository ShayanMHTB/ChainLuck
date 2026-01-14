// nextjs/src/components/lottery/WinAnimation.tsx

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/data/constants';

interface GrandPrizeWin {
  amount: number;
  prizeIndex: number;
}

interface WinAnimationProps {
  ticketCount: number;
  guaranteedWin: number;
  grandPrizeWins: GrandPrizeWin[];
  totalWin: number;
  onAnimationComplete?: () => void;
}

export function WinAnimation({
  ticketCount,
  guaranteedWin,
  grandPrizeWins,
  totalWin,
  onAnimationComplete,
}: WinAnimationProps) {
  const [showAnimation, setShowAnimation] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  const hasGrandPrize = grandPrizeWins.length > 0;
  const totalSteps = hasGrandPrize ? 3 : 2; // Guaranteed -> Grand Prize (if any) -> Total

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= totalSteps - 1) {
          clearInterval(timer);
          setTimeout(() => {
            setShowAnimation(false);
            onAnimationComplete?.();
          }, 3000); // Show final result for 3 seconds
          return prev;
        }
        return prev + 1;
      });
    }, 1500); // Change step every 1.5 seconds

    return () => clearInterval(timer);
  }, [totalSteps, onAnimationComplete]);

  if (!showAnimation) {
    return null;
  }

  return (
    <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
      <CardContent className="pt-8 pb-6">
        <div className="text-center space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="text-2xl">🎉</div>
            <h3 className="text-2xl font-bold text-green-600">
              Congratulations!
            </h3>
            <p className="text-muted-foreground">
              Your {ticketCount} ticket{ticketCount > 1 ? 's' : ''} won:
            </p>
          </div>

          {/* Animated Results */}
          <div className="space-y-4">
            {/* Step 0: Guaranteed Win */}
            {currentStep >= 0 && (
              <div
                className={`p-4 rounded-lg border transition-all duration-500 ${
                  currentStep === 0
                    ? 'bg-green-100 border-green-300 scale-105'
                    : 'bg-muted border-muted-foreground/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">💰</span>
                    <span className="font-medium">Guaranteed Win</span>
                  </div>
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(guaranteedWin)}
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Grand Prizes (if any) */}
            {hasGrandPrize && currentStep >= 1 && (
              <div
                className={`p-4 rounded-lg border transition-all duration-500 ${
                  currentStep === 1
                    ? 'bg-yellow-100 border-yellow-300 scale-105'
                    : 'bg-muted border-muted-foreground/20'
                }`}
              >
                <div className="space-y-2">
                  {grandPrizeWins.map((win, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">🏆</span>
                        <span className="font-medium">Grand Prize!</span>
                      </div>
                      <div className="text-lg font-bold text-yellow-600">
                        {formatCurrency(win.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Final Step: Total Win */}
            {currentStep >= totalSteps - 1 && (
              <div className="p-6 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white border-2 border-green-400 scale-110 transition-all duration-500">
                <div className="text-center space-y-2">
                  <div className="text-sm font-medium uppercase tracking-wide">
                    Total Win
                  </div>
                  <div className="text-4xl font-bold">
                    {formatCurrency(totalWin)}
                  </div>
                  <div className="text-sm opacity-90">
                    Added to your pending wins
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center space-x-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index <= currentStep ? 'bg-green-500' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Breakdown */}
          <div className="pt-4 border-t space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Tickets purchased:</span>
              <span>{ticketCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Guaranteed wins:</span>
              <span>{formatCurrency(guaranteedWin)}</span>
            </div>
            {hasGrandPrize && (
              <div className="flex justify-between">
                <span>Grand prize wins:</span>
                <span>
                  {formatCurrency(
                    grandPrizeWins.reduce((sum, win) => sum + win.amount, 0),
                  )}
                </span>
              </div>
            )}
            <div className="flex justify-between font-medium text-foreground border-t pt-2">
              <span>Total won:</span>
              <span className="text-green-600">{formatCurrency(totalWin)}</span>
            </div>
          </div>

          {/* Call to Action */}
          {currentStep >= totalSteps - 1 && (
            <div className="pt-4 space-y-2">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700"
              >
                💰 Wins are pending in your account
              </Badge>
              <div className="text-xs text-muted-foreground">
                Go to your dashboard to claim your winnings
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
