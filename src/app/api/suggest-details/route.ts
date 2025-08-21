import { NextRequest, NextResponse } from 'next/server';
import { suggestDetails } from '@/ai/flows/suggest-details-flow';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the input
    if (!body.userInput || typeof body.userInput !== 'string') {
      return NextResponse.json(
        { error: 'userInput is required and must be a string' },
        { status: 400 }
      );
    }

    const result = await suggestDetails({
      userInput: body.userInput,
      postType: body.postType,
      conversationHistory: body.conversationHistory,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in suggest-details API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate suggestions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 