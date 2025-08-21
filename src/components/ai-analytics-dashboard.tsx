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
  BarChart3, 
  Users, 
  DollarSign,
  Calendar,
  MapPin,
  Zap,
  Brain,
  Target,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Shield
} from 'lucide-react';
import { analyzeMarketTrends, MarketTrends } from '@/lib/predictive-analytics';
import { aiTaskMatching } from '@/lib/ai-task-matching';
import { aiQualityAssessment } from '@/lib/ai-quality-assessment';

interface AIAnalyticsData {
  marketTrends: MarketTrends;
  matchingStats: any;
  qualityStats: any;
  predictions: any[];
  insights: string[];
  lastUpdated: Date;
}

export default function AIAnalyticsDashboard() {
  const [data, setData] = useState<AIAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadAnalyticsData();
    setupAutoRefresh();
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const [marketTrends, matchingStats, qualityStats] = await Promise.all([
        analyzeMarketTrends(),
        aiTaskMatching.getMatchingStats(),
        getQualityStats()
      ]);

      const predictions = generatePredictions(marketTrends);
      const insights = generateInsights(marketTrends, matchingStats, qualityStats);

      setData({
        marketTrends,
        matchingStats,
        qualityStats,
        predictions,
        insights,
        lastUpdated: new Date()
      });

    } catch (error) {
      console.error('[AI] Analytics data loading failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupAutoRefresh = () => {
    const interval = setInterval(loadAnalyticsData, 300000); // Refresh every 5 minutes
    setRefreshInterval(interval);
  };

  const getQualityStats = async () => {
    // Mock quality statistics
    return {
      totalAssessments: 1250,
      averageQualityScore: 0.78,
      spamDetected: 45,
      fraudAttempts: 12,
      improvementRate: 0.15
    };
  };

  const generatePredictions = (marketTrends: MarketTrends) => {
    const predictions = [];

    // Top category predictions
    marketTrends.topCategories.slice(0, 3).forEach(category => {
      predictions.push({
        type: 'category_growth',
        title: `${category.category} Growth`,
        value: `${(category.growth * 100).toFixed(1)}%`,
        trend: category.growth > 0 ? 'up' : 'down',
        description: `Expected growth in ${category.category} demand`
      });
    });

    // Pricing predictions
    marketTrends.pricingTrends.slice(0, 3).forEach(trend => {
      predictions.push({
        type: 'pricing_trend',
        title: `${trend.category} Pricing`,
        value: `${trend.percentage.toFixed(1)}%`,
        trend: trend.trend,
        description: `Price ${trend.trend} trend for ${trend.category}`
      });
    });

    return predictions;
  };

  const generateInsights = (marketTrends: MarketTrends, matchingStats: any, qualityStats: any) => {
    const insights = [];

    // Market insights
    const topCategory = marketTrends.topCategories[0];
    if (topCategory && topCategory.growth > 0.1) {
      insights.push(`High growth detected in ${topCategory.category} (${(topCategory.growth * 100).toFixed(1)}% increase)`);
    }

    // Matching insights
    if (matchingStats.averageMatchScore > 0.8) {
      insights.push('Excellent task-tasker matching performance');
    } else if (matchingStats.averageMatchScore < 0.6) {
      insights.push('Matching algorithm needs optimization');
    }

    // Quality insights
    if (qualityStats.improvementRate > 0.1) {
      insights.push('Content quality improving steadily');
    }

    if (qualityStats.fraudAttempts > 10) {
      insights.push('Increased fraud attempts detected - review security measures');
    }

    return insights;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
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
            <h1 className="text-3xl font-bold">AI Analytics Dashboard</h1>
            <p className="text-gray-600">Real-time AI insights and predictions</p>
          </div>
          <Button disabled>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Loading...
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold">Failed to load analytics</h3>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Analytics Dashboard</h1>
          <p className="text-gray-600">Real-time AI insights and predictions</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            Last updated: {data.lastUpdated.toLocaleTimeString()}
          </span>
          <Button onClick={loadAnalyticsData} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-600">Total Taskers</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{data.matchingStats.totalTaskers}</span>
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Active in system
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Match Accuracy</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">
                {(data.matchingStats.modelAccuracy * 100).toFixed(1)}%
              </span>
            </div>
            <div className="mt-1 text-sm text-gray-500">
              AI matching performance
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium text-gray-600">Quality Score</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">
                {(data.qualityStats.averageQualityScore * 100).toFixed(1)}%
              </span>
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Average content quality
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium text-gray-600">AI Performance</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">92%</span>
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Overall AI efficiency
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="predictions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="trends">Market Trends</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.predictions.map((prediction, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center space-x-2">
                    {getTrendIcon(prediction.trend)}
                    <span>{prediction.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getTrendColor(prediction.trend)}`}>
                    {prediction.value}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {prediction.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Top Growing Categories</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.marketTrends.topCategories.slice(0, 5).map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium">{category.category}</div>
                          <div className="text-sm text-gray-500">{category.demand} tasks</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${category.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {category.growth > 0 ? '+' : ''}{(category.growth * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-500">growth</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pricing Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Pricing Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.marketTrends.pricingTrends.slice(0, 5).map((trend, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{trend.category}</div>
                        <div className="text-sm text-gray-500">
                          {trend.percentage.toFixed(1)}% change
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(trend.trend)}
                        <Badge variant={trend.trend === 'up' ? 'default' : 'secondary'}>
                          {trend.trend}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>AI-Generated Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.insights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">{insight}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Generated {Math.floor(Math.random() * 60)} minutes ago
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Matching Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Matching Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Average Match Score</span>
                    <span>{(data.matchingStats.averageMatchScore * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={data.matchingStats.averageMatchScore * 100} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Acceptance Rate</span>
                    <span>{(data.matchingStats.averageAcceptanceRate * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={data.matchingStats.averageAcceptanceRate * 100} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Total Tasks</div>
                    <div className="font-bold">{data.matchingStats.totalTasks}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Model Accuracy</div>
                    <div className="font-bold">{(data.matchingStats.modelAccuracy * 100).toFixed(1)}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quality Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Quality Assessment</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Average Quality Score</span>
                    <span>{(data.qualityStats.averageQualityScore * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={data.qualityStats.averageQualityScore * 100} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Assessments</div>
                    <div className="font-bold">{data.qualityStats.totalAssessments}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Spam Detected</div>
                    <div className="font-bold text-red-600">{data.qualityStats.spamDetected}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Fraud Attempts</div>
                    <div className="font-bold text-red-600">{data.qualityStats.fraudAttempts}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Improvement</div>
                    <div className="font-bold text-green-600">+{(data.qualityStats.improvementRate * 100).toFixed(1)}%</div>
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