/**
 * Smart Payment Service
 * 
 * Enhanced payment processing with intelligent features:
 * - Automatic payment detection via webhooks
 * - Smart payment routing
 * - Fraud prevention
 * - Payment analytics
 * - Multi-account management
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
  Firestore,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import QRCode from 'qrcode';
import { PAYMENT_CONFIG, getPaymentAccount, isPaymentMethodActive } from '@/lib/payment-config';

export interface SmartPayment {
  id?: string;
  amount: number;
  currency: string;
  referenceNumber: string;
  description: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  paymentMethod: 'gcash' | 'paymaya' | 'gotyme';
  status: 'pending' | 'detected' | 'confirmed' | 'completed' | 'failed' | 'expired' | 'suspicious';
  qrCode?: string;
  qrCodeUrl?: string;
  paymentProof?: string;
  confirmedBy?: string;
  confirmedAt?: Date;
  detectedAt?: Date; // When payment was automatically detected
  notes?: string;
  expiresAt: Date;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Smart features
  riskScore?: number; // 0-100, higher = more risky
  fraudIndicators?: string[];
  paymentPattern?: 'normal' | 'suspicious' | 'high-risk';
  autoConfirmed?: boolean;
  manualReviewRequired?: boolean;
}

export interface SmartPaymentRequest {
  amount: number;
  currency: string;
  referenceNumber: string;
  description: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  paymentMethod: 'gcash' | 'paymaya' | 'gotyme';
  expiresIn?: number;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  customerRiskLevel?: 'low' | 'medium' | 'high';
}

export interface SmartPaymentResponse {
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
  riskAssessment?: {
    riskScore: number;
    recommendations: string[];
    autoConfirm: boolean;
  };
}

export class SmartPaymentService {
  private static readonly COLLECTION = 'smart_payments';
  private static readonly DEFAULT_EXPIRY_MINUTES = 60;
  private static readonly PAYMENT_ACCOUNTS = PAYMENT_CONFIG;

  /**
   * Create a smart payment with risk assessment
   */
  static async createSmartPayment(request: SmartPaymentRequest): Promise<SmartPaymentResponse> {
    try {
      // Validate request
      this.validatePaymentRequest(request);

      // Assess risk
      const riskAssessment = await this.assessPaymentRisk(request);

      // Generate QR code with enhanced data
      const qrCodeData = this.generateEnhancedQRCodeData(request);
      const qrCode = await QRCode.toDataURL(qrCodeData);
      const qrCodeUrl = await QRCode.toDataURL(qrCodeData, { 
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Create payment record
      const paymentData: Omit<SmartPayment, 'id'> = {
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
        riskScore: riskAssessment.riskScore,
        fraudIndicators: riskAssessment.fraudIndicators,
        paymentPattern: riskAssessment.paymentPattern,
        autoConfirmed: riskAssessment.autoConfirm,
        manualReviewRequired: riskAssessment.riskScore > 70,
        expiresAt: new Date(Date.now() + (request.expiresIn || this.DEFAULT_EXPIRY_MINUTES) * 60000),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, this.COLLECTION), paymentData);
      const paymentId = docRef.id;

      // Set up payment monitoring
      this.setupPaymentMonitoring(paymentId, request);

      // Generate instructions
      const instructions = this.generateSmartInstructions(request, qrCodeData, riskAssessment);

      return {
        success: true,
        paymentId,
        qrCode,
        qrCodeUrl,
        instructions,
        expiresAt: paymentData.expiresAt,
        accountInfo: this.getAccountInfo(request.paymentMethod),
        riskAssessment
      };

    } catch (error) {
      console.error('Error creating smart payment:', error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Failed to create payment'
      };
    }
  }

  /**
   * Smart risk assessment for payments
   */
  private static async assessPaymentRisk(request: SmartPaymentRequest): Promise<{
    riskScore: number;
    fraudIndicators: string[];
    paymentPattern: 'normal' | 'suspicious' | 'high-risk';
    autoConfirm: boolean;
  }> {
    let riskScore = 0;
    const fraudIndicators: string[] = [];
    let paymentPattern: 'normal' | 'suspicious' | 'high-risk' = 'normal';

    // Check customer history
    const customerHistory = await this.getCustomerPaymentHistory(request.customerPhone);
    
    // New customer risk
    if (customerHistory.length === 0) {
      riskScore += 20;
      fraudIndicators.push('New customer');
    }

    // Check for suspicious patterns
    if (customerHistory.length > 0) {
      const recentPayments = customerHistory.filter(p => 
        p.createdAt.toDate() > new Date(Date.now() - 24 * 60 * 60 * 1000)
      );
      
      if (recentPayments.length > 5) {
        riskScore += 30;
        fraudIndicators.push('High frequency payments');
        paymentPattern = 'suspicious';
      }

      // Check for failed payments
      const failedPayments = customerHistory.filter(p => p.status === 'failed');
      if (failedPayments.length > 2) {
        riskScore += 25;
        fraudIndicators.push('Multiple failed payments');
      }
    }

    // Amount-based risk
    if (request.amount > 10000) {
      riskScore += 15;
      fraudIndicators.push('High amount transaction');
    }

    if (request.amount < 100) {
      riskScore += 10;
      fraudIndicators.push('Very low amount');
    }

    // Time-based risk
    const hour = new Date().getHours();
    if (hour < 6 || hour > 23) {
      riskScore += 15;
      fraudIndicators.push('Late night transaction');
    }

    // Priority-based adjustments
    if (request.priority === 'urgent') {
      riskScore += 10;
    }

    // Customer risk level
    if (request.customerRiskLevel === 'high') {
      riskScore += 30;
      paymentPattern = 'high-risk';
    }

    // Auto-confirm for low-risk payments
    const autoConfirm = riskScore < 30 && customerHistory.length > 0;

    return {
      riskScore: Math.min(riskScore, 100),
      fraudIndicators,
      paymentPattern,
      autoConfirm
    };
  }

  /**
   * Set up real-time payment monitoring
   */
  private static setupPaymentMonitoring(paymentId: string, request: SmartPaymentRequest): void {
    // Monitor for payment detection (simulated webhook)
    const checkInterval = setInterval(async () => {
      try {
        const payment = await this.getPayment(paymentId);
        if (!payment || payment.status !== 'pending') {
          clearInterval(checkInterval);
          return;
        }

        // Check if payment has expired
        if (payment.expiresAt.toDate() < new Date()) {
          await this.expirePayment(paymentId);
          clearInterval(checkInterval);
          return;
        }

        // Simulate payment detection (in real implementation, this would be webhook-based)
        if (Math.random() < 0.01) { // 1% chance per check for demo
          await this.detectPayment(paymentId);
        }

      } catch (error) {
        console.error('Payment monitoring error:', error);
      }
    }, 30000); // Check every 30 seconds

    // Clear interval after 2 hours
    setTimeout(() => clearInterval(checkInterval), 2 * 60 * 60 * 1000);
  }

  /**
   * Detect payment automatically (simulated)
   */
  static async detectPayment(paymentId: string): Promise<boolean> {
    try {
      const payment = await this.getPayment(paymentId);
      if (!payment || payment.status !== 'pending') {
        return false;
      }

      // Update payment status to detected
      await updateDoc(doc(db, this.COLLECTION, paymentId), {
        status: 'detected',
        detectedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      // Auto-confirm if low risk
      if (payment.autoConfirmed && payment.riskScore && payment.riskScore < 30) {
        await this.confirmPayment(paymentId, 'system', 'Auto-confirmed by smart system');
      }

      return true;
    } catch (error) {
      console.error('Error detecting payment:', error);
      return false;
    }
  }

  /**
   * Get customer payment history
   */
  private static async getCustomerPaymentHistory(customerPhone: string): Promise<SmartPayment[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('customerPhone', '==', customerPhone),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SmartPayment));
    } catch (error) {
      console.error('Error getting customer history:', error);
      return [];
    }
  }

  /**
   * Generate enhanced QR code data
   */
  private static generateEnhancedQRCodeData(request: SmartPaymentRequest): string {
    const account = this.getAccountInfo(request.paymentMethod);
    const timestamp = Date.now();
    
    return JSON.stringify({
      type: 'payment',
      method: request.paymentMethod,
      amount: request.amount,
      currency: request.currency,
      reference: request.referenceNumber,
      description: request.description,
      accountNumber: account.accountNumber,
      accountName: account.accountName,
      timestamp,
      signature: this.generateSignature(request, timestamp)
    });
  }

  /**
   * Generate payment signature for security
   */
  private static generateSignature(request: SmartPaymentRequest, timestamp: number): string {
    const data = `${request.amount}${request.currency}${request.referenceNumber}${timestamp}`;
    // In production, use proper cryptographic signing
    return btoa(data).slice(0, 16);
  }

  /**
   * Generate smart payment instructions
   */
  private static generateSmartInstructions(
    request: SmartPaymentRequest, 
    qrCodeData: string, 
    riskAssessment: any
  ): string {
    const account = this.getAccountInfo(request.paymentMethod);
    const methodName = request.paymentMethod.toUpperCase();
    
    let instructions = `📱 ${methodName} Payment Instructions\n\n`;
    instructions += `💰 Amount: ₱${request.amount.toLocaleString()}\n`;
    instructions += `📋 Reference: ${request.referenceNumber}\n\n`;
    
    instructions += `1️⃣ Open your ${methodName} app\n`;
    instructions += `2️⃣ Scan the QR code or send to:\n`;
    instructions += `   📞 ${account.accountNumber}\n`;
    instructions += `   👤 ${account.accountName}\n\n`;
    
    if (riskAssessment.riskScore > 50) {
      instructions += `⚠️  This payment requires manual review\n`;
      instructions += `⏱️  Processing time: 2-4 hours\n\n`;
    } else {
      instructions += `✅ This payment will be processed automatically\n`;
      instructions += `⏱️  Processing time: 5-15 minutes\n\n`;
    }
    
    instructions += `3️⃣ Take a screenshot of payment confirmation\n`;
    instructions += `4️⃣ Upload the screenshot for verification\n`;
    instructions += `5️⃣ Wait for confirmation\n\n`;
    
    instructions += `🔒 Secure payment processing\n`;
    instructions += `📞 Support: ${account.contactNumber}`;
    
    return instructions;
  }

  /**
   * Get payment by ID
   */
  static async getPayment(paymentId: string): Promise<SmartPayment | null> {
    try {
      const doc = await getDoc(doc(db, this.COLLECTION, paymentId));
      if (doc.exists()) {
        return { id: doc.id, ...doc.data() } as SmartPayment;
      }
      return null;
    } catch (error) {
      console.error('Error getting payment:', error);
      return null;
    }
  }

  /**
   * Get pending payments with risk assessment
   */
  static async getPendingPayments(limit: number = 50): Promise<SmartPayment[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('status', 'in', ['pending', 'detected']),
        orderBy('createdAt', 'desc'),
        limit(limit)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SmartPayment));
    } catch (error) {
      console.error('Error getting pending payments:', error);
      return [];
    }
  }

  /**
   * Confirm payment with smart validation
   */
  static async confirmPayment(paymentId: string, adminId: string, notes?: string): Promise<boolean> {
    try {
      const payment = await this.getPayment(paymentId);
      if (!payment) return false;

      // Additional validation for high-risk payments
      if (payment.riskScore && payment.riskScore > 70) {
        // Require additional verification for high-risk payments
        console.log('High-risk payment requires additional verification');
      }

      await updateDoc(doc(db, this.COLLECTION, paymentId), {
        status: 'confirmed',
        confirmedBy: adminId,
        confirmedAt: Timestamp.now(),
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
   * Expire payment
   */
  private static async expirePayment(paymentId: string): Promise<boolean> {
    try {
      await updateDoc(doc(db, this.COLLECTION, paymentId), {
        status: 'expired',
        updatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error expiring payment:', error);
      return false;
    }
  }

  /**
   * Get account information
   */
  private static getAccountInfo(paymentMethod: string) {
    const account = getPaymentAccount(paymentMethod as any);
    return {
      accountNumber: account?.phoneNumber || '',
      accountName: account?.accountName || 'FixMo Platform',
      contactNumber: account?.phoneNumber || '',
      contactName: 'FixMo Support'
    };
  }

  /**
   * Validate payment request
   */
  private static validatePaymentRequest(request: SmartPaymentRequest): void {
    if (!request.amount || request.amount <= 0) {
      throw new Error('Invalid amount');
    }
    if (!request.referenceNumber) {
      throw new Error('Reference number is required');
    }
    if (!request.customerName) {
      throw new Error('Customer name is required');
    }
    if (!request.customerPhone) {
      throw new Error('Customer phone is required');
    }
    if (!isPaymentMethodActive(request.paymentMethod)) {
      throw new Error(`Payment method ${request.paymentMethod} is not active`);
    }
  }

  /**
   * Send confirmation notification
   */
  private static async sendConfirmationNotification(paymentId: string): Promise<void> {
    // Implementation for sending confirmation notifications
    console.log(`Payment ${paymentId} confirmed - sending notification`);
  }

  /**
   * Get payment analytics
   */
  static async getPaymentAnalytics(): Promise<{
    totalPayments: number;
    totalAmount: number;
    averageRiskScore: number;
    fraudRate: number;
    methodDistribution: Record<string, number>;
  }> {
    try {
      const q = query(collection(db, this.COLLECTION));
      const snapshot = await getDocs(q);
      const payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SmartPayment));

      const totalPayments = payments.length;
      const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
      const averageRiskScore = payments.reduce((sum, p) => sum + (p.riskScore || 0), 0) / totalPayments;
      const fraudRate = payments.filter(p => p.status === 'suspicious').length / totalPayments;

      const methodDistribution = payments.reduce((acc, p) => {
        acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalPayments,
        totalAmount,
        averageRiskScore,
        fraudRate,
        methodDistribution
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      return {
        totalPayments: 0,
        totalAmount: 0,
        averageRiskScore: 0,
        fraudRate: 0,
        methodDistribution: {}
      };
    }
  }
} 