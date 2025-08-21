import { NextRequest, NextResponse } from 'next/server';
import { app } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing Firebase configuration...');
    
    // Test Firebase app initialization
    const appName = app.name;
    console.log('✅ Firebase app initialized:', appName);
    
    // Test if we can access the app options
    const appOptions = app.options;
    console.log('✅ Firebase app options:', {
      apiKey: appOptions.apiKey ? 'Present' : 'Missing',
      authDomain: appOptions.authDomain ? 'Present' : 'Missing',
      projectId: appOptions.projectId ? 'Present' : 'Missing',
      storageBucket: appOptions.storageBucket ? 'Present' : 'Missing'
    });
    
    return NextResponse.json({
      success: true,
      message: 'Firebase configuration is working correctly',
      firebase: {
        appName,
        projectId: appOptions.projectId,
        storageBucket: appOptions.storageBucket,
        authDomain: appOptions.authDomain
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Firebase configuration test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Firebase configuration test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 