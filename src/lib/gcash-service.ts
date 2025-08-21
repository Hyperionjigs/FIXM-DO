/**
 * GCash Payment Service
 * 
 * Handles GCash payment processing with real API integration
 * Supports QR code generation, payment links, and webhook handling
 */

import crypto from 'crypto';
import { Timestamp } from 'firebase/firestore';

export interface GCashConfig {
  merchantId: string;
  apiKey: string;
  secretKey: string;
  webhookSecret: string;
  sandboxMode: boolean;
  baseUrl: string;
}

export interface GCashPaymentRequest {
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
}

export interface GCashPaymentResponse {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  qrCode?: string;
  qrCodeUrl?: string;
  expiresAt?: Date;
  errorMessage?: string;
  errorCode?: string;
}

export interface GCashWebhookPayload {
  transactionId: string;
  referenceNumber: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'pending' | 'expired';
  timestamp: string;
  signature: string;
  metadata?: Record<string, any>;
}

export class GCashService {
  private config: GCashConfig;
  private readonly API_VERSION = 'v1';

  constructor(config: GCashConfig) {
    this.config = config;
  }

  /**
   * Initialize GCash configuration
   */
  static initialize(): GCashService {
    const config: GCashConfig = {
      merchantId: process.env.GCASH_MERCHANT_ID!,
      apiKey: process.env.GCASH_API_KEY!,
      secretKey: process.env.GCASH_SECRET_KEY!,
      webhookSecret: process.env.GCASH_WEBHOOK_SECRET!,
      sandboxMode: process.env.NODE_ENV !== 'production',
      baseUrl: process.env.NODE_ENV === 'production' 
        ? 'https://api.gcash.com' 
        : 'https://api-sandbox.gcash.com'
    };

    return new GCashService(config);
  }

  /**
   * Create a new GCash payment
   */
  async createPayment(request: GCashPaymentRequest): Promise<GCashPaymentResponse> {
    try {
      // Validate request
      this.validatePaymentRequest(request);

      // Prepare payment payload
      const payload = {
        merchant_id: this.config.merchantId,
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
        metadata: request.metadata,
        expires_in: 3600 // 1 hour
      };

      // Generate signature
      const signature = this.generateSignature(payload);

      // Make API request
      const response = await fetch(`${this.config.baseUrl}/api/${this.API_VERSION}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Signature': signature,
          'X-Timestamp': Date.now().toString()
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'GCash API request failed');
      }

      return {
        success: true,
        transactionId: data.transaction_id,
        paymentUrl: data.payment_url,
        qrCode: data.qr_code,
        qrCodeUrl: data.qr_code_url,
        expiresAt: new Date(data.expires_at)
      };

    } catch (error) {
      console.error('GCash payment creation failed:', error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Payment creation failed',
        errorCode: 'PAYMENT_CREATION_FAILED'
      };
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(transactionId: string): Promise<GCashPaymentResponse> {
    try {
      const signature = this.generateSignature({ transaction_id: transactionId });

      const response = await fetch(`${this.config.baseUrl}/api/${this.API_VERSION}/payments/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Signature': signature,
          'X-Timestamp': Date.now().toString()
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check payment status');
      }

      return {
        success: data.status === 'success',
        transactionId: data.transaction_id,
        paymentUrl: data.payment_url,
        qrCode: data.qr_code,
        qrCodeUrl: data.qr_code_url,
        expiresAt: new Date(data.expires_at)
      };

    } catch (error) {
      console.error('GCash status check failed:', error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Status check failed',
        errorCode: 'STATUS_CHECK_FAILED'
      };
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: any, signature: string): boolean {
    try {
      const expectedSignature = this.generateSignature(payload);
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return false;
    }
  }

  /**
   * Process webhook notification
   */
  async processWebhook(payload: GCashWebhookPayload): Promise<void> {
    try {
      // Verify webhook signature
      if (!this.verifyWebhookSignature(payload, payload.signature)) {
        throw new Error('Invalid webhook signature');
      }

      // Process based on status
      switch (payload.status) {
        case 'success':
          await this.handlePaymentSuccess(payload);
          break;
        case 'failed':
          await this.handlePaymentFailure(payload);
          break;
        case 'expired':
          await this.handlePaymentExpiry(payload);
          break;
        default:
          console.log('Unknown payment status:', payload.status);
      }

    } catch (error) {
      console.error('Webhook processing failed:', error);
      throw error;
    }
  }

  /**
   * Generate API signature for security
   */
  private generateSignature(payload: any): string {
    const payloadString = JSON.stringify(payload);
    const timestamp = Date.now().toString();
    const dataToSign = `${payloadString}.${timestamp}.${this.config.secretKey}`;
    
    return crypto
      .createHmac('sha256', this.config.secretKey)
      .update(dataToSign)
      .digest('hex');
  }

  /**
   * Validate payment request
   */
  private validatePaymentRequest(request: GCashPaymentRequest): void {
    if (!request.amount || request.amount <= 0) {
      throw new Error('Invalid amount');
    }
    if (!request.referenceNumber) {
      throw new Error('Reference number is required');
    }
    if (!request.description) {
      throw new Error('Description is required');
    }
    if (!request.customerName) {
      throw new Error('Customer name is required');
    }
    if (!request.redirectUrl) {
      throw new Error('Redirect URL is required');
    }
  }

  /**
   * Handle successful payment
   */
  private async handlePaymentSuccess(payload: GCashWebhookPayload): Promise<void> {
    // Update transaction status in database
    // Send success notification
    // Trigger order fulfillment
    console.log('Payment successful:', payload.transactionId);
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailure(payload: GCashWebhookPayload): Promise<void> {
    // Update transaction status in database
    // Send failure notification
    // Log failure for analysis
    console.log('Payment failed:', payload.transactionId);
  }

  /**
   * Handle expired payment
   */
  private async handlePaymentExpiry(payload: GCashWebhookPayload): Promise<void> {
    // Update transaction status in database
    // Send expiry notification
    // Clean up expired payment
    console.log('Payment expired:', payload.transactionId);
  }
} 