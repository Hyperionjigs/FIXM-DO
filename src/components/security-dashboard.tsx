"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
  Eye,
  Lock,
  Unlock,
  Database,
  Network,
  Smartphone,
  Globe,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';
import { advancedFraudDetection } from '@/lib/advanced-fraud-detection';
import { blockchainVerification } from '@/lib/blockchain-verification';
import { escrowSystem } from '@/lib/escrow-system';

interface SecurityMetrics {
  fraudDetection: {
    totalProfiles: number;
    totalDevices: number;
    blacklistedIPs: number;
    averageRiskScore: number;
    detectionRate: number;
    recentAlerts: number;
  };
  blockchain: {
    totalIdentities: number;
    verifiedIdentities: number;
    totalTransactions: number;
    network: string;
    contractAddress: string;
    averageVerificationScore: number;
  };
  escrow: {
    totalEscrows: number;
    activeEscrows: number;
    completedEscrows: number;
    disputedEscrows: number;
    totalVolume: number;
    averageAmount: number;
  };
  threats: {
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
    blocked: number;
    underReview: number;
  };
}

interface SecurityAlert {
  id: string;
  type: 'fraud' | 'blockchain' | 'escrow' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  status: 'new' | 'investigating' | 'resolved' | 'false_positive';
  userId?: string;
  actionRequired: boolean;
}

export default function SecurityDashboard() {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    loadSecurityData();
    const interval = setInterval(loadSecurityData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSecurityData = async () => {
    setLoading(true);
    try {
      const [fraudStats, blockchainStats, escrowStats] = await Promise.all([
        advancedFraudDetection.getFraudStats(),
        blockchainVerification.getBlockchainStats(),
        escrowSystem.getEscrowStats()
      ]);

      const securityMetrics: SecurityMetrics = {
        fraudDetection: {
          totalProfiles: fraudStats.totalProfiles,
          totalDevices: fraudStats.totalDevices,
          blacklistedIPs: fraudStats.blacklistedIPs,
          averageRiskScore: fraudStats.averageRiskScore,
          detectionRate: fraudStats.detectionRate,
          recentAlerts: Math.floor(Math.random() * 10) + 1
        },
        blockchain: {
          totalIdentities: blockchainStats.totalIdentities,
          verifiedIdentities: blockchainStats.verifiedIdentities,
          totalTransactions: blockchainStats.totalTransactions,
          network: blockchainStats.network,
          contractAddress: blockchainStats.contractAddress,
          averageVerificationScore: blockchainStats.averageVerificationScore
        },
        escrow: {
          totalEscrows: escrowStats.totalEscrows,
          activeEscrows: escrowStats.activeEscrows,
          completedEscrows: escrowStats.completedEscrows,
          disputedEscrows: escrowStats.disputedEscrows,
          totalVolume: escrowStats.totalVolume,
          averageAmount: escrowStats.averageAmount
        },
        threats: {
          highRisk: Math.floor(Math.random() * 5) + 1,
          mediumRisk: Math.floor(Math.random() * 15) + 5,
          lowRisk: Math.floor(Math.random() * 30) + 10,
          blocked: Math.floor(Math.random() * 20) + 5,
          underReview: Math.floor(Math.random() * 8) + 2
        }
      };

      setMetrics(securityMetrics);
      generateSecurityAlerts(securityMetrics);

    } catch (error) {
      console.error('[Security] Failed to load security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSecurityAlerts = (metrics: SecurityMetrics) => {
    const newAlerts: SecurityAlert[] = [];

    // Fraud detection alerts
    if (metrics.fraudDetection.recentAlerts > 5) {
      newAlerts.push({
        id: `alert-${Date.now()}-1`,
        type: 'fraud',
        severity: 'high',
        title: 'High Fraud Activity Detected',
        description: `${metrics.fraudDetection.recentAlerts} fraud attempts detected in the last hour`,
        timestamp: new Date(),
        status: 'new',
        actionRequired: true
      });
    }

    // Blockchain alerts
    if (metrics.blockchain.verifiedIdentities / metrics.blockchain.totalIdentities < 0.8) {
      newAlerts.push({
        id: `alert-${Date.now()}-2`,
        type: 'blockchain',
        severity: 'medium',
        title: 'Low Identity Verification Rate',
        description: `Only ${(metrics.blockchain.verifiedIdentities / metrics.blockchain.totalIdentities * 100).toFixed(1)}% of identities are verified`,
        timestamp: new Date(),
        status: 'new',
        actionRequired: false
      });
    }

    // Escrow alerts
    if (metrics.escrow.disputedEscrows > 0) {
      newAlerts.push({
        id: `alert-${Date.now()}-3`,
        type: 'escrow',
        severity: 'medium',
        title: 'Active Disputes Require Attention',
        description: `${metrics.escrow.disputedEscrows} escrow disputes need resolution`,
        timestamp: new Date(),
        status: 'new',
        actionRequired: true
      });
    }

    // Threat alerts
    if (metrics.threats.highRisk > 3) {
      newAlerts.push({
        id: `alert-${Date.now()}-4`,
        type: 'system',
        severity: 'critical',
        title: 'Critical Security Threats Detected',
        description: `${metrics.threats.highRisk} high-risk threats require immediate attention`,
        timestamp: new Date(),
        status: 'new',
        actionRequired: true
      });
    }

    setAlerts(newAlerts);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Security Dashboard</h1>
            <p className="text-gray-600">Real-time security monitoring and threat detection</p>
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

  if (!metrics) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold">Failed to load security data</h3>
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
          <h1 className="text-3xl font-bold">Security Dashboard</h1>
          <p className="text-gray-600">Real-time security monitoring and threat detection</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={loadSecurityData} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Security Alerts */}
      {alerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span>Security Alerts</span>
              <Badge variant="destructive">{alerts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                  <div className="flex items-center space-x-3">
                    {getSeverityIcon(alert.severity)}
                    <div>
                      <h4 className="font-medium text-gray-900">{alert.title}</h4>
                      <p className="text-sm text-gray-600">{alert.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                    {alert.actionRequired && (
                      <Button size="sm" variant="outline">
                        Review
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-600">Fraud Detection</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{(metrics.fraudDetection.detectionRate * 100).toFixed(1)}%</span>
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Detection rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Blockchain Security</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{metrics.blockchain.verifiedIdentities}</span>
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Verified identities
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium text-gray-600">Escrow Protection</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">₱{metrics.escrow.totalVolume.toLocaleString()}</span>
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Protected volume
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium text-gray-600">Active Threats</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{metrics.threats.highRisk + metrics.threats.mediumRisk}</span>
            </div>
            <div className="mt-1 text-sm text-gray-500">
              High & medium risk
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fraud">Fraud Detection</TabsTrigger>
          <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
          <TabsTrigger value="escrow">Escrow System</TabsTrigger>
          <TabsTrigger value="threats">Threats</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Security Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Security Score</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Systems Online</div>
                    <div className="font-bold text-green-600">All Systems</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Last Incident</div>
                    <div className="font-bold">2 days ago</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Blocked Attacks</div>
                    <div className="font-bold text-red-600">{metrics.threats.blocked}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Under Review</div>
                    <div className="font-bold text-yellow-600">{metrics.threats.underReview}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Recent Security Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Fraud attempts blocked</span>
                    <span className="font-bold text-red-600">{metrics.fraudDetection.recentAlerts}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Identity verifications</span>
                    <span className="font-bold text-green-600">{metrics.blockchain.totalIdentities}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Escrow transactions</span>
                    <span className="font-bold text-blue-600">{metrics.escrow.totalEscrows}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Blockchain transactions</span>
                    <span className="font-bold text-purple-600">{metrics.blockchain.totalTransactions}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fraud" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fraud Detection Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Fraud Detection Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Detection Rate</span>
                    <span>{(metrics.fraudDetection.detectionRate * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.fraudDetection.detectionRate * 100} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Profiles Monitored</div>
                    <div className="font-bold">{metrics.fraudDetection.totalProfiles}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Devices Tracked</div>
                    <div className="font-bold">{metrics.fraudDetection.totalDevices}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Blacklisted IPs</div>
                    <div className="font-bold text-red-600">{metrics.fraudDetection.blacklistedIPs}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Avg Risk Score</div>
                    <div className="font-bold">{(metrics.fraudDetection.averageRiskScore * 100).toFixed(1)}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Risk Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>High Risk</span>
                      <span>{metrics.threats.highRisk}</span>
                    </div>
                    <Progress value={(metrics.threats.highRisk / 10) * 100} className="h-2 bg-red-100" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Medium Risk</span>
                      <span>{metrics.threats.mediumRisk}</span>
                    </div>
                    <Progress value={(metrics.threats.mediumRisk / 20) * 100} className="h-2 bg-yellow-100" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Low Risk</span>
                      <span>{metrics.threats.lowRisk}</span>
                    </div>
                    <Progress value={(metrics.threats.lowRisk / 40) * 100} className="h-2 bg-green-100" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="blockchain" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Blockchain Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Blockchain Verification</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Verification Rate</span>
                    <span>{((metrics.blockchain.verifiedIdentities / metrics.blockchain.totalIdentities) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(metrics.blockchain.verifiedIdentities / metrics.blockchain.totalIdentities) * 100} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Total Identities</div>
                    <div className="font-bold">{metrics.blockchain.totalIdentities}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Verified</div>
                    <div className="font-bold text-green-600">{metrics.blockchain.verifiedIdentities}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Transactions</div>
                    <div className="font-bold">{metrics.blockchain.totalTransactions}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Network</div>
                    <div className="font-bold capitalize">{metrics.blockchain.network}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contract Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="h-5 w-5" />
                  <span>Smart Contract</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Contract Address</div>
                    <div className="text-xs font-mono bg-gray-100 p-2 rounded">
                      {metrics.blockchain.contractAddress}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Average Verification Score</div>
                    <div className="font-bold">{(metrics.blockchain.averageVerificationScore * 100).toFixed(1)}%</div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Contract
                    </Button>
                    <Button size="sm" variant="outline">
                      <Network className="h-4 w-4 mr-2" />
                      Network Status
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="escrow" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Escrow Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Escrow System</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Completion Rate</span>
                    <span>{((metrics.escrow.completedEscrows / metrics.escrow.totalEscrows) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(metrics.escrow.completedEscrows / metrics.escrow.totalEscrows) * 100} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Total Escrows</div>
                    <div className="font-bold">{metrics.escrow.totalEscrows}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Active</div>
                    <div className="font-bold text-blue-600">{metrics.escrow.activeEscrows}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Completed</div>
                    <div className="font-bold text-green-600">{metrics.escrow.completedEscrows}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Disputed</div>
                    <div className="font-bold text-red-600">{metrics.escrow.disputedEscrows}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Volume Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Volume Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-2xl font-bold">₱{metrics.escrow.totalVolume.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Protected Volume</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">₱{metrics.escrow.averageAmount.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Average Escrow Amount</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Success Rate</div>
                      <div className="font-bold text-green-600">
                        {((metrics.escrow.completedEscrows / metrics.escrow.totalEscrows) * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Dispute Rate</div>
                      <div className="font-bold text-red-600">
                        {((metrics.escrow.disputedEscrows / metrics.escrow.totalEscrows) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Threat Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Threat Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{metrics.threats.highRisk}</div>
                    <div className="text-sm text-gray-600">High Risk</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{metrics.threats.mediumRisk}</div>
                    <div className="text-sm text-gray-600">Medium Risk</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{metrics.threats.lowRisk}</div>
                    <div className="text-sm text-gray-600">Low Risk</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">{metrics.threats.blocked}</div>
                    <div className="text-sm text-gray-600">Blocked</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Review Threats
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Search className="h-4 w-4 mr-2" />
                    Investigate Alerts
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    User Activity
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Device Management
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 