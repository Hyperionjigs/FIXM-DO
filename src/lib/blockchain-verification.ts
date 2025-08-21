// Blockchain Verification System for FixMo
// Secure identity verification and transaction immutability using blockchain technology

export interface BlockchainIdentity {
  userId: string;
  identityHash: string;
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'expired';
  verificationLevel: 'basic' | 'enhanced' | 'premium';
  documents: BlockchainDocument[];
  verificationHistory: VerificationRecord[];
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

export interface BlockchainDocument {
  documentId: string;
  documentType: 'passport' | 'drivers_license' | 'national_id' | 'utility_bill' | 'selfie';
  documentHash: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationScore: number;
  metadata: {
    issuer: string;
    issueDate: string;
    expiryDate: string;
    documentNumber: string;
  };
  blockchainTxId: string;
  uploadedAt: Date;
  verifiedAt?: Date;
}

export interface VerificationRecord {
  recordId: string;
  verificationType: 'document' | 'biometric' | 'address' | 'phone' | 'email';
  status: 'success' | 'failed' | 'pending';
  score: number;
  blockchainTxId: string;
  timestamp: Date;
  details: any;
}

export interface BlockchainTransaction {
  txId: string;
  blockHash: string;
  blockNumber: number;
  timestamp: Date;
  from: string;
  to: string;
  data: any;
  gasUsed: number;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
}

export interface SmartContract {
  contractAddress: string;
  contractName: string;
  abi: any[];
  functions: {
    verifyIdentity: (userId: string, documentHash: string) => Promise<boolean>;
    recordTransaction: (txData: any) => Promise<string>;
    getVerificationStatus: (userId: string) => Promise<any>;
  };
}

export interface BlockchainConfig {
  network: 'mainnet' | 'testnet' | 'local';
  providerUrl: string;
  contractAddress: string;
  gasLimit: number;
  gasPrice: number;
  confirmationsRequired: number;
  enableAutoVerification: boolean;
  enableTransactionRecording: boolean;
}

class BlockchainVerification {
  private static instance: BlockchainVerification;
  private config: BlockchainConfig;
  private identities: Map<string, BlockchainIdentity> = new Map();
  private transactions: Map<string, BlockchainTransaction> = new Map();
  private smartContract: SmartContract | null = null;
  private web3Provider: any = null;

  private constructor() {
    this.config = {
      network: 'testnet',
      providerUrl: 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID',
      contractAddress: '0x1234567890123456789012345678901234567890',
      gasLimit: 300000,
      gasPrice: 20000000000, // 20 gwei
      confirmationsRequired: 3,
      enableAutoVerification: true,
      enableTransactionRecording: true
    };

    this.initializeBlockchain();
  }

  static getInstance(): BlockchainVerification {
    if (!BlockchainVerification.instance) {
      BlockchainVerification.instance = new BlockchainVerification();
    }
    return BlockchainVerification.instance;
  }

  private async initializeBlockchain(): Promise<void> {
    try {
      // In production, this would initialize Web3 and smart contracts
      console.log('[Blockchain] Initializing blockchain verification system...');
      
      // Mock smart contract initialization
      this.smartContract = {
        contractAddress: this.config.contractAddress,
        contractName: 'FixMoVerification',
        abi: [],
        functions: {
          verifyIdentity: async (userId: string, documentHash: string) => {
            // Mock verification
            return Math.random() > 0.1; // 90% success rate
          },
          recordTransaction: async (txData: any) => {
            // Mock transaction recording
            return `0x${Math.random().toString(16).substr(2, 64)}`;
          },
          getVerificationStatus: async (userId: string) => {
            const identity = this.identities.get(userId);
            return identity ? {
              status: identity.verificationStatus,
              level: identity.verificationLevel,
              score: this.calculateVerificationScore(identity)
            } : null;
          }
        }
      };

    } catch (error) {
      console.error('[Blockchain] Failed to initialize blockchain:', error);
    }
  }

  // Main verification function
  public async verifyIdentity(
    userId: string,
    documents: File[],
    verificationLevel: 'basic' | 'enhanced' | 'premium' = 'basic'
  ): Promise<BlockchainIdentity> {
    try {
      // Create or update identity
      const identity = this.identities.get(userId) || this.createNewIdentity(userId, verificationLevel);
      
      // Process documents
      const blockchainDocuments = await this.processDocuments(userId, documents);
      identity.documents = blockchainDocuments;
      
      // Verify documents on blockchain
      const verificationResults = await this.verifyDocumentsOnBlockchain(identity);
      identity.verificationHistory.push(...verificationResults);
      
      // Calculate overall verification status
      identity.verificationStatus = this.calculateOverallStatus(identity);
      identity.updatedAt = new Date();
      
      // Store on blockchain
      if (this.config.enableAutoVerification) {
        await this.storeIdentityOnBlockchain(identity);
      }
      
      this.identities.set(userId, identity);
      return identity;

    } catch (error) {
      console.error('[Blockchain] Identity verification failed:', error);
      throw new Error('Identity verification failed');
    }
  }

  private createNewIdentity(userId: string, verificationLevel: string): BlockchainIdentity {
    return {
      userId,
      identityHash: this.generateIdentityHash(userId),
      verificationStatus: 'pending',
      verificationLevel: verificationLevel as any,
      documents: [],
      verificationHistory: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    };
  }

  private generateIdentityHash(userId: string): string {
    // In production, this would use a proper hashing algorithm
    return `0x${userId}${Date.now()}${Math.random().toString(16).substr(2, 16)}`;
  }

  private async processDocuments(userId: string, documents: File[]): Promise<BlockchainDocument[]> {
    const blockchainDocuments: BlockchainDocument[] = [];

    for (const document of documents) {
      const documentHash = await this.hashDocument(document);
      const documentType = this.detectDocumentType(document);
      
      const blockchainDoc: BlockchainDocument = {
        documentId: this.generateDocumentId(),
        documentType,
        documentHash,
        verificationStatus: 'pending',
        verificationScore: 0,
        metadata: {
          issuer: 'Unknown',
          issueDate: new Date().toISOString(),
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          documentNumber: `DOC-${Date.now()}`
        },
        blockchainTxId: '',
        uploadedAt: new Date()
      };

      blockchainDocuments.push(blockchainDoc);
    }

    return blockchainDocuments;
  }

  private async hashDocument(document: File): Promise<string> {
    // In production, this would use SHA-256 or similar
    const arrayBuffer = await document.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const hash = Array.from(uint8Array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return `0x${hash}`;
  }

  private detectDocumentType(document: File): 'passport' | 'drivers_license' | 'national_id' | 'utility_bill' | 'selfie' {
    const fileName = document.name.toLowerCase();
    
    if (fileName.includes('passport')) return 'passport';
    if (fileName.includes('license') || fileName.includes('drivers')) return 'drivers_license';
    if (fileName.includes('national') || fileName.includes('id')) return 'national_id';
    if (fileName.includes('utility') || fileName.includes('bill')) return 'utility_bill';
    if (fileName.includes('selfie') || fileName.includes('photo')) return 'selfie';
    
    return 'selfie'; // Default
  }

  private generateDocumentId(): string {
    return `DOC-${Date.now()}-${Math.random().toString(16).substr(2, 8)}`;
  }

  private async verifyDocumentsOnBlockchain(identity: BlockchainIdentity): Promise<VerificationRecord[]> {
    const verificationRecords: VerificationRecord[] = [];

    for (const document of identity.documents) {
      try {
        // Verify document on blockchain
        const isVerified = await this.smartContract?.functions.verifyIdentity(
          identity.userId,
          document.documentHash
        );

        if (isVerified) {
          document.verificationStatus = 'verified';
          document.verificationScore = this.calculateDocumentScore(document);
          document.verifiedAt = new Date();
        } else {
          document.verificationStatus = 'rejected';
          document.verificationScore = 0;
        }

        // Record verification on blockchain
        const txId = await this.smartContract?.functions.recordTransaction({
          type: 'document_verification',
          userId: identity.userId,
          documentId: document.documentId,
          status: document.verificationStatus,
          score: document.verificationScore,
          timestamp: new Date().toISOString()
        });

        document.blockchainTxId = txId || '';

        // Create verification record
        const record: VerificationRecord = {
          recordId: this.generateRecordId(),
          verificationType: 'document',
          status: document.verificationStatus === 'verified' ? 'success' : 'failed',
          score: document.verificationScore,
          blockchainTxId: txId || '',
          timestamp: new Date(),
          details: {
            documentType: document.documentType,
            documentId: document.documentId
          }
        };

        verificationRecords.push(record);

      } catch (error) {
        console.error(`[Blockchain] Document verification failed for ${document.documentId}:`, error);
        
        // Create failed verification record
        const record: VerificationRecord = {
          recordId: this.generateRecordId(),
          verificationType: 'document',
          status: 'failed',
          score: 0,
          blockchainTxId: '',
          timestamp: new Date(),
          details: {
            documentType: document.documentType,
            documentId: document.documentId,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        };

        verificationRecords.push(record);
      }
    }

    return verificationRecords;
  }

  private calculateDocumentScore(document: BlockchainDocument): number {
    // Mock document scoring based on type and metadata
    const baseScores: Record<string, number> = {
      passport: 0.9,
      drivers_license: 0.8,
      national_id: 0.85,
      utility_bill: 0.7,
      selfie: 0.6
    };

    const baseScore = baseScores[document.documentType] || 0.5;
    
    // Add random variation
    const variation = (Math.random() - 0.5) * 0.2;
    return Math.max(0, Math.min(1, baseScore + variation));
  }

  private calculateOverallStatus(identity: BlockchainIdentity): 'pending' | 'verified' | 'rejected' | 'expired' {
    // Check if expired
    if (identity.expiresAt < new Date()) {
      return 'expired';
    }

    // Check verification requirements based on level
    const verifiedDocuments = identity.documents.filter(d => d.verificationStatus === 'verified');
    const totalScore = verifiedDocuments.reduce((sum, doc) => sum + doc.verificationScore, 0);
    const averageScore = verifiedDocuments.length > 0 ? totalScore / verifiedDocuments.length : 0;

    switch (identity.verificationLevel) {
      case 'basic':
        return verifiedDocuments.length >= 1 && averageScore >= 0.7 ? 'verified' : 'pending';
      case 'enhanced':
        return verifiedDocuments.length >= 2 && averageScore >= 0.8 ? 'verified' : 'pending';
      case 'premium':
        return verifiedDocuments.length >= 3 && averageScore >= 0.9 ? 'verified' : 'pending';
      default:
        return 'pending';
    }
  }

  private async storeIdentityOnBlockchain(identity: BlockchainIdentity): Promise<void> {
    try {
      const txData = {
        type: 'identity_update',
        userId: identity.userId,
        identityHash: identity.identityHash,
        verificationStatus: identity.verificationStatus,
        verificationLevel: identity.verificationLevel,
        documentCount: identity.documents.length,
        verifiedDocumentCount: identity.documents.filter(d => d.verificationStatus === 'verified').length,
        timestamp: new Date().toISOString()
      };

      const txId = await this.smartContract?.functions.recordTransaction(txData);
      
      if (txId) {
        const transaction: BlockchainTransaction = {
          txId,
          blockHash: `0x${Math.random().toString(16).substr(2, 64)}`,
          blockNumber: Math.floor(Math.random() * 1000000),
          timestamp: new Date(),
          from: this.config.contractAddress,
          to: identity.userId,
          data: txData,
          gasUsed: Math.floor(Math.random() * 100000) + 50000,
          status: 'confirmed',
          confirmations: this.config.confirmationsRequired
        };

        this.transactions.set(txId, transaction);
      }

    } catch (error) {
      console.error('[Blockchain] Failed to store identity on blockchain:', error);
    }
  }

  private generateRecordId(): string {
    return `REC-${Date.now()}-${Math.random().toString(16).substr(2, 8)}`;
  }

  private calculateVerificationScore(identity: BlockchainIdentity): number {
    if (identity.documents.length === 0) return 0;

    const verifiedDocuments = identity.documents.filter(d => d.verificationStatus === 'verified');
    const totalScore = verifiedDocuments.reduce((sum, doc) => sum + doc.verificationScore, 0);
    
    return verifiedDocuments.length > 0 ? totalScore / verifiedDocuments.length : 0;
  }

  // Transaction recording
  public async recordTransaction(
    transactionData: any,
    userId: string
  ): Promise<BlockchainTransaction> {
    try {
      if (!this.config.enableTransactionRecording) {
        throw new Error('Transaction recording is disabled');
      }

      const txData = {
        ...transactionData,
        userId,
        timestamp: new Date().toISOString(),
        network: this.config.network
      };

      const txId = await this.smartContract?.functions.recordTransaction(txData);

      const transaction: BlockchainTransaction = {
        txId: txId || `0x${Math.random().toString(16).substr(2, 64)}`,
        blockHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        blockNumber: Math.floor(Math.random() * 1000000),
        timestamp: new Date(),
        from: userId,
        to: transactionData.recipientId || 'platform',
        data: txData,
        gasUsed: Math.floor(Math.random() * 100000) + 50000,
        status: 'confirmed',
        confirmations: this.config.confirmationsRequired
      };

      this.transactions.set(transaction.txId, transaction);
      return transaction;

    } catch (error) {
      console.error('[Blockchain] Transaction recording failed:', error);
      throw new Error('Transaction recording failed');
    }
  }

  // Verification status checking
  public async getVerificationStatus(userId: string): Promise<any> {
    try {
      const identity = this.identities.get(userId);
      if (!identity) {
        return { status: 'not_found', level: 'none', score: 0 };
      }

      // Get status from blockchain
      const blockchainStatus = await this.smartContract?.functions.getVerificationStatus(userId);
      
      return {
        status: identity.verificationStatus,
        level: identity.verificationLevel,
        score: this.calculateVerificationScore(identity),
        blockchainStatus,
        documents: identity.documents.length,
        verifiedDocuments: identity.documents.filter(d => d.verificationStatus === 'verified').length,
        expiresAt: identity.expiresAt
      };

    } catch (error) {
      console.error('[Blockchain] Failed to get verification status:', error);
      return { status: 'error', level: 'none', score: 0 };
    }
  }

  // Blockchain transaction history
  public async getTransactionHistory(userId: string): Promise<BlockchainTransaction[]> {
    const userTransactions = Array.from(this.transactions.values())
      .filter(tx => tx.from === userId || tx.to === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return userTransactions;
  }

  // Identity management
  public async updateIdentityLevel(
    userId: string,
    newLevel: 'basic' | 'enhanced' | 'premium'
  ): Promise<BlockchainIdentity> {
    const identity = this.identities.get(userId);
    if (!identity) {
      throw new Error('Identity not found');
    }

    identity.verificationLevel = newLevel;
    identity.updatedAt = new Date();

    // Record update on blockchain
    await this.storeIdentityOnBlockchain(identity);

    this.identities.set(userId, identity);
    return identity;
  }

  public async revokeIdentity(userId: string, reason: string): Promise<void> {
    const identity = this.identities.get(userId);
    if (!identity) {
      throw new Error('Identity not found');
    }

    identity.verificationStatus = 'rejected';
    identity.updatedAt = new Date();

    // Record revocation on blockchain
    const txData = {
      type: 'identity_revocation',
      userId,
      reason,
      timestamp: new Date().toISOString()
    };

    await this.smartContract?.functions.recordTransaction(txData);
    this.identities.set(userId, identity);
  }

  // Public API methods
  public getConfig(): BlockchainConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<BlockchainConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public async getBlockchainStats(): Promise<any> {
    const totalIdentities = this.identities.size;
    const totalTransactions = this.transactions.size;
    const verifiedIdentities = Array.from(this.identities.values())
      .filter(id => id.verificationStatus === 'verified').length;

    return {
      totalIdentities,
      verifiedIdentities,
      totalTransactions,
      network: this.config.network,
      contractAddress: this.config.contractAddress,
      averageVerificationScore: this.calculateAverageVerificationScore()
    };
  }

  private calculateAverageVerificationScore(): number {
    if (this.identities.size === 0) return 0;

    const totalScore = Array.from(this.identities.values())
      .reduce((sum, identity) => sum + this.calculateVerificationScore(identity), 0);

    return totalScore / this.identities.size;
  }

  public getAllIdentities(): BlockchainIdentity[] {
    return Array.from(this.identities.values());
  }

  public getAllTransactions(): BlockchainTransaction[] {
    return Array.from(this.transactions.values());
  }
}

// Export singleton instance
export const blockchainVerification = BlockchainVerification.getInstance();

// Convenience functions
export async function verifyIdentity(
  userId: string,
  documents: File[],
  verificationLevel?: 'basic' | 'enhanced' | 'premium'
): Promise<BlockchainIdentity> {
  return blockchainVerification.verifyIdentity(userId, documents, verificationLevel);
}

export async function recordTransaction(
  transactionData: any,
  userId: string
): Promise<BlockchainTransaction> {
  return blockchainVerification.recordTransaction(transactionData, userId);
}

export async function getVerificationStatus(userId: string): Promise<any> {
  return blockchainVerification.getVerificationStatus(userId);
} 