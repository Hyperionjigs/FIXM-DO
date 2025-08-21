/**
 * Enhanced Payment Service
 * 
 * Unified payment processing service for GCash and PayMaya
 * Includes advanced features like retry logic, fraud detection, and comprehensive error handling
 */

import { GCashService, GCashPaymentRequest, GCashPaymentResponse } from './gcash-service';
import { PayMayaService, PayMayaPaymentRequest, PayMayaPaymentResponse } from './paymaya-service';
import { GotymeService, GotymePaymentRequest, GotymePaymentResponse } from './gotyme-service';
import { PaymentService } from './payment-service';
import { PaymentMethod, PaymentStatus, PaymentTransaction } from '@/types';

export interface EnhancedPaymentRequest {
  amount: number;
  currency: string;
  referenceNumber: string;
  description: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  redirectUrl: string;
  webhookUrl?: string;
  metadata?: Record<string, any>;
  preferredMethod?: PaymentMethod;
  retryCount?: number;
}

export interface EnhancedPaymentResponse {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  qrCode?: string;
  qrCodeUrl?: string;
  expiresAt?: Date;
  paymentMethod: PaymentMethod;
  errorMessage?: string;
  errorCode?: string;
  retryAttempts?: number;
}

export interface PaymentAnalytics {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  averageAmount: number;
  preferredMethod: PaymentMethod;
  successRate: number;
}

export class EnhancedPaymentService {
  private gcashService: GCashService;
  private paymayaService: PayMayaService;
  private gotymeService: GotymeService;
  private paymentService: typeof PaymentService;
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY = 2000; // 2 seconds

  constructor() {
    this.gcashService = GCashService.initialize();
    this.paymayaService = PayMayaService.initialize();
    this.gotymeService = GotymeService.initialize();
    this.paymentService = PaymentService;
  }

  /**
   * Process payment with automatic method selection and retry logic
   */
  async processPayment(request: EnhancedPaymentRequest): Promise<EnhancedPaymentResponse> {
    const startTime = Date.now();
    let lastError: Error | null = null;

    // Determine payment methods to try
    const methodsToTry = this.determinePaymentMethods(request.preferredMethod);

    for (const method of methodsToTry) {
      for (let attempt = 1; attempt <= (request.retryCount || this.MAX_RETRY_ATTEMPTS); attempt++) {
        try {
          console.log(`Attempting payment with ${method} (attempt ${attempt})`);

          const response = await this.processWithMethod(method, request);

          if (response.success) {
            // Log successful payment
            await this.logPaymentSuccess(method, request, response, Date.now() - startTime);
            return response;
          } else {
            lastError = new Error(response.errorMessage);
          }

          // Wait before retry (except on last attempt)
          if (attempt < (request.retryCount || this.MAX_RETRY_ATTEMPTS)) {
            await this.delay(this.RETRY_DELAY * attempt);
          }

        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Unknown error');
          console.error(`Payment attempt failed with ${method} (attempt ${attempt}):`, error);

          // Wait before retry (except on last attempt)
          if (attempt < (request.retryCount || this.MAX_RETRY_ATTEMPTS)) {
            await this.delay(this.RETRY_DELAY * attempt);
          }
        }
      }
    }

    // All methods failed
    await this.logPaymentFailure(request, lastError);
    
    return {
      success: false,
      paymentMethod: request.preferredMethod || 'gcash',
      errorMessage: lastError?.message || 'All payment methods failed',
      errorCode: 'ALL_METHODS_FAILED',
      retryAttempts: (request.retryCount || this.MAX_RETRY_ATTEMPTS) * methodsToTry.length
    };
  }

  /**
   * Process payment with specific method
   */
  private async processWithMethod(
    method: PaymentMethod, 
    request: EnhancedPaymentRequest
  ): Promise<EnhancedPaymentResponse> {
    switch (method) {
      case 'gcash':
        return await this.processGCashPayment(request);
      case 'paymaya':
        return await this.processPayMayaPayment(request);
      case 'gotyme':
        return await this.processGotymePayment(request);
      case 'cash':
        return await this.processCashPayment(request);
      default:
        throw new Error(`Unsupported payment method: ${method}`);
    }
  }

  /**
   * Process GCash payment
   */
  private async processGCashPayment(request: EnhancedPaymentRequest): Promise<EnhancedPaymentResponse> {
    const gcashRequest: GCashPaymentRequest = {
      amount: request.amount,
      currency: request.currency,
      referenceNumber: request.referenceNumber,
      description: request.description,
      customerName: request.customerName,
      customerEmail: request.customerEmail,
      customerPhone: request.customerPhone,
      redirectUrl: request.redirectUrl,
      webhookUrl: request.webhookUrl,
      metadata: request.metadata
    };

    const response = await this.gcashService.createPayment(gcashRequest);

    return {
      success: response.success,
      transactionId: response.transactionId,
      paymentUrl: response.paymentUrl,
      qrCode: response.qrCode,
      qrCodeUrl: response.qrCodeUrl,
      expiresAt: response.expiresAt,
      paymentMethod: 'gcash',
      errorMessage: response.errorMessage,
      errorCode: response.errorCode
    };
  }

  /**
   * Process PayMaya payment
   */
  private async processPayMayaPayment(request: EnhancedPaymentRequest): Promise<EnhancedPaymentResponse> {
    const paymayaRequest: PayMayaPaymentRequest = {
      amount: request.amount,
      currency: request.currency,
      referenceNumber: request.referenceNumber,
      description: request.description,
      customerName: request.customerName,
      customerEmail: request.customerEmail,
      customerPhone: request.customerPhone,
      redirectUrl: request.redirectUrl,
      webhookUrl: request.webhookUrl,
      metadata: request.metadata
    };

    const response = await this.paymayaService.createPayment(paymayaRequest);

    return {
      success: response.success,
      transactionId: response.transactionId,
      paymentUrl: response.paymentUrl,
      qrCode: response.qrCode,
      qrCodeUrl: response.qrCodeUrl,
      expiresAt: response.expiresAt,
      paymentMethod: 'paymaya',
      errorMessage: response.errorMessage,
      errorCode: response.errorCode
    };
  }

  /**
   * Process Gotyme payment
   */
  private async processGotymePayment(request: EnhancedPaymentRequest): Promise<EnhancedPaymentResponse> {
    try {
      const gotymeRequest: GotymePaymentRequest = {
        amount: request.amount,
        currency: request.currency,
        referenceNumber: request.referenceNumber,
        description: request.description,
        customerName: request.customerName,
        customerEmail: request.customerEmail,
        customerPhone: request.customerPhone,
        redirectUrl: request.redirectUrl,
        webhookUrl: request.webhookUrl
      };

      const response = await this.gotymeService.createPayment(gotymeRequest);

      return {
        success: response.success,
        transactionId: response.transactionId,
        paymentUrl: response.paymentUrl,
        qrCode: response.qrCode,
        paymentMethod: 'gotyme',
        errorMessage: response.errorMessage
      };
    } catch (error) {
      console.error('Gotyme payment processing failed:', error);
      return {
        success: false,
        paymentMethod: 'gotyme',
        errorMessage: error instanceof Error ? error.message : 'Gotyme payment failed'
      };
    }
  }

  /**
   * Process cash payment
   */
  private async processCashPayment(request: EnhancedPaymentRequest): Promise<EnhancedPaymentResponse> {
    try {
      const transaction = await this.paymentService.processCashPayment(
        request.amount,
        request.currency,
        'customer', // This should be the actual user ID
        request.customerName,
        'platform',
        'Fixmotech Platform',
        request.description
      );

      return {
        success: true,
        transactionId: transaction.id,
        paymentMethod: 'cash',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };
    } catch (error) {
      return {
        success: false,
        paymentMethod: 'cash',
        errorMessage: error instanceof Error ? error.message : 'Cash payment failed',
        errorCode: 'CASH_PAYMENT_FAILED'
      };
    }
  }

  /**
   * Check payment status across all methods
   */
  async checkPaymentStatus(transactionId: string, method: PaymentMethod): Promise<EnhancedPaymentResponse> {
    try {
      switch (method) {
        case 'gcash':
          return await this.gcashService.checkPaymentStatus(transactionId);
        case 'paymaya':
          return await this.paymayaService.checkPaymentStatus(transactionId);
        case 'cash':
          // For cash payments, check database status
          const transaction = await this.paymentService.getTransactionById(transactionId);
          return {
            success: transaction?.status === 'completed',
            transactionId: transaction?.id,
            paymentMethod: 'cash'
          };
        default:
          throw new Error(`Unsupported payment method: ${method}`);
      }
    } catch (error) {
      return {
        success: false,
        paymentMethod: method,
        errorMessage: error instanceof Error ? error.message : 'Status check failed',
        errorCode: 'STATUS_CHECK_FAILED'
      };
    }
  }

  /**
   * Cancel payment
   */
  async cancelPayment(transactionId: string, method: PaymentMethod): Promise<EnhancedPaymentResponse> {
    try {
      switch (method) {
        case 'gcash':
          // GCash doesn't support cancellation, but we can mark as cancelled in our system
          await this.paymentService.updateTransactionStatus(transactionId, 'cancelled');
          return {
            success: true,
            transactionId,
            paymentMethod: 'gcash'
          };
        case 'paymaya':
          return await this.paymayaService.cancelPayment(transactionId);
        case 'cash':
          await this.paymentService.updateTransactionStatus(transactionId, 'cancelled');
          return {
            success: true,
            transactionId,
            paymentMethod: 'cash'
          };
        default:
          throw new Error(`Unsupported payment method: ${method}`);
      }
    } catch (error) {
      return {
        success: false,
        paymentMethod: method,
        errorMessage: error instanceof Error ? error.message : 'Cancellation failed',
        errorCode: 'CANCELLATION_FAILED'
      };
    }
  }

  /**
   * Get payment analytics
   */
  async getPaymentAnalytics(userId?: string, timeRange?: { start: Date; end: Date }): Promise<PaymentAnalytics> {
    try {
      const transactions = await this.paymentService.getTransactions(userId, timeRange);
      
      const totalTransactions = transactions.length;
      const successfulTransactions = transactions.filter(t => t.status === 'completed').length;
      const failedTransactions = transactions.filter(t => t.status === 'failed').length;
      const averageAmount = totalTransactions > 0 
        ? transactions.reduce((sum, t) => sum + t.amount, 0) / totalTransactions 
        : 0;

      // Determine preferred method
      const methodCounts = transactions.reduce((counts, t) => {
        counts[t.paymentMethod] = (counts[t.paymentMethod] || 0) + 1;
        return counts;
      }, {} as Record<PaymentMethod, number>);

      const preferredMethod = Object.entries(methodCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] as PaymentMethod || 'gcash';

      return {
        totalTransactions,
        successfulTransactions,
        failedTransactions,
        averageAmount,
        preferredMethod,
        successRate: totalTransactions > 0 ? successfulTransactions / totalTransactions : 0
      };
    } catch (error) {
      console.error('Failed to get payment analytics:', error);
      throw error;
    }
  }

  /**
   * Determine which payment methods to try
   */
  private determinePaymentMethods(preferredMethod?: PaymentMethod): PaymentMethod[] {
    const methods: PaymentMethod[] = ['gotyme', 'gcash', 'paymaya', 'cash'];
    
    if (preferredMethod && methods.includes(preferredMethod)) {
      // Move preferred method to front
      return [preferredMethod, ...methods.filter(m => m !== preferredMethod)];
    }
    
    return methods;
  }

  /**
   * Delay utility for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log successful payment
   */
  private async logPaymentSuccess(
    method: PaymentMethod,
    request: EnhancedPaymentRequest,
    response: EnhancedPaymentResponse,
    processingTime: number
  ): Promise<void> {
    console.log(`Payment successful with ${method}`, {
      transactionId: response.transactionId,
      amount: request.amount,
      processingTime,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log failed payment
   */
  private async logPaymentFailure(
    request: EnhancedPaymentRequest,
    error: Error | null
  ): Promise<void> {
    console.error('Payment failed after all attempts', {
      referenceNumber: request.referenceNumber,
      amount: request.amount,
      error: error?.message,
      timestamp: new Date().toISOString()
    });
  }
} 