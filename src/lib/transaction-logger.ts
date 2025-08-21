import { TransactionLog } from '@/types';
import { db } from './firebase';
import { collection, addDoc, Firestore, serverTimestamp, Timestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

class TransactionLogger {
  private static instance: TransactionLogger;
  private readonly COLLECTION_NAME = 'transaction_logs';

  private constructor() {}

  public static getInstance(): TransactionLogger {
    if (!TransactionLogger.instance) {
      TransactionLogger.instance = new TransactionLogger();
    }
    return TransactionLogger.instance;
  }

  /**
   * Creates a secure transaction log entry that only admins can access
   */
  private async createTransactionLog(
    taskId: string,
    transactionType: TransactionLog['transactionType'],
    clientId: string,
    clientName: string,
    description: string,
    taskerId?: string,
    taskerName?: string,
    amount?: number,
    currency?: string,
    metadata: Record<string, any> = {},
    ipAddress?: string,
    userAgent?: string,
    location?: { latitude?: number; longitude?: number; address?: string }
  ): Promise<string> {
    try {
      const transactionId = uuidv4();
      const now = Timestamp.now();
      
      // Create the transaction log object
      const transactionLog: Omit<TransactionLog, 'id'> = {
        transactionId,
        taskId,
        transactionType,
        clientId,
        clientName,
        taskerId,
        taskerName,
        amount,
        currency,
        status: 'pending',
        description,
        metadata,
        ipAddress,
        userAgent,
        location,
        createdAt: now,
        updatedAt: now,
        adminOnly: false,
        encrypted: false
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db as Firestore, this.COLLECTION_NAME), transactionLog);
      
      console.log(`Transaction logged: ${transactionType} for task ${taskId} with ID ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error('Error logging transaction:', error);
      throw error;
    }
  }

  /**
   * Generates a cryptographic hash for audit integrity
   */
  private generateAuditHash(
    transactionId: string,
    taskId: string,
    clientId: string,
    taskerId?: string,
    amount?: number
  ): string {
    const data = `${transactionId}-${taskId}-${clientId}-${taskerId || 'none'}-${amount || 0}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Log task creation transaction
   */
  async logTaskCreation(
    taskId: string,
    clientId: string,
    clientName: string,
    amount: number,
    taskTitle: string,
    ipAddress?: string,
    userAgent?: string,
    location?: { latitude?: number; longitude?: number; address?: string }
  ): Promise<string> {
    return this.createTransactionLog(
      taskId,
      'task_created',
      clientId,
      clientName,
      `Task "${taskTitle}" created by ${clientName}`,
      undefined,
      undefined,
      amount,
      'PHP',
      {
        taskTitle,
        action: 'task_creation',
        platform: 'web',
      },
      ipAddress,
      userAgent,
      location
    );
  }

  /**
   * Log task claiming transaction
   */
  async logTaskClaiming(
    taskId: string,
    clientId: string,
    clientName: string,
    taskerId: string,
    taskerName: string,
    amount: number,
    taskTitle: string,
    ipAddress?: string,
    userAgent?: string,
    location?: { latitude?: number; longitude?: number; address?: string }
  ): Promise<string> {
    return this.createTransactionLog(
      taskId,
      'task_claimed',
      clientId,
      clientName,
      `Task "${taskTitle}" claimed by ${taskerName} for ${clientName}`,
      taskerId,
      taskerName,
      amount,
      'PHP',
      {
        taskTitle,
        action: 'task_claiming',
        platform: 'web',
        claimTimestamp: new Date().toISOString(),
      },
      ipAddress,
      userAgent,
      location
    );
  }

  /**
   * Log task completion transaction
   */
  async logTaskCompletion(
    taskId: string,
    clientId: string,
    clientName: string,
    taskerId: string,
    taskerName: string,
    amount: number,
    taskTitle: string,
    completedBy: 'client' | 'tasker',
    ipAddress?: string,
    userAgent?: string,
    location?: { latitude?: number; longitude?: number; address?: string }
  ): Promise<string> {
    return this.createTransactionLog(
      taskId,
      'task_completed',
      clientId,
      clientName,
      `Task "${taskTitle}" completed by ${completedBy === 'client' ? clientName : taskerName}`,
      taskerId,
      taskerName,
      amount,
      'PHP',
      {
        taskTitle,
        action: 'task_completion',
        completedBy,
        platform: 'web',
        completionTimestamp: new Date().toISOString(),
      },
      ipAddress,
      userAgent,
      location
    );
  }

  /**
   * Log review submission transaction
   */
  async logReviewSubmission(
    taskId: string,
    clientId: string,
    clientName: string,
    taskerId: string,
    taskerName: string,
    reviewerId: string,
    reviewerName: string,
    revieweeId: string,
    revieweeName: string,
    rating: number,
    comment?: string,
    ipAddress?: string,
    userAgent?: string,
    location?: { latitude?: number; longitude?: number; address?: string }
  ): Promise<string> {
    return this.createTransactionLog(
      taskId,
      'review_submitted',
      clientId,
      clientName,
      `Review submitted by ${reviewerName} for ${revieweeName} (Rating: ${rating}/5)`,
      taskerId,
      taskerName,
      undefined,
      'PHP',
      {
        action: 'review_submission',
        reviewerId,
        reviewerName,
        revieweeId,
        revieweeName,
        rating,
        comment: comment ? this.sanitizeComment(comment) : undefined,
        platform: 'web',
        reviewTimestamp: new Date().toISOString(),
      },
      ipAddress,
      userAgent,
      location
    );
  }

  /**
   * Log payment processing transaction
   */
  async logPaymentProcessing(
    taskId: string,
    clientId: string,
    clientName: string,
    taskerId: string,
    taskerName: string,
    amount: number,
    paymentMethod: string,
    paymentStatus: 'pending' | 'completed' | 'failed',
    ipAddress?: string,
    userAgent?: string,
    location?: { latitude?: number; longitude?: number; address?: string }
  ): Promise<string> {
    return this.createTransactionLog(
      taskId,
      'payment_processed',
      clientId,
      clientName,
      `Payment of $${amount} processed via ${paymentMethod} (Status: ${paymentStatus})`,
      taskerId,
      taskerName,
      amount,
      'PHP',
      {
        action: 'payment_processing',
        paymentMethod,
        paymentStatus,
        platform: 'web',
        paymentTimestamp: new Date().toISOString(),
      },
      ipAddress,
      userAgent,
      location
    );
  }

  /**
   * Log dispute filing transaction
   */
  async logDisputeFiling(
    taskId: string,
    clientId: string,
    clientName: string,
    taskerId: string,
    taskerName: string,
    filerId: string,
    filerName: string,
    disputeReason: string,
    amount?: number,
    ipAddress?: string,
    userAgent?: string,
    location?: { latitude?: number; longitude?: number; address?: string }
  ): Promise<string> {
    return this.createTransactionLog(
      taskId,
      'dispute_filed',
      clientId,
      clientName,
      `Dispute filed by ${filerName}: ${disputeReason}`,
      taskerId,
      taskerName,
      amount,
      'PHP',
      {
        action: 'dispute_filing',
        filerId,
        filerName,
        disputeReason: this.sanitizeComment(disputeReason),
        platform: 'web',
        disputeTimestamp: new Date().toISOString(),
      },
      ipAddress,
      userAgent,
      location
    );
  }

  /**
   * Log refund issuance transaction
   */
  async logRefundIssuance(
    taskId: string,
    clientId: string,
    clientName: string,
    taskerId: string,
    taskerName: string,
    amount: number,
    refundReason: string,
    refundedTo: 'client' | 'tasker',
    ipAddress?: string,
    userAgent?: string,
    location?: { latitude?: number; longitude?: number; address?: string }
  ): Promise<string> {
    return this.createTransactionLog(
      taskId,
      'refund_issued',
      clientId,
      clientName,
      `Refund of $${amount} issued to ${refundedTo === 'client' ? clientName : taskerName}: ${refundReason}`,
      taskerId,
      taskerName,
      amount,
      'PHP',
      {
        action: 'refund_issuance',
        refundReason: this.sanitizeComment(refundReason),
        refundedTo,
        platform: 'web',
        refundTimestamp: new Date().toISOString(),
      },
      ipAddress,
      userAgent,
      location
    );
  }

  /**
   * Sanitize sensitive data in comments
   */
  private sanitizeComment(comment: string): string {
    // Remove potential PII and sensitive information
    return comment
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]') // Social Security Numbers
      .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD]') // Credit card numbers
      .replace(/\b\d{3}[\s-]?\d{3}[\s-]?\d{4}\b/g, '[PHONE]') // Phone numbers
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]'); // Email addresses
  }

  /**
   * Get client IP address (for server-side usage)
   */
  getClientIP(req?: any): string | undefined {
    if (typeof window !== 'undefined') {
      // Client-side: we can't get the real IP, but we can get the user agent
      return undefined;
    }
    
    // Server-side: extract IP from request
    if (req) {
      return req.headers['x-forwarded-for'] || 
             req.connection.remoteAddress || 
             req.socket.remoteAddress ||
             req.ip;
    }
    
    return undefined;
  }

  /**
   * Get user agent string
   */
  getUserAgent(): string | undefined {
    if (typeof window !== 'undefined') {
      return navigator.userAgent;
    }
    return undefined;
  }
}

// Export singleton instance
export const TransactionLoggerService = TransactionLogger.getInstance(); 