import { NextRequest, NextResponse } from 'next/server';
import { assessContentQuality } from '@/lib/content-quality';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🔍 API: Received content quality assessment request:', {
      hasTitle: !!body.title,
      hasDescription: !!body.description,
      titleLength: body.title?.length || 0,
      descriptionLength: body.description?.length || 0
    });
    
    // Validate the input
    if (!body.title || typeof body.title !== 'string') {
      console.log('❌ API: Missing or invalid title');
      return NextResponse.json(
        { error: 'title is required and must be a string' },
        { status: 400 }
      );
    }

    if (!body.description || typeof body.description !== 'string') {
      console.log('❌ API: Missing or invalid description');
      return NextResponse.json(
        { error: 'description is required and must be a string' },
        { status: 400 }
      );
    }

    // Assess content quality
    console.log('🔍 API: Assessing content quality...');
    const qualityResult = assessContentQuality(body.title, body.description);
    console.log('✅ API: Content quality assessment completed:', {
      score: qualityResult.score,
      isValid: qualityResult.isValid,
      issuesCount: qualityResult.issues.length
    });
    
    // Add AI-powered suggestions if quality is low
    if (qualityResult.score < 0.7) {
      qualityResult.suggestions.push(
        "💡 Tip: Try using our AI suggestions feature to improve your post quality"
      );
    }

    return NextResponse.json({
      ...qualityResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in assess-content-quality API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to assess content quality',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 