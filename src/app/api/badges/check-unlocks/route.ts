import { NextRequest, NextResponse } from 'next/server';
import { BadgeSystem, UserStats, Badge } from '@/lib/badge-system';

export async function POST(request: NextRequest) {
  try {
    const { userId, previousStats } = await request.json();

    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID is required' 
      }, { status: 400 });
    }

    // Fetch current user stats
    const statsResponse = await fetch(`${request.nextUrl.origin}/api/badges/user-stats?userId=${userId}`);
    if (!statsResponse.ok) {
      throw new Error('Failed to fetch user stats');
    }
    
    const statsData = await statsResponse.json();
    const currentStats: UserStats = statsData.userStats;

    // If we have previous stats, compare to find newly unlocked badges
    let newlyUnlockedBadges: Badge[] = [];
    
    if (previousStats) {
      const previousBadges = BadgeSystem.getUnlockedBadges(previousStats);
      const currentBadges = BadgeSystem.getUnlockedBadges(currentStats);
      
      // Find badges that are unlocked now but weren't before
      newlyUnlockedBadges = currentBadges.filter(currentBadge => 
        !previousBadges.find(previousBadge => previousBadge.id === currentBadge.id)
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        currentStats,
        newlyUnlockedBadges,
        totalUnlockedBadges: BadgeSystem.getUnlockedBadges(currentStats).length
      }
    });
  } catch (error: any) {
    console.error('Error checking badge unlocks:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to check badge unlocks' 
    }, { status: 500 });
  }
} 