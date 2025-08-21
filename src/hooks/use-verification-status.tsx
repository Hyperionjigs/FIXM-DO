"use client";

import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface VerificationData {
  verificationType?: 'selfie' | 'id-upload';
  verificationResult?: any;
  idValidationResult?: any;
  documentType?: string;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  submittedAt?: Date;
}

export function useVerificationStatus() {
  const { user } = useAuth();
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [canPost, setCanPost] = useState(false);
  const [selfieVerified, setSelfieVerified] = useState(false);
  const [idDocumentVerified, setIdDocumentVerified] = useState(false);

  const checkVerificationStatus = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        
        // Set verification data
        setVerificationData({
          verificationType: data.verificationType,
          verificationResult: data.verificationResult,
          idValidationResult: data.idValidationResult,
          documentType: data.documentType,
          adminNotes: data.adminNotes,
          reviewedBy: data.reviewedBy,
          reviewedAt: data.reviewedAt ? new Date(data.reviewedAt) : undefined,
          submittedAt: data.photoVerifiedAt ? new Date(data.photoVerifiedAt) : undefined,
        });

        // Check individual verification statuses
        const selfieVerified = data.selfieVerified === true;
        const idDocumentVerified = data.idDocumentVerified === true;
        
        setSelfieVerified(selfieVerified);
        setIdDocumentVerified(idDocumentVerified);
        
        // User is only fully verified if BOTH verifications are complete
        const fullyVerified = selfieVerified && idDocumentVerified;
        const verificationStatus = data.verificationStatus;
        
        setIsVerified(fullyVerified);
        setIsPending(verificationStatus === 'pending' || verificationStatus === 'reviewing');
        setCanPost(fullyVerified); // Only verified users can post
      } else {
        // User document doesn't exist, set defaults
        setVerificationData(null);
        setIsVerified(false);
        setIsPending(false);
        setCanPost(false);
        setSelfieVerified(false);
        setIdDocumentVerified(false);
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
      // On error, assume not verified
      setIsVerified(false);
      setIsPending(false);
      setCanPost(false);
      setSelfieVerified(false);
      setIdDocumentVerified(false);
    } finally {
      setLoading(false);
    }
  };

  const updateVerificationStatus = async (type: 'selfie' | 'id-document', verified: boolean) => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const updateData: any = {
        updatedAt: new Date()
      };

      if (type === 'selfie') {
        updateData.selfieVerified = verified;
        updateData.selfieVerifiedAt = verified ? new Date() : null;
      } else if (type === 'id-document') {
        updateData.idDocumentVerified = verified;
        updateData.idDocumentVerifiedAt = verified ? new Date() : null;
      }

      // Check if both verifications are now complete
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        const newSelfieVerified = type === 'selfie' ? verified : data.selfieVerified;
        const newIdDocumentVerified = type === 'id-document' ? verified : data.idDocumentVerified;
        
        if (newSelfieVerified && newIdDocumentVerified) {
          updateData.verificationStatus = 'verified';
          updateData.photoVerified = true;
          updateData.verifiedAt = new Date();
        } else {
          updateData.verificationStatus = 'pending';
          updateData.photoVerified = false;
        }
      }

      await updateDoc(userRef, updateData);
      
      // Refresh verification status
      await checkVerificationStatus();
    } catch (error) {
      console.error('Error updating verification status:', error);
    }
  };

  useEffect(() => {
    checkVerificationStatus();
  }, [user]);

  return {
    verificationData,
    isVerified,
    isPending,
    canPost,
    loading,
    selfieVerified,
    idDocumentVerified,
    checkVerificationStatus,
    updateVerificationStatus,
  };
} 