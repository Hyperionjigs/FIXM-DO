"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Target, 
  BarChart3,
  Activity,
  Zap,
  RefreshCw,
  Eye,
  Calculator,
  Minus,
  MapPin,
  Lightbulb
} from 'lucide-react';
import { businessIntelligence } from '@/lib/business-intelligence';

export default function BusinessIntelligenceDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBusinessData();
    const interval = setInterval(loadBusinessData, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadBusinessData = async () => {
    setLoading(true);
    try {
      const businessMetrics = await businessIntelligence.getBusinessMetrics();
      setMetrics(businessMetrics);
    } catch (error) {
      console.error('[BI] Failed to load business data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Business Intelligence Dashboard</h1>
            <p className="text-gray-600">Advanced analytics and revenue optimization</p>
          </div>
          <Button disabled>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Loading...
          </Button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold">Failed to load business data</h3>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Business Intelligence Dashboard</h1>
          <p className="text-gray-600">Advanced analytics and revenue optimization</p>
        </div>
        <Button onClick={loadBusinessData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Total Revenue</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">${metrics.revenue.totalRevenue.toLocaleString()}</span>
            </div>
            <div className="mt-1 flex items-center space-x-1">
              {getTrendIcon(metrics.trends.revenueGrowth.trend)}
              <span className={`text-sm ${getTrendColor(metrics.trends.revenueGrowth.trend)}`}>
                {metrics.trends.revenueGrowth.percentageChange.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-600">Total Users</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{metrics.users.totalUsers.toLocaleString()}</span>
            </div>
            <div className="mt-1 flex items-center space-x-1">
              {getTrendIcon(metrics.trends.userGrowth.trend)}
              <span className={`text-sm ${getTrendColor(metrics.trends.userGrowth.trend)}`}>
                {metrics.trends.userGrowth.percentageChange.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium text-gray-600">Total Tasks</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{metrics.tasks.totalTasks.toLocaleString()}</span>
            </div>
            <div className="mt-1 flex items-center space-x-1">
              {getTrendIcon(metrics.trends.taskGrowth.trend)}
              <span className={`text-sm ${getTrendColor(metrics.trends.taskGrowth.trend)}`}>
                {metrics.trends.taskGrowth.percentageChange.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium text-gray-600">Market Share</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{metrics.market.marketShare}%</span>
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Market size: ${metrics.market.marketSize.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="market">Market Intelligence</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Business Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Monthly Revenue</span>
                    <div className="font-semibold">${metrics.revenue.monthlyRevenue.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Avg Transaction</span>
                    <div className="font-semibold">${metrics.revenue.averageTransactionValue.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Active Users</span>
                    <div className="font-semibold">{metrics.users.activeUsers.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Completion Rate</span>
                    <div className="font-semibold">{(metrics.tasks.taskCompletionRate * 100).toFixed(1)}%</div>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-gray-600">System Performance</span>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uptime</span>
                      <span>{metrics.performance.systemUptime}%</span>
                    </div>
                    <Progress value={metrics.performance.systemUptime} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Growth Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(metrics.trends).map(([key, trend]: [string, any]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(trend.trend)}
                      <span className="text-sm font-medium capitalize">{key.replace('Growth', '')}</span>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${getTrendColor(trend.trend)}`}>
                        {trend.percentageChange.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {trend.current.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Revenue Breakdown</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Commission Revenue</span>
                    <span className="font-semibold">${metrics.revenue.commissionRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Subscription Revenue</span>
                    <span className="font-semibold">${metrics.revenue.subscriptionRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Net Revenue</span>
                    <span className="font-semibold">${metrics.revenue.netRevenue.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Revenue Growth</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {metrics.trends.revenueGrowth.percentageChange.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Revenue Growth</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>User Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">New Users</span>
                    <div className="font-semibold">{metrics.users.newUsers.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Active Users</span>
                    <div className="font-semibold">{metrics.users.activeUsers.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Churn Rate</span>
                    <div className="font-semibold">{(metrics.users.churnRate * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Retention Rate</span>
                    <div className="font-semibold">{(metrics.users.userRetention * 100).toFixed(1)}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>User Growth</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {metrics.trends.userGrowth.percentageChange.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">User Growth</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Market Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Market Size</span>
                    <span className="font-semibold">${metrics.market.marketSize.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Market Share</span>
                    <span className="font-semibold">{metrics.market.marketShare}%</span>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-gray-600">Demand Forecast</span>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Short Term (30 days)</span>
                      <span>{metrics.market.demandForecast.shortTerm.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Medium Term (3 months)</span>
                      <span>{metrics.market.demandForecast.mediumTerm.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Long Term (12 months)</span>
                      <span>{metrics.market.demandForecast.longTerm.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Competitor Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.market.competitorAnalysis.map((competitor: any) => (
                    <div key={competitor.name} className="p-3 border rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{competitor.name}</span>
                        <Badge variant={competitor.threatLevel === 'high' ? 'destructive' : 'default'}>
                          {competitor.threatLevel}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Market Share:</span>
                          <div>{competitor.marketShare}%</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Pricing:</span>
                          <div>${competitor.pricing}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 