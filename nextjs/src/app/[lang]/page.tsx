// nextjs/src/app/[locale]/page.tsx

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TicketSelector } from '@/components/lottery/TicketSelector';
import { PurchaseFlow } from '@/components/lottery/PurchaseFlow';
import { HeroStats } from '@/components/lottery/HeroStats';
import { LiveFeed } from '@/components/lottery/LiveFeed';
import { PoolStatus } from '@/components/lottery/PoolStatus';
import { PendingWins } from '@/components/lottery/PendingWins';
import { DebugPanel } from '@/components/lottery/DebugPanel';
import { useWallet } from '@/components/providers/WalletProvider';
import { getTicketPriceUSD } from '@/lib/contracts';
import { TicketCount } from '@/types/lottery';
import Link from 'next/link';

export default function HomePage() {
  const t = useTranslations();
  const { isConnected } = useWallet();
  const [selectedMultiplier, setSelectedMultiplier] = useState<TicketCount>(5);
  const [totalPrice, setTotalPrice] = useState(getTicketPriceUSD(5));

  const handleSelectionChange = (multiplier: TicketCount, price: number) => {
    setSelectedMultiplier(multiplier);
    setTotalPrice(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section with Live Stats */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 max-w-4xl mx-auto mb-12">
            <Badge variant="outline" className="text-sm">
              🎲 {t('nav.home')}
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="text-foreground">Win Big with</span>
              <br />
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                ChainLuck
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              The first fully decentralized lottery with guaranteed wins on
              every ticket. Powered by blockchain technology and provably fair
              randomness.
            </p>
          </div>

          {/* Hero Stats */}
          <HeroStats />
        </div>
      </section>

      {/* Main Lottery Interface */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Purchase Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Ticket Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-center">
                    Choose Your Tickets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TicketSelector
                    selectedMultiplier={selectedMultiplier}
                    onSelectionChange={handleSelectionChange}
                  />
                </CardContent>
              </Card>

              {/* Purchase Flow */}
              <PurchaseFlow
                selectedMultiplier={selectedMultiplier}
                totalPrice={totalPrice}
              />

              {/* Pending Wins (only show if connected) */}
              {isConnected && <PendingWins />}

              {/* Debug Panel - Remove this in production */}
              <DebugPanel />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pool Status */}
              <PoolStatus />

              {/* Live Activity Feed */}
              <LiveFeed />

              {/* Quick Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Explore More</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link
                    href="/dashboard"
                    className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="font-medium">{t('nav.dashboard')}</div>
                    <div className="text-sm text-muted-foreground">
                      View your stats and history
                    </div>
                  </Link>
                  <Link
                    href="/stats"
                    className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="font-medium">{t('nav.stats')}</div>
                    <div className="text-sm text-muted-foreground">
                      Detailed analytics and winners
                    </div>
                  </Link>
                  <Link
                    href="/about"
                    className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="font-medium">{t('nav.about')}</div>
                    <div className="text-sm text-muted-foreground">
                      Learn about ChainLuck
                    </div>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl font-bold">Why ChainLuck?</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="text-2xl">🔒</div>
                <h3 className="font-semibold">100% On-Chain</h3>
                <p className="text-sm text-muted-foreground">
                  Every transaction recorded on blockchain
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-2xl">⚡</div>
                <h3 className="font-semibold">Instant Wins</h3>
                <p className="text-sm text-muted-foreground">
                  {t('lottery.guaranteedWin')} on every ticket
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-2xl">🎯</div>
                <h3 className="font-semibold">Provably Fair</h3>
                <p className="text-sm text-muted-foreground">
                  Chainlink VRF verified randomness
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
