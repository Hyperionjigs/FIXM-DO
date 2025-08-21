import { Task, User } from '@/types';

export interface SocialMediaPost {
  id: string;
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'tiktok';
  content: string;
  media?: string[];
  scheduledTime?: Date;
  publishedTime?: Date;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  engagement?: {
    likes: number;
    shares: number;
    comments: number;
    views: number;
  };
  externalId?: string;
  tags?: string[];
  location?: string;
}

export interface SocialMediaAccount {
  id: string;
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'tiktok';
  username: string;
  displayName: string;
  profileImage?: string;
  isConnected: boolean;
  accessToken?: string;
  refreshToken?: string;
  lastSync?: Date;
  syncEnabled: boolean;
  pageId?: string; // For Facebook pages
}

export interface SocialMediaCampaign {
  id: string;
  name: string;
  description?: string;
  platforms: ('facebook' | 'twitter' | 'instagram' | 'linkedin' | 'tiktok')[];
  posts: SocialMediaPost[];
  startDate: Date;
  endDate?: Date;
  status: 'draft' | 'active' | 'paused' | 'completed';
  metrics?: {
    totalReach: number;
    totalEngagement: number;
    totalClicks: number;
    conversionRate: number;
  };
}

export interface SocialMediaAnalytics {
  platform: string;
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  metrics: {
    followers: number;
    reach: number;
    engagement: number;
    clicks: number;
    impressions: number;
  };
  topPosts: SocialMediaPost[];
  audienceDemographics?: {
    ageRanges: Record<string, number>;
    genders: Record<string, number>;
    locations: Record<string, number>;
  };
}

export class SocialMediaIntegrationService {
  private static instance: SocialMediaIntegrationService;
  private accounts: Map<string, SocialMediaAccount> = new Map();
  private campaigns: Map<string, SocialMediaCampaign> = new Map();

  private constructor() {
    this.initializePlatforms();
  }

  static getInstance(): SocialMediaIntegrationService {
    if (!SocialMediaIntegrationService.instance) {
      SocialMediaIntegrationService.instance = new SocialMediaIntegrationService();
    }
    return SocialMediaIntegrationService.instance;
  }

  private initializePlatforms() {
    // Initialize with default platforms
    const platforms = ['facebook', 'twitter', 'instagram', 'linkedin', 'tiktok'];
    platforms.forEach(platform => {
      this.accounts.set(platform, {
        id: platform,
        platform: platform as any,
        username: '',
        displayName: '',
        isConnected: false,
        syncEnabled: true
      });
    });
  }

  // Facebook Integration
  async connectFacebook(): Promise<boolean> {
    try {
      const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
      const redirectUri = `${window.location.origin}/api/social/facebook/callback`;

      const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=pages_manage_posts,pages_read_engagement,pages_show_list,publish_to_groups`;
      
      window.location.href = authUrl;
      
      return true;
    } catch (error) {
      console.error('Failed to connect to Facebook:', error);
      return false;
    }
  }

  async handleFacebookCallback(code: string): Promise<boolean> {
    try {
      const response = await fetch('/api/social/facebook/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const { accessToken, refreshToken, pages } = await response.json();

      const account = this.accounts.get('facebook');
      if (account) {
        account.isConnected = true;
        account.accessToken = accessToken;
        account.refreshToken = refreshToken;
        account.lastSync = new Date();
        
        // If user has pages, connect to the first one
        if (pages && pages.length > 0) {
          account.pageId = pages[0].id;
          account.displayName = pages[0].name;
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to handle Facebook callback:', error);
      return false;
    }
  }

  async postToFacebook(content: string, media?: string[]): Promise<string> {
    try {
      const account = this.accounts.get('facebook');
      if (!account?.isConnected) {
        throw new Error('Facebook not connected');
      }

      const response = await fetch('/api/social/facebook/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${account.accessToken}`
        },
        body: JSON.stringify({
          pageId: account.pageId,
          message: content,
          media: media
        })
      });

      if (!response.ok) {
        throw new Error('Failed to post to Facebook');
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('Failed to post to Facebook:', error);
      throw error;
    }
  }

  // Twitter Integration
  async connectTwitter(): Promise<boolean> {
    try {
      const clientId = process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID;
      const redirectUri = `${window.location.origin}/api/social/twitter/callback`;

      const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=tweet.read%20tweet.write%20users.read%20offline.access&state=state&code_challenge=challenge&code_challenge_method=plain`;
      
      window.location.href = authUrl;
      
      return true;
    } catch (error) {
      console.error('Failed to connect to Twitter:', error);
      return false;
    }
  }

  async handleTwitterCallback(code: string): Promise<boolean> {
    try {
      const response = await fetch('/api/social/twitter/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const { accessToken, refreshToken, user } = await response.json();

      const account = this.accounts.get('twitter');
      if (account) {
        account.isConnected = true;
        account.accessToken = accessToken;
        account.refreshToken = refreshToken;
        account.username = user.username;
        account.displayName = user.name;
        account.profileImage = user.profile_image_url;
        account.lastSync = new Date();
      }

      return true;
    } catch (error) {
      console.error('Failed to handle Twitter callback:', error);
      return false;
    }
  }

  async postToTwitter(content: string, media?: string[]): Promise<string> {
    try {
      const account = this.accounts.get('twitter');
      if (!account?.isConnected) {
        throw new Error('Twitter not connected');
      }

      const response = await fetch('/api/social/twitter/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${account.accessToken}`
        },
        body: JSON.stringify({
          text: content,
          media: media
        })
      });

      if (!response.ok) {
        throw new Error('Failed to post to Twitter');
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('Failed to post to Twitter:', error);
      throw error;
    }
  }

  // LinkedIn Integration
  async connectLinkedIn(): Promise<boolean> {
    try {
      const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
      const redirectUri = `${window.location.origin}/api/social/linkedin/callback`;

      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=w_member_social%20r_liteprofile`;
      
      window.location.href = authUrl;
      
      return true;
    } catch (error) {
      console.error('Failed to connect to LinkedIn:', error);
      return false;
    }
  }

  async handleLinkedInCallback(code: string): Promise<boolean> {
    try {
      const response = await fetch('/api/social/linkedin/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const { accessToken, refreshToken, profile } = await response.json();

      const account = this.accounts.get('linkedin');
      if (account) {
        account.isConnected = true;
        account.accessToken = accessToken;
        account.refreshToken = refreshToken;
        account.username = profile.id;
        account.displayName = `${profile.firstName} ${profile.lastName}`;
        account.profileImage = profile.profilePicture;
        account.lastSync = new Date();
      }

      return true;
    } catch (error) {
      console.error('Failed to handle LinkedIn callback:', error);
      return false;
    }
  }

  async postToLinkedIn(content: string, media?: string[]): Promise<string> {
    try {
      const account = this.accounts.get('linkedin');
      if (!account?.isConnected) {
        throw new Error('LinkedIn not connected');
      }

      const response = await fetch('/api/social/linkedin/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${account.accessToken}`
        },
        body: JSON.stringify({
          text: content,
          media: media
        })
      });

      if (!response.ok) {
        throw new Error('Failed to post to LinkedIn');
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('Failed to post to LinkedIn:', error);
      throw error;
    }
  }

  // Universal Social Media Operations
  async postToAllPlatforms(content: string, media?: string[], platforms?: string[]): Promise<Record<string, string>> {
    const results: Record<string, string> = {};
    const targetPlatforms = platforms || ['facebook', 'twitter', 'linkedin'];

    for (const platform of targetPlatforms) {
      try {
        let postId: string;

        switch (platform) {
          case 'facebook':
            postId = await this.postToFacebook(content, media);
            break;
          case 'twitter':
            postId = await this.postToTwitter(content, media);
            break;
          case 'linkedin':
            postId = await this.postToLinkedIn(content, media);
            break;
          default:
            console.warn(`Unknown platform: ${platform}`);
            continue;
        }

        results[platform] = postId;
      } catch (error) {
        console.error(`Failed to post to ${platform}:`, error);
        results[platform] = 'failed';
      }
    }

    return results;
  }

  // Task to Social Media Integration
  async createTaskPromotionPost(task: Task, platforms: string[]): Promise<Record<string, string>> {
    try {
      const content = this.generateTaskPostContent(task);
      const media = task.images || [];
      
      return await this.postToAllPlatforms(content, media, platforms);
    } catch (error) {
      console.error('Failed to create task promotion post:', error);
      throw error;
    }
  }

  private generateTaskPostContent(task: Task): string {
    const urgency = task.urgency === 'high' ? '🚨 URGENT' : task.urgency === 'medium' ? '⚡' : '';
    const budget = task.budget ? `💰 Budget: ₱${task.budget}` : '';
    const location = task.location ? `📍 ${task.location}` : '';
    const categories = task.categories?.length ? `🏷️ ${task.categories.join(', ')}` : '';

    return `${urgency}

${task.title}

${task.description}

${budget}
${location}
${categories}

Need help with this task? Find trusted taskers on FixMo! 

#FixMo #TaskHelp #${task.categories?.[0] || 'Services'}`;
  }

  // Campaign Management
  async createCampaign(campaign: Omit<SocialMediaCampaign, 'id'>): Promise<string> {
    const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.campaigns.set(campaignId, {
      ...campaign,
      id: campaignId
    });

    return campaignId;
  }

  async schedulePost(post: Omit<SocialMediaPost, 'id'>, scheduledTime: Date): Promise<string> {
    const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const scheduledPost: SocialMediaPost = {
      ...post,
      id: postId,
      scheduledTime,
      status: 'scheduled'
    };

    // Schedule the post
    setTimeout(async () => {
      try {
        await this.publishScheduledPost(scheduledPost);
      } catch (error) {
        console.error('Failed to publish scheduled post:', error);
      }
    }, scheduledTime.getTime() - Date.now());

    return postId;
  }

  private async publishScheduledPost(post: SocialMediaPost): Promise<void> {
    try {
      let postId: string;

      switch (post.platform) {
        case 'facebook':
          postId = await this.postToFacebook(post.content, post.media);
          break;
        case 'twitter':
          postId = await this.postToTwitter(post.content, post.media);
          break;
        case 'linkedin':
          postId = await this.postToLinkedIn(post.content, post.media);
          break;
        default:
          throw new Error(`Unknown platform: ${post.platform}`);
      }

      // Update post status
      post.status = 'published';
      post.publishedTime = new Date();
      post.externalId = postId;
    } catch (error) {
      post.status = 'failed';
      throw error;
    }
  }

  // Analytics
  async getAnalytics(platform: string, period: 'day' | 'week' | 'month'): Promise<SocialMediaAnalytics> {
    try {
      const account = this.accounts.get(platform);
      if (!account?.isConnected) {
        throw new Error(`${platform} not connected`);
      }

      const response = await fetch(`/api/social/${platform}/analytics?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${account.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${platform} analytics`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Failed to get ${platform} analytics:`, error);
      throw error;
    }
  }

  // Account Management
  getAccounts(): SocialMediaAccount[] {
    return Array.from(this.accounts.values());
  }

  getAccount(platform: string): SocialMediaAccount | undefined {
    return this.accounts.get(platform);
  }

  updateAccount(platform: string, updates: Partial<SocialMediaAccount>): void {
    const account = this.accounts.get(platform);
    if (account) {
      Object.assign(account, updates);
    }
  }

  // Utility Methods
  async generateHashtags(content: string, platform: string): Promise<string[]> {
    // Implementation would use AI to generate relevant hashtags
    const commonHashtags = ['#FixMo', '#TaskHelp', '#Services', '#Community'];
    return commonHashtags;
  }

  async optimizePostTiming(platform: string): Promise<Date[]> {
    // Implementation would analyze best posting times based on audience engagement
    const now = new Date();
    return [
      new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
      new Date(now.getTime() + 6 * 60 * 60 * 1000), // 6 hours from now
      new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours from now
    ];
  }

  async getTrendingTopics(platform: string): Promise<string[]> {
    // Implementation would fetch trending topics from the platform
    return ['#LocalServices', '#TaskHelp', '#CommunitySupport'];
  }
}

// Convenience functions
export const socialMediaService = SocialMediaIntegrationService.getInstance();

export const connectFacebook = () => socialMediaService.connectFacebook();
export const connectTwitter = () => socialMediaService.connectTwitter();
export const connectLinkedIn = () => socialMediaService.connectLinkedIn();
export const postToAllPlatforms = (content: string, media?: string[], platforms?: string[]) => 
  socialMediaService.postToAllPlatforms(content, media, platforms);
export const createTaskPromotionPost = (task: Task, platforms: string[]) => 
  socialMediaService.createTaskPromotionPost(task, platforms); 