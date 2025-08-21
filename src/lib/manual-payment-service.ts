/**
 * Manual Payment Service
 * 
 * Handles manual payment processing when direct API access is not available
 * Includes QR code generation, payment tracking, and admin verification
 */

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  Firestore
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import QRCode from 'qrcode';
import { PAYMENT_CONFIG, getPaymentAccount, isPaymentMethodActive } from '@/lib/payment-config';

export interface ManualPayment {
  id?: string;
  amount: number;
  currency: string;
  referenceNumber: string;
  description: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  paymentMethod: 'gcash' | 'paymaya' | 'gotyme';
  status: 'pending' | 'confirmed' | 'completed' | 'failed' | 'expired';
  qrCode?: string;
  qrCodeUrl?: string;
  paymentProof?: string; // URL to uploaded screenshot
  confirmedBy?: string; // Admin who confirmed
  confirmedAt?: Date;
  notes?: string;
  expiresAt: Date;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ManualPaymentRequest {
  amount: number;
  currency: string;
  referenceNumber: string;
  description: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  paymentMethod: 'gcash' | 'paymaya' | 'gotyme';
  expiresIn?: number; // minutes, default 60
}

export interface ManualPaymentResponse {
  success: boolean;
  paymentId?: string;
  qrCode?: string;
  qrCodeUrl?: string;
  paymentUrl?: string;
  instructions?: string;
  expiresAt?: Date;
  errorMessage?: string;
  accountInfo?: {
    accountNumber?: string;
    accountName?: string;
    contactNumber?: string;
    contactName?: string;
  };
}

export class ManualPaymentService {
  private static readonly COLLECTION = 'manual_payments';
  private static readonly DEFAULT_EXPIRY_MINUTES = 60;

  // Payment Account Configuration - Now using centralized config
  private static readonly PAYMENT_ACCOUNTS = PAYMENT_CONFIG;

  /**
   * Create a new manual payment
   */
  static async createPayment(request: ManualPaymentRequest): Promise<ManualPaymentResponse> {
    try {
      // Validate request
      this.validatePaymentRequest(request);

      // Generate QR code
      const qrCodeData = this.generateQRCodeData(request);
      const qrCode = await QRCode.toDataURL(qrCodeData);
      const qrCodeUrl = await QRCode.toDataURL(qrCodeData, { 
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Calculate expiry time
      const expiresIn = request.expiresIn || this.DEFAULT_EXPIRY_MINUTES;
      const expiresAt = new Date(Date.now() + expiresIn * 60 * 1000);

      // Create payment record
      const payment: Omit<ManualPayment, 'id'> = {
        amount: request.amount,
        currency: request.currency,
        referenceNumber: request.referenceNumber,
        description: request.description,
        customerName: request.customerName,
        customerEmail: request.customerEmail,
        customerPhone: request.customerPhone,
        paymentMethod: request.paymentMethod,
        status: 'pending',
        qrCode,
        qrCodeUrl,
        expiresAt,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db as Firestore, this.COLLECTION), payment);
      const paymentId = docRef.id;

      // Generate payment instructions
      const instructions = this.generatePaymentInstructions(request, qrCodeData);

      // Get account information for the payment method
      const accountInfo = this.getAccountInfo(request.paymentMethod);

      return {
        success: true,
        paymentId,
        qrCode,
        qrCodeUrl,
        paymentUrl: qrCodeData,
        instructions,
        expiresAt,
        accountInfo
      };

    } catch (error) {
      console.error('Error creating manual payment:', error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Failed to create payment'
      };
    }
  }

  /**
   * Get payment by ID
   */
  static async getPayment(paymentId: string): Promise<ManualPayment | null> {
    try {
      const docRef = doc(db as Firestore, this.COLLECTION, paymentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as ManualPayment;
      }

      return null;
    } catch (error) {
      console.error('Error getting payment:', error);
      return null;
    }
  }

  /**
   * Get payments by customer
   */
  static async getCustomerPayments(customerPhone: string, limit: number = 10): Promise<ManualPayment[]> {
    try {
      const q = query(
        collection(db as Firestore, this.COLLECTION),
        where('customerPhone', '==', customerPhone),
        orderBy('createdAt', 'desc'),
        limit(limit)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as ManualPayment);
    } catch (error) {
      console.error('Error getting customer payments:', error);
      return [];
    }
  }

  /**
   * Get pending payments for admin review
   */
  static async getPendingPayments(limit: number = 50): Promise<ManualPayment[]> {
    try {
      const q = query(
        collection(db as Firestore, this.COLLECTION),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc'),
        limit(limit)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as ManualPayment);
    } catch (error) {
      console.error('Error getting pending payments:', error);
      return [];
    }
  }

  /**
   * Confirm payment (admin action)
   */
  static async confirmPayment(paymentId: string, adminId: string, notes?: string): Promise<boolean> {
    try {
      const docRef = doc(db as Firestore, this.COLLECTION, paymentId);
      
      await updateDoc(docRef, {
        status: 'confirmed',
        confirmedBy: adminId,
        confirmedAt: new Date(),
        notes,
        updatedAt: Timestamp.now()
      });

      // Send confirmation notification
      await this.sendConfirmationNotification(paymentId);

      return true;
    } catch (error) {
      console.error('Error confirming payment:', error);
      return false;
    }
  }

  /**
   * Complete payment (after service delivery)
   */
  static async completePayment(paymentId: string): Promise<boolean> {
    try {
      const docRef = doc(db as Firestore, this.COLLECTION, paymentId);
      
      await updateDoc(docRef, {
        status: 'completed',
        updatedAt: Timestamp.now()
      });

      return true;
    } catch (error) {
      console.error('Error completing payment:', error);
      return false;
    }
  }

  /**
   * Reject payment (admin action)
   */
  static async rejectPayment(paymentId: string, adminId: string, reason: string): Promise<boolean> {
    try {
      const docRef = doc(db as Firestore, this.COLLECTION, paymentId);
      
      await updateDoc(docRef, {
        status: 'failed',
        confirmedBy: adminId,
        confirmedAt: new Date(),
        notes: `Rejected: ${reason}`,
        updatedAt: Timestamp.now()
      });

      // Send rejection notification
      await this.sendRejectionNotification(paymentId, reason);

      return true;
    } catch (error) {
      console.error('Error rejecting payment:', error);
      return false;
    }
  }

  /**
   * Upload payment proof
   */
  static async uploadPaymentProof(paymentId: string, proofUrl: string): Promise<boolean> {
    try {
      const docRef = doc(db as Firestore, this.COLLECTION, paymentId);
      
      await updateDoc(docRef, {
        paymentProof: proofUrl,
        updatedAt: Timestamp.now()
      });

      // Notify admin of new payment proof
      await this.notifyAdminOfPaymentProof(paymentId);

      return true;
    } catch (error) {
      console.error('Error uploading payment proof:', error);
      return false;
    }
  }

  /**
   * Check for expired payments
   */
  static async checkExpiredPayments(): Promise<void> {
    try {
      const now = new Date();
      const q = query(
        collection(db as Firestore, this.COLLECTION),
        where('status', '==', 'pending'),
        where('expiresAt', '<', now)
      );

      const querySnapshot = await getDocs(q);
      
      for (const doc of querySnapshot.docs) {
        await updateDoc(doc.ref, {
          status: 'expired',
          updatedAt: Timestamp.now()
        });

        // Send expiry notification
        await this.sendExpiryNotification(doc.id);
      }
    } catch (error) {
      console.error('Error checking expired payments:', error);
    }
  }

  /**
   * Generate QR code data
   */
  private static generateQRCodeData(request: ManualPaymentRequest): string {
    const { paymentMethod, amount, referenceNumber } = request;
    const account = getPaymentAccount(paymentMethod as 'gcash' | 'paymaya' | 'gotyme');
    
    switch (paymentMethod) {
      case 'gcash':
        // Generate QR code with specific GCash account number
        return `gcash://pay?amount=${amount}&ref=${referenceNumber}&to=${account.phoneNumber}`;
      case 'paymaya':
        // Generate QR code with specific PayMaya account number (when configured)
        return account.phoneNumber ? 
          `paymaya://pay?amount=${amount}&ref=${referenceNumber}&to=${account.phoneNumber}` :
          `paymaya://pay?amount=${amount}&ref=${referenceNumber}`;
      case 'gotyme':
        // Generate QR code with specific GoTyme account number
        return `gotyme://pay?amount=${amount}&ref=${referenceNumber}&to=${account.phoneNumber}`;
      default:
        return `payment://${paymentMethod}?amount=${amount}&ref=${referenceNumber}`;
    }
  }

  /**
   * Get account information for payment method
   */
  private static getAccountInfo(paymentMethod: string) {
    const account = getPaymentAccount(paymentMethod as 'gcash' | 'paymaya' | 'gotyme');
    
    switch (paymentMethod) {
      case 'gcash':
        return {
          accountNumber: account.phoneNumber,
          accountName: account.accountName
        };
      case 'paymaya':
        return {
          accountNumber: account.phoneNumber || '',
          accountName: account.accountName
        };
      case 'gotyme':
        return {
          accountNumber: account.phoneNumber,
          accountName: account.accountName
        };
      default:
        return {};
    }
  }

  /**
   * Generate payment instructions
   */
  private static generatePaymentInstructions(request: ManualPaymentRequest, qrCodeData: string): string {
    const { paymentMethod, amount, referenceNumber } = request;
    const account = getPaymentAccount(paymentMethod as 'gcash' | 'paymaya' | 'gotyme');
    
    switch (paymentMethod) {
      case 'gcash':
        return `1. Open GCash app\n2. Tap "Send Money"\n3. Enter GCash number: ${account.phoneNumber}\n4. Enter amount: ₱${amount}\n5. Add message: ${referenceNumber}\n6. Confirm payment\n7. Take screenshot of payment confirmation\n8. Send screenshot to admin for verification`;
      
      case 'paymaya':
        if (account.phoneNumber) {
          return `1. Open PayMaya app\n2. Tap "Send Money"\n3. Enter PayMaya number: ${account.phoneNumber}\n4. Enter amount: ₱${amount}\n5. Add message: ${referenceNumber}\n6. Confirm payment\n7. Take screenshot of payment confirmation\n8. Send screenshot to admin for verification`;
        } else {
          return `1. Open PayMaya app\n2. Tap "Pay QR"\n3. Scan the QR code\n4. Enter amount: ₱${amount}\n5. Add reference: ${referenceNumber}\n6. Confirm payment\n7. Take screenshot of payment confirmation\n8. Send screenshot to admin for verification`;
        }
      
      case 'gotyme':
        return `1. Open GoTyme app\n2. Tap "Send Money"\n3. Enter GoTyme number: ${account.phoneNumber}\n4. Enter amount: ₱${amount}\n5. Add message: ${referenceNumber}\n6. Confirm payment\n7. Take screenshot of payment confirmation\n8. Send screenshot to admin for verification`;
      
      default:
        return `Please pay ₱${amount} using ${paymentMethod}. Reference: ${referenceNumber}`;
    }
  }

  /**
   * Validate payment request
   */
  private static validatePaymentRequest(request: ManualPaymentRequest): void {
    if (!request.amount || request.amount <= 0) {
      throw new Error('Invalid amount');
    }
    if (!request.referenceNumber || request.referenceNumber.length < 5) {
      throw new Error('Invalid reference number');
    }
    if (!request.customerName || request.customerName.length < 2) {
      throw new Error('Invalid customer name');
    }
    if (!request.customerPhone || request.customerPhone.length < 10) {
      throw new Error('Invalid customer phone');
    }
    if (!['gcash', 'paymaya', 'gotyme'].includes(request.paymentMethod)) {
      throw new Error('Invalid payment method');
    }
  }

  /**
   * Send confirmation notification
   */
  private static async sendConfirmationNotification(paymentId: string): Promise<void> {
    try {
      const payment = await this.getPayment(paymentId);
      if (!payment || !payment.customerEmail) return;

      // Import email service dynamically to avoid circular dependencies
      const { emailService } = await import('./email-service');
      
      await emailService.sendPaymentConfirmationEmail(
        payment.customerEmail,
        payment.customerName,
        {
          amount: payment.amount,
          currency: payment.currency,
          paymentId: paymentId,
          paymentMethod: payment.paymentMethod
        }
      );
      
      console.log(`✅ Payment confirmation email sent to ${payment.customerEmail}`);
    } catch (error) {
      console.error('❌ Failed to send payment confirmation email:', error);
    }
  }

  /**
   * Send rejection notification
   */
  private static async sendRejectionNotification(paymentId: string, reason: string): Promise<void> {
    try {
      const payment = await this.getPayment(paymentId);
      if (!payment || !payment.customerEmail) return;

      // Import email service dynamically to avoid circular dependencies
      const { emailService } = await import('./email-service');
      
      await emailService.sendEmail({
        to: payment.customerEmail,
        subject: 'Payment Rejected - FixMo ❌',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); padding: 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px;">Payment Rejected ❌</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Your payment could not be processed</p>
            </div>
            
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #333; margin-bottom: 20px;">Hello ${payment.customerName}! 📋</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                We're sorry, but your payment could not be processed. Please review the details below.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
                <h3 style="color: #333; margin-top: 0;">Payment Details:</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Amount:</td>
                    <td style="padding: 8px 0; color: #333; font-weight: bold;">${payment.currency} ${payment.amount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Payment Method:</td>
                    <td style="padding: 8px 0; color: #333;">${payment.paymentMethod}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Transaction ID:</td>
                    <td style="padding: 8px 0; color: #333; font-family: monospace;">${paymentId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Reason:</td>
                    <td style="padding: 8px 0; color: #dc3545; font-weight: bold;">${reason}</td>
                  </tr>
                </table>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://fixmo.com'}/payment" 
                   style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Try Again
                </a>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                If you have any questions about this rejection, 
                please contact us at <a href="mailto:eroybelcesar@gmail.com" style="color: #dc3545;">eroybelcesar@gmail.com</a>
              </p>
            </div>
            
            <div style="background: #333; padding: 20px; text-align: center; color: white;">
              <p style="margin: 0; font-size: 14px;">
                © 2024 FixMo. All rights reserved.
              </p>
            </div>
          </div>
        `,
        text: `
Payment Rejected - FixMo

Hello ${payment.customerName}!

We're sorry, but your payment could not be processed. Please review the details below.

Payment Details:
- Amount: ${payment.currency} ${payment.amount.toFixed(2)}
- Payment Method: ${payment.paymentMethod}
- Transaction ID: ${paymentId}
- Reason: ${reason}

Try again at: ${process.env.NEXT_PUBLIC_APP_URL || 'https://fixmo.com'}/payment

If you have any questions, contact us at: eroybelcesar@gmail.com

© 2024 FixMo. All rights reserved.
        `
      });
      
      console.log(`✅ Payment rejection email sent to ${payment.customerEmail}`);
    } catch (error) {
      console.error('❌ Failed to send payment rejection email:', error);
    }
  }

  /**
   * Send expiry notification
   */
  private static async sendExpiryNotification(paymentId: string): Promise<void> {
    try {
      const payment = await this.getPayment(paymentId);
      if (!payment || !payment.customerEmail) return;

      // Import email service dynamically to avoid circular dependencies
      const { emailService } = await import('./email-service');
      
      await emailService.sendEmail({
        to: payment.customerEmail,
        subject: 'Payment Expired - FixMo ⏰',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%); padding: 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px;">Payment Expired ⏰</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Your payment request has expired</p>
            </div>
            
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #333; margin-bottom: 20px;">Hello ${payment.customerName}! ⏰</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Your payment request has expired. You can create a new payment request to complete your transaction.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <h3 style="color: #333; margin-top: 0;">Expired Payment Details:</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Amount:</td>
                    <td style="padding: 8px 0; color: #333; font-weight: bold;">${payment.currency} ${payment.amount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Payment Method:</td>
                    <td style="padding: 8px 0; color: #333;">${payment.paymentMethod}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Transaction ID:</td>
                    <td style="padding: 8px 0; color: #333; font-family: monospace;">${paymentId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Expired At:</td>
                    <td style="padding: 8px 0; color: #ffc107; font-weight: bold;">${payment.expiresAt.toLocaleString()}</td>
                  </tr>
                </table>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://fixmo.com'}/payment" 
                   style="background: #ffc107; color: #333; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                  Create New Payment
                </a>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                If you have any questions, 
                please contact us at <a href="mailto:eroybelcesar@gmail.com" style="color: #ffc107;">eroybelcesar@gmail.com</a>
              </p>
            </div>
            
            <div style="background: #333; padding: 20px; text-align: center; color: white;">
              <p style="margin: 0; font-size: 14px;">
                © 2024 FixMo. All rights reserved.
              </p>
            </div>
          </div>
        `,
        text: `
Payment Expired - FixMo

Hello ${payment.customerName}!

Your payment request has expired. You can create a new payment request to complete your transaction.

Expired Payment Details:
- Amount: ${payment.currency} ${payment.amount.toFixed(2)}
- Payment Method: ${payment.paymentMethod}
- Transaction ID: ${paymentId}
- Expired At: ${payment.expiresAt.toLocaleString()}

Create new payment at: ${process.env.NEXT_PUBLIC_APP_URL || 'https://fixmo.com'}/payment

If you have any questions, contact us at: eroybelcesar@gmail.com

© 2024 FixMo. All rights reserved.
        `
      });
      
      console.log(`✅ Payment expiry email sent to ${payment.customerEmail}`);
    } catch (error) {
      console.error('❌ Failed to send payment expiry email:', error);
    }
  }

  /**
   * Notify admin of payment proof
   */
  private static async notifyAdminOfPaymentProof(paymentId: string): Promise<void> {
    try {
      const payment = await this.getPayment(paymentId);
      if (!payment) return;

      // Import email service dynamically to avoid circular dependencies
      const { emailService } = await import('./email-service');
      
      await emailService.sendAdminNotification(
        ['eroybelcesar@gmail.com'], // Admin emails
        'Payment Proof Uploaded',
        `A payment proof has been uploaded for payment ${paymentId}`,
        {
          paymentId,
          customerName: payment.customerName,
          customerEmail: payment.customerEmail,
          amount: payment.amount,
          currency: payment.currency,
          paymentMethod: payment.paymentMethod,
          timestamp: new Date().toISOString()
        }
      );
      
      console.log(`✅ Admin notification sent for payment proof ${paymentId}`);
    } catch (error) {
      console.error('❌ Failed to send admin notification:', error);
    }
  }
} 