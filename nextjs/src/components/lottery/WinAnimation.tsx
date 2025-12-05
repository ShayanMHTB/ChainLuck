// nextjs/src/components/lottery/WinAnimation.tsx

'use client';

import { useEffect, useState } from 'react';
import { Trophy, Sparkles, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  WinAnimationProps,
  TicketRevealState,
  GrandPrizeWin,
} from '@/types/lottery';
import { formatCurrency, LOTTERY_CONFIG } from '@/data/constants';

export function WinAnimation({
  ticketCount,
  guaranteedWin,
  grandPrizeWins,
  totalWin,
  onAnimationComplete,
}: WinAnimationProps) {
  const [currentTicket, setCurrentTicket] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'revealing' | 'summary'>(
    'revealing',
  );

  useEffect(() => {
    if (ticketCount === 0) return;

    // Reveal tickets one by one
    const revealInterval = setInterval(() => {
      setCurrentTicket((prev) => {
        if (prev >= ticketCount - 1) {
          clearInterval(revealInterval);
          setAnimationPhase('summary');

          // Show confetti for big wins
          if (totalWin >= 500) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
          }

          onAnimationComplete?.();
          return prev;
        }
        return prev + 1;
      });
    }, 800);

    return () => clearInterval(revealInterval);
  }, [ticketCount, totalWin, onAnimationComplete]);

  const getBiggestWin = (): GrandPrizeWin | null => {
    if (grandPrizeWins.length === 0) return null;
    return grandPrizeWins.reduce(
      (biggest, current) =>
        current.amount > (biggest?.amount || 0) ? current : biggest,
      null as GrandPrizeWin | null,
    );
  };

  const biggestWin = getBiggestWin();
  const hasBigWin = biggestWin && biggestWin.amount >= 500;
  const hasGrandPrize = grandPrizeWins.length > 0;

  const getPrizeInfo = (prizeIndex: number) => {
    const prize = LOTTERY_CONFIG.GRAND_PRIZES[prizeIndex];
    return prize ? { amount: prize.amount, odds: prize.odds } : null;
  };

  if (animationPhase === 'summary') {
    return (
      <div className="space-y-6">
        {/* Confetti Effect */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-bounce"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${2 + Math.random() * 2}s`,
                  }}
                >
                  <span className="text-2xl">
                    {
                      ['🎉', '✨', '🎊', '💰', '🏆'][
                        Math.floor(Math.random() * 5)
                      ]
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Win Display */}
        <div className="text-center space-y-4">
          {hasBigWin ? (
            <div className="space-y-2">
              <div className="text-6xl">🏆</div>
              <h2 className="text-3xl font-bold text-yellow-600">
                GRAND PRIZE!
              </h2>
              <div className="text-4xl font-bold text-green-600">
                {formatCurrency(totalWin)}
              </div>
            </div>
          ) : hasGrandPrize ? (
            <div className="space-y-2">
              <div className="text-5xl">🎉</div>
              <h2 className="text-2xl font-bold text-blue-600">Big Win!</h2>
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(totalWin)}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-4xl">✨</div>
              <h2 className="text-xl font-bold text-green-600">You Won!</h2>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalWin)}
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="grid grid-cols-1 gap-3">
          <h3 className="text-center text-lg font-semibold">Your Results</h3>

          <div className="space-y-3">
            {/* Guaranteed Win */}
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium">Guaranteed Win</div>
                    <Badge
                      variant="secondary"
                      className="text-green-500 bg-transparent border"
                    >
                      All {ticketCount} tickets
                    </Badge>
                  </div>
                  <div className="font-bold text-green-500">
                    {formatCurrency(guaranteedWin)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Grand Prize Wins */}
            {grandPrizeWins.map((win, index) => {
              const prizeInfo = getPrizeInfo(win.prizeIndex);
              const colors = [
                'border-l-pink-500 text-pink-500', // $10,000
                'border-l-purple-500 text-purple-500', // $5,000
                'border-l-red-500 text-red-500', // $2,000
                'border-l-orange-500 text-orange-500', // $1,000
                'border-l-yellow-500 text-yellow-500', // $500
              ];
              const colorClass =
                colors[win.prizeIndex] || 'border-l-gray-500 text-gray-500';

              return (
                <Card
                  key={index}
                  className={`border-l-4 ${colorClass.split(' ')[0]}`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-sm font-medium">Grand Prize!</div>
                        <Badge
                          variant="secondary"
                          className={`${
                            colorClass.split(' ')[1]
                          } bg-transparent border`}
                        >
                          1 in {prizeInfo?.odds.toLocaleString() || 'Unknown'}
                        </Badge>
                      </div>
                      <div className={`font-bold ${colorClass.split(' ')[1]}`}>
                        {formatCurrency(win.amount)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Win Statistics */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-semibold text-foreground">{ticketCount}</div>
              <div className="text-muted-foreground">Tickets</div>
            </div>
            <div>
              <div className="font-semibold text-foreground">
                {grandPrizeWins.length}
              </div>
              <div className="text-muted-foreground">Grand Prizes</div>
            </div>
            <div>
              <div className="font-semibold text-green-600">
                {formatCurrency(totalWin)}
              </div>
              <div className="text-muted-foreground">Total Won</div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center text-sm text-muted-foreground">
          {hasGrandPrize
            ? 'Congratulations! Your winnings have been added to your pending balance.'
            : 'Your guaranteed win has been added to your pending balance.'}
        </div>
      </div>
    );
  }

  // Revealing phase - show tickets being processed
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="text-4xl animate-pulse">🎲</div>
        <h2 className="text-xl font-bold">Processing Your Tickets...</h2>
        <div className="text-sm text-muted-foreground">
          Checking ticket {currentTicket + 1} of {ticketCount}
        </div>
      </div>

      {/* Current Ticket Being Processed */}
      <Card className="border-2 border-primary animate-pulse">
        <CardContent className="p-6 text-center space-y-4">
          <div className="text-lg font-semibold">
            Ticket #{currentTicket + 1}
          </div>

          <div className="space-y-2">
            <div className="animate-bounce">
              <div className="text-xl font-bold text-primary">
                Processing...
              </div>
              <Badge variant="secondary" className="bg-primary/10 border">
                Smart contract verification
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-500"
          style={{ width: `${((currentTicket + 1) / ticketCount) * 100}%` }}
        />
      </div>

      {/* Information */}
      <div className="text-center space-y-2">
        <div className="text-sm text-muted-foreground">
          🔒 Secured by smart contract randomness
        </div>
        <div className="text-sm text-muted-foreground">
          ⚡ Guaranteed win: {formatCurrency(guaranteedWin)}
        </div>
        <div className="text-sm text-muted-foreground">
          🎯 Checking for grand prizes...
        </div>
      </div>
    </div>
  );
}
