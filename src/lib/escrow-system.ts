// Escrow System for FixMo
// Secure payment holding and automated dispute resolution

export interface EscrowTransaction {
  escrowId: string;
  taskId: string;
  clientId: string;
  taskerId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'funded' | 'in_progress' | 'completed' | 'disputed' | 'released' | 'refunded' | 'cancelled';
  createdAt: Date;
  fundedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  releasedAt?: Date;
  refundedAt?: Date;
  cancelledAt?: Date;
  disputeDetails?: DisputeDetails;
  blockchainTxId?: string;
  paymentMethod: string;
  fees: {
    platform: number;
    processing: number;
    total: number;
  };
  terms: EscrowTerms;
  milestones?: Milestone[];
  currentMilestone?: number;
}

export interface DisputeDetails {
  disputeId: string;
  initiatedBy: string;
  reason: 'quality' | 'timing' | 'communication' | 'scope' | 'payment' | 'other';
  description: string;
  evidence: DisputeEvidence[];
  status: 'open' | 'under_review' | 'resolved' | 'closed';
  resolution?: DisputeResolution;
  createdAt: Date;
  updatedAt: Date;
  deadline: Date;
}

export interface DisputeEvidence {
  evidenceId: string;
  type: 'message' | 'image' | 'document' | 'video' | 'audio';
  url: string;
  description: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface DisputeResolution {
  resolutionType: 'full_release' | 'partial_release' | 'full_refund' | 'partial_refund' | 'split';
  amountToClient: number;
  amountToTasker: number;
  reason: string;
  resolvedBy: string;
  resolvedAt: Date;
  notes: string;
}

export interface EscrowTerms {
  autoReleaseDays: number;
  allowPartialRelease: boolean;
  requireMilestones: boolean;
  disputeDeadline: number; // days
  cancellationPolicy: 'flexible' | 'moderate' | 'strict';
  refundPolicy: 'full' | 'partial' | 'none';
}

export interface Milestone {
  milestoneId: string;
  title: string;
  description: string;
  amount: number;
  status: 'pending' | 'completed' | 'approved' | 'rejected';
  dueDate: Date;
  completedAt?: Date;
  approvedAt?: Date;
  evidence: string[];
}

export interface EscrowConfig {
  minAmount: number;
  maxAmount: number;
  platformFeePercentage: number;
  processingFeePercentage: number;
  autoReleaseDays: number;
  disputeDeadlineDays: number;
  enableMilestones: boolean;
  enablePartialRelease: boolean;
  requireVerification: boolean;
}

class EscrowSystem {
  private static instance: EscrowSystem;
  private config: EscrowConfig;
  private escrowTransactions: Map<string, EscrowTransaction> = new Map();
  private disputes: Map<string, DisputeDetails> = new Map();
  private blockchainVerification: any = null;

  private constructor() {
    this.config = {
      minAmount: 10,
      maxAmount: 10000,
      platformFeePercentage: 0.05, // 5%
      processingFeePercentage: 0.029, // 2.9%
      autoReleaseDays: 7,
      disputeDeadlineDays: 14,
      enableMilestones: true,
      enablePartialRelease: true,
      requireVerification: true
    };

    this.initializeEscrowSystem();
  }

  static getInstance(): EscrowSystem {
    if (!EscrowSystem.instance) {
      EscrowSystem.instance = new EscrowSystem();
    }
    return EscrowSystem.instance;
  }

  private initializeEscrowSystem(): void {
    console.log('[Escrow] Initializing escrow system...');
    
    // Import blockchain verification if available
    try {
      this.blockchainVerification = require('./blockchain-verification').blockchainVerification;
    } catch (error) {
      console.log('[Escrow] Blockchain verification not available');
    }
  }

  // Create new escrow transaction
  public async createEscrow(
    taskId: string,
    clientId: string,
    taskerId: string,
    amount: number,
    currency: string = 'PHP',
    paymentMethod: string = 'digital_wallet',
    terms?: Partial<EscrowTerms>
  ): Promise<EscrowTransaction> {
    try {
      // Validate amount
      if (amount < this.config.minAmount || amount > this.config.maxAmount) {
        throw new Error(`Amount must be between ${this.config.minAmount} and ${this.config.maxAmount}`);
      }

      // Calculate fees
      const platformFee = amount * this.config.platformFeePercentage;
      const processingFee = amount * this.config.processingFeePercentage;
      const totalFees = platformFee + processingFee;

      // Create escrow transaction
      const escrowId = this.generateEscrowId();
      const escrowTransaction: EscrowTransaction = {
        escrowId,
        taskId,
        clientId,
        taskerId,
        amount,
        currency,
        status: 'pending',
        createdAt: new Date(),
        paymentMethod,
        fees: {
          platform: platformFee,
          processing: processingFee,
          total: totalFees
        },
        terms: {
          autoReleaseDays: this.config.autoReleaseDays,
          allowPartialRelease: this.config.enablePartialRelease,
          requireMilestones: this.config.enableMilestones,
          disputeDeadline: this.config.disputeDeadlineDays,
          cancellationPolicy: 'moderate',
          refundPolicy: 'partial',
          ...terms
        }
      };

      // Add milestones if required
      if (this.config.enableMilestones && terms?.requireMilestones) {
        escrowTransaction.milestones = this.createDefaultMilestones(amount);
        escrowTransaction.currentMilestone = 0;
      }

      this.escrowTransactions.set(escrowId, escrowTransaction);

      // Record on blockchain if available
      if (this.blockchainVerification) {
        await this.recordEscrowOnBlockchain(escrowTransaction);
      }

      return escrowTransaction;

    } catch (error) {
      console.error('[Escrow] Failed to create escrow:', error);
      throw error;
    }
  }

  private generateEscrowId(): string {
    return `ESC-${Date.now()}-${Math.random().toString(16).substr(2, 8)}`;
  }

  private createDefaultMilestones(amount: number): Milestone[] {
    const milestones: Milestone[] = [];
    const milestoneCount = Math.min(3, Math.floor(amount / 100)); // Max 3 milestones
    
    for (let i = 0; i < milestoneCount; i++) {
      const milestoneAmount = amount / milestoneCount;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (i + 1) * 7); // 7 days apart

      milestones.push({
        milestoneId: `MIL-${Date.now()}-${i}`,
        title: `Milestone ${i + 1}`,
        description: `Completion of phase ${i + 1}`,
        amount: milestoneAmount,
        status: 'pending',
        dueDate,
        evidence: []
      });
    }

    return milestones;
  }

  private async recordEscrowOnBlockchain(escrow: EscrowTransaction): Promise<void> {
    try {
      if (!this.blockchainVerification) return;

      const txData = {
        type: 'escrow_created',
        escrowId: escrow.escrowId,
        taskId: escrow.taskId,
        clientId: escrow.clientId,
        taskerId: escrow.taskerId,
        amount: escrow.amount,
        currency: escrow.currency,
        status: escrow.status
      };

      const blockchainTx = await this.blockchainVerification.recordTransaction(txData, escrow.clientId);
      escrow.blockchainTxId = blockchainTx.txId;

    } catch (error) {
      console.error('[Escrow] Failed to record on blockchain:', error);
    }
  }

  // Fund escrow (client pays)
  public async fundEscrow(escrowId: string, paymentDetails: any): Promise<EscrowTransaction> {
    const escrow = this.escrowTransactions.get(escrowId);
    if (!escrow) {
      throw new Error('Escrow not found');
    }

    if (escrow.status !== 'pending') {
      throw new Error('Escrow is not in pending status');
    }

    try {
      // Process payment (in production, this would integrate with payment processors)
      const paymentResult = await this.processPayment(paymentDetails, escrow.amount + escrow.fees.total);
      
      if (paymentResult.success) {
        escrow.status = 'funded';
        escrow.fundedAt = new Date();

        // Record funding on blockchain
        if (this.blockchainVerification) {
          await this.recordEscrowFunding(escrow, paymentResult);
        }

        this.escrowTransactions.set(escrowId, escrow);
        return escrow;
      } else {
        throw new Error('Payment processing failed');
      }

    } catch (error) {
      console.error('[Escrow] Failed to fund escrow:', error);
      throw error;
    }
  }

  private async processPayment(paymentDetails: any, amount: number): Promise<any> {
    // Mock payment processing
    return {
      success: true,
      transactionId: `PAY-${Date.now()}`,
      amount,
      status: 'completed'
    };
  }

  private async recordEscrowFunding(escrow: EscrowTransaction, paymentResult: any): Promise<void> {
    try {
      const txData = {
        type: 'escrow_funded',
        escrowId: escrow.escrowId,
        amount: escrow.amount,
        paymentTransactionId: paymentResult.transactionId,
        status: 'funded'
      };

      await this.blockchainVerification.recordTransaction(txData, escrow.clientId);

    } catch (error) {
      console.error('[Escrow] Failed to record funding on blockchain:', error);
    }
  }

  // Start work (tasker begins)
  public async startWork(escrowId: string, taskerId: string): Promise<EscrowTransaction> {
    const escrow = this.escrowTransactions.get(escrowId);
    if (!escrow) {
      throw new Error('Escrow not found');
    }

    if (escrow.taskerId !== taskerId) {
      throw new Error('Unauthorized access');
    }

    if (escrow.status !== 'funded') {
      throw new Error('Escrow must be funded before starting work');
    }

    escrow.status = 'in_progress';
    escrow.startedAt = new Date();

    // Set auto-release timer
    this.setAutoReleaseTimer(escrow);

    this.escrowTransactions.set(escrowId, escrow);
    return escrow;
  }

  private setAutoReleaseTimer(escrow: EscrowTransaction): void {
    const autoReleaseTime = new Date();
    autoReleaseTime.setDate(autoReleaseTime.getDate() + escrow.terms.autoReleaseDays);

    setTimeout(async () => {
      await this.autoReleaseEscrow(escrow.escrowId);
    }, autoReleaseTime.getTime() - Date.now());
  }

  // Complete milestone
  public async completeMilestone(
    escrowId: string,
    milestoneId: string,
    taskerId: string,
    evidence: string[]
  ): Promise<Milestone> {
    const escrow = this.escrowTransactions.get(escrowId);
    if (!escrow) {
      throw new Error('Escrow not found');
    }

    if (escrow.taskerId !== taskerId) {
      throw new Error('Unauthorized access');
    }

    const milestone = escrow.milestones?.find(m => m.milestoneId === milestoneId);
    if (!milestone) {
      throw new Error('Milestone not found');
    }

    milestone.status = 'completed';
    milestone.completedAt = new Date();
    milestone.evidence = evidence;

    this.escrowTransactions.set(escrowId, escrow);
    return milestone;
  }

  // Approve milestone (client approves)
  public async approveMilestone(
    escrowId: string,
    milestoneId: string,
    clientId: string
  ): Promise<Milestone> {
    const escrow = this.escrowTransactions.get(escrowId);
    if (!escrow) {
      throw new Error('Escrow not found');
    }

    if (escrow.clientId !== clientId) {
      throw new Error('Unauthorized access');
    }

    const milestone = escrow.milestones?.find(m => m.milestoneId === milestoneId);
    if (!milestone) {
      throw new Error('Milestone not found');
    }

    if (milestone.status !== 'completed') {
      throw new Error('Milestone must be completed before approval');
    }

    milestone.status = 'approved';
    milestone.approvedAt = new Date();

    // Release milestone payment if partial release is enabled
    if (escrow.terms.allowPartialRelease) {
      await this.releaseMilestonePayment(escrow, milestone);
    }

    this.escrowTransactions.set(escrowId, escrow);
    return milestone;
  }

  private async releaseMilestonePayment(escrow: EscrowTransaction, milestone: Milestone): Promise<void> {
    try {
      // Process payment to tasker
      const paymentResult = await this.processPaymentToTasker(escrow.taskerId, milestone.amount);
      
      if (paymentResult.success) {
        // Record milestone release on blockchain
        if (this.blockchainVerification) {
          const txData = {
            type: 'milestone_released',
            escrowId: escrow.escrowId,
            milestoneId: milestone.milestoneId,
            amount: milestone.amount,
            taskerId: escrow.taskerId
          };
          await this.blockchainVerification.recordTransaction(txData, escrow.clientId);
        }
      }

    } catch (error) {
      console.error('[Escrow] Failed to release milestone payment:', error);
    }
  }

  private async processPaymentToTasker(taskerId: string, amount: number): Promise<any> {
    // Mock payment to tasker
    return {
      success: true,
      transactionId: `PAY-${Date.now()}`,
      amount,
      recipientId: taskerId
    };
  }

  // Complete task
  public async completeTask(escrowId: string, taskerId: string): Promise<EscrowTransaction> {
    const escrow = this.escrowTransactions.get(escrowId);
    if (!escrow) {
      throw new Error('Escrow not found');
    }

    if (escrow.taskerId !== taskerId) {
      throw new Error('Unauthorized access');
    }

    escrow.status = 'completed';
    escrow.completedAt = new Date();

    this.escrowTransactions.set(escrowId, escrow);
    return escrow;
  }

  // Release payment (client releases to tasker)
  public async releasePayment(escrowId: string, clientId: string): Promise<EscrowTransaction> {
    const escrow = this.escrowTransactions.get(escrowId);
    if (!escrow) {
      throw new Error('Escrow not found');
    }

    if (escrow.clientId !== clientId) {
      throw new Error('Unauthorized access');
    }

    if (escrow.status !== 'completed') {
      throw new Error('Task must be completed before releasing payment');
    }

    try {
      // Calculate remaining amount (after milestone releases)
      const releasedAmount = this.calculateReleasedAmount(escrow);
      const remainingAmount = escrow.amount - releasedAmount;

      // Process payment to tasker
      const paymentResult = await this.processPaymentToTasker(escrow.taskerId, remainingAmount);
      
      if (paymentResult.success) {
        escrow.status = 'released';
        escrow.releasedAt = new Date();

        // Record release on blockchain
        if (this.blockchainVerification) {
          const txData = {
            type: 'escrow_released',
            escrowId: escrow.escrowId,
            amount: remainingAmount,
            taskerId: escrow.taskerId
          };
          await this.blockchainVerification.recordTransaction(txData, escrow.clientId);
        }

        this.escrowTransactions.set(escrowId, escrow);
        return escrow;
      } else {
        throw new Error('Payment processing failed');
      }

    } catch (error) {
      console.error('[Escrow] Failed to release payment:', error);
      throw error;
    }
  }

  private calculateReleasedAmount(escrow: EscrowTransaction): number {
    if (!escrow.milestones) return 0;

    return escrow.milestones
      .filter(m => m.status === 'approved')
      .reduce((sum, m) => sum + m.amount, 0);
  }

  // Auto-release after deadline
  private async autoReleaseEscrow(escrowId: string): Promise<void> {
    const escrow = this.escrowTransactions.get(escrowId);
    if (!escrow || escrow.status !== 'in_progress') {
      return;
    }

    try {
      // Auto-release to tasker
      const releasedAmount = this.calculateReleasedAmount(escrow);
      const remainingAmount = escrow.amount - releasedAmount;

      const paymentResult = await this.processPaymentToTasker(escrow.taskerId, remainingAmount);
      
      if (paymentResult.success) {
        escrow.status = 'released';
        escrow.releasedAt = new Date();

        // Record auto-release on blockchain
        if (this.blockchainVerification) {
          const txData = {
            type: 'escrow_auto_released',
            escrowId: escrow.escrowId,
            amount: remainingAmount,
            taskerId: escrow.taskerId,
            reason: 'auto_release_deadline'
          };
          await this.blockchainVerification.recordTransaction(txData, 'system');
        }

        this.escrowTransactions.set(escrowId, escrow);
      }

    } catch (error) {
      console.error('[Escrow] Auto-release failed:', error);
    }
  }

  // Create dispute
  public async createDispute(
    escrowId: string,
    initiatedBy: string,
    reason: DisputeDetails['reason'],
    description: string,
    evidence: Omit<DisputeEvidence, 'evidenceId' | 'uploadedAt'>[]
  ): Promise<DisputeDetails> {
    const escrow = this.escrowTransactions.get(escrowId);
    if (!escrow) {
      throw new Error('Escrow not found');
    }

    if (escrow.clientId !== initiatedBy && escrow.taskerId !== initiatedBy) {
      throw new Error('Unauthorized access');
    }

    if (escrow.status === 'released' || escrow.status === 'refunded') {
      throw new Error('Cannot create dispute for completed escrow');
    }

    const disputeId = this.generateDisputeId();
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + escrow.terms.disputeDeadline);

    const dispute: DisputeDetails = {
      disputeId,
      initiatedBy,
      reason,
      description,
      evidence: evidence.map(e => ({
        ...e,
        evidenceId: this.generateEvidenceId(),
        uploadedAt: new Date()
      })),
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
      deadline
    };

    escrow.status = 'disputed';
    escrow.disputeDetails = dispute;

    this.disputes.set(disputeId, dispute);
    this.escrowTransactions.set(escrowId, escrow);

    // Record dispute on blockchain
    if (this.blockchainVerification) {
      const txData = {
        type: 'dispute_created',
        escrowId: escrow.escrowId,
        disputeId,
        initiatedBy,
        reason,
        status: 'open'
      };
      await this.blockchainVerification.recordTransaction(txData, initiatedBy);
    }

    return dispute;
  }

  private generateDisputeId(): string {
    return `DIS-${Date.now()}-${Math.random().toString(16).substr(2, 8)}`;
  }

  private generateEvidenceId(): string {
    return `EVI-${Date.now()}-${Math.random().toString(16).substr(2, 8)}`;
  }

  // Resolve dispute (admin or automated)
  public async resolveDispute(
    disputeId: string,
    resolution: Omit<DisputeResolution, 'resolvedAt'>,
    resolvedBy: string
  ): Promise<DisputeResolution> {
    const dispute = this.disputes.get(disputeId);
    if (!dispute) {
      throw new Error('Dispute not found');
    }

    const escrow = Array.from(this.escrowTransactions.values())
      .find(e => e.disputeDetails?.disputeId === disputeId);
    
    if (!escrow) {
      throw new Error('Escrow not found for dispute');
    }

    const fullResolution: DisputeResolution = {
      ...resolution,
      resolvedBy,
      resolvedAt: new Date()
    };

    dispute.status = 'resolved';
    dispute.resolution = fullResolution;
    dispute.updatedAt = new Date();

    // Process resolution
    await this.processDisputeResolution(escrow, fullResolution);

    this.disputes.set(disputeId, dispute);
    this.escrowTransactions.set(escrow.escrowId, escrow);

    return fullResolution;
  }

  private async processDisputeResolution(
    escrow: EscrowTransaction,
    resolution: DisputeResolution
  ): Promise<void> {
    try {
      // Process payments based on resolution
      if (resolution.amountToTasker > 0) {
        await this.processPaymentToTasker(escrow.taskerId, resolution.amountToTasker);
      }

      if (resolution.amountToClient > 0) {
        await this.processRefundToClient(escrow.clientId, resolution.amountToClient);
      }

      // Update escrow status
      if (resolution.resolutionType === 'full_release') {
        escrow.status = 'released';
        escrow.releasedAt = new Date();
      } else if (resolution.resolutionType === 'full_refund') {
        escrow.status = 'refunded';
        escrow.refundedAt = new Date();
      } else {
        escrow.status = 'released'; // Partial release/refund
        escrow.releasedAt = new Date();
      }

      // Record resolution on blockchain
      if (this.blockchainVerification) {
        const txData = {
          type: 'dispute_resolved',
          escrowId: escrow.escrowId,
          disputeId: escrow.disputeDetails?.disputeId,
          resolution: resolution.resolutionType,
          amountToTasker: resolution.amountToTasker,
          amountToClient: resolution.amountToClient,
          resolvedBy: resolution.resolvedBy
        };
        await this.blockchainVerification.recordTransaction(txData, resolution.resolvedBy);
      }

    } catch (error) {
      console.error('[Escrow] Failed to process dispute resolution:', error);
      throw error;
    }
  }

  private async processRefundToClient(clientId: string, amount: number): Promise<any> {
    // Mock refund to client
    return {
      success: true,
      transactionId: `REF-${Date.now()}`,
      amount,
      recipientId: clientId
    };
  }

  // Public API methods
  public async getEscrow(escrowId: string): Promise<EscrowTransaction | null> {
    return this.escrowTransactions.get(escrowId) || null;
  }

  public async getEscrowsByUser(userId: string): Promise<EscrowTransaction[]> {
    return Array.from(this.escrowTransactions.values())
      .filter(e => e.clientId === userId || e.taskerId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public async getDispute(disputeId: string): Promise<DisputeDetails | null> {
    return this.disputes.get(disputeId) || null;
  }

  public async getActiveDisputes(): Promise<DisputeDetails[]> {
    return Array.from(this.disputes.values())
      .filter(d => d.status === 'open' || d.status === 'under_review')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public getConfig(): EscrowConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<EscrowConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public async getEscrowStats(): Promise<any> {
    const totalEscrows = this.escrowTransactions.size;
    const activeEscrows = Array.from(this.escrowTransactions.values())
      .filter(e => e.status === 'funded' || e.status === 'in_progress').length;
    const completedEscrows = Array.from(this.escrowTransactions.values())
      .filter(e => e.status === 'released').length;
    const disputedEscrows = Array.from(this.escrowTransactions.values())
      .filter(e => e.status === 'disputed').length;

    return {
      totalEscrows,
      activeEscrows,
      completedEscrows,
      disputedEscrows,
      totalVolume: Array.from(this.escrowTransactions.values())
        .reduce((sum, e) => sum + e.amount, 0),
      averageAmount: totalEscrows > 0 ? 
        Array.from(this.escrowTransactions.values())
          .reduce((sum, e) => sum + e.amount, 0) / totalEscrows : 0
    };
  }

  public getAllEscrows(): EscrowTransaction[] {
    return Array.from(this.escrowTransactions.values());
  }

  public getAllDisputes(): DisputeDetails[] {
    return Array.from(this.disputes.values());
  }
}

// Export singleton instance
export const escrowSystem = EscrowSystem.getInstance();

// Convenience functions
export async function createEscrow(
  taskId: string,
  clientId: string,
  taskerId: string,
  amount: number,
  currency?: string,
  paymentMethod?: string,
  terms?: Partial<EscrowTerms>
): Promise<EscrowTransaction> {
  return escrowSystem.createEscrow(taskId, clientId, taskerId, amount, currency, paymentMethod, terms);
}

export async function fundEscrow(escrowId: string, paymentDetails: any): Promise<EscrowTransaction> {
  return escrowSystem.fundEscrow(escrowId, paymentDetails);
}

export async function releasePayment(escrowId: string, clientId: string): Promise<EscrowTransaction> {
  return escrowSystem.releasePayment(escrowId, clientId);
}

export async function createDispute(
  escrowId: string,
  initiatedBy: string,
  reason: DisputeDetails['reason'],
  description: string,
  evidence: Omit<DisputeEvidence, 'evidenceId' | 'uploadedAt'>[]
): Promise<DisputeDetails> {
  return escrowSystem.createDispute(escrowId, initiatedBy, reason, description, evidence);
} 