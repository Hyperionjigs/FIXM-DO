'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Shield,
  Zap,
  Users,
  Bug
} from 'lucide-react'

interface QualityMetrics {
  testCoverage: number
  securityScore: number
  performanceScore: number
  errorRate: number
  userSatisfaction: number
  lastUpdated: string
  status: 'excellent' | 'good' | 'warning' | 'critical'
}

interface QualityAlert {
  id: string
  type: 'error' | 'warning' | 'info' | 'success'
  message: string
  timestamp: string
  priority: 'low' | 'medium' | 'high' | 'critical'
}

const QualityDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<QualityMetrics>({
    testCoverage: 0.21,
    securityScore: 85,
    performanceScore: 78,
    errorRate: 2.5,
    userSatisfaction: 4.2,
    lastUpdated: new Date().toISOString(),
    status: 'critical'
  })

  const [alerts, setAlerts] = useState<QualityAlert[]>([
    {
      id: '1',
      type: 'error',
      message: 'Test coverage critically low (0.21%) - Target: 80%+',
      timestamp: new Date().toISOString(),
      priority: 'critical'
    },
    {
      id: '2',
      type: 'warning',
      message: 'Performance score below target (78/90)',
      timestamp: new Date().toISOString(),
      priority: 'high'
    },
    {
      id: '3',
      type: 'warning',
      message: 'Error rate above acceptable threshold (2.5% > 1%)',
      timestamp: new Date().toISOString(),
      priority: 'high'
    }
  ])

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading quality metrics
    const loadMetrics = async () => {
      setIsLoading(true)
      // In real implementation, this would fetch from your quality monitoring service
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsLoading(false)
    }

    loadMetrics()
  }, [])

  const getStatusColor = (status: QualityMetrics['status']) => {
    switch (status) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-blue-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: QualityMetrics['status']) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'good': return <CheckCircle className="h-5 w-5 text-blue-600" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'critical': return <XCircle className="h-5 w-5 text-red-600" />
      default: return <Activity className="h-5 w-5 text-gray-600" />
    }
  }

  const getAlertIcon = (type: QualityAlert['type']) => {
    switch (type) {
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info': return <Activity className="h-4 w-4 text-blue-500" />
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: QualityAlert['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const runQualityCheck = async () => {
    setIsLoading(true)
    // Simulate running quality checks
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Update metrics (in real implementation, this would fetch actual results)
    setMetrics(prev => ({
      ...prev,
      testCoverage: Math.min(prev.testCoverage + 5, 80),
      lastUpdated: new Date().toISOString()
    }))
    
    setIsLoading(false)
  }

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quality Dashboard</h1>
          <p className="text-gray-600">Monitor and track application quality metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge className={`${getStatusColor(metrics.status)} border`}>
            {getStatusIcon(metrics.status)}
            <span className="ml-2 capitalize">{metrics.status}</span>
          </Badge>
          <Button onClick={runQualityCheck} disabled={isLoading}>
            <Activity className="h-4 w-4 mr-2" />
            Run Quality Check
          </Button>
        </div>
      </div>

      {/* Quality Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Test Coverage */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Bug className="h-4 w-4 mr-2" />
              Test Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.testCoverage.toFixed(1)}%
            </div>
            <Progress 
              value={metrics.testCoverage} 
              className="mt-2"
              color={metrics.testCoverage >= 80 ? 'green' : metrics.testCoverage >= 60 ? 'yellow' : 'red'}
            />
            <p className="text-xs text-gray-600 mt-1">
              Target: 80%+
            </p>
          </CardContent>
        </Card>

        {/* Security Score */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Security Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.securityScore}%
            </div>
            <Progress 
              value={metrics.securityScore} 
              className="mt-2"
              color={metrics.securityScore >= 95 ? 'green' : metrics.securityScore >= 80 ? 'yellow' : 'red'}
            />
            <p className="text-xs text-gray-600 mt-1">
              Target: 100%
            </p>
          </CardContent>
        </Card>

        {/* Performance Score */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.performanceScore}
            </div>
            <Progress 
              value={metrics.performanceScore} 
              className="mt-2"
              color={metrics.performanceScore >= 90 ? 'green' : metrics.performanceScore >= 70 ? 'yellow' : 'red'}
            />
            <p className="text-xs text-gray-600 mt-1">
              Target: 90+
            </p>
          </CardContent>
        </Card>

        {/* Error Rate */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <XCircle className="h-4 w-4 mr-2" />
              Error Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.errorRate}%
            </div>
            <Progress 
              value={100 - metrics.errorRate} 
              className="mt-2"
              color={metrics.errorRate <= 1 ? 'green' : metrics.errorRate <= 3 ? 'yellow' : 'red'}
            />
            <p className="text-xs text-gray-600 mt-1">
              Target: &lt;1%
            </p>
          </CardContent>
        </Card>

        {/* User Satisfaction */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2" />
              User Satisfaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.userSatisfaction}/5
            </div>
            <Progress 
              value={(metrics.userSatisfaction / 5) * 100} 
              className="mt-2"
              color={metrics.userSatisfaction >= 4.5 ? 'green' : metrics.userSatisfaction >= 4.0 ? 'yellow' : 'red'}
            />
            <p className="text-xs text-gray-600 mt-1">
              Target: 4.5+
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quality Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Quality Alerts</span>
            <Badge variant="secondary">{alerts.length} active</Badge>
          </CardTitle>
          <CardDescription>
            Critical issues that need immediate attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  No active quality alerts. All systems are running optimally!
                </AlertDescription>
              </Alert>
            ) : (
              alerts.map((alert) => (
                <Alert key={alert.id} className="border-l-4 border-l-red-500">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2">
                      {getAlertIcon(alert.type)}
                      <AlertDescription className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{alert.message}</span>
                          <Badge className={`text-xs ${getPriorityColor(alert.priority)}`}>
                            {alert.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </AlertDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissAlert(alert.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </Button>
                  </div>
                </Alert>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quality Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quality Trends</CardTitle>
            <CardDescription>
              Track quality metrics over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Test Coverage</span>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">+5.2%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Security Score</span>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">+2.1%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Performance</span>
                <div className="flex items-center space-x-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600">-1.5%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Quality Actions</CardTitle>
            <CardDescription>
              Latest quality improvements and fixes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Fixed Jest configuration</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Added payment form tests</p>
                  <p className="text-xs text-gray-500">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium">Performance optimization needed</p>
                  <p className="text-xs text-gray-500">6 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {new Date(metrics.lastUpdated).toLocaleString()}
      </div>
    </div>
  )
}

export default QualityDashboard 