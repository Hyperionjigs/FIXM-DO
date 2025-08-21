"use client";

/**
 * Smart Payment Page
 * 
 * Customer-facing payment page that uses the Smart Payment Form
 * Accessible at /payment-smart
 */

import React, { useState } from 'react';
import { SmartPaymentForm } from '@/components/smart-payment-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, ArrowLeft, CreditCard, Shield, Zap } from 'lucide-react';

export default function SmartPaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get payment details from URL parameters
  const amount = parseFloat(searchParams.get('amount') || '0');
  const description = searchParams.get('description') || 'Payment';
  const referenceNumber = searchParams.get('reference') || '';
  const customerName = searchParams.get('name') || '';
  const customerEmail = searchParams.get('email') || '';
  const customerPhone = searchParams.get('phone') || '';

  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentId, setPaymentId] = useState('');

  const handlePaymentSuccess = (paymentId: string) => {
    setPaymentCompleted(true);
    setPaymentId(paymentId);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    // You can add toast notification here
  };

  const handleCancel = () => {
    router.back();
  };

  if (paymentCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">
              Payment Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your payment has been processed successfully. You will receive a confirmation shortly.
              </AlertDescription>
            </Alert>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment ID:</span>
                <span className="font-mono text-sm">{paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold">₱{amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Description:</span>
                <span>{description}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => router.push('/dashboard')} 
                className="flex-1"
              >
                Go to Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setPaymentCompleted(false)}
                className="flex-1"
              >
                New Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={handleCancel}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Smart Payment
            </h1>
            <p className="text-gray-600">
              Secure, intelligent payment processing with real-time risk assessment
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="text-center p-4">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Secure</h3>
            <p className="text-sm text-gray-600">Fraud prevention and risk assessment</p>
          </Card>
          
          <Card className="text-center p-4">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Fast</h3>
            <p className="text-sm text-gray-600">5-15 minute processing time</p>
          </Card>
          
          <Card className="text-center p-4">
            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Flexible</h3>
            <p className="text-sm text-gray-600">GCash, PayMaya, and GoTyme</p>
          </Card>
        </div>

        {/* Payment Form */}
        <div className="flex justify-center">
          <SmartPaymentForm
            amount={amount}
            description={description}
            referenceNumber={referenceNumber}
            customerName={customerName}
            customerEmail={customerEmail}
            customerPhone={customerPhone}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onCancel={handleCancel}
          />
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Need help? Contact support at support@fixmo.com or call +63 956 512 1085</p>
          <p className="mt-2">Your payment information is encrypted and secure</p>
        </div>
      </div>
    </div>
  );
} 