"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Zap, 
  Database, 
  Network, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  HardDrive,
  Cpu
} from 'lucide-react';
import { performanceMonitor, PerformanceMetrics } from '@/lib/performance-monitor';
import { advancedCache, CacheStats } from '@/lib/advanced-cache';

interface PerformanceData {
  metrics: PerformanceMetrics;
  cacheStats: CacheStats;
  timestamp: number;
}

export default function PerformanceDashboard() {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateData = () => {
      const data: PerformanceData = {
        metrics: performanceMonitor.getMetrics(),
        cacheStats: advancedCache.getStats(),
        timestamp: Date.now()
      };
      setPerformanceData(data);
    };

    // Initial update
    updateData();

    // Set up refresh interval
    const interval = setInterval(updateData, 2000); // Update every 2 seconds
    setRefreshInterval(interval);

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  const getPerformanceScore = () => {
    if (!performanceData) return 0;
    return performanceMonitor.getPerformanceScore();
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 70) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const toggleMonitoring = () => {
    if (isMonitoring) {
      performanceMonitor.stopMonitoring();
      setIsMonitoring(false);
    } else {
      performanceMonitor.startMonitoring();
      setIsMonitoring(true);
    }
  };

  const clearCache = () => {
    advancedCache.clear();
  };

  if (!performanceData) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="animate-spin h-8 w-8 text-gray-400" />
      </div>
    );
  }

  const { metrics, cacheStats } = performanceData;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Dashboard</h1>
          <p className="text-gray-600">Real-time performance monitoring and optimization</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={toggleMonitoring}
            variant={isMonitoring ? "destructive" : "default"}
            size="sm"
          >
            {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
          </Button>
          <Button onClick={clearCache} variant="outline" size="sm">
            Clear Cache
          </Button>
        </div>
      </div>

      {/* Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Overall Performance Score</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`text-4xl font-bold ${getScoreColor(getPerformanceScore())}`}>
                {getPerformanceScore()}
              </div>
              <div>
                <div className="text-sm text-gray-600">Performance Score</div>
                {getScoreBadge(getPerformanceScore())}
              </div>
            </div>
            <Progress value={getPerformanceScore()} className="w-32" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="core-web-vitals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="core-web-vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="cache">Cache Performance</TabsTrigger>
          <TabsTrigger value="network">Network & API</TabsTrigger>
          <TabsTrigger value="system">System Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="core-web-vitals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* LCP */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span>Largest Contentful Paint</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatTime(metrics.lcp)}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  {metrics.lcp <= 2500 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                  <span className="text-sm text-gray-600">
                    {metrics.lcp <= 2500 ? 'Good' : 'Needs Improvement'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* FID */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>First Input Delay</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatTime(metrics.fid)}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  {metrics.fid <= 100 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                  <span className="text-sm text-gray-600">
                    {metrics.fid <= 100 ? 'Good' : 'Needs Improvement'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* CLS */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Cumulative Layout Shift</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.cls.toFixed(4)}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  {metrics.cls <= 0.1 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                  <span className="text-sm text-gray-600">
                    {metrics.cls <= 0.1 ? 'Good' : 'Needs Improvement'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* FCP */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span>First Contentful Paint</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatTime(metrics.fcp)}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  {metrics.fcp <= 1800 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                  <span className="text-sm text-gray-600">
                    {metrics.fcp <= 1800 ? 'Good' : 'Needs Improvement'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* TTFB */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center space-x-2">
                  <Network className="h-4 w-4" />
                  <span>Time to First Byte</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatTime(metrics.ttfb)}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  {metrics.ttfb <= 600 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                  <span className="text-sm text-gray-600">
                    {metrics.ttfb <= 600 ? 'Good' : 'Needs Improvement'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* App Load Time */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>App Load Time</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatTime(metrics.appLoadTime)}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  {metrics.appLoadTime <= 3000 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                  <span className="text-sm text-gray-600">
                    {metrics.appLoadTime <= 3000 ? 'Good' : 'Needs Improvement'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Cache Hit Rate */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center space-x-2">
                  <Database className="h-4 w-4" />
                  <span>Cache Hit Rate</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(cacheStats.hitRate * 100).toFixed(1)}%
                </div>
                <Progress value={cacheStats.hitRate * 100} className="mt-2" />
                <div className="text-sm text-gray-600 mt-2">
                  {cacheStats.hits} hits / {cacheStats.misses} misses
                </div>
              </CardContent>
            </Card>

            {/* Cache Size */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center space-x-2">
                  <HardDrive className="h-4 w-4" />
                  <span>Cache Size</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatBytes(cacheStats.totalSize)}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {cacheStats.entryCount} entries
                </div>
              </CardContent>
            </Card>

            {/* Cache Evictions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center space-x-2">
                  <TrendingDown className="h-4 w-4" />
                  <span>Cache Evictions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {cacheStats.evictions}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Total evictions
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* API Response Time */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center space-x-2">
                  <Network className="h-4 w-4" />
                  <span>API Response Time</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatTime(metrics.apiResponseTime)}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  {metrics.apiResponseTime <= 500 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                  <span className="text-sm text-gray-600">
                    {metrics.apiResponseTime <= 500 ? 'Good' : 'Needs Improvement'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Network Latency */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center space-x-2">
                  <Network className="h-4 w-4" />
                  <span>Network Latency</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatTime(metrics.networkLatency)}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Connection: {metrics.connectionType}
                </div>
              </CardContent>
            </Card>

            {/* Error Rate */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Error Rate</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(metrics.errorRate * 100).toFixed(2)}%
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {metrics.errorCount} total errors
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Memory Usage */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center space-x-2">
                  <Cpu className="h-4 w-4" />
                  <span>Memory Usage</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(metrics.memoryUsage * 100).toFixed(1)}%
                </div>
                <Progress value={metrics.memoryUsage * 100} className="mt-2" />
                <div className="text-sm text-gray-600 mt-2">
                  JavaScript heap usage
                </div>
              </CardContent>
            </Card>

            {/* Image Load Time */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>Image Load Time</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatTime(metrics.imageLoadTime)}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  {metrics.imageLoadTime <= 1000 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                  <span className="text-sm text-gray-600">
                    {metrics.imageLoadTime <= 1000 ? 'Good' : 'Needs Improvement'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Last Updated */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Last Updated</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Date(performanceData.timestamp).toLocaleTimeString()}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Real-time monitoring
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 