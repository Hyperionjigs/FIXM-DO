"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './use-auth';
import { BadgeSystem, UserStats, Badge } from '@/lib/badge-system';
import { BadgeService, UserBadgeData } from '@/lib/badge-service';

interface BadgeState {
  userStats: UserStats | null;
  userBadges: Badge[];
  unlockedBadges: Badge[];
  nextBadge: Badge | null;
  badgeProgress: { unlocked: number; total: number; percentage: number };
  levelProgress: { level: string; progress: number; nextLevel: string | null };
  loading: boolean;
  error: string | null;
}

interface UseBadgesReturn extends BadgeState {
  refreshBadges: () => Promise<void>;
  checkForNewUnlocks: () => Promise<Badge[]>;
  subscribeToUpdates: () => void;
  unsubscribeFromUpdates: () => void;
}

export function useBadges(): UseBadgesReturn {
  const { user } = useAuth();
  const [state, setState] = useState<BadgeState>({
    userStats: null,
    userBadges: [],
    unlockedBadges: [],
    nextBadge: null,
    badgeProgress: { unlocked: 0, total: 0, percentage: 0 },
    levelProgress: { level: 'starter', progress: 0, nextLevel: null },
    loading: true,
    error: null
  });

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const previousStatsRef = useRef<UserStats | null>(null);

  // Fetch user stats from API
  const fetchUserStats = useCallback(async (userId: string): Promise<UserStats> => {
    const response = await fetch(`/api/badges/user-stats?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user stats');
    }
    const data = await response.json();
    return data.userStats;
  }, []);

  // Calculate badge data from user stats
  const calculateBadgeData = useCallback((userStats: UserStats) => {
    const userBadges = BadgeSystem.getUserBadges(userStats);
    const unlockedBadges = BadgeSystem.getUnlockedBadges(userStats);
    const nextBadge = BadgeSystem.getNextBadge(userStats);
    const badgeProgress = BadgeSystem.getBadgeProgress(userStats);
    const levelProgress = BadgeSystem.getLevelProgress(userStats);

    return {
      userBadges,
      unlockedBadges,
      nextBadge,
      badgeProgress,
      levelProgress
    };
  }, []);

  // Load initial badge data
  const loadBadgeData = useCallback(async () => {
    if (!user?.uid) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const userStats = await fetchUserStats(user.uid);
      const badgeData = calculateBadgeData(userStats);
      
      setState(prev => ({
        ...prev,
        userStats,
        ...badgeData,
        loading: false
      }));

      previousStatsRef.current = userStats;
    } catch (error: any) {
      console.error('Error loading badge data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load badge data'
      }));
    }
  }, [user?.uid, fetchUserStats, calculateBadgeData]);

  // Refresh badge data
  const refreshBadges = useCallback(async () => {
    if (!user?.uid) return;
    await loadBadgeData();
  }, [user?.uid, loadBadgeData]);

  // Check for newly unlocked badges
  const checkForNewUnlocks = useCallback(async (): Promise<Badge[]> => {
    if (!user?.uid || !previousStatsRef.current) return [];

    try {
      const response = await fetch('/api/badges/check-unlocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          previousStats: previousStatsRef.current
        })
      });

      if (!response.ok) {
        throw new Error('Failed to check for new unlocks');
      }

      const data = await response.json();
      const { newlyUnlockedBadges, currentStats } = data.data;

      // Update state with new data
      const badgeData = calculateBadgeData(currentStats);
      setState(prev => ({
        ...prev,
        userStats: currentStats,
        ...badgeData
      }));

      previousStatsRef.current = currentStats;
      return newlyUnlockedBadges;
    } catch (error: any) {
      console.error('Error checking for new unlocks:', error);
      return [];
    }
  }, [user?.uid, calculateBadgeData]);

  // Subscribe to real-time badge updates
  const subscribeToUpdates = useCallback(() => {
    if (!user?.uid) return;

    // Unsubscribe from previous subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    // Subscribe to badge updates
    unsubscribeRef.current = BadgeService.subscribeToBadgeUpdates(
      user.uid,
      (badgeData: UserBadgeData | null) => {
        if (badgeData && state.userStats) {
          // Update badge data when database changes
          const badgeDataCalculated = calculateBadgeData(state.userStats);
          setState(prev => ({
            ...prev,
            ...badgeDataCalculated
          }));
        }
      }
    );
  }, [user?.uid, state.userStats, calculateBadgeData]);

  // Unsubscribe from updates
  const unsubscribeFromUpdates = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
  }, []);

  // Load data on mount and when user changes
  useEffect(() => {
    loadBadgeData();
  }, [loadBadgeData]);

  // Subscribe to updates when user is available
  useEffect(() => {
    if (user?.uid) {
      subscribeToUpdates();
    }

    return () => {
      unsubscribeFromUpdates();
    };
  }, [user?.uid, subscribeToUpdates, unsubscribeFromUpdates]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribeFromUpdates();
    };
  }, [unsubscribeFromUpdates]);

  return {
    ...state,
    refreshBadges,
    checkForNewUnlocks,
    subscribeToUpdates,
    unsubscribeFromUpdates
  };
} 