/**
 * Payment Service
 * 
 * Handles payment processing for GCash, PayMaya, and other payment methods
 */

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  Firestore
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  PaymentMethod, 
  PaymentStatus, 
  PaymentTransaction, 
  PaymentMethodConfig,
  GCashPaymentRequest,
  GCashPaymentResponse,
  PayMayaPaymentRequest,
  PayMayaPaymentResponse
} from '@/types';

export class PaymentService {
  private static readonly TRANSACTIONS_COLLECTION = 'payment_transactions';
  private static readonly PAYMENT_METHODS_COLLECTION = 'payment_methods';

  /**
   * Initialize payment methods configuration
   */
  static async initializePaymentMethods(): Promise<void> {
    try {
      const methods = [
        {
          id: 'gcash',
          name: 'GCash',
          type: 'gcash' as PaymentMethod,
          isEnabled: true,
          isDefault: false,
          config: {
            merchantId: process.env.GCASH_MERCHANT_ID,
            apiKey: process.env.GCASH_API_KEY,
            secretKey: process.env.GCASH_SECRET_KEY,
            webhookUrl: process.env.GCASH_WEBHOOK_URL,
            sandboxMode: process.env.NODE_ENV !== 'production'
          }
        },
        {
          id: 'paymaya',
          name: 'PayMaya',
          type: 'paymaya' as PaymentMethod,
          isEnabled: true,
          isDefault: false,
          config: {
            merchantId: process.env.PAYMAYA_MERCHANT_ID,
            apiKey: process.env.PAYMAYA_API_KEY,
            secretKey: process.env.PAYMAYA_SECRET_KEY,
            webhookUrl: process.env.PAYMAYA_WEBHOOK_URL,
            sandboxMode: process.env.NODE_ENV !== 'production'
          }
        },
        {
          id: 'cash',
          name: 'Cash',
          type: 'cash' as PaymentMethod,
          isEnabled: true,
          isDefault: true,
          config: {
            sandboxMode: false
          }
        }
      ];

      const batch = db.batch();
      const now = Timestamp.now();

      for (const method of methods) {
        const docRef = doc(collection(db as Firestore, this.PAYMENT_METHODS_COLLECTION), method.id);
        batch.set(docRef, {
          ...method,
          createdAt: now,
          updatedAt: now
        });
      }

      await batch.commit();
    } catch (error) {
      console.error('Error initializing payment methods:', error);
      // Don't throw error as this might be called multiple times
    }
  }

  /**
   * Get all payment methods
   */
  static async getPaymentMethods(): Promise<PaymentMethodConfig[]> {
    try {
      const q = query(
        collection(db as Firestore, this.PAYMENT_METHODS_COLLECTION),
        where('isEnabled', '==', true),
        orderBy('isDefault', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PaymentMethodConfig[];
    } catch (error) {
      console.error('Error getting payment methods:', error);
      throw new Error('Failed to get payment methods');
    }
  }

  /**
   * Get payment method by ID
   */
  static async getPaymentMethod(methodId: string): Promise<PaymentMethodConfig | null> {
    try {
      const docRef = doc(db as Firestore, this.PAYMENT_METHODS_COLLECTION, methodId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data()
      } as PaymentMethodConfig;
    } catch (error) {
      console.error('Error getting payment method:', error);
      throw new Error('Failed to get payment method');
    }
  }

  /**
   * Create a payment transaction
   */
  static async createPaymentTransaction(
    transaction: Omit<PaymentTransaction, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PaymentTransaction> {
    try {
      const now = Timestamp.now();
      const transactionData: Omit<PaymentTransaction, 'id'> = {
        ...transaction,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(
        collection(db as Firestore, this.TRANSACTIONS_COLLECTION),
        transactionData
      );

      return {
        id: docRef.id,
        ...transactionData
      };
    } catch (error) {
      console.error('Error creating payment transaction:', error);
      throw new Error('Failed to create payment transaction');
    }
  }

  /**
   * Update payment transaction status
   */
  static async updateTransactionStatus(
    transactionId: string,
    status: PaymentStatus,
    externalTransactionId?: string,
    errorMessage?: string
  ): Promise<void> {
    try {
      const transactionRef = doc(db as Firestore, this.TRANSACTIONS_COLLECTION, transactionId);
      const updateData: Partial<PaymentTransaction> = {
        status,
        updatedAt: Timestamp.now()
      };

      if (status === 'completed') {
        updateData.processedAt = Timestamp.now();
      }

      if (externalTransactionId) {
        updateData.transactionId = externalTransactionId;
      }

      if (errorMessage) {
        updateData.errorMessage = errorMessage;
      }

      await updateDoc(transactionRef, updateData);
    } catch (error) {
      console.error('Error updating transaction status:', error);
      throw new Error('Failed to update transaction status');
    }
  }

  /**
   * Process GCash payment
   */
  static async processGCashPayment(request: GCashPaymentRequest): Promise<GCashPaymentResponse> {
    try {
      // Create transaction record
      const transaction = await this.createPaymentTransaction({
        payerId: request.customerName, // This should be the actual user ID
        payerName: request.customerName,
        payeeId: 'platform', // Platform account
        payeeName: 'Fixmotech Platform',
        amount: request.amount,
        currency: request.currency,
        paymentMethod: 'gcash',
        status: 'pending',
        referenceNumber: request.referenceNumber,
        description: request.description
      });

      // In a real implementation, you would call the GCash API here
      // For now, we'll simulate the API call
      const gcashResponse = await this.callGCashAPI(request);

      if (gcashResponse.success) {
        await this.updateTransactionStatus(
          transaction.id!,
          'processing',
          gcashResponse.transactionId
        );

        return {
          success: true,
          transactionId: gcashResponse.transactionId,
          paymentUrl: gcashResponse.paymentUrl,
          qrCode: gcashResponse.qrCode
        };
      } else {
        await this.updateTransactionStatus(
          transaction.id!,
          'failed',
          undefined,
          gcashResponse.errorMessage
        );

        return {
          success: false,
          errorMessage: gcashResponse.errorMessage
        };
      }
    } catch (error) {
      console.error('Error processing GCash payment:', error);
      return {
        success: false,
        errorMessage: 'Failed to process GCash payment'
      };
    }
  }

  /**
   * Process PayMaya payment
   */
  static async processPayMayaPayment(request: PayMayaPaymentRequest): Promise<PayMayaPaymentResponse> {
    try {
      // Create transaction record
      const transaction = await this.createPaymentTransaction({
        payerId: request.customerName, // This should be the actual user ID
        payerName: request.customerName,
        payeeId: 'platform', // Platform account
        payeeName: 'Fixmotech Platform',
        amount: request.amount,
        currency: request.currency,
        paymentMethod: 'paymaya',
        status: 'pending',
        referenceNumber: request.referenceNumber,
        description: request.description
      });

      // In a real implementation, you would call the PayMaya API here
      // For now, we'll simulate the API call
      const paymayaResponse = await this.callPayMayaAPI(request);

      if (paymayaResponse.success) {
        await this.updateTransactionStatus(
          transaction.id!,
          'processing',
          paymayaResponse.transactionId
        );

        return {
          success: true,
          transactionId: paymayaResponse.transactionId,
          paymentUrl: paymayaResponse.paymentUrl,
          qrCode: paymayaResponse.qrCode
        };
      } else {
        await this.updateTransactionStatus(
          transaction.id!,
          'failed',
          undefined,
          paymayaResponse.errorMessage
        );

        return {
          success: false,
          errorMessage: paymayaResponse.errorMessage
        };
      }
    } catch (error) {
      console.error('Error processing PayMaya payment:', error);
      return {
        success: false,
        errorMessage: 'Failed to process PayMaya payment'
      };
    }
  }

  /**
   * Process cash payment
   */
  static async processCashPayment(
    amount: number,
    currency: string,
    payerId: string,
    payerName: string,
    payeeId: string,
    payeeName: string,
    description: string
  ): Promise<PaymentTransaction> {
    try {
      const transaction = await this.createPaymentTransaction({
        payerId,
        payerName,
        payeeId,
        payeeName,
        amount,
        currency,
        paymentMethod: 'cash',
        status: 'completed',
        description,
        processedAt: Timestamp.now()
      });

      return transaction;
    } catch (error) {
      console.error('Error processing cash payment:', error);
      throw new Error('Failed to process cash payment');
    }
  }

  /**
   * Get payment transaction by ID
   */
  static async getTransaction(transactionId: string): Promise<PaymentTransaction | null> {
    try {
      const docRef = doc(db as Firestore, this.TRANSACTIONS_COLLECTION, transactionId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data()
      } as PaymentTransaction;
    } catch (error) {
      console.error('Error getting transaction:', error);
      throw new Error('Failed to get transaction');
    }
  }

  /**
   * Get user payment transactions
   */
  static async getUserTransactions(
    userId: string,
    role: 'payer' | 'payee',
    limitCount: number = 50
  ): Promise<PaymentTransaction[]> {
    try {
      const field = role === 'payer' ? 'payerId' : 'payeeId';
      const q = query(
        collection(db as Firestore, this.TRANSACTIONS_COLLECTION),
        where(field, '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PaymentTransaction[];
    } catch (error) {
      console.error('Error getting user transactions:', error);
      throw new Error('Failed to get user transactions');
    }
  }

  /**
   * Simulate GCash API call
   */
  private static async callGCashAPI(request: GCashPaymentRequest): Promise<GCashPaymentResponse> {
    // This is a simulation - in real implementation, you would call the actual GCash API
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate success response
      return {
        success: true,
        transactionId: `gcash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        paymentUrl: `https://pay.gcash.com/pay/${request.referenceNumber}`,
        qrCode: `data:image/png;base64,${btoa('simulated-qr-code')}`
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: 'GCash API error'
      };
    }
  }

  /**
   * Simulate PayMaya API call
   */
  private static async callPayMayaAPI(request: PayMayaPaymentRequest): Promise<PayMayaPaymentResponse> {
    // This is a simulation - in real implementation, you would call the actual PayMaya API
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate success response
      return {
        success: true,
        transactionId: `paymaya_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        paymentUrl: `https://pay.paymaya.com/pay/${request.referenceNumber}`,
        qrCode: `data:image/png;base64,${btoa('simulated-qr-code')}`
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: 'PayMaya API error'
      };
    }
  }

  /**
   * Handle payment webhook
   */
  static async handlePaymentWebhook(
    paymentMethod: PaymentMethod,
    webhookData: any
  ): Promise<void> {
    try {
      // Extract transaction ID from webhook data
      const transactionId = webhookData.transactionId || webhookData.referenceNumber;
      
      if (!transactionId) {
        throw new Error('No transaction ID in webhook data');
      }

      // Find the transaction in our database
      const q = query(
        collection(db as Firestore, this.TRANSACTIONS_COLLECTION),
        where('transactionId', '==', transactionId),
        where('paymentMethod', '==', paymentMethod)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        throw new Error('Transaction not found');
      }

      const transaction = snapshot.docs[0];
      const status = webhookData.status || 'completed';

      // Update transaction status based on webhook
      await this.updateTransactionStatus(
        transaction.id,
        status as PaymentStatus,
        transactionId
      );

      console.log(`Updated transaction ${transactionId} to status: ${status}`);
    } catch (error) {
      console.error('Error handling payment webhook:', error);
      throw new Error('Failed to handle payment webhook');
    }
  }
} 