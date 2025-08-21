import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/firebase';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing Firebase Storage connectivity...');
    
    // Test upload
    const testData = 'data:text/plain;base64,VGVzdCBmaWxlIGZvciBzdG9yYWdlIHRlc3Rpbmc=';
    const testFileName = `test-${Date.now()}.txt`;
    const storageRef = ref(storage, `test/${testFileName}`);
    
    console.log('🔍 Uploading test file...');
    await uploadString(storageRef, testData, 'data_url');
    console.log('✅ Test file uploaded successfully');
    
    // Test download URL
    console.log('🔍 Getting download URL...');
    const downloadURL = await getDownloadURL(storageRef);
    console.log('✅ Download URL obtained:', downloadURL);
    
    // Clean up test file
    console.log('🔍 Cleaning up test file...');
    await deleteObject(storageRef);
    console.log('✅ Test file deleted successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Firebase Storage is working correctly',
      testFileName,
      downloadURL,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Firebase Storage test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Firebase Storage test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 