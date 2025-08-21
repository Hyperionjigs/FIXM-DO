"use client";

/**
 * Smart Payment Dashboard
 * 
 * Comprehensive admin dashboard for managing smart payments:
 * - Real-time payment monitoring
 * - Risk assessment overview
 * - Payment analytics
 * - Fraud detection alerts
 * - Payment management tools
 */

import React, { useState, useEffect } from 'react';
import { SmartPaymentService, SmartPayment } from '@/lib/smart-payment-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Users,
  Activity,
  BarChart3,
  Eye,
  Check,
  X,
  RefreshCw,
  Filter
} from 'lucide-react';

interface SmartPaymentDashboardProps {
  adminId: string;
}

export function SmartPaymentDashboard({ adminId }: SmartPaymentDashboardProps) {
  const [payments, setPayments] = useState<SmartPayment[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<SmartPayment | null>(null);
  const [notes, setNotes] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      
      // Load payments and analytics in parallel
      const [paymentsResponse, analyticsResponse] = await Promise.all([
        fetch('/api/payments/smart?limit=100'),
        fetch('/api/payments/smart?action=analytics')
      ]);

      const paymentsData = await paymentsResponse.json();
      const analyticsData = await analyticsResponse.json();

      if (paymentsData.success) {
        setPayments(paymentsData.payments || []);
      }

      if (analyticsData.success) {
        setAnalytics(analyticsData.analytics);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (paymentId: string) => {
    try {
      const response = await fetch('/api/payments/smart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          action: 'confirm',
          adminId,
          notes
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Payment confirmed successfully'
        });
        loadDashboard();
        setSelectedPayment(null);
        setNotes('');
      } else {
        throw new Error(data.error || 'Failed to confirm payment');
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to confirm payment',
        variant: 'destructive'
      });
    }
  };

  const handleDetectPayment = async (paymentId: string) => {
    try {
      const response = await fetch('/api/payments/smart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          action: 'detect'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Payment detected successfully'
        });
        loadDashboard();
      } else {
        throw new Error(data.error || 'Failed to detect payment');
      }
    } catch (error) {
      console.error('Error detecting payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to detect payment',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'secondary',
      detected: 'default',
      confirmed: 'default',
      completed: 'default',
      failed: 'destructive',
      expired: 'destructive',
      suspicious: 'destructive'
    };

    return <Badge variant={variants[status] || 'secondary'}>{status.toUpperCase()}</Badge>;
  };

  const getRiskBadge = (riskScore?: number) => {
    if (!riskScore) return <Badge variant="secondary">N/A</Badge>;
    
    if (riskScore < 30) return <Badge variant="default">Low Risk</Badge>;
    if (riskScore < 70) return <Badge variant="secondary">Medium Risk</Badge>;
    return <Badge variant="destructive">High Risk</Badge>;
  };

  const getPaymentMethodIcon = (method: string) => {
    const colors: Record<string, string> = {
      gcash: 'bg-green-500',
      paymaya: 'bg-blue-500',
      gotyme: 'bg-purple-500'
    };

    return (
      <div className={`w-3 h-3 rounded-full ${colors[method] || 'bg-gray-500'}`}></div>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    return new Date(date.toDate ? date.toDate() : date).toLocaleString('en-PH');
  };

  const filteredPayments = payments.filter(payment => {
    const matchesFilter = filter === 'all' || payment.status === filter;
    const matchesSearch = !searchTerm || 
      payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customerPhone.includes(searchTerm);
    
    return matchesFilter && matchesSearch;
  });

  const getAnalyticsCard = (title: string, value: any, icon: React.ReactNode, color: string) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Smart Payment Dashboard</h1>
          <p className="text-gray-600">Real-time payment monitoring and management</p>
        </div>
        <Button onClick={loadDashboard} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getAnalyticsCard(
            'Total Payments',
            analytics.totalPayments || 0,
            <Activity className="h-6 w-6 text-white" />,
            'bg-blue-500'
          )}
          {getAnalyticsCard(
            'Total Amount',
            formatCurrency(analytics.totalAmount || 0),
            <DollarSign className="h-6 w-6 text-white" />,
            'bg-green-500'
          )}
          {getAnalyticsCard(
            'Avg Risk Score',
            Math.round(analytics.averageRiskScore || 0),
            <Shield className="h-6 w-6 text-white" />,
            'bg-orange-500'
          )}
          {getAnalyticsCard(
            'Fraud Rate',
            `${((analytics.fraudRate || 0) * 100).toFixed(1)}%`,
            <AlertTriangle className="h-6 w-6 text-white" />,
            'bg-red-500'
          )}
        </div>
      )}

      {/* Payment Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Payment Management</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="all">All Payments</option>
                  <option value="pending">Pending</option>
                  <option value="detected">Detected</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="suspicious">Suspicious</option>
                </select>
              </div>
              <Input
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="payments" className="w-full">
            <TabsList>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="payments" className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Loading payments...</p>
                </div>
              ) : filteredPayments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No payments found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPayments.map((payment) => (
                    <Card key={payment.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {getPaymentMethodIcon(payment.paymentMethod)}
                            <div>
                              <div className="font-medium">{payment.customerName}</div>
                              <div className="text-sm text-gray-600">
                                {payment.customerPhone} • {payment.referenceNumber}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatDate(payment.createdAt)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-bold text-lg">
                                {formatCurrency(payment.amount)}
                              </div>
                              <div className="text-sm text-gray-600">
                                {payment.paymentMethod.toUpperCase()}
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                              {getStatusBadge(payment.status)}
                              {getRiskBadge(payment.riskScore)}
                            </div>
                            
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Payment Details</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Customer</Label>
                                        <p className="font-medium">{payment.customerName}</p>
                                      </div>
                                      <div>
                                        <Label>Phone</Label>
                                        <p>{payment.customerPhone}</p>
                                      </div>
                                      <div>
                                        <Label>Amount</Label>
                                        <p className="font-bold">{formatCurrency(payment.amount)}</p>
                                      </div>
                                      <div>
                                        <Label>Method</Label>
                                        <p>{payment.paymentMethod.toUpperCase()}</p>
                                      </div>
                                      <div>
                                        <Label>Status</Label>
                                        {getStatusBadge(payment.status)}
                                      </div>
                                      <div>
                                        <Label>Risk Score</Label>
                                        {getRiskBadge(payment.riskScore)}
                                      </div>
                                    </div>
                                    
                                    {payment.fraudIndicators && payment.fraudIndicators.length > 0 && (
                                      <Alert>
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertDescription>
                                          <div className="font-medium mb-2">Fraud Indicators:</div>
                                          <ul className="list-disc list-inside space-y-1">
                                            {payment.fraudIndicators.map((indicator, index) => (
                                              <li key={index} className="text-sm">{indicator}</li>
                                            ))}
                                          </ul>
                                        </AlertDescription>
                                      </Alert>
                                    )}
                                    
                                    {payment.status === 'pending' && (
                                      <div className="space-y-4">
                                        <div>
                                          <Label>Admin Notes</Label>
                                          <Textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Add notes for this payment..."
                                          />
                                        </div>
                                        <div className="flex gap-2">
                                          <Button
                                            onClick={() => handleConfirmPayment(payment.id!)}
                                            className="flex-1"
                                          >
                                            <Check className="mr-2 h-4 w-4" />
                                            Confirm Payment
                                          </Button>
                                          <Button
                                            onClick={() => handleDetectPayment(payment.id!)}
                                            variant="outline"
                                            className="flex-1"
                                          >
                                            <Eye className="mr-2 h-4 w-4" />
                                            Detect Payment
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              {analytics && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Method Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(analytics.methodDistribution || {}).map(([method, count]) => (
                          <div key={method} className="flex items-center justify-between">
                            <span className="capitalize">{method}</span>
                            <Badge>{count as number}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Risk Score Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Low Risk (0-30)</span>
                            <span>{Math.round((1 - (analytics.averageRiskScore || 0) / 100) * 100)}%</span>
                          </div>
                          <Progress value={100 - (analytics.averageRiskScore || 0)} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>High Risk (70-100)</span>
                            <span>{Math.round((analytics.fraudRate || 0) * 100)}%</span>
                          </div>
                          <Progress value={(analytics.fraudRate || 0) * 100} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 