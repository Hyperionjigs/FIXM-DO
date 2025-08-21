"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  MessageSquare, 
  Trophy, 
  Star, 
  Award, 
  Target,
  TrendingUp,
  Heart,
  Share2,
  Plus,
  Search,
  Filter,
  RefreshCw,
  User,
  Calendar,
  MapPin,
  Clock,
  Eye,
  ThumbsUp,
  MessageCircle,
  Bookmark,
  Flag,
  Crown,
  Zap,
  Gift,
  Medal,
  Fire,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { communitySocialSystem } from '@/lib/community-social-system';

interface CommunityMetrics {
  communities: any[];
  totalMembers: number;
  totalPosts: number;
  activeCommunities: number;
  challenges: any[];
  achievements: any[];
  gamification: any;
}

export default function CommunityDashboard() {
  const [metrics, setMetrics] = useState<CommunityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);

  useEffect(() => {
    loadCommunityData();
    const interval = setInterval(loadCommunityData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadCommunityData = async () => {
    setLoading(true);
    try {
      const [communities, challenges, achievements, gamification, communityStats] = await Promise.all([
        communitySocialSystem.getCommunities(),
        communitySocialSystem.getChallenges(),
        communitySocialSystem.getAchievements(),
        communitySocialSystem.getGamificationSystem(),
        communitySocialSystem.getCommunityStats()
      ]);

      const communityMetrics: CommunityMetrics = {
        communities,
        totalMembers: communityStats.totalMembers,
        totalPosts: communityStats.totalPosts,
        activeCommunities: communityStats.activeCommunities,
        challenges,
        achievements,
        gamification
      };

      setMetrics(communityMetrics);

    } catch (error) {
      console.error('[Community] Failed to load community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSamplePost = async () => {
    try {
      const communityId = selectedCommunity || metrics?.communities[0]?.id;
      if (!communityId) return;

      const post = await communitySocialSystem.createPost(communityId, {
        authorId: 'sample-user',
        authorName: 'Sample User',
        authorAvatar: '/avatars/sample-user.png',
        title: 'Sample Community Post',
        content: 'This is a sample post to demonstrate the community features.',
        type: 'discussion',
        tags: ['sample', 'community'],
        images: []
      });

      console.log('Sample post created:', post);
      loadCommunityData(); // Refresh data
    } catch (error) {
      console.error('[Community] Failed to create sample post:', error);
    }
  };

  const joinSampleCommunity = async () => {
    try {
      const communityId = selectedCommunity || metrics?.communities[0]?.id;
      if (!communityId) return;

      await communitySocialSystem.joinCommunity(
        communityId,
        'sample-user',
        'Sample User',
        '/avatars/sample-user.png'
      );

      console.log('Joined community:', communityId);
      loadCommunityData(); // Refresh data
    } catch (error) {
      console.error('[Community] Failed to join community:', error);
    }
  };

  const awardSamplePoints = async () => {
    try {
      await communitySocialSystem.awardExperiencePoints(
        'sample-user',
        100,
        'Sample activity'
      );

      console.log('Awarded 100 experience points');
      loadCommunityData(); // Refresh data
    } catch (error) {
      console.error('[Community] Failed to award points:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Community Dashboard</h1>
            <p className="text-gray-600">Community engagement and social features</p>
          </div>
          <Button disabled>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Loading...
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold">Failed to load community data</h3>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Community Dashboard</h1>
          <p className="text-gray-600">Community engagement and social features</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={loadCommunityData} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button
          variant="outline"
          onClick={createSamplePost}
          className="flex flex-col items-center space-y-2 h-20"
        >
          <MessageSquare className="h-5 w-5" />
          <span className="text-xs">Create Post</span>
        </Button>

        <Button
          variant="outline"
          onClick={joinSampleCommunity}
          className="flex flex-col items-center space-y-2 h-20"
        >
          <Users className="h-5 w-5" />
          <span className="text-xs">Join Community</span>
        </Button>

        <Button
          variant="outline"
          onClick={awardSamplePoints}
          className="flex flex-col items-center space-y-2 h-20"
        >
          <Zap className="h-5 w-5" />
          <span className="text-xs">Award Points</span>
        </Button>

        <Button
          variant="outline"
          className="flex flex-col items-center space-y-2 h-20"
        >
          <Plus className="h-5 w-5" />
          <span className="text-xs">Create Event</span>
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-600">Total Members</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{metrics.totalMembers}</span>
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Across all communities
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Total Posts</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{metrics.totalPosts}</span>
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Community discussions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium text-gray-600">Active Communities</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{metrics.activeCommunities}</span>
            </div>
            <div className="mt-1 text-sm text-gray-500">
              With recent activity
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium text-gray-600">Active Challenges</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{metrics.challenges.filter(c => c.status === 'active').length}</span>
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Ongoing competitions
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="communities">Communities</TabsTrigger>
          <TabsTrigger value="gamification">Gamification</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Community Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Community Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Communities</span>
                  <span className="font-semibold">{metrics.communities.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Communities</span>
                  <span className="font-semibold">{metrics.activeCommunities}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Members</span>
                  <span className="font-semibold">{metrics.totalMembers}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Posts</span>
                  <span className="font-semibold">{metrics.totalPosts}</span>
                </div>
              </CardContent>
            </Card>

            {/* Gamification Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <span>Gamification Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Levels</span>
                  <span className="font-semibold">{metrics.gamification.levels.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Available Achievements</span>
                  <span className="font-semibold">{metrics.achievements.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Challenges</span>
                  <span className="font-semibold">{metrics.challenges.filter(c => c.status === 'active').length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed Achievements</span>
                  <span className="font-semibold">{metrics.achievements.filter(a => a.completed).length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="communities" className="space-y-4">
          <div className="space-y-4">
            {metrics.communities.map((community) => (
              <Card key={community.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-gray-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{community.name}</CardTitle>
                        <p className="text-sm text-gray-600">{community.description}</p>
                      </div>
                    </div>
                    <Badge variant={community.isPrivate ? "secondary" : "default"}>
                      {community.isPrivate ? 'Private' : 'Public'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Members:</span>
                      <div className="font-semibold">{community.memberCount}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Posts:</span>
                      <div className="font-semibold">{community.posts.length}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Events:</span>
                      <div className="font-semibold">{community.events.length}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Category:</span>
                      <div className="font-semibold capitalize">{community.category}</div>
                    </div>
                  </div>
                  
                  {community.posts.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Recent Posts</h4>
                      <div className="space-y-2">
                        {community.posts.slice(0, 3).map((post) => (
                          <div key={post.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center space-x-2">
                              <MessageSquare className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium">{post.title}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span>{post.likes} likes</span>
                              <span>{post.comments.length} comments</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="gamification" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Levels */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Level System</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.gamification.levels.map((level) => (
                    <div key={level.level} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">{level.level}</span>
                        </div>
                        <div>
                          <div className="font-medium">{level.name}</div>
                          <div className="text-sm text-gray-600">{level.description}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {level.experienceRequired} XP
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Active Challenges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Active Challenges</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.challenges.filter(c => c.status === 'active').map((challenge) => (
                    <div key={challenge.id} className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded border">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{challenge.name}</h4>
                        <Badge variant="default">{challenge.type}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{challenge.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{challenge.participants.length} participants</span>
                        <span>Ends: {new Date(challenge.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                  
                  {metrics.challenges.filter(c => c.status === 'active').length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <Target className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>No active challenges</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.achievements.map((achievement) => (
              <Card key={achievement.id} className={achievement.completed ? 'ring-2 ring-green-200' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`text-2xl ${achievement.completed ? 'opacity-100' : 'opacity-50'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{achievement.name}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                    {achievement.completed && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span>{achievement.progress}/{achievement.maxProgress}</span>
                    </div>
                    <Progress 
                      value={(achievement.progress / achievement.maxProgress) * 100} 
                      className="h-2"
                    />
                    
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Badge variant="outline" className="text-xs">
                        {achievement.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {achievement.criteria.type}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 