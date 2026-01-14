// nextjs/src/components/lottery/TicketSelector.tsx

'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TICKET_OPTIONS, formatCurrency } from '@/data/constants';
import { TicketCount } from '@/types/lottery';

interface TicketSelectorProps {
  selectedMultiplier: TicketCount;
  onSelectionChange: (multiplier: TicketCount, price: number) => void;
  disabled?: boolean;
}

export function TicketSelector({
  selectedMultiplier,
  onSelectionChange,
  disabled = false,
}: TicketSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Each purchase includes a guaranteed win! Prices updated to match smart
          contract.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {TICKET_OPTIONS.map((option) => {
          const isSelected = selectedMultiplier === option.multiplier;

          return (
            <Card
              key={option.multiplier}
              className={`
                relative cursor-pointer transition-all duration-200 hover:shadow-md
                ${
                  isSelected
                    ? 'ring-2 ring-primary ring-offset-2 bg-primary/5'
                    : 'hover:border-primary/50'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={() => {
                if (!disabled) {
                  onSelectionChange(option.multiplier, option.priceUSD);
                }
              }}
            >
              <div className="p-4 text-center space-y-3">
                {/* Popular Badge */}
                {option.popular && (
                  <Badge
                    variant="secondary"
                    className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs"
                  >
                    {option.bonus}
                  </Badge>
                )}

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}

                {/* Ticket Count */}
                <div className="space-y-1">
                  <div className="text-2xl font-bold font-mono">
                    {option.multiplier}x
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {option.label}
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <div className="text-lg font-semibold">
                    {formatCurrency(option.priceUSD)}
                  </div>
                  {option.multiplier > 1 && (
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(option.priceUSD / option.multiplier)} per
                      ticket
                    </div>
                  )}
                </div>

                {/* Bonus Text */}
                {option.bonus && !option.popular && (
                  <Badge variant="outline" className="text-xs">
                    {option.bonus}
                  </Badge>
                )}

                {/* Guaranteed Win Display */}
                <div className="text-xs text-green-600 font-medium">
                  + {formatCurrency(option.guaranteedWin)} guaranteed
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Grand Prize Information */}
      <div className="text-center space-y-2">
        <div className="text-sm font-medium text-foreground">
          🏆 Grand Prize Chances (per ticket)
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <div>$10,000: 1 in 10M • $5,000: 1 in 5M • $2,000: 1 in 2M</div>
          <div>$1,000: 1 in 1M • $500: 1 in 500K</div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="text-center space-y-2">
        <div className="text-xs text-muted-foreground">
          All transactions processed on-chain with provably fair randomness
        </div>
        <div className="text-xs text-muted-foreground">
          🔒 Secure • ⚡ Instant guaranteed wins • 🎯 Transparent odds
        </div>
      </div>
    </div>
  );
}
