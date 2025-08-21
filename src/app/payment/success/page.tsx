"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Home, Receipt } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    // Get payment details from URL parameters
    const transactionId = searchParams.get('transaction_id');
    const amount = searchParams.get('amount');
    const description = searchParams.get('description');
    const paymentMethod = searchParams.get('payment_method');

    if (transactionId) {
      setPaymentDetails({
        transactionId,
        amount,
        description,
        paymentMethod
      });
    }
  }, [searchParams]);

  const formatAmount = (amount: string | null) => {
    if (!amount) return '₱0.00';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(parseFloat(amount));
  };

  const getPaymentMethodIcon = (method: string | null) => {
    switch (method) {
      case 'gcash':
        return '📱';
      case 'paymaya':
        return '💳';
      case 'cash':
        return '💵';
      default:
        return '💳';
    }
  };

  const getPaymentMethodName = (method: string | null) => {
    switch (method) {
      case 'gcash':
        return 'GCash';
      case 'paymaya':
        return 'PayMaya';
      case 'cash':
        return 'Cash';
      default:
        return 'Payment';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 rounded-full p-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">
              Payment Successful!
            </CardTitle>
            <p className="text-muted-foreground">
              Your payment has been processed successfully
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {paymentDetails && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Transaction ID</span>
                  <span className="text-sm font-mono">{paymentDetails.transactionId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Amount</span>
                  <span className="text-lg font-bold">{formatAmount(paymentDetails.amount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Payment Method</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getPaymentMethodIcon(paymentDetails.paymentMethod)}</span>
                    <span className="text-sm">{getPaymentMethodName(paymentDetails.paymentMethod)}</span>
                  </div>
                </div>
                {paymentDetails.description && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Description</span>
                    <span className="text-sm text-right max-w-[200px] truncate">
                      {paymentDetails.description}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">Payment Confirmed</span>
              </div>
              <p className="text-sm text-green-700">
                You will receive a confirmation email shortly. Keep this transaction ID for your records.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => router.push('/dashboard')}
                className="w-full"
              >
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/schedule')}
                className="w-full"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                View Schedule
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>If you have any questions about this payment, please contact our support team.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 