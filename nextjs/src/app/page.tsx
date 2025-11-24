// nextjs/src/app/page.tsx

'use client';

import { useState } from 'react';
import { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { TicketSelector } from '@/components/lottery/TicketSelector';
import { PurchaseFlow } from '@/components/lottery/PurchaseFlow';
import { LiveStats } from '@/components/lottery/LiveStats';
import { RecentWinners } from '@/components/lottery/RecentWinners';
import { useWallet } from '@/components/providers/WalletProvider';
import { useChainLuckContract } from '@/hooks/useChainLuckContract';
import { TicketCount, TicketPurchaseResult } from '@/types/lottery';
import { formatCurrency, TICKET_OPTIONS } from '@/data/constants';
import { Trophy, Zap, Shield, Target, AlertTriangle, Info } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { isConnected, chainInfo } = useWallet();
  const { userStats, contractStats } = useChainLuckContract();
  const [selectedMultiplier, setSelectedMultiplier] = useState<TicketCount>(1);
  const [totalPrice, setTotalPrice] = useState(3.5); // Default 1 ticket price

  const handleSelectionChange = (multiplier: TicketCount, price: number) => {
    setSelectedMultiplier(multiplier);
    setTotalPrice(price);
  };

  const handlePurchaseComplete = (result: TicketPurchaseResult) => {
    // Handle successful purchase - stats will update automatically via hooks
    console.log('Purchase completed:', result);
  };

  // Check if we're on the right network
  const isOnLocalhost = chainInfo.chain?.id === 1337;
  const networkWarning = !isOnLocalhost && isConnected;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <Badge variant="outline" className="text-sm">
              🎲 Live on Blockchain
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="text-foreground">Win Big with</span>
              <br />
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                ChainLuck Lottery
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              The first fully decentralized lottery with guaranteed wins on
              every ticket. Powered by smart contracts and provably fair
              randomness.
            </p>

            {/* Quick Stats */}
            {contractStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(contractStats.grandPrizePool)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Grand Prize Pool
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {contractStats.totalTicketsSold}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Tickets Sold
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">
                    {formatCurrency(contractStats.totalRevenue)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total Revenue
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">
                    {formatCurrency(contractStats.contractBalance)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Contract Balance
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Network Warning */}
      {networkWarning && (
        <section className="py-4">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Alert variant="destructive" className="max-w-4xl mx-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You're connected to{' '}
                {chainInfo.chain?.name || 'an unsupported network'}. For
                testing, please switch to localhost (Hardhat) or use the faucet
                to get test USDC.
              </AlertDescription>
            </Alert>
          </div>
        </section>
      )}

      {/* Development Info */}
      {isOnLocalhost && (
        <section className="py-4">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Alert className="max-w-4xl mx-auto">
              <Info className="h-4 w-4" />
              <AlertDescription>
                🚀 You're connected to localhost! This is the development
                environment. Use the "Get Test USDC" button to receive free
                tokens for testing.
              </AlertDescription>
            </Alert>
          </div>
        </section>
      )}

      {/* User Stats Section */}
      {isConnected && userStats && (
        <section className="py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary/5 to-blue-500/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-semibold">
                    Your ChainLuck Stats
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-foreground">
                        {formatCurrency(userStats.totalSpent)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Spent
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-600">
                        {formatCurrency(userStats.totalWon)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Won
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-600">
                        {formatCurrency(userStats.pendingWins)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Pending Wins
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className={`text-xl font-bold ${
                          userStats.netResult >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {userStats.netResult >= 0 ? '+' : ''}
                        {formatCurrency(userStats.netResult)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Net Result
                      </div>
                    </div>
                  </div>

                  {userStats.pendingWins > 0 && (
                    <div className="pt-4">
                      <Button
                        onClick={() => {
                          // This will be handled by the useChainLuckContract hook
                          // We can add a claim button here later
                        }}
                        className="w-full sm:w-auto"
                      >
                        Claim {formatCurrency(userStats.pendingWins)} in Pending
                        Wins
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Main Lottery Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Ticket Selection and Purchase */}
            <div className="lg:col-span-2 space-y-8">
              {/* Ticket Selector */}
              <Card>
                <CardContent className="pt-6">
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
                onPurchaseComplete={handlePurchaseComplete}
              />
            </div>

            {/* Right Column - Live Stats and Recent Winners */}
            <div className="space-y-8">
              {/* Live Stats */}
              <LiveStats />

              {/* Recent Winners */}
              <RecentWinners />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold">Why ChainLuck?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the most transparent and fair lottery ever created
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardContent className="pt-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold">Guaranteed Wins</h3>
                <p className="text-sm text-muted-foreground">
                  Every ticket guarantees a win. You literally cannot lose!
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <Zap className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold">Instant Payouts</h3>
                <p className="text-sm text-muted-foreground">
                  Wins are credited immediately to your wallet. No waiting!
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="text-lg font-semibold">100% On-Chain</h3>
                <p className="text-sm text-muted-foreground">
                  Every transaction is verifiable on the blockchain. Complete
                  transparency.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="text-lg font-semibold">Provably Fair</h3>
                <p className="text-sm text-muted-foreground">
                  Smart contract randomness ensures fair and unbiased results.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20 max-w-4xl mx-auto">
            <CardContent className="pt-8 text-center space-y-6">
              <h2 className="text-3xl font-bold">Ready to Win?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join the revolution in fair gaming. Every ticket guarantees a
                win, with chances for life-changing grand prizes!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {!isConnected ? (
                  <Button size="lg" className="px-8">
                    Connect Wallet to Start
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="px-8"
                    onClick={() => {
                      // Scroll to lottery section
                      document
                        .querySelector('section')
                        ?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Buy Tickets Now
                  </Button>
                )}
                <Button variant="outline" size="lg" className="px-8" asChild>
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
