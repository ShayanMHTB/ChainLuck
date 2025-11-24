// nextjs/src/app/about/page.tsx

import { Metadata } from 'next';
import {
  Shield,
  Zap,
  Target,
  Users,
  DollarSign,
  Lock,
  Award,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { APP_CONFIG, WIN_TIERS, LOTTERY_CONFIG } from '@/data/constants';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Learn how ChainLuck works - the first fully on-chain lottery with instant payouts and provably fair randomness.',
};

export default function AboutPage() {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <Badge variant="outline" className="text-sm">
              🎯 About ChainLuck
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="text-foreground">The Future of</span>
              <br />
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Fair Lottery Gaming
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              ChainLuck is the first fully decentralized lottery platform built
              on blockchain technology. Experience transparent, instant, and
              provably fair gaming with guaranteed wins on every ticket.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple, transparent, and instant. Here&apos;s how ChainLuck
              revolutionizes lottery gaming.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center">
              <CardContent className="pt-6 space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">
                  1. Choose Your Tickets
                </h3>
                <p className="text-muted-foreground">
                  Select 1, 5, 10, or 20 tickets at $
                  {LOTTERY_CONFIG.TICKET_PRICE_USD} each. Every ticket
                  guarantees a $
                  {formatCurrency(LOTTERY_CONFIG.GUARANTEED_WIN_USD)} win!
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6 space-y-4">
                <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <Zap className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold">2. Connect & Pay</h3>
                <p className="text-muted-foreground">
                  Connect your Web3 wallet and confirm the transaction. All
                  payments are processed securely on the blockchain.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6 space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                  <Award className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold">3. Win Instantly</h3>
                <p className="text-muted-foreground">
                  Get your results immediately! Small wins are paid instantly,
                  while big wins use Chainlink VRF for maximum fairness.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Prize Structure */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                Prize Structure
              </CardTitle>
              <p className="text-center text-muted-foreground">
                Every ticket wins something! Here&apos;s how our prize tiers
                work:
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {WIN_TIERS.filter((tier) => tier.tier !== 'none').map(
                  (tier) => (
                    <div
                      key={tier.tier}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center space-x-4">
                        <Badge
                          variant="outline"
                          className={`${tier.color} bg-transparent border`}
                        >
                          {tier.name}
                        </Badge>
                        <div>
                          <div className="font-medium">
                            {tier.minAmount === tier.maxAmount
                              ? formatCurrency(tier.minAmount)
                              : `${formatCurrency(
                                  tier.minAmount,
                                )} - ${formatCurrency(tier.maxAmount)}`}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {tier.requiresVRF
                              ? 'Chainlink VRF verified'
                              : 'Instant payout'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          {tier.probability}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          chance
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Why Choose ChainLuck?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We&apos;ve built the most transparent and fair lottery platform
              ever created.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Shield className="h-6 w-6 text-green-500" />
                  <CardTitle>100% On-Chain</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Every transaction, every random number, every payout is
                  recorded on the blockchain. Complete transparency and
                  immutable records.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Target className="h-6 w-6 text-blue-500" />
                  <CardTitle>Provably Fair</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Big wins use Chainlink VRF (Verifiable Random Function) for
                  cryptographically secure randomness that can be independently
                  verified.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Zap className="h-6 w-6 text-yellow-500" />
                  <CardTitle>Instant Payouts</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Small wins (under $50) are paid immediately to your wallet. No
                  waiting, no processing delays, no middlemen.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-6 w-6 text-green-500" />
                  <CardTitle>Guaranteed Wins</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Every single ticket guarantees a $
                  {formatCurrency(LOTTERY_CONFIG.GUARANTEED_WIN_USD)} win. You
                  literally cannot lose money on every ticket purchase.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Lock className="h-6 w-6 text-purple-500" />
                  <CardTitle>Secure & Auditable</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Smart contracts are open source and auditable by anyone. Built
                  with security best practices and battle-tested code.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Users className="h-6 w-6 text-orange-500" />
                  <CardTitle>Community Driven</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Built by the community, for the community. No corporate
                  overlords, just fair gaming for everyone.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Transparency Section */}
      <section id="transparency" className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center space-x-3">
                    <BarChart3 className="h-8 w-8 text-primary" />
                    <CardTitle className="text-2xl">
                      Complete Transparency
                    </CardTitle>
                  </div>
                  <p className="text-muted-foreground">
                    See exactly where every dollar goes. No hidden fees, no
                    black boxes.
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Revenue Breakdown (Per $5 Ticket)
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/20 rounded">
                        <span>Guaranteed Win</span>
                        <span className="font-semibold">$0.10 (2%)</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded">
                        <span>Prize Pool</span>
                        <span className="font-semibold">$0.80 (16%)</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded">
                        <span>Referral Rewards</span>
                        <span className="font-semibold">$0.20 (4%)</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded">
                        <span>VRF & Gas</span>
                        <span className="font-semibold">$0.15 (3%)</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted rounded">
                        <span>Platform Operations</span>
                        <span className="font-semibold">$3.75 (75%)</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Platform Commitments
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start space-x-3">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>
                          All smart contracts are open source and verified
                        </span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Prize pools are fully funded and protected</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Chainlink VRF ensures fair randomness</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>No hidden fees or surprise charges</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Community governance for future updates</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to know about ChainLuck
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  How does the guaranteed win work?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Every ticket you purchase automatically includes a $
                  {formatCurrency(LOTTERY_CONFIG.GUARANTEED_WIN_USD)} win
                  that&apos;s paid out immediately. This ensures you always get
                  something back, making ChainLuck the lowest-risk lottery ever
                  created. On top of this guaranteed amount, you have chances to
                  win much larger prizes!
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  What is Chainlink VRF and why do you use it?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Chainlink VRF (Verifiable Random Function) is the gold
                  standard for generating secure, unbiased random numbers on
                  blockchain. For big wins ($50+), we use VRF to ensure the
                  randomness is cryptographically secure and independently
                  verifiable. This means neither we nor anyone else can
                  manipulate the results.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  How quickly do I receive my winnings?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Small wins (under $50) are paid instantly to your wallet as
                  part of the same transaction. Big wins that use Chainlink VRF
                  typically take 1-2 minutes to process as we wait for the VRF
                  response. All winnings are automatically credited to your
                  connected wallet.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  What networks do you support?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Currently, ChainLuck operates on Polygon for fast, low-cost
                  transactions. We&apos;re planning to expand to other networks
                  like BSC and Ethereum L2s based on community demand. All
                  payments are made in USDC for stability.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  Is this gambling? What about regulations?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  ChainLuck operates as a decentralized application where every
                  ticket guarantees a return, making it more like a game with
                  prizes than traditional gambling. However, regulations vary by
                  jurisdiction. Users are responsible for ensuring they comply
                  with their local laws. We recommend checking your local
                  regulations before participating.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  How do referrals work?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  After spending $10+ on tickets, you unlock the ability to
                  refer friends. When someone uses your referral link and spends
                  $10+, you earn $
                  {formatCurrency(LOTTERY_CONFIG.REFERRAL_REWARD_USD)}{' '}
                  instantly. You can refer up to{' '}
                  {LOTTERY_CONFIG.MAX_REFERRALS_PER_USER} friends. Referral
                  rewards are funded from our platform revenue, not from prize
                  pools.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20">
            <CardContent className="pt-8 text-center space-y-6">
              <h2 className="text-3xl font-bold">Ready to Try Your Luck?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join thousands of players who are already winning with
                ChainLuck. Remember, every ticket guarantees a win!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Start Playing Now
                </Link>
                <a
                  href="https://github.com/chainluck"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-8 py-3 border border-primary text-primary rounded-lg font-medium hover:bg-primary/5 transition-colors"
                >
                  View Source Code
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
