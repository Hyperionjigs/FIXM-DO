"use client";

import { useState } from 'react';
import { PaymentForm } from '@/components/payment-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PaymentPage() {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    description: '',
    customerName: '',
    customerEmail: '',
    customerPhone: ''
  });
  const { toast } = useToast();
  const router = useRouter();

  const handlePaymentSuccess = (transactionId: string) => {
    toast({
      title: "Payment Successful!",
      description: `Transaction ID: ${transactionId}`,
    });
    // Redirect to success page or dashboard
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive",
    });
  };

  const handleStartPayment = () => {
    if (!paymentData.amount || !paymentData.description || !paymentData.customerName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    setShowPaymentForm(true);
  };

  const generateReferenceNumber = () => {
    return `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold mb-2">Payment</h1>
          <p className="text-muted-foreground">
            Complete your payment using GCash, PayMaya, or other payment methods.
          </p>
        </div>

        {!showPaymentForm ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="amount">Amount (PHP)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={paymentData.amount || ''}
                    onChange={(e) => setPaymentData(prev => ({ 
                      ...prev, 
                      amount: parseFloat(e.target.value) || 0 
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Payment description"
                    value={paymentData.description}
                    onChange={(e) => setPaymentData(prev => ({ 
                      ...prev, 
                      description: e.target.value 
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    placeholder="Your full name"
                    value={paymentData.customerName}
                    onChange={(e) => setPaymentData(prev => ({ 
                      ...prev, 
                      customerName: e.target.value 
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail">Email (Optional)</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    placeholder="your.email@example.com"
                    value={paymentData.customerEmail}
                    onChange={(e) => setPaymentData(prev => ({ 
                      ...prev, 
                      customerEmail: e.target.value 
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Phone (Optional)</Label>
                  <Input
                    id="customerPhone"
                    placeholder="+63 912 345 6789"
                    value={paymentData.customerPhone}
                    onChange={(e) => setPaymentData(prev => ({ 
                      ...prev, 
                      customerPhone: e.target.value 
                    }))}
                  />
                </div>
              </div>
              <Button onClick={handleStartPayment} className="w-full">
                Continue to Payment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <PaymentForm
            amount={paymentData.amount}
            currency="PHP"
            description={paymentData.description}
            referenceNumber={generateReferenceNumber()}
            customerName={paymentData.customerName}
            customerEmail={paymentData.customerEmail}
            customerPhone={paymentData.customerPhone}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onCancel={() => setShowPaymentForm(false)}
          />
        )}
      </div>
    </div>
  );
} 