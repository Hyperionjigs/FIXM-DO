import { NextRequest, NextResponse } from 'next/server';
import { BadgeService } from '@/lib/badge-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID is required' 
      }, { status: 400 });
    }

    const events = await BadgeService.getBadgeUnlockEvents(userId, limit);

    return NextResponse.json({ 
      success: true, 
      data: events 
    });
  } catch (error: any) {
    console.error('Error fetching badge events:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch badge events' 
    }, { status: 500 });
  }
} 