import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Basic API test...');
    
    return NextResponse.json({
      success: true,
      message: 'Basic API is working correctly',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Basic API test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Basic API test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 