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
  Users, 
  Target, 
  BarChart3,
  Activity,
  RefreshCw,
  Eye,
  Brain,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  PieChart,
  LineChart
} from 'lucide-react';
import { advancedAnalytics } from '@/lib/advanced-analytics';

export default function AdvancedAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
    const interval = setInterval(loadAnalyticsData, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const analyticsData = await advancedAnalytics.getAllAnalytics();
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('[Analytics] Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Advanced Analytics Dashboard</h1>
            <p className="text-gray-600">Predictive modeling and data insights</p>
          </div>
          <Button disabled>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Loading...
          </Button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold">Failed to load analytics data</h3>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Analytics Dashboard</h1>
          <p className="text-gray-600">Predictive modeling and data insights</p>
        </div>
        <Button onClick={loadAnalyticsData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-600">Engagement Score</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{(analytics.userBehavior.engagementScore * 100).toFixed(1)}%</span>
            </div>
            <div className="mt-2">
              <Progress value={analytics.userBehavior.engagementScore * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Conversion Rate</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{(analytics.userBehavior.conversionRate * 100).toFixed(1)}%</span>
            </div>
            <div className="mt-2">
              <Progress value={analytics.userBehavior.conversionRate * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium text-gray-600">Retention Rate</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{(analytics.userBehavior.retentionRate * 100).toFixed(1)}%</span>
            </div>
            <div className="mt-2">
              <Progress value={analytics.userBehavior.retentionRate * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium text-gray-600">Churn Risk</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{(analytics.predictiveModels.userChurn.churnProbability * 100).toFixed(1)}%</span>
            </div>
            <div className="mt-2">
              <Progress value={analytics.predictiveModels.userChurn.churnProbability * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="user-behavior" className="space-y-4">
        <TabsList>
          <TabsTrigger value="user-behavior">User Behavior</TabsTrigger>
          <TabsTrigger value="task-patterns">Task Patterns</TabsTrigger>
          <TabsTrigger value="revenue-insights">Revenue Insights</TabsTrigger>
          <TabsTrigger value="predictive-models">Predictive Models</TabsTrigger>
        </TabsList>

        <TabsContent value="user-behavior" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>User Behavior Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Session Duration</span>
                    <div className="font-semibold">{analytics.userBehavior.sessionDuration}s</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Page Views</span>
                    <div className="font-semibold">{analytics.userBehavior.pageViews}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Bounce Rate</span>
                    <div className="font-semibold">{(analytics.userBehavior.bounceRate * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Engagement Score</span>
                    <div className="font-semibold">{(analytics.userBehavior.engagementScore * 100).toFixed(1)}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5" />
                  <span>Feature Usage</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.userBehavior.featureUsage).map(([feature, usage]) => (
                    <div key={feature} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{feature.replace('_', ' ')}</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={usage * 100} className="w-20 h-2" />
                        <span className="text-sm font-medium">{(usage * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="task-patterns" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Task Category Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.taskPatterns.categoryDistribution).map(([category, percentage]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{category.replace('_', ' ')}</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={percentage * 100} className="w-20 h-2" />
                        <span className="text-sm font-medium">{(percentage * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Time Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.taskPatterns.timeDistribution).map(([time, percentage]) => (
                    <div key={time} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{time}</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={percentage * 100} className="w-20 h-2" />
                        <span className="text-sm font-medium">{(percentage * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue-insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Revenue by Category</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.revenueInsights.revenueByCategory).map(([category, revenue]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{category.replace('_', ' ')}</span>
                      <span className="font-semibold">${revenue.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Revenue Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Revenue Growth</span>
                    <div className="font-semibold text-green-600">{(analytics.revenueInsights.revenueGrowth * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Avg Order Value</span>
                    <div className="font-semibold">${analytics.revenueInsights.averageOrderValue}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Customer LTV</span>
                    <div className="font-semibold">${analytics.revenueInsights.customerLifetimeValue}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Churn Impact</span>
                    <div className="font-semibold text-red-600">${Math.abs(analytics.revenueInsights.churnImpact).toLocaleString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictive-models" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5" />
                  <span>Churn Prediction</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm text-gray-600">Churn Probability</span>
                  <div className="text-2xl font-bold text-red-600">
                    {(analytics.predictiveModels.userChurn.churnProbability * 100).toFixed(1)}%
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-gray-600">Risk Factors</span>
                  <div className="mt-2 space-y-1">
                    {analytics.predictiveModels.userChurn.riskFactors.map((factor: string) => (
                      <div key={factor} className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <span className="text-sm capitalize">{factor.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-gray-600">Retention Strategies</span>
                  <div className="mt-2 space-y-1">
                    {analytics.predictiveModels.userChurn.retentionStrategies.map((strategy: string) => (
                      <div key={strategy} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm capitalize">{strategy.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <LineChart className="h-5 w-5" />
                  <span>Revenue Forecast</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <span className="text-sm text-gray-600">Short Term</span>
                    <div className="text-lg font-bold">${(analytics.predictiveModels.revenueForecast.shortTerm / 1000).toFixed(0)}k</div>
                  </div>
                  <div className="text-center">
                    <span className="text-sm text-gray-600">Medium Term</span>
                    <div className="text-lg font-bold">${(analytics.predictiveModels.revenueForecast.mediumTerm / 1000).toFixed(0)}k</div>
                  </div>
                  <div className="text-center">
                    <span className="text-sm text-gray-600">Long Term</span>
                    <div className="text-lg font-bold">${(analytics.predictiveModels.revenueForecast.longTerm / 1000).toFixed(0)}k</div>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-gray-600">Confidence Level</span>
                  <div className="mt-2">
                    <Progress value={analytics.predictiveModels.revenueForecast.confidence * 100} className="h-2" />
                    <div className="text-sm text-gray-500 mt-1">
                      {(analytics.predictiveModels.revenueForecast.confidence * 100).toFixed(0)}% confidence
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 