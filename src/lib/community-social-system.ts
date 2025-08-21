// Community & Social System for FixMo
// Enhanced user profiles, community engagement, and advanced gamification

export interface UserProfile {
  userId: string;
  displayName: string;
  bio: string;
  avatar: string;
  coverPhoto: string;
  skills: Skill[];
  certifications: Certification[];
  badges: Badge[];
  testimonials: Testimonial[];
  socialProof: SocialProof;
  portfolio: PortfolioItem[];
  contactInfo: ContactInfo;
  preferences: UserPreferences;
  stats: UserStats;
  createdAt: Date;
  updatedAt: Date;
  lastActive: Date;
  verificationStatus: 'unverified' | 'basic' | 'enhanced' | 'premium';
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number;
  verified: boolean;
  endorsements: number;
  endorsers: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId: string;
  verificationUrl: string;
  status: 'active' | 'expired' | 'pending' | 'revoked';
  documentUrl?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'achievement' | 'skill' | 'community' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt: Date;
  progress?: number;
  maxProgress?: number;
}

export interface Testimonial {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  rating: number;
  content: string;
  taskId?: string;
  createdAt: Date;
  verified: boolean;
  helpful: number;
  reported: boolean;
}

export interface SocialProof {
  totalTasks: number;
  completedTasks: number;
  totalEarnings: number;
  averageRating: number;
  responseRate: number;
  responseTime: number; // in minutes
  repeatClientRate: number;
  memberSince: Date;
  location: string;
  languages: string[];
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  tags: string[];
  completedAt: Date;
  clientFeedback?: string;
  featured: boolean;
}

export interface ContactInfo {
  email: string;
  phone?: string;
  website?: string;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  preferredContactMethod: 'email' | 'phone' | 'in-app';
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    showEarnings: boolean;
    showLocation: boolean;
    allowMessages: boolean;
  };
  communication: {
    autoReply: string;
    availability: 'available' | 'busy' | 'unavailable';
    responseTime: number; // in hours
  };
}

export interface UserStats {
  tasksCompleted: number;
  totalEarnings: number;
  averageRating: number;
  responseRate: number;
  responseTime: number;
  repeatClients: number;
  badgesEarned: number;
  communityPoints: number;
  level: number;
  experiencePoints: number;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  avatar: string;
  coverPhoto: string;
  members: CommunityMember[];
  posts: CommunityPost[];
  events: CommunityEvent[];
  rules: string[];
  moderators: string[];
  createdAt: Date;
  updatedAt: Date;
  isPrivate: boolean;
  memberCount: number;
  activeMembers: number;
}

export interface CommunityMember {
  userId: string;
  role: 'member' | 'moderator' | 'admin';
  joinedAt: Date;
  lastActive: Date;
  contributionScore: number;
  postsCount: number;
  helpfulAnswers: number;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  title: string;
  content: string;
  type: 'question' | 'discussion' | 'announcement' | 'showcase';
  tags: string[];
  images: string[];
  likes: number;
  dislikes: number;
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  likes: number;
  dislikes: number;
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
  parentId?: string; // for nested comments
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  type: 'meetup' | 'workshop' | 'webinar' | 'competition';
  startDate: Date;
  endDate: Date;
  location: string;
  isOnline: boolean;
  maxParticipants: number;
  currentParticipants: number;
  organizerId: string;
  organizerName: string;
  registrationRequired: boolean;
  registrationDeadline: Date;
  participants: string[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export interface GamificationSystem {
  levels: Level[];
  achievements: Achievement[];
  challenges: Challenge[];
  leaderboards: Leaderboard[];
  rewards: Reward[];
  quests: Quest[];
}

export interface Level {
  level: number;
  name: string;
  description: string;
  experienceRequired: number;
  rewards: Reward[];
  badge?: Badge;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'task' | 'community' | 'skill' | 'social' | 'special';
  criteria: AchievementCriteria;
  rewards: Reward[];
  progress: number;
  maxProgress: number;
  completed: boolean;
  completedAt?: Date;
}

export interface AchievementCriteria {
  type: 'tasks_completed' | 'earnings_reached' | 'rating_achieved' | 'community_activity' | 'skill_endorsements';
  value: number;
  timeframe?: number; // in days
  conditions?: Record<string, any>;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  startDate: Date;
  endDate: Date;
  criteria: AchievementCriteria;
  rewards: Reward[];
  participants: ChallengeParticipant[];
  leaderboard: ChallengeLeaderboard;
  status: 'upcoming' | 'active' | 'completed';
}

export interface ChallengeParticipant {
  userId: string;
  userName: string;
  userAvatar: string;
  progress: number;
  maxProgress: number;
  rank: number;
  joinedAt: Date;
  completedAt?: Date;
}

export interface ChallengeLeaderboard {
  participants: ChallengeParticipant[];
  lastUpdated: Date;
}

export interface Leaderboard {
  id: string;
  name: string;
  type: 'global' | 'category' | 'community' | 'challenge';
  category?: string;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'all-time';
  entries: LeaderboardEntry[];
  lastUpdated: Date;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  userAvatar: string;
  rank: number;
  score: number;
  metric: string;
  change: number; // rank change from previous period
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  type: 'points' | 'badge' | 'feature' | 'discount' | 'item';
  value: number;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  expiresAt?: Date;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'story' | 'event';
  objectives: QuestObjective[];
  rewards: Reward[];
  status: 'available' | 'active' | 'completed' | 'expired';
  progress: number;
  maxProgress: number;
  startDate: Date;
  endDate: Date;
  completedAt?: Date;
}

export interface QuestObjective {
  id: string;
  description: string;
  type: 'task' | 'social' | 'skill' | 'community';
  target: number;
  current: number;
  completed: boolean;
}

class CommunitySocialSystem {
  private static instance: CommunitySocialSystem;
  private userProfiles: Map<string, UserProfile> = new Map();
  private communities: Map<string, Community> = new Map();
  private gamification: GamificationSystem;
  private achievements: Map<string, Achievement> = new Map();
  private challenges: Map<string, Challenge> = new Map();
  private leaderboards: Map<string, Leaderboard> = new Map();

  private constructor() {
    this.initializeGamificationSystem();
    this.initializeCommunities();
  }

  static getInstance(): CommunitySocialSystem {
    if (!CommunitySocialSystem.instance) {
      CommunitySocialSystem.instance = new CommunitySocialSystem();
    }
    return CommunitySocialSystem.instance;
  }

  private initializeGamificationSystem(): void {
    // Initialize levels
    const levels: Level[] = [
      { level: 1, name: 'Novice', description: 'Just getting started', experienceRequired: 0, rewards: [] },
      { level: 2, name: 'Apprentice', description: 'Learning the ropes', experienceRequired: 100, rewards: [] },
      { level: 3, name: 'Skilled', description: 'Building expertise', experienceRequired: 500, rewards: [] },
      { level: 4, name: 'Expert', description: 'Master of the craft', experienceRequired: 1000, rewards: [] },
      { level: 5, name: 'Master', description: 'Legendary status', experienceRequired: 2500, rewards: [] }
    ];

    // Initialize achievements
    const achievements: Achievement[] = [
      {
        id: 'first-task',
        name: 'First Steps',
        description: 'Complete your first task',
        icon: '🎯',
        category: 'task',
        criteria: { type: 'tasks_completed', value: 1 },
        rewards: [{ id: 'points-100', name: '100 Points', description: 'Experience points', type: 'points', value: 100, icon: '⭐', rarity: 'common' }],
        progress: 0,
        maxProgress: 1,
        completed: false
      },
      {
        id: 'task-master',
        name: 'Task Master',
        description: 'Complete 100 tasks',
        icon: '🏆',
        category: 'task',
        criteria: { type: 'tasks_completed', value: 100 },
        rewards: [{ id: 'badge-task-master', name: 'Task Master Badge', description: 'Exclusive badge', type: 'badge', value: 1, icon: '🏆', rarity: 'rare' }],
        progress: 0,
        maxProgress: 100,
        completed: false
      },
      {
        id: 'community-helper',
        name: 'Community Helper',
        description: 'Help 50 other users',
        icon: '🤝',
        category: 'community',
        criteria: { type: 'community_activity', value: 50 },
        rewards: [{ id: 'points-500', name: '500 Points', description: 'Experience points', type: 'points', value: 500, icon: '⭐', rarity: 'rare' }],
        progress: 0,
        maxProgress: 50,
        completed: false
      }
    ];

    this.gamification = {
      levels,
      achievements,
      challenges: [],
      leaderboards: [],
      rewards: [],
      quests: []
    };

    // Add achievements to map
    achievements.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  private initializeCommunities(): void {
    const defaultCommunities: Community[] = [
      {
        id: 'general',
        name: 'FixMo General',
        description: 'General discussion about tasks and services',
        category: 'general',
        avatar: '/avatars/community-general.png',
        coverPhoto: '/covers/community-general.jpg',
        members: [],
        posts: [],
        events: [],
        rules: [
          'Be respectful to all members',
          'No spam or self-promotion',
          'Keep discussions relevant to tasks and services',
          'Report inappropriate content'
        ],
        moderators: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isPrivate: false,
        memberCount: 0,
        activeMembers: 0
      },
      {
        id: 'home-repair',
        name: 'Home Repair Experts',
        description: 'Community for home repair and maintenance professionals',
        category: 'home-repair',
        avatar: '/avatars/community-home-repair.png',
        coverPhoto: '/covers/community-home-repair.jpg',
        members: [],
        posts: [],
        events: [],
        rules: [
          'Share tips and best practices',
          'Ask for advice on complex projects',
          'Showcase your work',
          'Help fellow professionals'
        ],
        moderators: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isPrivate: false,
        memberCount: 0,
        activeMembers: 0
      }
    ];

    defaultCommunities.forEach(community => {
      this.communities.set(community.id, community);
    });
  }

  // User Profile Management
  public async createUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    const profile: UserProfile = {
      userId,
      displayName: profileData.displayName || 'New User',
      bio: profileData.bio || '',
      avatar: profileData.avatar || '/avatars/default.png',
      coverPhoto: profileData.coverPhoto || '/covers/default.jpg',
      skills: profileData.skills || [],
      certifications: profileData.certifications || [],
      badges: profileData.badges || [],
      testimonials: profileData.testimonials || [],
      socialProof: {
        totalTasks: 0,
        completedTasks: 0,
        totalEarnings: 0,
        averageRating: 0,
        responseRate: 0,
        responseTime: 0,
        repeatClientRate: 0,
        memberSince: new Date(),
        location: profileData.socialProof?.location || '',
        languages: profileData.socialProof?.languages || ['English']
      },
      portfolio: profileData.portfolio || [],
      contactInfo: {
        email: profileData.contactInfo?.email || '',
        phone: profileData.contactInfo?.phone,
        website: profileData.contactInfo?.website,
        socialMedia: profileData.contactInfo?.socialMedia || {},
        preferredContactMethod: 'email'
      },
      preferences: {
        notifications: {
          email: true,
          push: true,
          sms: false,
          inApp: true
        },
        privacy: {
          profileVisibility: 'public',
          showEarnings: false,
          showLocation: true,
          allowMessages: true
        },
        communication: {
          autoReply: '',
          availability: 'available',
          responseTime: 24
        }
      },
      stats: {
        tasksCompleted: 0,
        totalEarnings: 0,
        averageRating: 0,
        responseRate: 0,
        responseTime: 0,
        repeatClients: 0,
        badgesEarned: 0,
        communityPoints: 0,
        level: 1,
        experiencePoints: 0
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActive: new Date(),
      verificationStatus: 'unverified'
    };

    this.userProfiles.set(userId, profile);
    return profile;
  }

  public async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const profile = this.userProfiles.get(userId);
    if (!profile) {
      throw new Error('User profile not found');
    }

    const updatedProfile = { ...profile, ...updates, updatedAt: new Date() };
    this.userProfiles.set(userId, updatedProfile);
    return updatedProfile;
  }

  public async getUserProfile(userId: string): Promise<UserProfile | null> {
    return this.userProfiles.get(userId) || null;
  }

  public async addSkill(userId: string, skill: Omit<Skill, 'id'>): Promise<Skill> {
    const profile = this.userProfiles.get(userId);
    if (!profile) {
      throw new Error('User profile not found');
    }

    const newSkill: Skill = {
      id: `skill-${Date.now()}`,
      ...skill,
      endorsements: 0,
      endorsers: []
    };

    profile.skills.push(newSkill);
    profile.updatedAt = new Date();
    this.userProfiles.set(userId, profile);

    return newSkill;
  }

  public async endorseSkill(userId: string, skillId: string, endorserId: string): Promise<void> {
    const profile = this.userProfiles.get(userId);
    if (!profile) {
      throw new Error('User profile not found');
    }

    const skill = profile.skills.find(s => s.id === skillId);
    if (!skill) {
      throw new Error('Skill not found');
    }

    if (!skill.endorsers.includes(endorserId)) {
      skill.endorsements++;
      skill.endorsers.push(endorserId);
      profile.updatedAt = new Date();
      this.userProfiles.set(userId, profile);
    }
  }

  public async addCertification(userId: string, certification: Omit<Certification, 'id'>): Promise<Certification> {
    const profile = this.userProfiles.get(userId);
    if (!profile) {
      throw new Error('User profile not found');
    }

    const newCertification: Certification = {
      id: `cert-${Date.now()}`,
      ...certification
    };

    profile.certifications.push(newCertification);
    profile.updatedAt = new Date();
    this.userProfiles.set(userId, profile);

    return newCertification;
  }

  public async addTestimonial(userId: string, testimonial: Omit<Testimonial, 'id' | 'createdAt'>): Promise<Testimonial> {
    const profile = this.userProfiles.get(userId);
    if (!profile) {
      throw new Error('User profile not found');
    }

    const newTestimonial: Testimonial = {
      id: `testimonial-${Date.now()}`,
      ...testimonial,
      createdAt: new Date(),
      helpful: 0,
      reported: false
    };

    profile.testimonials.push(newTestimonial);
    profile.updatedAt = new Date();
    this.userProfiles.set(userId, profile);

    return newTestimonial;
  }

  // Community Management
  public async createCommunity(communityData: Omit<Community, 'id' | 'createdAt' | 'updatedAt' | 'memberCount' | 'activeMembers'>): Promise<Community> {
    const community: Community = {
      id: `community-${Date.now()}`,
      ...communityData,
      members: [],
      posts: [],
      events: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      memberCount: 0,
      activeMembers: 0
    };

    this.communities.set(community.id, community);
    return community;
  }

  public async joinCommunity(communityId: string, userId: string, userName: string, userAvatar: string): Promise<void> {
    const community = this.communities.get(communityId);
    if (!community) {
      throw new Error('Community not found');
    }

    const existingMember = community.members.find(m => m.userId === userId);
    if (existingMember) {
      throw new Error('User already a member');
    }

    const member: CommunityMember = {
      userId,
      role: 'member',
      joinedAt: new Date(),
      lastActive: new Date(),
      contributionScore: 0,
      postsCount: 0,
      helpfulAnswers: 0
    };

    community.members.push(member);
    community.memberCount++;
    community.updatedAt = new Date();
    this.communities.set(communityId, community);
  }

  public async createPost(communityId: string, postData: Omit<CommunityPost, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'dislikes' | 'comments' | 'viewCount'>): Promise<CommunityPost> {
    const community = this.communities.get(communityId);
    if (!community) {
      throw new Error('Community not found');
    }

    const post: CommunityPost = {
      id: `post-${Date.now()}`,
      ...postData,
      likes: 0,
      dislikes: 0,
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isPinned: false,
      isLocked: false,
      viewCount: 0
    };

    community.posts.push(post);
    community.updatedAt = new Date();
    this.communities.set(communityId, community);

    return post;
  }

  public async addComment(postId: string, commentData: Omit<Comment, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'dislikes' | 'isEdited'>): Promise<Comment> {
    const comment: Comment = {
      id: `comment-${Date.now()}`,
      ...commentData,
      likes: 0,
      dislikes: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      isEdited: false
    };

    // Find post in any community
    for (const community of this.communities.values()) {
      const post = community.posts.find(p => p.id === postId);
      if (post) {
        post.comments.push(comment);
        community.updatedAt = new Date();
        this.communities.set(community.id, community);
        break;
      }
    }

    return comment;
  }

  // Gamification System
  public async awardExperiencePoints(userId: string, points: number, reason: string): Promise<void> {
    const profile = this.userProfiles.get(userId);
    if (!profile) {
      throw new Error('User profile not found');
    }

    profile.stats.experiencePoints += points;
    profile.stats.communityPoints += points;

    // Check for level up
    const currentLevel = this.gamification.levels.find(l => l.level === profile.stats.level);
    const nextLevel = this.gamification.levels.find(l => l.level === profile.stats.level + 1);

    if (nextLevel && profile.stats.experiencePoints >= nextLevel.experienceRequired) {
      profile.stats.level = nextLevel.level;
      // Award level rewards
      nextLevel.rewards.forEach(reward => {
        this.awardReward(userId, reward);
      });
    }

    profile.updatedAt = new Date();
    this.userProfiles.set(userId, profile);

    // Check achievements
    this.checkAchievements(userId);
  }

  private async checkAchievements(userId: string): Promise<void> {
    const profile = this.userProfiles.get(userId);
    if (!profile) return;

    for (const achievement of this.achievements.values()) {
      if (achievement.completed) continue;

      let progress = 0;
      switch (achievement.criteria.type) {
        case 'tasks_completed':
          progress = profile.stats.tasksCompleted;
          break;
        case 'earnings_reached':
          progress = profile.stats.totalEarnings;
          break;
        case 'rating_achieved':
          progress = Math.floor(profile.stats.averageRating * 100);
          break;
        case 'community_activity':
          progress = profile.stats.communityPoints;
          break;
        case 'skill_endorsements':
          progress = profile.skills.reduce((sum, skill) => sum + skill.endorsements, 0);
          break;
      }

      achievement.progress = Math.min(progress, achievement.criteria.value);

      if (achievement.progress >= achievement.criteria.value && !achievement.completed) {
        achievement.completed = true;
        achievement.completedAt = new Date();

        // Award achievement rewards
        achievement.rewards.forEach(reward => {
          this.awardReward(userId, reward);
        });

        // Add badge to user profile
        const badgeReward = achievement.rewards.find(r => r.type === 'badge');
        if (badgeReward) {
          const badge: Badge = {
            id: badgeReward.id,
            name: badgeReward.name,
            description: badgeReward.description,
            icon: badgeReward.icon,
            category: 'achievement',
            rarity: badgeReward.rarity,
            earnedAt: new Date()
          };
          profile.badges.push(badge);
          profile.stats.badgesEarned++;
        }
      }
    }

    profile.updatedAt = new Date();
    this.userProfiles.set(userId, profile);
  }

  private async awardReward(userId: string, reward: Reward): Promise<void> {
    const profile = this.userProfiles.get(userId);
    if (!profile) return;

    switch (reward.type) {
      case 'points':
        profile.stats.experiencePoints += reward.value;
        profile.stats.communityPoints += reward.value;
        break;
      case 'badge':
        // Badge is already handled in checkAchievements
        break;
      case 'feature':
        // Handle feature unlocks
        break;
      case 'discount':
        // Handle discount rewards
        break;
      case 'item':
        // Handle item rewards
        break;
    }

    profile.updatedAt = new Date();
    this.userProfiles.set(userId, profile);
  }

  public async createChallenge(challengeData: Omit<Challenge, 'id' | 'participants' | 'leaderboard' | 'status'>): Promise<Challenge> {
    const challenge: Challenge = {
      id: `challenge-${Date.now()}`,
      ...challengeData,
      participants: [],
      leaderboard: { participants: [], lastUpdated: new Date() },
      status: 'upcoming'
    };

    this.challenges.set(challenge.id, challenge);
    return challenge;
  }

  public async joinChallenge(challengeId: string, userId: string, userName: string, userAvatar: string): Promise<void> {
    const challenge = this.challenges.get(challengeId);
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    const existingParticipant = challenge.participants.find(p => p.userId === userId);
    if (existingParticipant) {
      throw new Error('User already participating');
    }

    const participant: ChallengeParticipant = {
      userId,
      userName,
      userAvatar,
      progress: 0,
      maxProgress: challenge.criteria.value,
      rank: challenge.participants.length + 1,
      joinedAt: new Date()
    };

    challenge.participants.push(participant);
    this.challenges.set(challengeId, challenge);
  }

  public async updateChallengeProgress(challengeId: string, userId: string, progress: number): Promise<void> {
    const challenge = this.challenges.get(challengeId);
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    const participant = challenge.participants.find(p => p.userId === userId);
    if (!participant) {
      throw new Error('User not participating in challenge');
    }

    participant.progress = Math.min(progress, participant.maxProgress);
    participant.rank = this.calculateRank(challenge.participants, participant.progress);

    if (participant.progress >= participant.maxProgress && !participant.completedAt) {
      participant.completedAt = new Date();
      // Award challenge rewards
      challenge.rewards.forEach(reward => {
        this.awardReward(userId, reward);
      });
    }

    challenge.leaderboard.participants = [...challenge.participants].sort((a, b) => b.progress - a.progress);
    challenge.leaderboard.lastUpdated = new Date();
    this.challenges.set(challengeId, challenge);
  }

  private calculateRank(participants: ChallengeParticipant[], progress: number): number {
    return participants.filter(p => p.progress > progress).length + 1;
  }

  // Public API methods
  public async getCommunities(): Promise<Community[]> {
    return Array.from(this.communities.values());
  }

  public async getCommunity(communityId: string): Promise<Community | null> {
    return this.communities.get(communityId) || null;
  }

  public async getChallenges(): Promise<Challenge[]> {
    return Array.from(this.challenges.values());
  }

  public async getChallenge(challengeId: string): Promise<Challenge | null> {
    return this.challenges.get(challengeId) || null;
  }

  public async getAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  public async getGamificationSystem(): Promise<GamificationSystem> {
    return this.gamification;
  }

  public async getCommunityStats(): Promise<any> {
    const totalCommunities = this.communities.size;
    const totalMembers = Array.from(this.communities.values()).reduce((sum, c) => sum + c.memberCount, 0);
    const totalPosts = Array.from(this.communities.values()).reduce((sum, c) => sum + c.posts.length, 0);

    return {
      totalCommunities,
      totalMembers,
      totalPosts,
      activeCommunities: Array.from(this.communities.values()).filter(c => c.activeMembers > 0).length
    };
  }

  public async getUserStats(userId: string): Promise<UserStats | null> {
    const profile = this.userProfiles.get(userId);
    return profile ? profile.stats : null;
  }
}

// Export singleton instance
export const communitySocialSystem = CommunitySocialSystem.getInstance();

// Convenience functions
export async function createUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
  return communitySocialSystem.createUserProfile(userId, profileData);
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  return communitySocialSystem.updateUserProfile(userId, updates);
}

export async function joinCommunity(communityId: string, userId: string, userName: string, userAvatar: string): Promise<void> {
  return communitySocialSystem.joinCommunity(communityId, userId, userName, userAvatar);
}

export async function awardExperiencePoints(userId: string, points: number, reason: string): Promise<void> {
  return communitySocialSystem.awardExperiencePoints(userId, points, reason);
} 