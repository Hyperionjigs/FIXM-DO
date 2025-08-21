/**
 * Gotyme Service
 * 
 * Handles Gotyme payment processing and integration
 */

import { 
  GotymePaymentRequest, 
  GotymePaymentResponse,
  PaymentTransaction,
  PaymentStatus
} from '@/types';
import { PaymentService } from './payment-service';
import { Timestamp } from 'firebase/firestore';

export class GotymeService {
  private static readonly API_BASE_URL = process.env.GOTYME_API_URL || 'https://api.gotyme.com.ph';
  private static readonly MERCHANT_ID = process.env.GOTYME_MERCHANT_ID;
  private static readonly API_KEY = process.env.GOTYME_API_KEY;
  private static readonly SECRET_KEY = process.env.GOTYME_SECRET_KEY;
  private static readonly SANDBOX_MODE = process.env.NODE_ENV !== 'production';

  /**
   * Initialize Gotyme service
   */
  static initialize(): GotymeService {
    if (!this.MERCHANT_ID || !this.API_KEY || !this.SECRET_KEY) {
      throw new Error('Gotyme configuration is incomplete. Please check environment variables.');
    }
    return new GotymeService();
  }

  /**
   * Create a new Gotyme payment
   */
  async createPayment(request: GotymePaymentRequest): Promise<GotymePaymentResponse> {
    try {
      console.log('Creating Gotyme payment:', request);

      // Validate request
      this.validatePaymentRequest(request);

      // Call Gotyme API
      const response = await this.callGotymeAPI(request);

      if (response.success && response.transactionId) {
        // Store transaction in database
        await this.storeTransaction(request, response.transactionId);
      }

      return response;
    } catch (error) {
      console.error('Gotyme payment creation failed:', error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Process Gotyme webhook
   */
  async processWebhook(webhookData: any): Promise<void> {
    try {
      console.log('Processing Gotyme webhook:', webhookData);

      const { transactionId, status, amount, referenceNumber } = webhookData;

      // Update transaction status
      await PaymentService.updateTransactionStatus(
        transactionId,
        this.mapGotymeStatus(status),
        transactionId
      );

      // Send notifications based on status
      if (status === 'success') {
        await this.sendPaymentSuccessNotification(referenceNumber);
      } else if (status === 'failed') {
        await this.sendPaymentFailureNotification(referenceNumber);
      }

    } catch (error) {
      console.error('Gotyme webhook processing failed:', error);
      throw error;
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/payments/${transactionId}/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${GotymeService.API_KEY}`,
          'Content-Type': 'application/json',
          'X-Merchant-ID': GotymeService.MERCHANT_ID!
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to check payment status: ${response.statusText}`);
      }

      const data = await response.json();
      return this.mapGotymeStatus(data.status);
    } catch (error) {
      console.error('Failed to check Gotyme payment status:', error);
      return 'failed';
    }
  }

  /**
   * Validate payment request
   */
  private validatePaymentRequest(request: GotymePaymentRequest): void {
    if (!request.amount || request.amount < 1) {
      throw new Error('Invalid amount - minimum ₱1');
    }
    if (!request.referenceNumber || request.referenceNumber.length < 5) {
      throw new Error('Invalid reference number');
    }
    if (!request.customerName || request.customerName.length < 2) {
      throw new Error('Invalid customer name');
    }
    if (!request.customerPhone || !this.isValidPhilippinePhone(request.customerPhone)) {
      throw new Error('Invalid Philippine phone number');
    }
    if (!request.redirectUrl || !this.isValidUrl(request.redirectUrl)) {
      throw new Error('Invalid redirect URL');
    }
  }

  /**
   * Call Gotyme API
   */
  private async callGotymeAPI(request: GotymePaymentRequest): Promise<GotymePaymentResponse> {
    const payload = {
      merchant_id: GotymeService.MERCHANT_ID,
      amount: request.amount,
      currency: request.currency,
      reference_number: request.referenceNumber,
      description: request.description,
      customer: {
        name: request.customerName,
        email: request.customerEmail,
        phone: request.customerPhone
      },
      redirect_url: request.redirectUrl,
      webhook_url: request.webhookUrl,
      sandbox: GotymeService.SANDBOX_MODE
    };

    const response = await fetch(`${this.API_BASE_URL}/payments/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GotymeService.API_KEY}`,
        'Content-Type': 'application/json',
        'X-Merchant-ID': GotymeService.MERCHANT_ID!,
        'X-Signature': this.generateSignature(payload)
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gotyme API error: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();

    return {
      success: data.success || false,
      transactionId: data.transaction_id,
      paymentUrl: data.payment_url,
      qrCode: data.qr_code,
      errorMessage: data.error_message
    };
  }

  /**
   * Store transaction in database
   */
  private async storeTransaction(
    request: GotymePaymentRequest, 
    transactionId: string
  ): Promise<void> {
    const transaction: Omit<PaymentTransaction, 'id' | 'createdAt' | 'updatedAt'> = {
      payerId: 'customer', // Will be updated when user is authenticated
      payerName: request.customerName,
      payeeId: 'merchant', // Will be updated with actual merchant ID
      payeeName: 'FixMo Merchant',
      amount: request.amount,
      currency: request.currency,
      paymentMethod: 'gotyme',
      status: 'pending',
      transactionId: transactionId,
      referenceNumber: request.referenceNumber,
      description: request.description,
      metadata: {
        customerEmail: request.customerEmail,
        customerPhone: request.customerPhone,
        redirectUrl: request.redirectUrl,
        webhookUrl: request.webhookUrl
      }
    };

    await PaymentService.createPaymentTransaction(transaction);
  }

  /**
   * Generate API signature
   */
  private generateSignature(payload: any): string {
    const crypto = require('crypto');
    const payloadString = JSON.stringify(payload);
    return crypto
      .createHmac('sha256', GotymeService.SECRET_KEY!)
      .update(payloadString)
      .digest('hex');
  }

  /**
   * Map Gotyme status to internal status
   */
  private mapGotymeStatus(gotymeStatus: string): PaymentStatus {
    switch (gotymeStatus.toLowerCase()) {
      case 'pending':
        return 'pending';
      case 'processing':
        return 'processing';
      case 'success':
      case 'completed':
        return 'completed';
      case 'failed':
      case 'declined':
        return 'failed';
      case 'cancelled':
        return 'cancelled';
      case 'refunded':
        return 'refunded';
      default:
        return 'pending';
    }
  }

  /**
   * Validate Philippine phone number
   */
  private isValidPhilippinePhone(phone: string): boolean {
    const phPhoneRegex = /^(\+63|0)9\d{9}$/;
    return phPhoneRegex.test(phone);
  }

  /**
   * Validate URL
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Send payment success notification
   */
  private async sendPaymentSuccessNotification(referenceNumber: string): Promise<void> {
    // Implementation for sending success notification
    console.log(`Payment success notification sent for reference: ${referenceNumber}`);
  }

  /**
   * Send payment failure notification
   */
  private async sendPaymentFailureNotification(referenceNumber: string): Promise<void> {
    // Implementation for sending failure notification
    console.log(`Payment failure notification sent for reference: ${referenceNumber}`);
  }
} 