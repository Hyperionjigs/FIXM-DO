import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  Timestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';
import { BadgeSystem, UserStats, Badge } from './badge-system';

export interface UserBadgeData {
  userId: string;
  unlockedBadges: string[]; // Array of badge IDs
  lastUpdated: Timestamp;
  totalBadgesUnlocked: number;
  currentLevel: string;
  levelProgress: number;
}

export interface BadgeUnlockEvent {
  id: string;
  userId: string;
  badgeId: string;
  badgeName: string;
  unlockedAt: Timestamp;
  userStats: UserStats;
  metadata?: Record<string, any>;
}

export class BadgeService {
  private static readonly BADGE_COLLECTION = 'user_badges';
  private static readonly BADGE_EVENTS_COLLECTION = 'badge_events';

  /**
   * Get user's badge data from database
   */
  static async getUserBadgeData(userId: string): Promise<UserBadgeData | null> {
    try {
      const docRef = doc(db, this.BADGE_COLLECTION, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as UserBadgeData;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user badge data:', error);
      throw error;
    }
  }

  /**
   * Save user's badge data to database
   */
  static async saveUserBadgeData(userId: string, userStats: UserStats): Promise<UserBadgeData> {
    try {
      const unlockedBadges = BadgeSystem.getUnlockedBadges(userStats);
      const levelProgress = BadgeSystem.getLevelProgress(userStats);
      
      const badgeData: UserBadgeData = {
        userId,
        unlockedBadges: unlockedBadges.map(badge => badge.id),
        lastUpdated: Timestamp.now(),
        totalBadgesUnlocked: unlockedBadges.length,
        currentLevel: levelProgress.level,
        levelProgress: levelProgress.progress
      };

      await setDoc(doc(db, this.BADGE_COLLECTION, userId), badgeData);
      return badgeData;
    } catch (error) {
      console.error('Error saving user badge data:', error);
      throw error;
    }
  }

  /**
   * Record a badge unlock event
   */
  static async recordBadgeUnlock(
    userId: string, 
    badge: Badge, 
    userStats: UserStats,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const event: BadgeUnlockEvent = {
        id: `${userId}_${badge.id}_${Date.now()}`,
        userId,
        badgeId: badge.id,
        badgeName: badge.name,
        unlockedAt: Timestamp.now(),
        userStats,
        metadata
      };

      await setDoc(doc(db, this.BADGE_EVENTS_COLLECTION, event.id), event);
    } catch (error) {
      console.error('Error recording badge unlock event:', error);
      throw error;
    }
  }

  /**
   * Get badge unlock events for a user
   */
  static async getBadgeUnlockEvents(userId: string, limit: number = 10): Promise<BadgeUnlockEvent[]> {
    try {
      const q = query(
        collection(db, this.BADGE_EVENTS_COLLECTION),
        where('userId', '==', userId),
        where('unlockedAt', '>', Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))) // Last 30 days
      );
      
      const querySnapshot = await getDocs(q);
      const events = querySnapshot.docs
        .map(doc => doc.data() as BadgeUnlockEvent)
        .sort((a, b) => b.unlockedAt.toMillis() - a.unlockedAt.toMillis())
        .slice(0, limit);

      return events;
    } catch (error) {
      console.error('Error fetching badge unlock events:', error);
      throw error;
    }
  }

  /**
   * Check for newly unlocked badges and update database
   */
  static async checkAndUpdateBadges(userId: string, userStats: UserStats): Promise<{
    newlyUnlockedBadges: Badge[];
    totalUnlockedBadges: number;
  }> {
    try {
      // Get previous badge data
      const previousData = await this.getUserBadgeData(userId);
      const previousUnlockedBadges = previousData?.unlockedBadges || [];
      
      // Get current unlocked badges
      const currentUnlockedBadges = BadgeSystem.getUnlockedBadges(userStats);
      const currentUnlockedBadgeIds = currentUnlockedBadges.map(badge => badge.id);
      
      // Find newly unlocked badges
      const newlyUnlockedBadges = currentUnlockedBadges.filter(badge => 
        !previousUnlockedBadges.includes(badge.id)
      );

      // Save updated badge data
      await this.saveUserBadgeData(userId, userStats);

      // Record unlock events for new badges
      for (const badge of newlyUnlockedBadges) {
        await this.recordBadgeUnlock(userId, badge, userStats);
      }

      return {
        newlyUnlockedBadges,
        totalUnlockedBadges: currentUnlockedBadges.length
      };
    } catch (error) {
      console.error('Error checking and updating badges:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time badge updates for a user
   */
  static subscribeToBadgeUpdates(
    userId: string, 
    callback: (badgeData: UserBadgeData | null) => void
  ): Unsubscribe {
    const docRef = doc(db, this.BADGE_COLLECTION, userId);
    
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as UserBadgeData);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('Error subscribing to badge updates:', error);
      callback(null);
    });
  }

  /**
   * Get leaderboard data for badges
   */
  static async getBadgeLeaderboard(limit: number = 10): Promise<Array<{
    userId: string;
    totalBadgesUnlocked: number;
    currentLevel: string;
    levelProgress: number;
  }>> {
    try {
      const q = query(
        collection(db, this.BADGE_COLLECTION),
        where('totalBadgesUnlocked', '>', 0)
      );
      
      const querySnapshot = await getDocs(q);
      const leaderboard = querySnapshot.docs
        .map(doc => doc.data() as UserBadgeData)
        .sort((a, b) => {
          // Sort by level first, then by badges unlocked
          const levelOrder = { 'prestigious': 4, 'advanced': 3, 'mid': 2, 'starter': 1 };
          const aLevel = levelOrder[a.currentLevel as keyof typeof levelOrder] || 0;
          const bLevel = levelOrder[b.currentLevel as keyof typeof levelOrder] || 0;
          
          if (aLevel !== bLevel) {
            return bLevel - aLevel;
          }
          
          return b.totalBadgesUnlocked - a.totalBadgesUnlocked;
        })
        .slice(0, limit);

      return leaderboard;
    } catch (error) {
      console.error('Error fetching badge leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get badge statistics for analytics
   */
  static async getBadgeStatistics(): Promise<{
    totalUsersWithBadges: number;
    averageBadgesPerUser: number;
    mostUnlockedBadge: string;
    levelDistribution: Record<string, number>;
  }> {
    try {
      const querySnapshot = await getDocs(collection(db, this.BADGE_COLLECTION));
      const users = querySnapshot.docs.map(doc => doc.data() as UserBadgeData);
      
      const totalUsersWithBadges = users.length;
      const averageBadgesPerUser = totalUsersWithBadges > 0 
        ? users.reduce((sum, user) => sum + user.totalBadgesUnlocked, 0) / totalUsersWithBadges 
        : 0;

      // Count badge unlocks from events
      const eventsQuery = query(collection(db, this.BADGE_EVENTS_COLLECTION));
      const eventsSnapshot = await getDocs(eventsQuery);
      const events = eventsSnapshot.docs.map(doc => doc.data() as BadgeUnlockEvent);
      
      const badgeCounts: Record<string, number> = {};
      events.forEach(event => {
        badgeCounts[event.badgeId] = (badgeCounts[event.badgeId] || 0) + 1;
      });
      
      const mostUnlockedBadge = Object.entries(badgeCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none';

      // Level distribution
      const levelDistribution: Record<string, number> = {};
      users.forEach(user => {
        levelDistribution[user.currentLevel] = (levelDistribution[user.currentLevel] || 0) + 1;
      });

      return {
        totalUsersWithBadges,
        averageBadgesPerUser,
        mostUnlockedBadge,
        levelDistribution
      };
    } catch (error) {
      console.error('Error fetching badge statistics:', error);
      throw error;
    }
  }
} 