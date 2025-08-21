"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useVerificationStatus } from '@/hooks/use-verification-status';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Shield, 
  UserCheck, 
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  RefreshCw
} from 'lucide-react';
import { VerificationModal } from '@/components/verification-modal';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface VerificationDetails {
  verificationType?: 'selfie' | 'id-upload';
  verificationResult?: any;
  idValidationResult?: any;
  documentType?: string;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  submittedAt?: Date;
}

export default function VerificationStatusPage() {
  const { user } = useAuth();
  const { verificationData, isVerified, isPending, loading: verificationLoading, checkVerificationStatus } = useVerificationStatus();
  const { toast } = useToast();
  const [verificationDetails, setVerificationDetails] = useState<VerificationDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchVerificationDetails();
    }
  }, [user]);

  const fetchVerificationDetails = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setVerificationDetails({
          verificationType: data.verificationType,
          verificationResult: data.verificationResult,
          idValidationResult: data.idValidationResult,
          documentType: data.documentType,
          adminNotes: data.adminNotes,
          reviewedBy: data.reviewedBy,
          reviewedAt: data.reviewedAt ? new Date(data.reviewedAt) : undefined,
          submittedAt: data.photoVerifiedAt ? new Date(data.photoVerifiedAt) : undefined,
        });
      }
    } catch (error) {
      console.error('Error fetching verification details:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch verification details.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await checkVerificationStatus();
    await fetchVerificationDetails();
    toast({
      title: 'Status Updated',
      description: 'Your verification status has been refreshed.',
    });
  };

  const getStatusBadge = () => {
    if (verificationLoading) {
      return <Badge variant="outline">Loading...</Badge>;
    }
    
    if (isVerified) {
      return <Badge variant="outline" className="text-green-600 border-green-600">Verified</Badge>;
    }
    
    if (isPending) {
      return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending Review</Badge>;
    }
    
    return <Badge variant="outline" className="text-red-600 border-red-600">Not Verified</Badge>;
  };

  const getStatusIcon = () => {
    if (verificationLoading) {
      return <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin" />;
    }
    
    if (isVerified) {
      return <CheckCircle className="h-8 w-8 text-green-600" />;
    }
    
    if (isPending) {
      return <Clock className="h-8 w-8 text-yellow-600" />;
    }
    
    return <AlertTriangle className="h-8 w-8 text-red-600" />;
  };

  const getStatusMessage = () => {
    if (verificationLoading) {
      return "Loading verification status...";
    }
    
    if (isVerified) {
      return "Your account has been verified! You can now post tasks and services.";
    }
    
    if (isPending) {
      return "Your verification is currently under review. You'll be notified once it's processed.";
    }
    
    return "Please complete your verification to access all features.";
  };

  if (!user) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p>Please log in to view your verification status.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Verification Status</h1>
            <p className="text-muted-foreground">
              Check the status of your identity verification
            </p>
          </div>
          <Button onClick={handleRefresh} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Verification Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.photoURL} alt={user.displayName || "User"} />
              <AvatarFallback>{user.displayName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{user.displayName}</h3>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            {getStatusBadge()}
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
            {getStatusIcon()}
            <div>
              <h4 className="font-medium">Current Status</h4>
              <p className="text-sm text-muted-foreground">{getStatusMessage()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Details */}
      {verificationDetails && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Verification Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {verificationDetails.verificationType && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="font-medium">Method:</span>
                <span className="capitalize">{verificationDetails.verificationType.replace('-', ' ')}</span>
              </div>
            )}

            {verificationDetails.submittedAt && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Submitted:</span>
                <span>{verificationDetails.submittedAt.toLocaleString()}</span>
              </div>
            )}

            {verificationDetails.reviewedAt && (
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                <span className="font-medium">Reviewed:</span>
                <span>{verificationDetails.reviewedAt.toLocaleString()}</span>
              </div>
            )}

            {verificationDetails.adminNotes && (
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Admin Notes:</h4>
                <p className="text-sm text-muted-foreground">{verificationDetails.adminNotes}</p>
              </div>
            )}

            {verificationDetails.verificationResult && (
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">AI Verification Results:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Confidence: {Math.round((verificationDetails.verificationResult.confidence || 0) * 100)}%</div>
                  <div>Liveness: {Math.round((verificationDetails.verificationResult.livenessScore || 0) * 100)}%</div>
                  <div>Quality: {Math.round((verificationDetails.verificationResult.qualityScore || 0) * 100)}%</div>
                  <div>Face Detected: {verificationDetails.verificationResult.faceDetected ? 'Yes' : 'No'}</div>
                </div>
              </div>
            )}

            {verificationDetails.idValidationResult && (
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Document Validation:</h4>
                <div className="text-sm">
                  <div>Type: {verificationDetails.documentType?.replace('-', ' ')}</div>
                  <div>Confidence: {Math.round((verificationDetails.idValidationResult.confidence || 0) * 100)}%</div>
                  <div>Valid: {verificationDetails.idValidationResult.isValid ? 'Yes' : 'No'}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        {!isVerified && (
          <Button onClick={() => setVerificationModalOpen(true)}>
            <Shield className="h-4 w-4 mr-2" />
            {isPending ? 'Update Verification' : 'Start Verification'}
          </Button>
        )}
        
        <Button variant="outline" onClick={() => window.history.back()}>
          Back
        </Button>
      </div>

      {/* Verification Modal */}
      <VerificationModal
        isOpen={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
      />
    </div>
  );
} 