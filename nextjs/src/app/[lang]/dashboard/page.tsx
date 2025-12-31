// nextjs/src/app/dashboard/page.tsx

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DashboardGuard } from '@/components/auth/ProtectedRoute';
import { UserStats } from '@/components/dashboard/UserStats';
import { WinHistory } from '@/components/dashboard/WinHistory';
import { ReferralPanel } from '@/components/dashboard/ReferralPanel';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { PendingWins } from '@/components/lottery/PendingWins';
import { useUser } from '@/components/providers/UserProvider';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { stats, hasUnclaimedWins } = useUser();

  return (
    <DashboardGuard>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Header */}
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-2">
                <Link
                  href="/"
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to Lottery
                </Link>
                <div className="flex items-center space-x-3">
                  <h1 className="text-4xl font-bold tracking-tight">
                    Dashboard
                  </h1>
                  <Badge variant="outline">Personal Stats</Badge>
                  {hasUnclaimedWins && (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700"
                    >
                      💰 Wins Available
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">
                  Track your lottery performance and manage your account
                </p>
                {stats && (
                  <div className="text-sm text-muted-foreground">
                    Connected: {stats.walletAddress.slice(0, 6)}...
                    {stats.walletAddress.slice(-4)}
                  </div>
                )}
              </div>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* User Statistics Overview */}
                <UserStats />

                {/* Pending Wins - Only show if user has wins */}
                {hasUnclaimedWins && <PendingWins />}

                {/* Win History */}
                <WinHistory />
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Referral Panel */}
                <ReferralPanel />

                {/* Recent Activity */}
                <ActivityFeed />

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Link href="/">
                      <Button variant="outline" className="w-full">
                        Buy More Tickets
                      </Button>
                    </Link>
                    <Link href="/stats">
                      <Button variant="outline" className="w-full">
                        View Platform Stats
                      </Button>
                    </Link>
                    <Link href="/about">
                      <Button variant="outline" className="w-full">
                        How It Works
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>
    </DashboardGuard>
  );
}
