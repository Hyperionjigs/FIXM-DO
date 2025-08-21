/**
 * Disbursement Service
 * 
 * Handles payments from FixMo to taskers for completed tasks
 * Supports GCash, PayMaya, and GoTyme disbursements
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
import { PAYMENT_CONFIG, getPaymentAccount } from '@/lib/payment-config';

export interface DisbursementRequest {
  taskerId: string;
  taskerName: string;
  taskerPhone: string;
  taskerEmail?: string;
  amount: number;
  currency: string;
  taskId: string;
  taskTitle: string;
  taskNumber?: string; // New field for unique task number
  paymentMethod: 'gcash' | 'paymaya' | 'gotyme';
  referenceNumber?: string;
  description?: string;
  adminId: string;
  adminName: string;
}

export interface Disbursement {
  id?: string;
  taskerId: string;
  taskerName: string;
  taskerPhone: string;
  taskerEmail?: string;
  amount: number;
  currency: string;
  taskId: string;
  taskTitle: string;
  taskNumber?: string; // New field for unique task number
  paymentMethod: 'gcash' | 'paymaya' | 'gotyme';
  referenceNumber: string;
  description?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  adminId: string;
  adminName: string;
  paymentProof?: string; // URL to payment screenshot
  completedAt?: Date;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface DisbursementResponse {
  success: boolean;
  disbursementId?: string;
  referenceNumber?: string;
  paymentInstructions?: string;
  accountInfo?: {
    accountNumber?: string;
    accountName?: string;
  };
  errorMessage?: string;
}

export class DisbursementService {
  private static readonly COLLECTION = 'disbursements';

  /**
   * Create a new disbursement
   */
  static async createDisbursement(request: DisbursementRequest): Promise<DisbursementResponse> {
    try {
      // Validate request
      this.validateDisbursementRequest(request);

      // Generate reference number if not provided
      const referenceNumber = request.referenceNumber || this.generateReferenceNumber();

      // Create disbursement record
      const disbursement: Omit<Disbursement, 'id'> = {
        taskerId: request.taskerId,
        taskerName: request.taskerName,
        taskerPhone: request.taskerPhone,
        taskerEmail: request.taskerEmail,
        amount: request.amount,
        currency: request.currency,
        taskId: request.taskId,
        taskTitle: request.taskTitle,
        taskNumber: request.taskNumber,
        paymentMethod: request.paymentMethod,
        referenceNumber,
        description: request.description,
        status: 'pending',
        adminId: request.adminId,
        adminName: request.adminName,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db as Firestore, this.COLLECTION), disbursement);
      const disbursementId = docRef.id;

      // Generate payment instructions
      const paymentInstructions = this.generatePaymentInstructions(request, referenceNumber);

      // Get account information
      const accountInfo = this.getAccountInfo(request.paymentMethod);

      return {
        success: true,
        disbursementId,
        referenceNumber,
        paymentInstructions,
        accountInfo
      };

    } catch (error) {
      console.error('Error creating disbursement:', error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Failed to create disbursement'
      };
    }
  }

  /**
   * Get disbursement by ID
   */
  static async getDisbursement(disbursementId: string): Promise<Disbursement | null> {
    try {
      const docRef = doc(db as Firestore, this.COLLECTION, disbursementId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Disbursement;
      }

      return null;
    } catch (error) {
      console.error('Error getting disbursement:', error);
      return null;
    }
  }

  /**
   * Get tasker disbursements
   */
  static async getTaskerDisbursements(taskerId: string, limit: number = 20): Promise<Disbursement[]> {
    try {
      const q = query(
        collection(db as Firestore, this.COLLECTION),
        where('taskerId', '==', taskerId),
        orderBy('createdAt', 'desc'),
        limit(limit)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Disbursement[];
    } catch (error) {
      console.error('Error getting tasker disbursements:', error);
      return [];
    }
  }

  /**
   * Get pending disbursements
   */
  static async getPendingDisbursements(limit: number = 50): Promise<Disbursement[]> {
    try {
      const q = query(
        collection(db as Firestore, this.COLLECTION),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'asc'),
        limit(limit)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Disbursement[];
    } catch (error) {
      console.error('Error getting pending disbursements:', error);
      return [];
    }
  }

  /**
   * Mark disbursement as processing
   */
  static async markAsProcessing(disbursementId: string, adminId: string): Promise<boolean> {
    try {
      const docRef = doc(db as Firestore, this.COLLECTION, disbursementId);
      await updateDoc(docRef, {
        status: 'processing',
        updatedAt: Timestamp.now()
      });

      return true;
    } catch (error) {
      console.error('Error marking disbursement as processing:', error);
      return false;
    }
  }

  /**
   * Complete disbursement
   */
  static async completeDisbursement(
    disbursementId: string, 
    adminId: string, 
    paymentProof?: string,
    notes?: string
  ): Promise<boolean> {
    try {
      const docRef = doc(db as Firestore, this.COLLECTION, disbursementId);
      await updateDoc(docRef, {
        status: 'completed',
        paymentProof,
        notes,
        completedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      // Send completion notification
      await this.sendCompletionNotification(disbursementId);

      return true;
    } catch (error) {
      console.error('Error completing disbursement:', error);
      return false;
    }
  }

  /**
   * Cancel disbursement
   */
  static async cancelDisbursement(
    disbursementId: string, 
    adminId: string, 
    reason: string
  ): Promise<boolean> {
    try {
      const docRef = doc(db as Firestore, this.COLLECTION, disbursementId);
      await updateDoc(docRef, {
        status: 'cancelled',
        notes: reason,
        updatedAt: Timestamp.now()
      });

      // Send cancellation notification
      await this.sendCancellationNotification(disbursementId, reason);

      return true;
    } catch (error) {
      console.error('Error cancelling disbursement:', error);
      return false;
    }
  }

  /**
   * Upload payment proof
   */
  static async uploadPaymentProof(disbursementId: string, proofUrl: string): Promise<boolean> {
    try {
      const docRef = doc(db as Firestore, this.COLLECTION, disbursementId);
      await updateDoc(docRef, {
        paymentProof: proofUrl,
        updatedAt: Timestamp.now()
      });

      return true;
    } catch (error) {
      console.error('Error uploading payment proof:', error);
      return false;
    }
  }

  /**
   * Generate payment instructions
   */
  private static generatePaymentInstructions(request: DisbursementRequest, referenceNumber: string): string {
    const { paymentMethod, amount, taskerPhone } = request;
    
    switch (paymentMethod) {
      case 'gcash':
        return `1. Open GCash app\n2. Tap "Send Money"\n3. Enter GCash number: ${taskerPhone}\n4. Enter amount: ₱${amount}\n5. Add message: ${referenceNumber}\n6. Confirm payment\n7. Take screenshot of payment confirmation\n8. Upload proof to complete disbursement`;
      
      case 'paymaya':
        return `1. Open PayMaya app\n2. Tap "Send Money"\n3. Enter PayMaya number: ${taskerPhone}\n4. Enter amount: ₱${amount}\n5. Add message: ${referenceNumber}\n6. Confirm payment\n7. Take screenshot of payment confirmation\n8. Upload proof to complete disbursement`;
      
      case 'gotyme':
        return `1. Open GoTyme app\n2. Tap "Send Money"\n3. Enter GoTyme number: ${taskerPhone}\n4. Enter amount: ₱${amount}\n5. Add message: ${referenceNumber}\n6. Confirm payment\n7. Take screenshot of payment confirmation\n8. Upload proof to complete disbursement`;
      
      default:
        return `Please send ₱${amount} to ${taskerPhone} using ${paymentMethod}. Reference: ${referenceNumber}`;
    }
  }

  /**
   * Get account information for payment method
   */
  private static getAccountInfo(paymentMethod: 'gcash' | 'paymaya' | 'gotyme') {
    const account = getPaymentAccount(paymentMethod);
    
    return {
      accountNumber: account.phoneNumber,
      accountName: account.accountName
    };
  }

  /**
   * Validate disbursement request
   */
  private static validateDisbursementRequest(request: DisbursementRequest): void {
    if (!request.amount || request.amount <= 0) {
      throw new Error('Invalid amount');
    }
    if (!request.taskerId || request.taskerId.length < 5) {
      throw new Error('Invalid tasker ID');
    }
    if (!request.taskerName || request.taskerName.length < 2) {
      throw new Error('Invalid tasker name');
    }
    if (!request.taskerPhone || request.taskerPhone.length < 10) {
      throw new Error('Invalid tasker phone number');
    }
    if (!['gcash', 'paymaya', 'gotyme'].includes(request.paymentMethod)) {
      throw new Error('Invalid payment method');
    }
    if (!request.adminId || request.adminId.length < 5) {
      throw new Error('Invalid admin ID');
    }
  }

  /**
   * Generate reference number
   */
  private static generateReferenceNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `DISB-${timestamp.slice(-6)}-${random}`;
  }

  /**
   * Send completion notification
   */
  private static async sendCompletionNotification(disbursementId: string): Promise<void> {
    try {
      const disbursement = await this.getDisbursement(disbursementId);
      if (!disbursement || !disbursement.taskerEmail) return;

      // Import email service dynamically to avoid circular dependencies
      const { emailService } = await import('./email-service');
      
      await emailService.sendDisbursementCompletionEmail(
        disbursement.taskerEmail,
        disbursement.taskerName,
        {
          amount: disbursement.amount,
          currency: disbursement.currency,
          disbursementId: disbursementId,
          paymentMethod: disbursement.paymentMethod,
          referenceNumber: disbursement.referenceNumber
        }
      );
      
      console.log(`✅ Disbursement completion email sent to ${disbursement.taskerEmail}`);
    } catch (error) {
      console.error('❌ Failed to send disbursement completion email:', error);
    }
  }

  /**
   * Send cancellation notification
   */
  private static async sendCancellationNotification(disbursementId: string, reason: string): Promise<void> {
    try {
      const disbursement = await this.getDisbursement(disbursementId);
      if (!disbursement || !disbursement.taskerEmail) return;

      // Import email service dynamically to avoid circular dependencies
      const { emailService } = await import('./email-service');
      
      await emailService.sendEmail({
        to: disbursement.taskerEmail,
        subject: 'Disbursement Cancelled - FixMo',
        html: `
          <h2>Disbursement Cancelled</h2>
          <p>Dear ${disbursement.taskerName},</p>
          <p>Your disbursement of ₱${disbursement.amount} has been cancelled.</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p><strong>Reference Number:</strong> ${disbursement.referenceNumber}</p>
          <p>If you have any questions, please contact support.</p>
          <p>Best regards,<br>FixMo Team</p>
        `
      });
      
      console.log(`✅ Disbursement cancellation email sent to ${disbursement.taskerEmail}`);
    } catch (error) {
      console.error('❌ Failed to send disbursement cancellation email:', error);
    }
  }
} 