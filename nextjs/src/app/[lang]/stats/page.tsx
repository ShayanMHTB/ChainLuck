// nextjs/src/app/stats/page.tsx

'use client';

import { RecentWinners } from '@/components/lottery/RecentWinners';
import { Charts } from '@/components/stats/Charts';
import { GlobalStats } from '@/components/stats/GlobalStats';
import { PoolAnalytics } from '@/components/stats/PoolAnalytics';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function StatsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Lottery
            </Link>

            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <BarChart3 className="h-8 w-8 text-primary" />
                <h1 className="text-4xl font-bold tracking-tight">
                  Platform Statistics
                </h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Real-time analytics and insights from the ChainLuck lottery
                platform
              </p>
              <div className="flex justify-center">
                <Badge variant="outline" className="text-sm">
                  🔴 Live Data
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Content */}
      <section className="pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Global Statistics Overview */}
            <GlobalStats />

            {/* Charts and Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Charts />
              <PoolAnalytics />
            </div>

            {/* Recent Winners */}
            <RecentWinners />

            {/* Additional Platform Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Platform Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Contract Security</span>
                      <Badge
                        variant="secondary"
                        className="text-green-600 bg-green-50"
                      >
                        ✅ Verified
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Pool Liquidity</span>
                      <Badge
                        variant="secondary"
                        className="text-green-600 bg-green-50"
                      >
                        ✅ Healthy
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">VRF Status</span>
                      <Badge
                        variant="secondary"
                        className="text-green-600 bg-green-50"
                      >
                        ✅ Active
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Transparency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>All transactions on-chain</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Open source smart contracts</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Provably fair randomness</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Real-time prize pool monitoring</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Community</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link
                    href="/about"
                    className="block p-2 rounded border hover:bg-muted/50 transition-colors"
                  >
                    <div className="text-sm font-medium">How It Works</div>
                    <div className="text-xs text-muted-foreground">
                      Learn about our lottery mechanics
                    </div>
                  </Link>
                  <Link
                    href="/dashboard"
                    className="block p-2 rounded border hover:bg-muted/50 transition-colors"
                  >
                    <div className="text-sm font-medium">Your Dashboard</div>
                    <div className="text-xs text-muted-foreground">
                      Personal stats and history
                    </div>
                  </Link>
                  <a
                    href="https://github.com/chainluck"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-2 rounded border hover:bg-muted/50 transition-colors"
                  >
                    <div className="text-sm font-medium">Source Code</div>
                    <div className="text-xs text-muted-foreground">
                      View on GitHub
                    </div>
                  </a>
                </CardContent>
              </Card>
            </div>

            {/* Data Refresh Info */}
            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <div className="text-sm font-medium">📊 Live Data</div>
                  <div className="text-xs text-muted-foreground">
                    Statistics update every 30 seconds from the blockchain. All
                    data is pulled directly from smart contracts.
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
