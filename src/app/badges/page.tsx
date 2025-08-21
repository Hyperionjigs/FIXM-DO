"use client";

import React, { useState } from "react";
import { BadgeDisplay } from "@/components/badge-display";
import { BadgeNotification } from "@/components/badge-notification";
import { BadgeSystem, UserStats, BADGES } from "@/lib/badge-system";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Trophy, 
  Star, 
  Target, 
  TrendingUp, 
  Crown,
  Sparkles,
  Lock,
  Egg,
  Baby,
  Zap
} from "lucide-react";
import { UserBadge } from "@/components/user-badge";

// Demo user scenarios
const demoUsers = {
  unverified: {
    name: "Unverified User",
    stats: {
      tasksCompleted: 0,
      averageRating: 0,
      totalReviews: 0,
      positiveReviews: 0,
      responseRate: 0,
      completionRate: 0,
      profileVerified: false,
      photoVerified: false,
      mentorshipCount: 0,
      staffRecognition: false,
      firstTaskPosted: false,
      firstTaskAccepted: false,
      firstTaskCompleted: false
    }
  },
  starter: {
    name: "Starter User",
    stats: {
      tasksCompleted: 3,
      averageRating: 4.2,
      totalReviews: 3,
      positiveReviews: 3,
      responseRate: 85,
      completionRate: 100,
      profileVerified: true,
      photoVerified: true,
      mentorshipCount: 0,
      staffRecognition: false,
      firstTaskPosted: true,
      firstTaskAccepted: true,
      firstTaskCompleted: true
    }
  },
  intermediate: {
    name: "Intermediate User",
    stats: {
      tasksCompleted: 25,
      averageRating: 4.6,
      totalReviews: 20,
      positiveReviews: 18,
      responseRate: 92,
      completionRate: 96,
      profileVerified: true,
      photoVerified: true,
      mentorshipCount: 1,
      staffRecognition: false,
      firstTaskPosted: true,
      firstTaskAccepted: true,
      firstTaskCompleted: true
    }
  },
  advanced: {
    name: "Advanced User",
    stats: {
      tasksCompleted: 150,
      averageRating: 4.8,
      totalReviews: 120,
      positiveReviews: 115,
      responseRate: 98,
      completionRate: 99,
      profileVerified: true,
      photoVerified: true,
      mentorshipCount: 8,
      staffRecognition: false,
      firstTaskPosted: true,
      firstTaskAccepted: true,
      firstTaskCompleted: true
    }
  },
  expert: {
    name: "Expert User",
    stats: {
      tasksCompleted: 800,
      averageRating: 4.9,
      totalReviews: 750,
      positiveReviews: 745,
      responseRate: 100,
      completionRate: 100,
      profileVerified: true,
      photoVerified: true,
      mentorshipCount: 15,
      staffRecognition: true,
      firstTaskPosted: true,
      firstTaskAccepted: true,
      firstTaskCompleted: true
    }
  }
};

export default function BadgesPage() {
  const [selectedUser, setSelectedUser] = useState<keyof typeof demoUsers>('unverified');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationBadge, setNotificationBadge] = useState<any>(null);

  const currentUser = demoUsers[selectedUser];
  const userStats = BadgeSystem.calculateUserStats(currentUser.stats);
  const unlockedBadges = BadgeSystem.getUnlockedBadges(userStats);
  const nextBadge = BadgeSystem.getNextBadge(userStats);
  const badgeProgress = BadgeSystem.getBadgeProgress(userStats);
  const levelProgress = BadgeSystem.getLevelProgress(userStats);

  const simulateBadgeUnlock = () => {
    if (nextBadge) {
      setNotificationBadge(nextBadge);
      setShowNotification(true);
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'unverified': return <Lock className="h-4 w-4" />;
      case 'starter': return <Star className="h-4 w-4" />;
      case 'mid': return <Target className="h-4 w-4" />;
      case 'advanced': return <TrendingUp className="h-4 w-4" />;
      case 'prestigious': return <Crown className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'unverified': return 'text-gray-600';
      case 'starter': return 'text-green-600';
      case 'mid': return 'text-blue-600';
      case 'advanced': return 'text-purple-600';
      case 'prestigious': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getLevelBackground = (level: string) => {
    switch (level) {
      case 'unverified': return 'bg-gray-100';
      case 'starter': return 'bg-green-100';
      case 'mid': return 'bg-blue-100';
      case 'advanced': return 'bg-purple-100';
      case 'prestigious': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">FixMo Badge System</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Earn badges as you grow and contribute to the FixMo community
        </p>
        
        {/* User Selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {Object.entries(demoUsers).map(([key, user]) => (
            <Button
              key={key}
              variant={selectedUser === key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedUser(key as keyof typeof demoUsers)}
            >
              {key === 'unverified' && <Egg className="h-4 w-4 mr-2" />}
              {key === 'starter' && <Baby className="h-4 w-4 mr-2" />}
              {key === 'intermediate' && <Star className="h-4 w-4 mr-2" />}
              {key === 'advanced' && <Zap className="h-4 w-4 mr-2" />}
              {key === 'expert' && <Crown className="h-4 w-4 mr-2" />}
              {user.name}
            </Button>
          ))}
        </div>

        {/* Current User Badge Display */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <UserBadge 
              userStats={userStats}
              size="lg"
              showTooltip={false}
            />
            <div className="text-left">
              <h3 className="font-semibold">{currentUser.name}</h3>
              <p className="text-sm text-muted-foreground">
                {unlockedBadges.length} badges unlocked • {levelProgress.level} level
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Badge Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Level Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getLevelIcon(levelProgress.level)}
              <span className="capitalize">{levelProgress.level} Level</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{levelProgress.progress}%</span>
              </div>
              <Progress value={levelProgress.progress} className="h-2" />
              {levelProgress.nextLevel && (
                <p className="text-xs text-muted-foreground">
                  Next: {levelProgress.nextLevel} level
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Badge Count */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Badge Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Unlocked</span>
                <span>{unlockedBadges.length} / {BADGES.length}</span>
              </div>
              <Progress value={badgeProgress.percentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {badgeProgress.percentage}% complete
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Next Badge */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Next Badge
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextBadge ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{nextBadge.icon}</span>
                  <span className="font-medium">{nextBadge.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">{nextBadge.description}</p>
                <Button size="sm" onClick={simulateBadgeUnlock}>
                  Simulate Unlock
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <Crown className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                <p className="text-sm font-medium">All badges unlocked!</p>
                <p className="text-xs text-muted-foreground">You're a FixMo legend!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Badge Categories */}
      <div className="space-y-8">
        {['unverified', 'starter', 'mid', 'advanced', 'prestigious'].map((level) => {
          const levelBadges = BADGES.filter(badge => badge.level === level);
          const unlockedInLevel = unlockedBadges.filter(badge => badge.level === level);
          
          return (
            <Card key={level}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${getLevelBackground(level)}`}>
                    {getLevelIcon(level)}
                  </div>
                  <span className="capitalize">{level} Level</span>
                  <Badge variant="outline" className="ml-auto">
                    {unlockedInLevel.length} / {levelBadges.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {levelBadges.map((badge) => {
                    const isUnlocked = unlockedBadges.some(ub => ub.id === badge.id);
                    return (
                      <div
                        key={badge.id}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          isUnlocked
                            ? 'border-green-200 bg-green-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{badge.icon}</span>
                          <div className="flex-1">
                            <h4 className="font-medium">{badge.name}</h4>
                            <p className="text-xs text-muted-foreground">{badge.description}</p>
                          </div>
                          {isUnlocked && (
                            <div className="text-green-600">
                              <Sparkles className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        
                        {/* Requirements */}
                        <div className="space-y-1">
                          {badge.requirements.map((req, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs">
                              <div className={`w-2 h-2 rounded-full ${
                                isUnlocked ? 'bg-green-500' : 'bg-gray-300'
                              }`} />
                              <span className={isUnlocked ? 'text-green-700' : 'text-gray-600'}>
                                {req.description}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Badge Notification */}
      {showNotification && notificationBadge && (
        <BadgeNotification
          badge={notificationBadge}
          isVisible={showNotification}
          onClose={() => setShowNotification(false)}
        />
      )}
    </div>
  );
} 