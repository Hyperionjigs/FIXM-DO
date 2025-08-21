import { NextRequest, NextResponse } from 'next/server';
import { BadgeService } from '@/lib/badge-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const leaderboard = await BadgeService.getBadgeLeaderboard(limit);

    return NextResponse.json({ 
      success: true, 
      data: leaderboard 
    });
  } catch (error: any) {
    console.error('Error fetching badge leaderboard:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch badge leaderboard' 
    }, { status: 500 });
  }
} 