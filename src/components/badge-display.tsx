"use client";

import React, { useState } from "react";
import { Badge as BadgeType, BadgeSystem, UserStats } from "@/lib/badge-system";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Star, 
  Target, 
  TrendingUp, 
  Crown,
  Lock,
  CheckCircle,
  Sparkles
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface BadgeDisplayProps {
  userStats: UserStats;
  showProgress?: boolean;
  compact?: boolean;
}

export function BadgeDisplay({ userStats, showProgress = true, compact = false }: BadgeDisplayProps) {
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);
  
  const userBadges = BadgeSystem.getUserBadges(userStats);
  const unlockedBadges = BadgeSystem.getUnlockedBadges(userStats);
  const nextBadge = BadgeSystem.getNextBadge(userStats);
  const badgeProgress = BadgeSystem.getBadgeProgress(userStats);
  const levelProgress = BadgeSystem.getLevelProgress(userStats);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'starter': return <Star className="h-4 w-4" />;
      case 'mid': return <Target className="h-4 w-4" />;
      case 'advanced': return <TrendingUp className="h-4 w-4" />;
      case 'prestigious': return <Crown className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'starter': return 'text-yellow-600';
      case 'mid': return 'text-blue-600';
      case 'advanced': return 'text-purple-600';
      case 'prestigious': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Level Progress */}
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-primary/10 ${getLevelColor(levelProgress.level)}`}>
            {getLevelIcon(levelProgress.level)}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium capitalize">{levelProgress.level} Level</span>
              <span className="text-muted-foreground">{levelProgress.progress}%</span>
            </div>
            <Progress value={levelProgress.progress} className="h-2 mt-1" />
          </div>
        </div>

        {/* Badge Summary */}
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-medium">
            {unlockedBadges.length} of {userBadges.length} Badges Unlocked
          </span>
        </div>

        {/* Recent Badges */}
        <div className="flex gap-2 flex-wrap">
          {unlockedBadges.slice(-3).map((badge) => (
            <Badge
              key={badge.id}
              variant="outline"
              className="cursor-pointer hover:bg-primary/5 transition-colors"
              onClick={() => setSelectedBadge(badge)}
            >
              <span className="mr-1">{badge.icon}</span>
              {badge.name}
            </Badge>
          ))}
          {unlockedBadges.length === 0 && (
            <span className="text-sm text-muted-foreground">No badges unlocked yet</span>
          )}
        </div>

        {/* Next Badge */}
        {nextBadge && (
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Next Badge</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">{nextBadge.icon}</span>
              <div className="flex-1">
                <div className="text-sm font-medium">{nextBadge.name}</div>
                <div className="text-xs text-muted-foreground">{nextBadge.progress}% complete</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className={`p-2 rounded-lg bg-primary/10 ${getLevelColor(levelProgress.level)}`}>
              {getLevelIcon(levelProgress.level)}
            </div>
            <div>
              <div className="text-lg font-semibold capitalize">{levelProgress.level} Level</div>
              <div className="text-sm text-muted-foreground">
                {levelProgress.nextLevel ? `Progress to ${levelProgress.nextLevel} level` : 'Maximum level reached!'}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Level Progress</span>
              <span className="font-medium">{levelProgress.progress}%</span>
            </div>
            <Progress value={levelProgress.progress} className="h-3" />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{unlockedBadges.filter(b => b.level === levelProgress.level).length} badges unlocked</span>
              <span>{userBadges.filter(b => b.level === levelProgress.level).length} total badges</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badge Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-600" />
            Badge Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">{unlockedBadges.length}</div>
              <div className="text-sm text-muted-foreground">Unlocked</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{userBadges.length - unlockedBadges.length}</div>
              <div className="text-sm text-muted-foreground">Remaining</div>
            </div>
            <div className="text-center p-4 bg-green-500/5 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{badgeProgress.percentage}%</div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badge Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Unlocked Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Unlocked Badges ({unlockedBadges.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unlockedBadges.length > 0 ? (
                unlockedBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg cursor-pointer hover:bg-green-100 dark:hover:bg-green-950/30 transition-colors"
                    onClick={() => setSelectedBadge(badge)}
                  >
                    <div className="text-2xl">{badge.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium">{badge.name}</div>
                      <div className="text-sm text-muted-foreground">{badge.description}</div>
                    </div>
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                      Unlocked
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Lock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No badges unlocked yet</p>
                  <p className="text-sm">Complete tasks and build your reputation to earn badges!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Next Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Next Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userBadges
                .filter(badge => !badge.unlockedAt)
                .sort((a, b) => (b.progress || 0) - (a.progress || 0))
                .slice(0, 5)
                .map((badge) => (
                  <div
                    key={badge.id}
                    className="flex items-center gap-3 p-3 bg-muted/50 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => setSelectedBadge(badge)}
                  >
                    <div className="text-2xl opacity-50">{badge.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium">{badge.name}</div>
                      <div className="text-sm text-muted-foreground">{badge.progress}% complete</div>
                    </div>
                    <Progress value={badge.progress || 0} className="w-16 h-2" />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badge Detail Dialog */}
      <Dialog open={!!selectedBadge} onOpenChange={() => setSelectedBadge(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="text-3xl">{selectedBadge?.icon}</span>
              <div>
                <div className="text-xl font-bold">{selectedBadge?.name}</div>
                <Badge 
                  variant="outline" 
                  className={selectedBadge?.unlockedAt ? 
                    "bg-green-500/10 text-green-600 border-green-500/20" : 
                    "bg-muted text-muted-foreground"
                  }
                >
                  {selectedBadge?.unlockedAt ? 'Unlocked' : 'Locked'}
                </Badge>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-muted-foreground">{selectedBadge?.description}</p>
            
            <div className="space-y-3">
              <h4 className="font-medium">Requirements:</h4>
              {selectedBadge?.requirements.map((requirement, index) => {
                const value = BadgeSystem.getRequirementValue(requirement.type, userStats);
                const meetsRequirement = BadgeSystem.evaluateRequirement(requirement, value);
                
                return (
                  <div key={index} className="flex items-center gap-2">
                    {meetsRequirement ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={meetsRequirement ? "text-green-600" : "text-muted-foreground"}>
                      {requirement.description}
                    </span>
                    {!meetsRequirement && (
                      <span className="text-xs text-muted-foreground">
                        (Current: {value})
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            
            {selectedBadge?.unlockedAt && (
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-medium">Unlocked on {selectedBadge.unlockedAt.toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 