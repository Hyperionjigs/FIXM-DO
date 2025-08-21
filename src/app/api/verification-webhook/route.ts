import { NextRequest, NextResponse } from 'next/server';
import { VerificationService } from '@/lib/verification-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate webhook signature (in production, verify with n8n webhook secret)
    const signature = request.headers.get('x-n8n-signature');
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing webhook signature' },
        { status: 401 }
      );
    }

    // Extract verification data from n8n webhook
    const {
      userId,
      verificationType,
      result,
      imageUrl,
      documentType,
      metadata
    } = body;

    if (!userId || !verificationType || !result) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Process the verification result
    const verificationResult = {
      isVerified: result.isVerified || false,
      confidence: result.confidence || 0,
      livenessScore: result.livenessScore,
      qualityScore: result.qualityScore,
      faceDetected: result.faceDetected || false,
      reasons: result.reasons || [],
      recommendations: result.recommendations || [],
      metadata: metadata || {}
    };

    // Update verification status
    await VerificationService.updateVerificationStatus(
      userId,
      verificationResult,
      verificationType,
      imageUrl,
      documentType
    );

    return NextResponse.json({
      success: true,
      message: 'Verification result processed successfully'
    });

  } catch (error) {
    console.error('Error processing verification webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 