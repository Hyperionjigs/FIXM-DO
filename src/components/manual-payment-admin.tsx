/**
 * Manual Payment Admin Interface
 * 
 * Admin interface for managing manual payments, verifying payments,
 * and handling payment proofs
 */

import React, { useState, useEffect } from 'react';
import { ManualPaymentService, ManualPayment } from '@/lib/manual-payment-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface ManualPaymentAdminProps {
  adminId: string;
}

export function ManualPaymentAdmin({ adminId }: ManualPaymentAdminProps) {
  const [payments, setPayments] = useState<ManualPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<ManualPayment | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadPendingPayments();
  }, []);

  const loadPendingPayments = async () => {
    try {
      setLoading(true);
      const pendingPayments = await ManualPaymentService.getPendingPayments(50);
      setPayments(pendingPayments);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pending payments',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (paymentId: string) => {
    try {
      const success = await ManualPaymentService.confirmPayment(paymentId, adminId, notes);
      
      if (success) {
        toast({
          title: 'Success',
          description: 'Payment confirmed successfully'
        });
        loadPendingPayments();
        setSelectedPayment(null);
        setNotes('');
      } else {
        toast({
          title: 'Error',
          description: 'Failed to confirm payment',
          variant: 'destructive'
        });
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

  const handleRejectPayment = async (paymentId: string) => {
    if (!rejectionReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a rejection reason',
        variant: 'destructive'
      });
      return;
    }

    try {
      const success = await ManualPaymentService.rejectPayment(paymentId, adminId, rejectionReason);
      
      if (success) {
        toast({
          title: 'Success',
          description: 'Payment rejected successfully'
        });
        loadPendingPayments();
        setSelectedPayment(null);
        setRejectionReason('');
      } else {
        toast({
          title: 'Error',
          description: 'Failed to reject payment',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject payment',
        variant: 'destructive'
      });
    }
  };

  const handleCompletePayment = async (paymentId: string) => {
    try {
      const success = await ManualPaymentService.completePayment(paymentId);
      
      if (success) {
        toast({
          title: 'Success',
          description: 'Payment marked as completed'
        });
        loadPendingPayments();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to complete payment',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error completing payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete payment',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'confirmed':
        return <Badge variant="default">Confirmed</Badge>;
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'expired':
        return <Badge variant="outline">Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'gcash':
        return '💰';
      case 'paymaya':
        return '💳';
      case 'cash':
        return '💵';
      default:
        return '💳';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (date: any) => {
    if (date instanceof Date) {
      return date.toLocaleString('en-PH');
    }
    if (date?.toDate) {
      return date.toDate().toLocaleString('en-PH');
    }
    return 'Invalid date';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manual Payment Management</h2>
        <Button onClick={loadPendingPayments} variant="outline">
          Refresh
        </Button>
      </div>

      {payments.length === 0 ? (
        <Alert>
          <AlertDescription>
            No pending payments found.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4">
          {payments.map((payment) => (
            <Card key={payment.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {getPaymentMethodIcon(payment.paymentMethod)}
                      {payment.customerName}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {payment.customerPhone} • {payment.customerEmail}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">
                      {formatCurrency(payment.amount, payment.currency)}
                    </div>
                    {getStatusBadge(payment.status)}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm">{payment.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="font-medium">Reference</Label>
                      <p>{payment.referenceNumber}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Created</Label>
                      <p>{formatDate(payment.createdAt)}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Expires</Label>
                      <p>{formatDate(payment.expiresAt)}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Method</Label>
                      <p className="capitalize">{payment.paymentMethod}</p>
                    </div>
                  </div>

                  {payment.paymentProof && (
                    <div>
                      <Label className="text-sm font-medium">Payment Proof</Label>
                      <div className="mt-1">
                        <img 
                          src={payment.paymentProof} 
                          alt="Payment proof" 
                          className="max-w-xs rounded border"
                        />
                      </div>
                    </div>
                  )}

                  {payment.notes && (
                    <div>
                      <Label className="text-sm font-medium">Notes</Label>
                      <p className="text-sm text-gray-600">{payment.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => setSelectedPayment(payment)}
                        >
                          Confirm Payment
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm Payment</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Textarea
                              id="notes"
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Add any notes about this payment..."
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleConfirmPayment(payment.id!)}
                              className="flex-1"
                            >
                              Confirm Payment
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => setSelectedPayment(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => setSelectedPayment(payment)}
                        >
                          Reject Payment
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reject Payment</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                            <Textarea
                              id="rejectionReason"
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Please provide a reason for rejection..."
                              required
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="destructive"
                              onClick={() => handleRejectPayment(payment.id!)}
                              className="flex-1"
                            >
                              Reject Payment
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => setSelectedPayment(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {payment.status === 'confirmed' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCompletePayment(payment.id!)}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 