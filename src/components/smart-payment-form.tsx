/**
 * Smart Payment Form
 * 
 * Enhanced payment form with intelligent features:
 * - Real-time risk assessment
 * - Smart payment method selection
 * - Payment status monitoring
 * - Enhanced user experience
 */

import React, { useState, useEffect } from 'react';
import { SmartPaymentService, SmartPaymentRequest, SmartPaymentResponse } from '@/lib/smart-payment-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, AlertTriangle, CheckCircle, Clock, Smartphone } from 'lucide-react';

interface SmartPaymentFormProps {
  amount: number;
  currency?: string;
  description?: string;
  referenceNumber?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

export function SmartPaymentForm({
  amount,
  currency = 'PHP',
  description,
  referenceNumber,
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
  onError,
  onCancel
}: SmartPaymentFormProps) {
  const [formData, setFormData] = useState({
    customerName: customerName || '',
    customerEmail: customerEmail || '',
    customerPhone: customerPhone || '',
    paymentMethod: 'gcash' as 'gcash' | 'paymaya' | 'gotyme',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent'
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [riskAssessment, setRiskAssessment] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'detected' | 'confirmed' | 'completed' | 'failed'>('pending');
  const [statusMessage, setStatusMessage] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(3600); // 60 minutes in seconds

  const { toast } = useToast();

  // Auto-generate reference number if not provided
  useEffect(() => {
    if (!referenceNumber) {
      const generatedRef = `FIXMO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      setFormData(prev => ({ ...prev, referenceNumber: generatedRef }));
    }
  }, [referenceNumber]);

  // Countdown timer for payment expiry
  useEffect(() => {
    if (transactionId && paymentStatus === 'pending') {
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 0) {
            setPaymentStatus('failed');
            setStatusMessage('Payment expired');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [transactionId, paymentStatus]);

  // Monitor payment status
  useEffect(() => {
    if (transactionId) {
      const checkStatus = async () => {
        try {
          const payment = await SmartPaymentService.getPayment(transactionId);
          if (payment) {
            setPaymentStatus(payment.status as any);
            
            switch (payment.status) {
              case 'detected':
                setStatusMessage('Payment detected! Verifying...');
                break;
              case 'confirmed':
                setStatusMessage('Payment confirmed!');
                onSuccess?.(transactionId);
                break;
              case 'completed':
                setStatusMessage('Payment completed!');
                onSuccess?.(transactionId);
                break;
              case 'failed':
                setStatusMessage('Payment failed or expired');
                onError?.('Payment failed');
                break;
              default:
                setStatusMessage('Processing payment...');
            }
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
        }
      };

      const interval = setInterval(checkStatus, 5000); // Check every 5 seconds
      return () => clearInterval(interval);
    }
  }, [transactionId, onSuccess, onError]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setShowQRCode(false);
    setQrCodeData('');
    setPaymentUrl('');
    setTransactionId('');
    setAccountInfo(null);
    setRiskAssessment(null);
    setPaymentStatus('pending');
    setStatusMessage('Creating payment...');

    try {
      const paymentRequest: SmartPaymentRequest = {
        amount,
        currency,
        referenceNumber: referenceNumber || formData.referenceNumber,
        description: description || `Payment for ${formData.customerName}`,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        paymentMethod: formData.paymentMethod,
        priority: formData.priority,
        expiresIn: 60 // 60 minutes
      };

      const response: SmartPaymentResponse = await SmartPaymentService.createSmartPayment(paymentRequest);

      if (response.success && response.paymentId) {
        setTransactionId(response.paymentId);
        
        if (response.qrCode) {
          setQrCodeData(response.qrCode);
          setShowQRCode(true);
        }
        
        if (response.paymentUrl) {
          setPaymentUrl(response.paymentUrl);
        }

        if (response.accountInfo) {
          setAccountInfo(response.accountInfo);
        }

        if (response.riskAssessment) {
          setRiskAssessment(response.riskAssessment);
        }

        setStatusMessage('Payment created successfully!');
        toast({
          title: 'Payment Created',
          description: 'Your payment has been created successfully',
        });
      } else {
        throw new Error(response.errorMessage || 'Failed to create payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      setStatusMessage(errorMessage);
      onError?.(errorMessage);
      toast({
        title: 'Payment Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'detected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'confirmed':
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus) {
      case 'detected':
      case 'confirmed':
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-blue-500';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Payment Form */}
      {!transactionId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Smart Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Amount Display */}
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                ₱{amount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                {description || 'Payment'}
              </div>
            </div>

            {/* Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Full Name *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Phone Number *</Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                  placeholder="09XXXXXXXXX"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="customerEmail">Email (Optional)</Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                placeholder="your@email.com"
              />
            </div>

            {/* Payment Method Selection */}
            <div>
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value: 'gcash' | 'paymaya' | 'gotyme') => 
                  handleInputChange('paymentMethod', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gcash">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                      GCash
                    </div>
                  </SelectItem>
                  <SelectItem value="paymaya">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                      PayMaya
                    </div>
                  </SelectItem>
                  <SelectItem value="gotyme">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-purple-500 rounded-full"></div>
                      GoTyme
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority Selection */}
            <div>
              <Label htmlFor="priority">Payment Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: 'low' | 'normal' | 'high' | 'urgent') => 
                  handleInputChange('priority', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="normal">Normal Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handlePayment}
                disabled={isProcessing || !formData.customerName || !formData.customerPhone}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Payment...
                  </>
                ) : (
                  'Create Payment'
                )}
              </Button>
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Status */}
      {transactionId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon()}
              Payment Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status Display */}
            <div className="flex items-center justify-between">
              <span className={`font-medium ${getStatusColor()}`}>
                {statusMessage}
              </span>
              <Badge variant={paymentStatus === 'completed' ? 'default' : 'secondary'}>
                {paymentStatus.toUpperCase()}
              </Badge>
            </div>

            {/* Countdown Timer */}
            {paymentStatus === 'pending' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Time Remaining</span>
                  <span className="font-mono">{formatTime(timeRemaining)}</span>
                </div>
                <Progress value={(timeRemaining / 3600) * 100} className="h-2" />
              </div>
            )}

            {/* QR Code */}
            {showQRCode && qrCodeData && (
              <div className="text-center space-y-3">
                <div className="text-sm font-medium">Scan QR Code</div>
                <div className="inline-block p-4 bg-white rounded-lg border">
                  <img src={qrCodeData} alt="Payment QR Code" className="w-48 h-48" />
                </div>
              </div>
            )}

            {/* Account Information */}
            {accountInfo && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="font-medium">Account Details</div>
                <div className="text-sm space-y-1">
                  <div>Account: {accountInfo.accountNumber}</div>
                  <div>Name: {accountInfo.accountName}</div>
                  <div>Contact: {accountInfo.contactNumber}</div>
                </div>
              </div>
            )}

            {/* Risk Assessment */}
            {riskAssessment && (
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Risk Score:</span>
                      <Badge variant={riskAssessment.riskScore > 50 ? 'destructive' : 'default'}>
                        {riskAssessment.riskScore}/100
                      </Badge>
                    </div>
                    {riskAssessment.autoConfirm && (
                      <div className="text-green-600 text-sm">
                        ✅ This payment will be processed automatically
                      </div>
                    )}
                    {riskAssessment.riskScore > 50 && (
                      <div className="text-orange-600 text-sm">
                        ⚠️ This payment requires manual review
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Reference Number */}
            <div className="text-center text-sm text-gray-600">
              Reference: {referenceNumber || formData.referenceNumber}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 