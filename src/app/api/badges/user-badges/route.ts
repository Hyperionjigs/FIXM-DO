import { NextRequest, NextResponse } from 'next/server';
import { BadgeSystem, UserStats } from '@/lib/badge-system';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID is required' 
      }, { status: 400 });
    }

    // Fetch user stats first
    const statsResponse = await fetch(`${request.nextUrl.origin}/api/badges/user-stats?userId=${userId}`);
    if (!statsResponse.ok) {
      throw new Error('Failed to fetch user stats');
    }
    
    const statsData = await statsResponse.json();
    const userStats: UserStats = statsData.userStats;

    // Get user badges with progress
    const userBadges = BadgeSystem.getUserBadges(userStats);
    const unlockedBadges = BadgeSystem.getUnlockedBadges(userStats);
    const nextBadge = BadgeSystem.getNextBadge(userStats);
    const badgeProgress = BadgeSystem.getBadgeProgress(userStats);
    const levelProgress = BadgeSystem.getLevelProgress(userStats);

    return NextResponse.json({ 
      success: true, 
      data: {
        userStats,
        userBadges,
        unlockedBadges,
        nextBadge,
        badgeProgress,
        levelProgress
      }
    });
  } catch (error: any) {
    console.error('Error fetching user badges:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch user badges' 
    }, { status: 500 });
  }
} 