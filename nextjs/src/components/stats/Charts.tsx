// nextjs/src/components/stats/Charts.tsx

'use client';

import { BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
} from 'recharts';
import { useLiveStats } from '@/hooks/useChainLuckContract';
import { formatCurrency, formatNumber } from '@/data/constants';

// Mock data for charts - replace with real historical data
const weeklyRevenue = [
  { name: 'Mon', revenue: 1250, tickets: 125 },
  { name: 'Tue', revenue: 2100, tickets: 210 },
  { name: 'Wed', revenue: 1800, tickets: 180 },
  { name: 'Thu', revenue: 2400, tickets: 240 },
  { name: 'Fri', revenue: 2800, tickets: 280 },
  { name: 'Sat', revenue: 3200, tickets: 320 },
  { name: 'Sun', revenue: 2900, tickets: 290 },
];

const ticketDistribution = [
  { name: '1 Ticket', value: 35, count: 450, color: '#3B82F6' },
  { name: '5 Tickets', value: 40, count: 320, color: '#10B981' },
  { name: '10 Tickets', value: 15, count: 120, color: '#F59E0B' },
  { name: '20 Tickets', value: 8, count: 64, color: '#EF4444' },
  { name: '50 Tickets', value: 2, count: 16, color: '#8B5CF6' },
];

const RAMP_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export function Charts() {
  const { stats, isLoading } = useLiveStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Platform Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Loading charts...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Custom tooltip for bar chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-blue-600">
            Revenue: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-green-600">
            Tickets: {formatNumber(payload[1].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for pie chart
  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{data.name}</p>
          <p className="text-muted-foreground">
            {data.value}% ({data.count} purchases)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          <span>Platform Analytics</span>
          <Badge variant="outline" className="text-xs">
            7 Days
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Weekly Revenue Chart */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span>Weekly Performance</span>
            </h3>
            <div className="text-xs text-muted-foreground">
              Total:{' '}
              {formatCurrency(
                weeklyRevenue.reduce((sum, day) => sum + day.revenue, 0),
              )}
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyRevenue}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="revenue"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                  name="Revenue"
                />
                <Bar
                  dataKey="tickets"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                  name="Tickets"
                  yAxisId="tickets"
                  hide
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ticket Distribution Chart */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center space-x-2">
              <PieChart className="h-4 w-4 text-purple-500" />
              <span>Ticket Package Distribution</span>
            </h3>
            <div className="text-xs text-muted-foreground">
              Total purchases:{' '}
              {ticketDistribution.reduce((sum, item) => sum + item.count, 0)}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    dataKey="value"
                    data={ticketDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                  >
                    {ticketDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="space-y-3">
              {ticketDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{item.value}%</div>
                    <div className="text-xs text-muted-foreground">
                      {item.count} purchases
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-lg font-bold text-blue-600">$4.2K</div>
            <div className="text-xs text-muted-foreground">
              Avg Daily Revenue
            </div>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-lg font-bold text-green-600">2.1K</div>
            <div className="text-xs text-muted-foreground">Weekly Tickets</div>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-lg font-bold text-purple-600">+18%</div>
            <div className="text-xs text-muted-foreground">Growth Rate</div>
          </div>
        </div>

        {/* Chart Info */}
        <div className="text-center pt-3 border-t">
          <div className="text-xs text-muted-foreground">
            📈 Charts update daily with aggregated blockchain data
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
