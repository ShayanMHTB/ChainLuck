// nextjs/src/components/auth/LoginPrompt.tsx

'use client';

import { Wallet, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/components/providers/WalletProvider';
import Link from 'next/link';

interface LoginPromptProps {
  title?: string;
  description?: string;
  action?: string;
  actionHref?: string;
  showBackButton?: boolean;
}

export function LoginPrompt({
  title = 'Connect Your Wallet',
  description = 'Connect your wallet to access your personal dashboard and statistics.',
  action = 'Buy Tickets',
  actionHref = '/',
  showBackButton = true,
}: LoginPromptProps) {
  const { connect, isConnecting } = useWallet();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          {showBackButton && (
            <div className="mb-8">
              <Link
                href={actionHref}
                className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to {action}
              </Link>
            </div>
          )}

          {/* Main Card */}
          <Card className="border-2 border-dashed border-muted-foreground/25">
            <CardContent className="pt-12 pb-8 text-center space-y-8">
              {/* Icon */}
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Wallet className="h-10 w-10 text-primary" />
              </div>

              {/* Content */}
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                <p className="text-lg text-muted-foreground max-w-md mx-auto">
                  {description}
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <Button
                  onClick={connect}
                  disabled={isConnecting}
                  size="lg"
                  className="w-full max-w-sm h-12"
                >
                  {isConnecting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="mr-2 h-5 w-5" />
                      Connect Wallet
                    </>
                  )}
                </Button>

                <div className="text-xs text-muted-foreground">
                  <Link
                    href={actionHref}
                    className="hover:text-primary transition-colors"
                  >
                    Continue to {action} →
                  </Link>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t space-y-3">
                <div className="text-sm font-medium">Why Connect?</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
                  <div className="space-y-1">
                    <div className="font-medium text-foreground">🔒 Secure</div>
                    <div>Your keys, your control</div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium text-foreground">
                      ⚡ Instant
                    </div>
                    <div>Immediate access to features</div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium text-foreground">
                      🎯 Personal
                    </div>
                    <div>Track your wins and stats</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Loading Screen Component
export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="mx-auto w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <div className="text-lg font-medium">Loading...</div>
        <div className="text-sm text-muted-foreground">
          Preparing your dashboard
        </div>
      </div>
    </div>
  );
}
