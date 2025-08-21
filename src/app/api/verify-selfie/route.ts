import { NextRequest, NextResponse } from 'next/server';
import { VerificationService } from '@/lib/verification-service';
import { storage, db } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

const auth = getAuth();

export async function POST(request: NextRequest) {
  try {
    const { imageData, userId } = await request.json();
    console.log('🔍 API: Received request with userId:', userId);
    console.log('🔍 API: Image data length:', imageData?.length || 0);
    
    if (!imageData || !userId) {
      console.log('❌ API: Missing required fields');
      return NextResponse.json({ error: 'Missing required fields: imageData and userId' }, { status: 400 });
    }

    // 1. Perform selfie verification (mock or real)
    console.log('🔍 API: Starting selfie verification...');
    const verificationResult = await VerificationService.verifySelfie(imageData, userId);
    console.log('🔍 API: Verification result:', verificationResult);

    // 2. Always upload profile picture if verification passed or failed
    let profilePictureUrl = null;
    try {
      console.log('🔍 API: Starting profile picture upload...');
      
      try {
        // Try to upload to Firebase Storage first
        const storageRef = ref(storage, `profile_pictures/${userId}/${Date.now()}.jpeg`);
        console.log('🔍 API: Storage reference created:', storageRef.fullPath);
        
        console.log('🔍 API: Uploading image to storage...');
        await uploadString(storageRef, imageData, 'data_url');
        console.log('✅ API: Image uploaded to storage successfully');
        
        console.log('🔍 API: Getting download URL...');
        profilePictureUrl = await getDownloadURL(storageRef);
        console.log('✅ API: Download URL obtained:', profilePictureUrl);
      } catch (storageError) {
        console.warn('⚠️ API: Firebase Storage not available, using fallback:', storageError.message);
        
        // Fallback: Store image data directly in Firestore
        console.log('🔄 API: Using fallback - storing image data in Firestore...');
        profilePictureUrl = imageData; // Use the data URL directly
      }

      // Update user's Firestore document with profile picture URL
      console.log('🔍 API: Updating Firestore document...');
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        profilePictureUrl: profilePictureUrl,
        updatedAt: new Date()
      });
      console.log('✅ API: Firestore document updated');

      // Update Firebase Auth user profile with photoURL
      console.log('🔍 API: Updating Firebase Auth user profile...');
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.uid === userId) {
        await updateProfile(currentUser, {
          photoURL: profilePictureUrl
        });
        console.log('✅ API: Firebase Auth user profile updated');
      } else {
        console.log('⚠️ API: No current user or user ID mismatch');
      }

      console.log('✅ API: Profile picture processed successfully:', profilePictureUrl);
    } catch (storageError) {
      console.error('❌ API: Error processing profile picture:', storageError);
      console.error('❌ API: Error details:', {
        message: storageError.message,
        code: storageError.code,
        stack: storageError.stack
      });
      
      // Fallback: Store image data directly in Firestore
      console.log('🔄 API: Trying fallback - storing image data in Firestore...');
      try {
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, {
          profilePictureData: imageData, // Store base64 data directly
          profilePictureUrl: null,
          updatedAt: new Date()
        });
        console.log('✅ API: Image data stored in Firestore as fallback');
        
        // Use the image data directly as the URL for display
        profilePictureUrl = imageData;
      } catch (fallbackError) {
        console.error('❌ API: Fallback also failed:', fallbackError);
        // Last resort: just use the image data directly
        profilePictureUrl = imageData;
      }
    }

    // 3. Return verification result with profile picture URL
    console.log('🔍 API: Preparing response with profilePictureUrl:', profilePictureUrl);
    
    const response = { 
      success: verificationResult.isVerified, 
      result: verificationResult,
      profilePictureUrl 
    };
    
    if (verificationResult.isVerified) {
      console.log('✅ API: Returning success response:', response);
      return NextResponse.json(response);
    } else {
      console.log('⚠️ API: Returning failure response with profile picture:', response);
      return NextResponse.json(response, { status: 400 });
    }
  } catch (error) {
    console.error('❌ API: Error in verify-selfie API:', error);
    console.error('❌ API: Error details:', {
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
} 