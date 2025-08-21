"use client";

import { useState, useEffect, useCallback } from 'react';
import { PaymentMethod, PaymentMethodConfig, PaymentTransaction } from '@/types';

interface UsePaymentsOptions {
  userId?: string;
  role?: 'payer' | 'payee';
  limit?: number;
}

interface UsePaymentsReturn {
  paymentMethods: PaymentMethodConfig[];
  transactions: PaymentTransaction[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  processPayment: (paymentData: any) => Promise<any>;
}

export function usePayments({
  userId,
  role,
  limit = 50
}: UsePaymentsOptions = {}): UsePaymentsReturn {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentMethods = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/methods');
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment methods');
      }

      const data = await response.json();
      setPaymentMethods(data.paymentMethods || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payment methods');
      console.error('Error fetching payment methods:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    if (!userId || !role) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        userId,
        role,
        limit: limit.toString()
      });

      const response = await fetch(`/api/payments/transactions?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, role, limit]);

  const processPayment = useCallback(async (paymentData: any): Promise<any> => {
    try {
      let endpoint = '';
      
      switch (paymentData.paymentMethod) {
        case 'gcash':
          endpoint = '/api/payments/gcash';
          break;
        case 'paymaya':
          endpoint = '/api/payments/paymaya';
          break;
        case 'cash':
          endpoint = '/api/payments/cash';
          break;
        default:
          throw new Error('Unsupported payment method');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment failed');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      console.error('Error processing payment:', err);
      throw err;
    }
  }, []);

  const refetch = useCallback(async () => {
    await Promise.all([
      fetchPaymentMethods(),
      ...(userId && role ? [fetchTransactions()] : [])
    ]);
  }, [fetchPaymentMethods, fetchTransactions, userId, role]);

  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  useEffect(() => {
    if (userId && role) {
      fetchTransactions();
    }
  }, [fetchTransactions, userId, role]);

  return {
    paymentMethods,
    transactions,
    isLoading,
    error,
    refetch,
    processPayment,
  };
} 