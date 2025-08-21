import { NextRequest, NextResponse } from 'next/server';
import { BadgeService } from '@/lib/badge-service';

export async function GET(request: NextRequest) {
  try {
    const statistics = await BadgeService.getBadgeStatistics();

    return NextResponse.json({ 
      success: true, 
      data: statistics 
    });
  } catch (error: any) {
    console.error('Error fetching badge statistics:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch badge statistics' 
    }, { status: 500 });
  }
} 