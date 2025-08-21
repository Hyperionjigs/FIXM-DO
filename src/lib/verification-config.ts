/**
 * Verification Configuration
 * 
 * This file contains all verification thresholds and settings.
 * Adjust these values to make verification more or less strict.
 */

export interface VerificationConfig {
  // Confidence thresholds (0.0 to 1.0)
  confidenceThreshold: number;
  livenessThreshold: number;
  antiSpoofingThreshold: number;
  qualityThreshold: number;
  
  // Processing settings
  autoCaptureDelay: number;
  countdownDuration: number;
  maxRetries: number;
  
  // Risk calculation thresholds
  lowConfidenceThreshold: number;
  lowLivenessThreshold: number;
  lowQualityThreshold: number;
  lowAntiSpoofingThreshold: number;
  
  // Debug mode for testing
  debugMode: boolean;
}

// Current configuration - VERY LENIENT FOR BASIC HUMAN DETECTION
export const VERIFICATION_CONFIG: VerificationConfig = {
  // Main thresholds (very lenient - only check for basic human features)
  confidenceThreshold: 0.50,    // Very lenient - only check for basic human features
  livenessThreshold: 0.4,       // Very lenient - basic liveness check
  antiSpoofingThreshold: 0.5,   // Very lenient - basic anti-spoofing
  qualityThreshold: 0.3,        // Very lenient - basic quality check
  
  // Processing settings
  autoCaptureDelay: 3000,
  countdownDuration: 3,
  maxRetries: 3,
  
  // Risk calculation thresholds (very lenient for mobile)
  lowConfidenceThreshold: 0.2,  // Very low threshold for mobile
  lowLivenessThreshold: 0.3,    // Very low threshold for mobile
  lowQualityThreshold: 0.2,     // Very low threshold for mobile
  lowAntiSpoofingThreshold: 0.3, // Very low threshold for mobile
  
  // Debug mode
  debugMode: process.env.NODE_ENV === 'development'
};

// Helper function to get current thresholds
export function getVerificationThresholds() {
  return {
    confidence: VERIFICATION_CONFIG.confidenceThreshold,
    liveness: VERIFICATION_CONFIG.livenessThreshold,
    antiSpoofing: VERIFICATION_CONFIG.antiSpoofingThreshold,
    quality: VERIFICATION_CONFIG.qualityThreshold
  };
}

// Helper function to check if verification should pass
export function shouldPassVerification(scores: {
  confidence: number;
  liveness: number;
  antiSpoofing: number;
  quality: number;
}): boolean {
  return (
    scores.confidence >= VERIFICATION_CONFIG.confidenceThreshold &&
    scores.liveness >= VERIFICATION_CONFIG.livenessThreshold &&
    scores.antiSpoofing >= VERIFICATION_CONFIG.antiSpoofingThreshold &&
    scores.quality >= VERIFICATION_CONFIG.qualityThreshold
  );
}

// Helper function to get verification feedback
export function getVerificationFeedback(scores: {
  confidence: number;
  liveness: number;
  antiSpoofing: number;
  quality: number;
}): { passed: boolean; reasons: string[]; recommendations: string[] } {
  const reasons: string[] = [];
  const recommendations: string[] = [];
  
  if (scores.confidence < VERIFICATION_CONFIG.confidenceThreshold) {
    reasons.push('Face detection confidence too low');
    recommendations.push('Ensure your face is clearly visible and well-lit');
  }
  
  if (scores.liveness < VERIFICATION_CONFIG.livenessThreshold) {
    reasons.push('Liveness detection failed');
    recommendations.push('Make sure you are taking a live photo, not using a screenshot');
  }
  
  if (scores.antiSpoofing < VERIFICATION_CONFIG.antiSpoofingThreshold) {
    reasons.push('Anti-spoofing check failed');
    recommendations.push('Take the photo directly with your camera, not from another device');
  }
  
  if (scores.quality < VERIFICATION_CONFIG.qualityThreshold) {
    reasons.push('Image quality too low');
    recommendations.push('Improve lighting and ensure the image is not blurry');
  }
  
  const passed = reasons.length === 0;
  
  if (passed) {
    reasons.push('All verification checks passed');
    recommendations.push('Verification successful!');
  }
  
  return { passed, reasons, recommendations };
}

// Export for easy access
export default VERIFICATION_CONFIG; 