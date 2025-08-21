"use client";

import React, { useState } from "react";
import { Badge as BadgeType, BadgeSystem, UserStats } from "@/lib/badge-system";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Target, TrendingUp, Crown, Lock } from "lucide-react";

interface UserBadgeProps {
  userStats: UserStats;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showTooltip?: boolean;
}

export function UserBadge({ 
  userStats, 
  size = 'md',
  className,
  showTooltip = true
}: UserBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const unlockedBadges = BadgeSystem.getUnlockedBadges(userStats);
  const nextBadge = BadgeSystem.getNextBadge(userStats);
  const levelProgress = BadgeSystem.getLevelProgress(userStats);
  
  // Get the highest level badge the user has unlocked
  const currentBadge = unlockedBadges.length > 0 
    ? unlockedBadges[unlockedBadges.length - 1] 
    : BADGES.find(badge => badge.id === 'unverified')!;

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-lg'
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'unverified': return <Lock className="h-3 w-3" />;
      case 'starter': return <Star className="h-3 w-3" />;
      case 'mid': return <Target className="h-3 w-3" />;
      case 'advanced': return <TrendingUp className="h-3 w-3" />;
      case 'prestigious': return <Crown className="h-3 w-3" />;
      default: return <Star className="h-3 w-3" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'unverified': return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'starter': return 'bg-green-100 text-green-600 border-green-200';
      case 'mid': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'advanced': return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'prestigious': return 'bg-red-100 text-red-600 border-red-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getLevelBackground = (level: string) => {
    switch (level) {
      case 'unverified': return 'bg-gradient-to-br from-gray-100 to-gray-200';
      case 'starter': return 'bg-gradient-to-br from-green-100 to-green-200';
      case 'mid': return 'bg-gradient-to-br from-blue-100 to-blue-200';
      case 'advanced': return 'bg-gradient-to-br from-purple-100 to-purple-200';
      case 'prestigious': return 'bg-gradient-to-br from-red-100 to-red-200';
      default: return 'bg-gradient-to-br from-gray-100 to-gray-200';
    }
  };

  const BadgeContent = () => (
    <div className={cn(
      "flex items-center justify-center rounded-full border-2 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer",
      sizeClasses[size],
      getLevelColor(currentBadge.level),
      getLevelBackground(currentBadge.level),
      className
    )}>
      <span className="text-center leading-none">{currentBadge.icon}</span>
    </div>
  );

  if (!showTooltip) {
    return <BadgeContent />;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="relative group">
          <BadgeContent />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
            {currentBadge.name}
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{currentBadge.icon}</span>
            <span>{currentBadge.name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{currentBadge.description}</p>
          
          {/* Level Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium capitalize">{levelProgress.level} Level</span>
              <span className="text-muted-foreground">{levelProgress.progress}%</span>
            </div>
            <Progress value={levelProgress.progress} className="h-2" />
          </div>

          {/* Badge Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-600" />
              <span>{unlockedBadges.length} Badges</span>
            </div>
            <div className="flex items-center gap-2">
              {getLevelIcon(currentBadge.level)}
              <span className="capitalize">{currentBadge.level}</span>
            </div>
          </div>

          {/* Next Badge */}
          {nextBadge && (
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{nextBadge.icon}</span>
                <span className="font-medium">Next: {nextBadge.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">{nextBadge.description}</p>
            </div>
          )}

          {/* Recent Badges */}
          {unlockedBadges.length > 1 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Recent Badges</h4>
              <div className="flex gap-2 flex-wrap">
                {unlockedBadges.slice(-3).map((badge) => (
                  <Badge
                    key={badge.id}
                    variant="outline"
                    className="text-xs"
                  >
                    <span className="mr-1">{badge.icon}</span>
                    {badge.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 