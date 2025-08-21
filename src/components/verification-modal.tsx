"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Upload, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Shield,
  User,
  FileText,
  Sparkles
} from "lucide-react";
import { VerificationService } from "@/lib/verification-service";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (profilePictureUrl?: string) => void;
  verificationType?: 'selfie' | 'id-document';
}

type VerificationType = 'selfie' | 'id-document';
type VerificationStep = 'select' | 'capture' | 'review' | 'processing' | 'result';

export function VerificationModal({ isOpen, onClose, onComplete, verificationType = 'selfie' }: VerificationModalProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<VerificationStep>('select');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<string>('government-id');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset modal state when verification type changes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('select');
      setResult(null);
      setCapturedImage(null);
      setIsProcessing(false);
    }
  }, [isOpen, verificationType]);

  // Auto-start processing when processing step is reached
  useEffect(() => {
    if (currentStep === 'processing' && capturedImage && !isProcessing) {
      // Use setTimeout to avoid the dependency issue
      setTimeout(() => {
        processVerification();
      }, 0);
    }
  }, [currentStep, capturedImage, isProcessing]);

  const handleClose = useCallback(() => {
    setCurrentStep('select');
    setResult(null);
    setCapturedImage(null);
    setIsProcessing(false);
    onClose();
  }, [onClose]);

  const startCamera = useCallback(async () => {
    console.log('🔍 Starting camera...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log('✅ Camera started successfully');
      }
    } catch (error) {
      console.error('❌ Error accessing camera:', error);
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        setCurrentStep('review');
        
        // Stop camera stream
        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
    }
  }, []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setCapturedImage(imageData);
        setCurrentStep('review');
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    setCurrentStep('capture');
    startCamera();
  }, [startCamera]);

  const confirmPhoto = useCallback(() => {
    setCurrentStep('processing');
  }, []);

  const processVerification = useCallback(async () => {
    if (!capturedImage || !user?.uid) {
      console.log('❌ Missing capturedImage or user.uid');
      return;
    }

    console.log('🔍 Processing verification...', { verificationType, userId: user.uid });
    setIsProcessing(true);
    
    try {
      let verificationResult;
      let profilePictureUrl: string | undefined;
      
      if (verificationType === 'selfie') {
        console.log('🔍 Calling selfie verification API...');
        // Call the verify-selfie API
        const response = await fetch('/api/verify-selfie', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageData: capturedImage,
            userId: user.uid
          })
        });

        const data = await response.json();
        
        if (!response.ok) {
          console.error('❌ Selfie verification API error:', data);
          throw new Error(data.error || 'Selfie verification failed');
        }

        verificationResult = data.result;
        profilePictureUrl = data.profilePictureUrl;
        console.log('✅ Selfie verification result:', verificationResult);
        console.log('✅ Profile picture URL:', profilePictureUrl);
      } else {
        console.log('🔍 Calling ID document verification API...');
        // Call the validate-id-document API
        const response = await fetch('/api/validate-id-document', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageData: capturedImage,
            documentType: documentType,
            userId: user.uid
          })
        });

        const data = await response.json();
        
        if (!response.ok) {
          console.error('❌ ID document verification API error:', data);
          throw new Error(data.error || 'ID document validation failed');
        }

        verificationResult = data.result;
        console.log('✅ ID document verification result:', verificationResult);
      }
      
      setResult(verificationResult);
      setCurrentStep('result');
      
      // Always call onComplete with profile picture URL if available, regardless of verification result
      if (onComplete) {
        console.log('✅ Calling onComplete with profile picture URL:', profilePictureUrl);
        if (verificationType === 'selfie') {
          onComplete(profilePictureUrl);
        } else {
          onComplete();
        }
      }
    } catch (error) {
      console.error('❌ Verification error:', error);
      setResult({
        isVerified: false,
        confidence: 0,
        faceDetected: false,
        reasons: [error instanceof Error ? error.message : 'Verification failed'],
        recommendations: ['Please check your internet connection and try again', 'Ensure your image is clear and well-lit']
      });
      setCurrentStep('result');
    } finally {
      setIsProcessing(false);
    }
  }, [capturedImage, user?.uid, verificationType, documentType, onComplete]);

  const retryVerification = useCallback(() => {
    setCurrentStep('select');
    setResult(null);
    setCapturedImage(null);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mx-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Shield className="h-5 w-5" />
              Identity Verification
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8 sm:h-10 sm:w-10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
          {/* Step 1: Select Verification Type */}
          {currentStep === 'select' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-semibold mb-2 text-base sm:text-lg">
                  {verificationType === 'selfie' ? 'Selfie Verification' : 'ID Document Verification'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {verificationType === 'selfie' 
                    ? 'Take a photo of yourself for quick verification' 
                    : 'Upload a government-issued ID for verification'
                  }
                </p>
              </div>
              
              {verificationType === 'id-document' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Document Type</label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full p-3 border border-border rounded-lg bg-background"
                  >
                    <option value="government-id">Government ID</option>
                    <option value="passport">Passport</option>
                    <option value="drivers-license">Driver's License</option>
                    <option value="company-id">Company ID</option>
                  </select>
                </div>
              )}
              
              <Button
                onClick={() => {
                  if (verificationType === 'selfie') {
                    setCurrentStep('capture');
                    startCamera();
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
                className="w-full"
                size="lg"
              >
                {verificationType === 'selfie' ? (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Start Camera
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </>
                )}
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}
          
          {/* Step 2: Camera Capture */}
          {currentStep === 'capture' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-semibold mb-2 text-base sm:text-lg">Take Your Profile Photo</h3>
                <p className="text-sm text-muted-foreground">
                  Position your face in the center circle. This photo will be used as your profile picture once verified.
                </p>
              </div>
              
              <div className="relative bg-black rounded-full overflow-hidden mx-auto w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 border-4 border-primary/30 rounded-full pointer-events-none">
                  {/* Circular face guide */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 sm:w-44 sm:h-44 md:w-48 md:h-48 border-2 border-white/50 rounded-full"></div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentStep('select');
                    const stream = videoRef.current?.srcObject as MediaStream;
                    if (stream) {
                      stream.getTracks().forEach(track => track.stop());
                    }
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={capturePhoto}
                  className="flex-1"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Capture Photo
                </Button>
              </div>
              
              {/* Tips for getting the right selfie */}
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100 flex items-center gap-2 text-xs">
                  <Sparkles className="h-3 w-3" />
                  Tips on getting the right selfie
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-blue-700 dark:text-blue-300">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500 font-semibold">•</span>
                    <span>Ensure good lighting - face should be well-lit</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500 font-semibold">•</span>
                    <span>Look directly at the camera with a neutral expression</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500 font-semibold">•</span>
                    <span>Remove glasses, hats, or face coverings</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500 font-semibold">•</span>
                    <span>Keep your face centered in the circle</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500 font-semibold">•</span>
                    <span>Use a plain background without distractions</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500 font-semibold">•</span>
                    <span>Hold the device steady to avoid blur</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 3: Review Photo */}
          {currentStep === 'review' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-semibold mb-2">Review Your {verificationType === 'selfie' ? 'Photo' : 'Document'}</h3>
                <p className="text-sm text-muted-foreground">
                  {verificationType === 'selfie' 
                    ? 'Review your profile photo before verification' 
                    : 'Review your document before verification'
                  }
                </p>
              </div>
              
              {capturedImage && (
                <div className="mt-4 flex flex-col items-center">
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className={`mx-auto border-4 border-primary/20 ${verificationType === 'selfie' ? 'w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-cover rounded-full' : 'w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-cover rounded-lg'}`}
                  />
                  {verificationType === 'selfie' && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      This will be your profile picture once verified
                    </p>
                  )}
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={retakePhoto}
                  className="flex-1"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Retake
                </Button>
                <Button
                  onClick={confirmPhoto}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm
                </Button>
              </div>
            </div>
          )}
          
          {/* Step 4: Processing */}
          {currentStep === 'processing' && (
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <h3 className="font-semibold">Processing Verification</h3>
              <p className="text-sm text-muted-foreground">
                Please wait while we verify your {verificationType === 'selfie' ? 'profile photo' : 'document'}
              </p>
              
              {capturedImage && (
                <div className="mt-4 flex flex-col items-center">
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className={`mx-auto border-4 border-primary/20 ${verificationType === 'selfie' ? 'w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-cover rounded-full' : 'w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-cover rounded-lg'}`}
                  />
                  {verificationType === 'selfie' && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      This will be your profile picture once verified
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Step 4: Result */}
          {currentStep === 'result' && result && (
            <div className="space-y-4">
              <div className="text-center">
                {result.isVerified ? (
                  <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                    <CheckCircle className="h-6 w-6" />
                    <h3 className="font-semibold">Verification Successful!</h3>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-red-600 mb-2">
                    <AlertCircle className="h-6 w-6" />
                    <h3 className="font-semibold">Verification Failed</h3>
                  </div>
                )}
                
                <p className="text-sm text-muted-foreground">
                  Confidence: {Math.round(result.confidence * 100)}%
                </p>
              </div>
              
              {result.reasons && result.reasons.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Details:</h4>
                  <ul className="text-sm space-y-1">
                    {result.reasons.map((reason: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-muted-foreground">•</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {result.recommendations && result.recommendations.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">Recommendations:</h4>
                  <ul className="text-sm space-y-1 text-blue-700 dark:text-blue-300">
                    {result.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span>•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3">
                {!result.isVerified && (
                  <Button
                    variant="outline"
                    onClick={retryVerification}
                    className="flex-1"
                  >
                    Try Again
                  </Button>
                )}
                <Button
                  onClick={handleClose}
                  className="flex-1"
                >
                  {result.isVerified ? 'Continue' : 'Close'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
} 