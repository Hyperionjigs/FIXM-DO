export interface Badge {
  id: string;
  name: string;
  description: string;
  level: 'unverified' | 'starter' | 'mid' | 'advanced' | 'prestigious';
  category: 'verification' | 'tasks' | 'reputation' | 'community' | 'achievement';
  icon: string;
  color: string;
  requirements: BadgeRequirement[];
  unlockedAt?: Date;
  progress?: number; // 0-100
}

export interface BadgeRequirement {
  type: 'tasks_completed' | 'rating_average' | 'reviews_count' | 'response_rate' | 'completion_rate' | 'profile_verified' | 'photo_verified' | 'mentorship_count' | 'staff_recognition';
  value: number;
  operator: 'gte' | 'eq' | 'lte';
  description: string;
}

export interface UserStats {
  tasksCompleted: number;
  averageRating: number;
  totalReviews: number;
  positiveReviews: number;
  responseRate: number;
  completionRate: number;
  profileVerified: boolean;
  photoVerified: boolean;
  mentorshipCount: number;
  staffRecognition: boolean;
  firstTaskPosted: boolean;
  firstTaskAccepted: boolean;
  firstTaskCompleted: boolean;
}

export const BADGES: Badge[] = [
  // Unverified Level (1 badge)
  {
    id: 'unverified',
    name: 'Unverified',
    description: 'Complete your profile verification to unlock your first badge.',
    level: 'unverified',
    category: 'verification',
    icon: '🥚',
    color: 'text-gray-500',
    requirements: [
      {
        type: 'profile_verified',
        value: 0,
        operator: 'eq',
        description: 'Profile not yet verified'
      }
    ]
  },

  // Starter-Level Badges
  {
    id: 'verified',
    name: 'Verified',
    description: 'Welcome to FixMo! You\'ve completed your profile verification.',
    level: 'starter',
    category: 'verification',
    icon: '🐤',
    color: 'text-green-600',
    requirements: [
      {
        type: 'profile_verified',
        value: 1,
        operator: 'eq',
        description: 'Complete profile verification'
      }
    ]
  },
  {
    id: 'task_scout',
    name: 'Task Scout',
    description: 'Posted your first task or accepted your first task. You\'re officially active on FixMo!',
    level: 'starter',
    category: 'tasks',
    icon: '🔍',
    color: 'text-blue-600',
    requirements: [
      {
        type: 'tasks_completed',
        value: 1,
        operator: 'gte',
        description: 'Post or accept your first task'
      }
    ]
  },
  {
    id: 'fresh_hand',
    name: 'Fresh Hand',
    description: 'Successfully completed your first task. Congratulations on your first successful transaction!',
    level: 'starter',
    category: 'achievement',
    icon: '🤝',
    color: 'text-green-600',
    requirements: [
      {
        type: 'tasks_completed',
        value: 1,
        operator: 'gte',
        description: 'Complete your first task'
      }
    ]
  },
  {
    id: 'apprentice',
    name: 'Apprentice',
    description: 'Completed 5 tasks with excellent ratings. You\'re getting the hang of things!',
    level: 'starter',
    category: 'reputation',
    icon: '🎓',
    color: 'text-purple-600',
    requirements: [
      {
        type: 'tasks_completed',
        value: 5,
        operator: 'gte',
        description: 'Complete 5 tasks'
      },
      {
        type: 'rating_average',
        value: 4.0,
        operator: 'gte',
        description: 'Maintain 4+ star rating'
      }
    ]
  },
  {
    id: 'onboarder',
    name: 'Onboarder',
    description: 'Completed both profile and photo verification. You\'re fully onboarded!',
    level: 'starter',
    category: 'verification',
    icon: '📸',
    color: 'text-indigo-600',
    requirements: [
      {
        type: 'profile_verified',
        value: 1,
        operator: 'eq',
        description: 'Complete profile verification'
      },
      {
        type: 'photo_verified',
        value: 1,
        operator: 'eq',
        description: 'Complete photo verification'
      }
    ]
  },

  // Mid Level Badges
  {
    id: 'skilled_helper',
    name: 'Skilled Helper',
    description: 'Completed 15 tasks with excellent ratings. You\'re becoming a reliable helper!',
    level: 'mid',
    category: 'reputation',
    icon: '⭐',
    color: 'text-yellow-600',
    requirements: [
      {
        type: 'tasks_completed',
        value: 15,
        operator: 'gte',
        description: 'Complete 15 tasks'
      },
      {
        type: 'rating_average',
        value: 4.5,
        operator: 'gte',
        description: 'Maintain 4.5+ star rating'
      }
    ]
  },
  {
    id: 'reliable_fixer',
    name: 'Reliable Fixer',
    description: 'Completed 30 tasks with excellent ratings. You\'re a trusted problem solver!',
    level: 'mid',
    category: 'reputation',
    icon: '🔧',
    color: 'text-blue-600',
    requirements: [
      {
        type: 'tasks_completed',
        value: 30,
        operator: 'gte',
        description: 'Complete 30 tasks'
      },
      {
        type: 'rating_average',
        value: 4.5,
        operator: 'gte',
        description: 'Maintain 4.5+ star rating'
      }
    ]
  },
  {
    id: 'certified_doer',
    name: 'Certified Doer',
    description: 'Completed 50 tasks with excellent ratings and received 10+ reviews. You\'re certified!',
    level: 'mid',
    category: 'reputation',
    icon: '🏆',
    color: 'text-amber-600',
    requirements: [
      {
        type: 'tasks_completed',
        value: 50,
        operator: 'gte',
        description: 'Complete 50 tasks'
      },
      {
        type: 'rating_average',
        value: 4.5,
        operator: 'gte',
        description: 'Maintain 4.5+ star rating'
      },
      {
        type: 'reviews_count',
        value: 10,
        operator: 'gte',
        description: 'Receive 10+ reviews'
      }
    ]
  },
  {
    id: 'task_pro',
    name: 'Task Pro',
    description: 'Completed 75 tasks with excellent ratings and high response rate. You\'re a pro!',
    level: 'mid',
    category: 'reputation',
    icon: '🚀',
    color: 'text-purple-600',
    requirements: [
      {
        type: 'tasks_completed',
        value: 75,
        operator: 'gte',
        description: 'Complete 75 tasks'
      },
      {
        type: 'rating_average',
        value: 4.7,
        operator: 'gte',
        description: 'Maintain 4.7+ star rating'
      },
      {
        type: 'response_rate',
        value: 95,
        operator: 'gte',
        description: 'Maintain 95%+ response rate'
      }
    ]
  },
  {
    id: 'problem_solver',
    name: 'Problem Solver',
    description: 'Completed 100 tasks with excellent ratings and 25+ reviews. You solve problems!',
    level: 'mid',
    category: 'reputation',
    icon: '💡',
    color: 'text-indigo-600',
    requirements: [
      {
        type: 'tasks_completed',
        value: 100,
        operator: 'gte',
        description: 'Complete 100 tasks'
      },
      {
        type: 'rating_average',
        value: 4.8,
        operator: 'gte',
        description: 'Maintain 4.8+ star rating'
      },
      {
        type: 'reviews_count',
        value: 25,
        operator: 'gte',
        description: 'Receive 25+ reviews'
      }
    ]
  },

  // Advanced Level Badges
  {
    id: 'elite_tasker',
    name: 'Elite Tasker',
    description: 'Completed 250 tasks with near-perfect ratings and response rate. You\'re elite!',
    level: 'advanced',
    category: 'reputation',
    icon: '👑',
    color: 'text-purple-600',
    requirements: [
      {
        type: 'tasks_completed',
        value: 250,
        operator: 'gte',
        description: 'Complete 250 tasks'
      },
      {
        type: 'rating_average',
        value: 4.9,
        operator: 'gte',
        description: 'Maintain 4.9+ star rating'
      },
      {
        type: 'response_rate',
        value: 98,
        operator: 'gte',
        description: 'Maintain 98%+ response rate'
      }
    ]
  },
  {
    id: 'master_hand',
    name: 'Master Hand',
    description: 'Completed 500 tasks with near-perfect ratings and response rate. You\'re a master!',
    level: 'advanced',
    category: 'reputation',
    icon: '🎯',
    color: 'text-red-600',
    requirements: [
      {
        type: 'tasks_completed',
        value: 500,
        operator: 'gte',
        description: 'Complete 500 tasks'
      },
      {
        type: 'rating_average',
        value: 4.9,
        operator: 'gte',
        description: 'Maintain 4.9+ star rating'
      },
      {
        type: 'response_rate',
        value: 99,
        operator: 'gte',
        description: 'Maintain 99%+ response rate'
      }
    ]
  },
  {
    id: 'veteran_pro',
    name: 'Veteran Pro',
    description: 'Completed 750 tasks with perfect ratings and response/completion rates. You\'re a veteran!',
    level: 'advanced',
    category: 'reputation',
    icon: '🏅',
    color: 'text-orange-600',
    requirements: [
      {
        type: 'tasks_completed',
        value: 750,
        operator: 'gte',
        description: 'Complete 750 tasks'
      },
      {
        type: 'rating_average',
        value: 4.9,
        operator: 'gte',
        description: 'Maintain 4.9+ star rating'
      },
      {
        type: 'response_rate',
        value: 100,
        operator: 'eq',
        description: 'Maintain 100% response rate'
      },
      {
        type: 'completion_rate',
        value: 100,
        operator: 'eq',
        description: 'Maintain 100% completion rate'
      }
    ]
  },
  {
    id: 'task_commander',
    name: 'Task Commander',
    description: 'Completed 1,000 tasks and mentored 5+ users. You\'re a commander!',
    level: 'advanced',
    category: 'community',
    icon: '⚡',
    color: 'text-blue-600',
    requirements: [
      {
        type: 'tasks_completed',
        value: 1000,
        operator: 'gte',
        description: 'Complete 1,000 tasks'
      },
      {
        type: 'mentorship_count',
        value: 5,
        operator: 'gte',
        description: 'Mentor 5+ users'
      }
    ]
  },
  {
    id: 'trusted_force',
    name: 'Trusted Force',
    description: 'Completed 1,500 tasks with perfect ratings and perfect rates. You\'re a trusted force!',
    level: 'advanced',
    category: 'reputation',
    icon: '🛡️',
    color: 'text-emerald-600',
    requirements: [
      {
        type: 'tasks_completed',
        value: 1500,
        operator: 'gte',
        description: 'Complete 1,500 tasks'
      },
      {
        type: 'rating_average',
        value: 5.0,
        operator: 'eq',
        description: 'Maintain 5.0 star rating'
      },
      {
        type: 'response_rate',
        value: 100,
        operator: 'eq',
        description: 'Maintain 100% response rate'
      },
      {
        type: 'completion_rate',
        value: 100,
        operator: 'eq',
        description: 'Maintain 100% completion rate'
      }
    ]
  },

  // Prestigious Level Badges
  {
    id: 'hero_level',
    name: 'Hero Level',
    description: 'Completed 2,500 tasks with perfect ratings and staff recognition. You\'re a hero!',
    level: 'prestigious',
    category: 'achievement',
    icon: '🦸',
    color: 'text-red-600',
    requirements: [
      {
        type: 'tasks_completed',
        value: 2500,
        operator: 'gte',
        description: 'Complete 2,500 tasks'
      },
      {
        type: 'rating_average',
        value: 5.0,
        operator: 'eq',
        description: 'Maintain 5.0 star rating'
      },
      {
        type: 'staff_recognition',
        value: 1,
        operator: 'eq',
        description: 'Receive staff recognition'
      }
    ]
  }
];

export class BadgeSystem {
  static calculateUserStats(userData: any): UserStats {
    return {
      tasksCompleted: userData.tasksCompleted || 0,
      averageRating: userData.averageRating || 0,
      totalReviews: userData.totalReviews || 0,
      positiveReviews: userData.positiveReviews || 0,
      responseRate: userData.responseRate || 0,
      completionRate: userData.completionRate || 0,
      profileVerified: userData.profileVerified || false,
      photoVerified: userData.photoVerified || false,
      mentorshipCount: userData.mentorshipCount || 0,
      staffRecognition: userData.staffRecognition || false,
      firstTaskPosted: userData.firstTaskPosted || false,
      firstTaskAccepted: userData.firstTaskAccepted || false,
      firstTaskCompleted: userData.firstTaskCompleted || false
    };
  }

  static checkBadgeRequirements(badge: Badge, userStats: UserStats): { unlocked: boolean; progress: number; unmetRequirements: string[] } {
    let unlocked = true;
    let unmetRequirements: string[] = [];
    let totalRequirements = badge.requirements.length;
    let metRequirements = 0;

    for (const requirement of badge.requirements) {
      const value = this.getRequirementValue(requirement.type, userStats);
      const meetsRequirement = this.evaluateRequirement(requirement, value);
      
      if (meetsRequirement) {
        metRequirements++;
      } else {
        unlocked = false;
        unmetRequirements.push(requirement.description);
      }
    }

    const progress = Math.round((metRequirements / totalRequirements) * 100);

    return {
      unlocked,
      progress,
      unmetRequirements
    };
  }

  static getRequirementValue(type: string, userStats: UserStats): number {
    switch (type) {
      case 'tasks_completed':
        return userStats.tasksCompleted;
      case 'rating_average':
        return userStats.averageRating;
      case 'reviews_count':
        return userStats.positiveReviews;
      case 'response_rate':
        return userStats.responseRate;
      case 'completion_rate':
        return userStats.completionRate;
      case 'profile_verified':
        return userStats.profileVerified ? 1 : 0;
      case 'photo_verified':
        return userStats.photoVerified ? 1 : 0;
      case 'mentorship_count':
        return userStats.mentorshipCount;
      case 'staff_recognition':
        return userStats.staffRecognition ? 1 : 0;
      default:
        return 0;
    }
  }

  static evaluateRequirement(requirement: BadgeRequirement, value: number): boolean {
    switch (requirement.operator) {
      case 'gte':
        return value >= requirement.value;
      case 'eq':
        return value === requirement.value;
      case 'lte':
        return value <= requirement.value;
      default:
        return false;
    }
  }

  static getUserBadges(userStats: UserStats): Badge[] {
    return BADGES.map(badge => {
      const { unlocked, progress } = this.checkBadgeRequirements(badge, userStats);
      return {
        ...badge,
        unlockedAt: unlocked ? new Date() : undefined,
        progress
      };
    });
  }

  static getUnlockedBadges(userStats: UserStats): Badge[] {
    return this.getUserBadges(userStats).filter(badge => badge.unlockedAt);
  }

  static getNextBadge(userStats: UserStats): Badge | null {
    const userBadges = this.getUserBadges(userStats);
    const unlockedBadges = userBadges.filter(badge => badge.unlockedAt);
    const lockedBadges = userBadges.filter(badge => !badge.unlockedAt);

    // Find the next badge with the highest progress
    const nextBadge = lockedBadges.reduce((best, current) => {
      return (current.progress || 0) > (best.progress || 0) ? current : best;
    }, lockedBadges[0]);

    return nextBadge || null;
  }

  static getBadgeProgress(userStats: UserStats): { unlocked: number; total: number; percentage: number } {
    const userBadges = this.getUserBadges(userStats);
    const unlocked = userBadges.filter(badge => badge.unlockedAt).length;
    const total = userBadges.length;
    const percentage = Math.round((unlocked / total) * 100);

    return { unlocked, total, percentage };
  }

  static getLevelProgress(userStats: UserStats): { level: string; progress: number; nextLevel: string | null } {
    const unlockedBadges = this.getUnlockedBadges(userStats);
    const levels = ['unverified', 'starter', 'mid', 'advanced', 'prestigious'];
    
    let currentLevel = 'unverified';
    let nextLevel: string | null = null;

    for (let i = 0; i < levels.length; i++) {
      const level = levels[i];
      const levelBadges = BADGES.filter(badge => badge.level === level);
      const unlockedLevelBadges = unlockedBadges.filter(badge => badge.level === level);
      
      if (unlockedLevelBadges.length === levelBadges.length) {
        currentLevel = level;
        nextLevel = i < levels.length - 1 ? levels[i + 1] : null;
      } else {
        const progress = Math.round((unlockedLevelBadges.length / levelBadges.length) * 100);
        return { level: currentLevel, progress, nextLevel: level };
      }
    }

    return { level: currentLevel, progress: 100, nextLevel };
  }
} 