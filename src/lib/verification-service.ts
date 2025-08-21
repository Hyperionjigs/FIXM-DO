import { db, storage } from './firebase';
import { doc, updateDoc, getDoc, collection, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { providerManager } from './verification-providers';

export interface VerificationResult {
  isVerified: boolean;
  confidence: number;
  livenessScore?: number;
  qualityScore?: number;
  faceDetected: boolean;
  reasons: string[];
  recommendations: string[];
  metadata?: Record<string, any>;
}

export interface VerificationStatus {
  isVerified: boolean;
  verificationType: 'selfie' | 'id-document';
  verifiedAt?: string;
  documentType?: string;
  confidence?: number;
  livenessScore?: number;
  qualityScore?: number;
  verificationReasons?: string[];
  failedAttempts?: number;
  lastAttemptAt?: string;
}

export class VerificationService {
  /**
   * Verify a selfie using AI/ML detection
   */
  static async verifySelfie(imageData: string, userId: string, provider?: string): Promise<VerificationResult> {
    try {
      let result: VerificationResult;
      
      if (provider && provider !== 'internal') {
        // Use external provider
        result = await providerManager.verifyWithProvider(provider, 'selfie', imageData, userId);
      } else {
        // Use internal AI verification
        result = await this.simulateSelfieVerification(imageData);
      }
      
      // Log verification attempt
      await this.logVerificationAttempt(userId, 'selfie', result);
      
      return result;
    } catch (error) {
      console.error('Error verifying selfie:', error);
      return {
        isVerified: false,
        confidence: 0,
        faceDetected: false,
        reasons: ['Verification service unavailable'],
        recommendations: ['Please try again later']
      };
    }
  }

  /**
   * Validate an ID document
   */
  static async validateIDDocument(imageData: string, documentType: string, userId: string, provider?: string): Promise<VerificationResult> {
    try {
      let result: VerificationResult;
      
      if (provider && provider !== 'internal') {
        // Use external provider
        result = await providerManager.verifyWithProvider(provider, 'document', imageData, userId, documentType);
      } else {
        // Use internal validation
        result = await this.simulateIDValidation(imageData, documentType);
      }
      
      // Log verification attempt
      await this.logVerificationAttempt(userId, 'id-document', result);
      
      return result;
    } catch (error) {
      console.error('Error validating ID document:', error);
      return {
        isVerified: false,
        confidence: 0,
        faceDetected: false,
        reasons: ['Document validation service unavailable'],
        recommendations: ['Please try again later']
      };
    }
  }

  /**
   * Upload verification image to storage
   */
  static async uploadVerificationImage(
    imageData: string, 
    userId: string, 
    type: 'selfie' | 'id-document'
  ): Promise<string> {
    try {
      // Convert base64 to blob
      const response = await fetch(imageData);
      const blob = await response.blob();
      
      // Upload to Firebase Storage
      const fileName = `${type}-${Date.now()}.jpg`;
      const storageRef = ref(storage, `verifications/${userId}/${fileName}`);
      await uploadBytes(storageRef, blob);
      
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error uploading verification image:', error);
      throw new Error('Failed to upload verification image');
    }
  }

  /**
   * Update user verification status
   */
  static async updateVerificationStatus(
    userId: string,
    verificationResult: VerificationResult,
    type: 'selfie' | 'id-document',
    imageUrl?: string,
    documentType?: string
  ): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      
      const verificationStatus: VerificationStatus = {
        isVerified: verificationResult.isVerified,
        verificationType: type,
        verifiedAt: verificationResult.isVerified ? new Date().toISOString() : undefined,
        documentType: documentType,
        confidence: verificationResult.confidence,
        livenessScore: verificationResult.livenessScore,
        qualityScore: verificationResult.qualityScore,
        verificationReasons: verificationResult.reasons,
        lastAttemptAt: new Date().toISOString()
      };

      await updateDoc(userRef, {
        verificationStatus,
        // Only update photoURL if imageUrl is provided
        ...(imageUrl && { photoURL: imageUrl }),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating verification status:', error);
      throw new Error('Failed to update verification status');
    }
  }

  /**
   * Get user verification status
   */
  static async getVerificationStatus(userId: string): Promise<VerificationStatus | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return null;
      }
      
      const userData = userDoc.data();
      return userData.verificationStatus || null;
    } catch (error) {
      console.error('Error getting verification status:', error);
      return null;
    }
  }

  /**
   * Get available verification providers
   */
  static getAvailableProviders() {
    return providerManager.getAvailableProviders();
  }

  /**
   * Get all verification providers (including unavailable ones)
   */
  static getAllProviders() {
    return providerManager.getAllProviders();
  }

  /**
   * Simulate selfie verification (replace with real API calls)
   */
  private static async simulateSelfieVerification(imageData: string): Promise<VerificationResult> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Simulate verification logic
    const isSuccess = Math.random() > 0.3; // 70% success rate
    
    if (isSuccess) {
      return {
        isVerified: true,
        confidence: 0.85 + Math.random() * 0.1, // 85-95%
        livenessScore: 0.8 + Math.random() * 0.15, // 80-95%
        qualityScore: 0.75 + Math.random() * 0.2, // 75-95%
        faceDetected: true,
        reasons: [],
        recommendations: []
      };
    } else {
      const possibleReasons = [
        'Poor lighting conditions',
        'Face not clearly visible',
        'Multiple faces detected',
        'Image quality too low',
        'Face partially obscured'
      ];
      
      const possibleRecommendations = [
        'Ensure good lighting',
        'Look directly at camera',
        'Remove glasses if possible',
        'Ensure face is fully visible',
        'Take photo in a well-lit area'
      ];
      
      const selectedReasons = possibleReasons.slice(0, 1 + Math.floor(Math.random() * 2));
      const selectedRecommendations = possibleRecommendations.slice(0, 1 + Math.floor(Math.random() * 2));
      
      return {
        isVerified: false,
        confidence: 0.3 + Math.random() * 0.4, // 30-70%
        livenessScore: 0.2 + Math.random() * 0.5, // 20-70%
        qualityScore: 0.4 + Math.random() * 0.3, // 40-70%
        faceDetected: Math.random() > 0.2, // 80% chance face is detected
        reasons: selectedReasons,
        recommendations: selectedRecommendations
      };
    }
  }

  /**
   * Simulate ID document validation (replace with real API calls)
   */
  private static async simulateIDValidation(imageData: string, documentType: string): Promise<VerificationResult> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 3000));
    
    // Simulate validation logic
    const isSuccess = Math.random() > 0.2; // 80% success rate
    
    if (isSuccess) {
      return {
        isVerified: true,
        confidence: 0.9 + Math.random() * 0.08, // 90-98%
        faceDetected: true,
        reasons: [],
        recommendations: [],
        metadata: {
          documentType,
          validationMethod: 'simulated'
        }
      };
    } else {
      const possibleReasons = [
        'Document not clearly visible',
        'Document appears to be expired',
        'Document type not recognized',
        'Image quality insufficient',
        'Document information not readable'
      ];
      
      const possibleRecommendations = [
        'Ensure document is fully visible',
        'Check document expiration date',
        'Use a supported document type',
        'Improve image quality',
        'Ensure all text is readable'
      ];
      
      const selectedReasons = possibleReasons.slice(0, 1 + Math.floor(Math.random() * 2));
      const selectedRecommendations = possibleRecommendations.slice(0, 1 + Math.floor(Math.random() * 2));
      
      return {
        isVerified: false,
        confidence: 0.4 + Math.random() * 0.4, // 40-80%
        faceDetected: Math.random() > 0.3, // 70% chance face is detected
        reasons: selectedReasons,
        recommendations: selectedRecommendations,
        metadata: {
          documentType,
          validationMethod: 'simulated'
        }
      };
    }
  }

  /**
   * Log verification attempt for analytics
   */
  private static async logVerificationAttempt(
    userId: string, 
    type: 'selfie' | 'id-document', 
    result: VerificationResult
  ): Promise<void> {
    try {
      const logData: any = {
        userId,
        type,
        timestamp: new Date(),
        success: result.isVerified,
        confidence: result.confidence,
        reasons: result.reasons
      };

      // Only add metadata if it exists and is not undefined
      if (result.metadata && Object.keys(result.metadata).length > 0) {
        logData.metadata = result.metadata;
      }

      const logRef = doc(collection(db, 'verificationLogs'));
      await setDoc(logRef, logData);
    } catch (error) {
      console.error('Error logging verification attempt:', error);
      // Don't throw error as this is just for analytics
    }
  }
} 