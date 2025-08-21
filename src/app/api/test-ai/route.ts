import { NextRequest, NextResponse } from 'next/server';
import { generateSelfie } from '@/ai/flows/generate-selfie-flow';

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const result = await generateSelfie({ name });
    
    return NextResponse.json({ 
      success: true, 
      photoDataUri: result.photoDataUri 
    });
  } catch (error: any) {
    console.error('AI test error:', error);
    return NextResponse.json({ 
      error: error.message || 'AI generation failed' 
    }, { status: 500 });
  }
} 