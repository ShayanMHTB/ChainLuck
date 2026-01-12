// nextjs/src/components/dashboard/ActivityFeed.tsx

'use client';

import { Clock, Ticket, Trophy, DollarSign, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency } from '@/data/constants';

// Mock activity data - replace with real contract events
const mockActivity = [
  {
    id: '1',
    type: 'ticket_purchase',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    data: {
      ticketCount: 5,
      amount: 17.5,
      guaranteedWin: 0.875,
    },
  },
  {
    id: '2',
    type: 'grand_prize_win',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    data: {
      amount: 500,
      tier: '$500 Grand Prize',
    },
  },
  {
    id: '3',
    type: 'wins_claimed',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5), // 2.5 hours ago
    data: {
      amount: 500.875,
    },
  },
  {
    id: '4',
    type: 'referral_earned',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    data: {
      amount: 4,
      referredUser: '0x1234...5678',
    },
  },
  {
    id: '5',
    type: 'ticket_purchase',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25), // 25 hours ago
    data: {
      ticketCount: 1,
      amount: 3.5,
      guaranteedWin: 0.175,
    },
  },
];

type ActivityType =
  | 'ticket_purchase'
  | 'grand_prize_win'
  | 'wins_claimed'
  | 'referral_earned';

interface ActivityItem {
  id: string;
  type: ActivityType;
  timestamp: Date;
  data: any;
}

export function ActivityFeed() {
  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'ticket_purchase':
        return <Ticket className="h-4 w-4 text-blue-500" />;
      case 'grand_prize_win':
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'wins_claimed':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'referral_earned':
        return <Users className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityText = (item: ActivityItem) => {
    switch (item.type) {
      case 'ticket_purchase':
        return {
          title: `Bought ${item.data.ticketCount} ticket${
            item.data.ticketCount > 1 ? 's' : ''
          }`,
          description: `Spent ${formatCurrency(
            item.data.amount,
          )} • Won ${formatCurrency(item.data.guaranteedWin)} guaranteed`,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-950/20',
        };
      case 'grand_prize_win':
        return {
          title: `🏆 Won ${item.data.tier}!`,
          description: `Grand prize of ${formatCurrency(item.data.amount)}`,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
        };
      case 'wins_claimed':
        return {
          title: 'Claimed winnings',
          description: `Received ${formatCurrency(item.data.amount)} to wallet`,
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-950/20',
        };
      case 'referral_earned':
        return {
          title: 'Referral reward earned',
          description: `Friend ${
            item.data.referredUser
          } joined • Earned ${formatCurrency(item.data.amount)}`,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50 dark:bg-purple-950/20',
        };
      default:
        return {
          title: 'Unknown activity',
          description: '',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50 dark:bg-gray-950/20',
        };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <Clock className="h-5 w-5 text-gray-500" />
          <span>Recent Activity</span>
          <Badge variant="outline" className="text-xs">
            Personal
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {mockActivity.length === 0 ? (
          <div className="text-center py-6 space-y-3">
            <div className="text-3xl">📱</div>
            <div className="text-sm text-muted-foreground">No activity yet</div>
            <div className="text-xs text-muted-foreground">
              Your lottery activity will appear here
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {mockActivity.map((item) => {
                const activityInfo = getActivityText(item);

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border ${activityInfo.bgColor} border-opacity-50`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getActivityIcon(item.type)}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div
                          className={`text-sm font-medium ${activityInfo.color}`}
                        >
                          {activityInfo.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {activityInfo.description}
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeAgo(item.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* Activity Summary */}
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-center text-xs">
            <div>
              <div className="font-semibold text-foreground">
                {
                  mockActivity.filter((item) => item.type === 'ticket_purchase')
                    .length
                }
              </div>
              <div className="text-muted-foreground">Purchases</div>
            </div>
            <div>
              <div className="font-semibold text-foreground">
                {
                  mockActivity.filter((item) => item.type === 'grand_prize_win')
                    .length
                }
              </div>
              <div className="text-muted-foreground">Grand Prizes</div>
            </div>
          </div>

          <div className="text-center mt-3">
            <div className="text-xs text-muted-foreground">
              📊 Last 30 days of activity
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
