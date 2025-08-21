"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreditCard, Smartphone, QrCode, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { PaymentMethod, PaymentMethodConfig } from '@/types';

interface PaymentFormProps {
  amount: number;
  currency?: string;
  description: string;
  referenceNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  onSuccess?: (transactionId: string) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

export function PaymentForm({
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
}: PaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('cash');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [paymentUrl, setPaymentUrl] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/payments/methods');
      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data.paymentMethods || []);
        if (data.paymentMethods?.length > 0) {
          const defaultMethod = data.paymentMethods.find((m: PaymentMethodConfig) => m.isDefault);
          if (defaultMethod) {
            setSelectedMethod(defaultMethod.type);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setShowQRCode(false);
    setQrCodeData('');
    setPaymentUrl('');
    setTransactionId('');

    try {
      let response;
      const paymentData = {
        amount,
        currency,
        referenceNumber,
        description,
        customerName,
        customerEmail,
        customerPhone,
        redirectUrl: `${window.location.origin}/payment/success`
      };

      if (selectedMethod === 'gcash') {
        response = await fetch('/api/payments/gcash', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(paymentData)
        });
      } else if (selectedMethod === 'paymaya') {
        response = await fetch('/api/payments/paymaya', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(paymentData)
        });
      } else if (selectedMethod === 'cash') {
        // Handle cash payment
        response = await fetch('/api/payments/cash', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(paymentData)
        });
      } else {
        throw new Error('Unsupported payment method');
      }

      const data = await response.json();

      if (data.success) {
        setTransactionId(data.transactionId);
        
        if (data.qrCode) {
          setQrCodeData(data.qrCode);
          setShowQRCode(true);
        }
        
        if (data.paymentUrl) {
          setPaymentUrl(data.paymentUrl);
        }

        onSuccess?.(data.transactionId);
      } else {
        throw new Error(data.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      onError?.(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'gcash':
        return '📱';
      case 'paymaya':
        return '💳';
      case 'cash':
        return '💵';
      case 'stripe':
        return '💳';
      case 'paypal':
        return '🔗';
      default:
        return '💳';
    }
  };

  const getMethodName = (method: PaymentMethod) => {
    switch (method) {
      case 'gcash':
        return 'GCash';
      case 'paymaya':
        return 'PayMaya';
      case 'cash':
        return 'Cash';
      case 'stripe':
        return 'Credit Card';
      case 'paypal':
        return 'PayPal';
      default:
        return method;
    }
  };

  const getMethodDescription = (method: PaymentMethod) => {
    switch (method) {
      case 'gcash':
        return 'Pay using your GCash wallet';
      case 'paymaya':
        return 'Pay using your PayMaya account';
      case 'cash':
        return 'Pay with cash on delivery';
      case 'stripe':
        return 'Pay with credit or debit card';
      case 'paypal':
        return 'Pay with your PayPal account';
      default:
        return 'Payment method';
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Amount</span>
              <span className="text-lg font-bold">{formatAmount(amount, currency)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Reference</span>
              <span className="font-mono">{referenceNumber}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Description</span>
              <span className="text-right max-w-[200px] truncate">{description}</span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Select Payment Method</Label>
            <RadioGroup value={selectedMethod} onValueChange={(value) => setSelectedMethod(value as PaymentMethod)}>
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center space-x-3">
                  <RadioGroupItem value={method.type} id={method.id} />
                  <Label htmlFor={method.id} className="flex items-center gap-3 cursor-pointer">
                    <span className="text-xl">{getMethodIcon(method.type)}</span>
                    <div className="flex-1">
                      <div className="font-medium">{getMethodName(method.type)}</div>
                      <div className="text-sm text-muted-foreground">{getMethodDescription(method.type)}</div>
                    </div>
                    {method.isDefault && (
                      <Badge variant="secondary" className="text-xs">Default</Badge>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Customer Information</Label>
            <div className="grid gap-3">
              <div>
                <Label htmlFor="customerName">Name</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  disabled
                  className="bg-muted"
                />
              </div>
              {customerEmail && (
                <div>
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input
                    id="customerEmail"
                    value={customerEmail}
                    disabled
                    className="bg-muted"
                  />
                </div>
              )}
              {customerPhone && (
                <div>
                  <Label htmlFor="customerPhone">Phone</Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    disabled
                    className="bg-muted"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay {formatAmount(amount, currency)}
                </>
              )}
            </Button>
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>

          {/* Payment Status */}
          {transactionId && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Payment Initiated</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Transaction ID: {transactionId}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Scan QR Code
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg inline-block">
                <img
                  src={qrCodeData}
                  alt="Payment QR Code"
                  className="w-48 h-48 mx-auto"
                />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Scan this QR code with your {getMethodName(selectedMethod)} app to complete the payment
              </p>
              {paymentUrl && (
                <Button
                  onClick={() => window.open(paymentUrl, '_blank')}
                  className="w-full"
                >
                  <Smartphone className="mr-2 h-4 w-4" />
                  Open Payment Page
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 