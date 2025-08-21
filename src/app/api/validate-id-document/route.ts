import { NextRequest, NextResponse } from 'next/server';
import { VerificationService } from '@/lib/verification-service';

export async function POST(request: NextRequest) {
  try {
    const { imageData, documentType, userId } = await request.json();

    if (!imageData || !documentType || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: imageData, documentType, and userId' },
        { status: 400 }
      );
    }

    // Validate the ID document using the verification service
    const result = await VerificationService.validateIDDocument(imageData, documentType, userId);

    return NextResponse.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Error in validate-id-document API:', error);
    return NextResponse.json(
      { error: 'Document validation failed' },
      { status: 500 }
    );
  }
} 