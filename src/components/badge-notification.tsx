"use client";

import React, { useState, useEffect } from "react";
import { Badge as BadgeType } from "@/lib/badge-system";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Sparkles, 
  Star, 
  Target, 
  TrendingUp, 
  Crown,
  X,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BadgeNotificationProps {
  badge: BadgeType;
  isOpen: boolean;
  onClose: () => void;
  onClaim?: () => void;
}

export function BadgeNotification({ badge, isOpen, onClose, onClaim }: BadgeNotificationProps) {
  const [showAnimation, setShowAnimation] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setShowAnimation(true);
      setTimeout(() => setShowRewards(true), 1000);
    } else {
      setShowAnimation(false);
      setShowRewards(false);
    }
  }, [isOpen]);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'starter': return <Star className="h-6 w-6" />;
      case 'mid': return <Target className="h-6 w-6" />;
      case 'advanced': return <TrendingUp className="h-6 w-6" />;
      case 'prestigious': return <Crown className="h-6 w-6" />;
      default: return <Star className="h-6 w-6" />;
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

  const getRewards = (level: string) => {
    switch (level) {
      case 'starter':
        return [
          { icon: '🎯', name: 'Profile Boost', description: 'Your profile appears higher in search results' },
          { icon: '💬', name: 'Priority Support', description: 'Faster response from our support team' }
        ];
      case 'mid':
        return [
          { icon: '🚀', name: 'Featured Listing', description: 'Your tasks appear in featured sections' },
          { icon: '📊', name: 'Advanced Analytics', description: 'Detailed insights about your performance' },
          { icon: '🎁', name: 'Exclusive Offers', description: 'Special discounts and promotions' }
        ];
      case 'advanced':
        return [
          { icon: '👑', name: 'VIP Status', description: 'Exclusive access to premium features' },
          { icon: '💰', name: 'Higher Earnings', description: 'Better commission rates on transactions' },
          { icon: '🎪', name: 'Early Access', description: 'Try new features before anyone else' }
        ];
      case 'prestigious':
        return [
          { icon: '🏆', name: 'Legendary Status', description: 'Recognition as a community leader' },
          { icon: '💎', name: 'Premium Benefits', description: 'All platform benefits unlocked' },
          { icon: '🌟', name: 'Community Ambassador', description: 'Help shape the future of FixMo' }
        ];
      default:
        return [];
    }
  };

  const handleClaim = () => {
    onClaim?.();
    toast({
      title: "Badge Claimed! 🎉",
      description: `Congratulations on earning the ${badge.name} badge!`,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md relative overflow-hidden">
        {/* Animated Background */}
        {showAnimation && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-blue-500/20 to-purple-500/20 animate-pulse" />
        )}
        
        <CardContent className="p-6 relative z-10">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Badge Unlock Animation */}
          {showAnimation && (
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <div className="text-6xl mb-4 animate-bounce">
                  {badge.icon}
                </div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="h-6 w-6 text-yellow-500 animate-ping" />
                </div>
                <div className="absolute -bottom-2 -left-2">
                  <Sparkles className="h-6 w-6 text-blue-500 animate-ping" style={{ animationDelay: '0.5s' }} />
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-center">Badge Unlocked!</h2>
                <div className="flex items-center justify-center gap-2">
                  <div className={`p-2 rounded-lg bg-primary/10 ${getLevelColor(badge.level)}`}>
                    {getLevelIcon(badge.level)}
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                    {badge.level.toUpperCase()} LEVEL
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Badge Details */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">{badge.name}</h3>
            <p className="text-muted-foreground">{badge.description}</p>
          </div>

          {/* Rewards Section */}
          {showRewards && (
            <div className="space-y-4">
              <div className="text-center">
                <Trophy className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                <h4 className="font-semibold text-lg">New Rewards Unlocked!</h4>
                <p className="text-sm text-muted-foreground">You've earned these exclusive benefits</p>
              </div>
              
              <div className="space-y-3">
                {getRewards(badge.level).map((reward, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/5 to-blue-500/5 border border-primary/20 rounded-lg"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <div className="text-2xl">{reward.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium">{reward.name}</div>
                      <div className="text-sm text-muted-foreground">{reward.description}</div>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Continue
            </Button>
            <Button
              onClick={handleClaim}
              className="flex-1"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Claim Rewards
            </Button>
          </div>

          {/* Progress Encouragement */}
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Keep up the great work! Complete more tasks to unlock even more badges and rewards.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for managing badge notifications
export function useBadgeNotifications() {
  const [unlockedBadges, setUnlockedBadges] = useState<BadgeType[]>([]);
  const [currentNotification, setCurrentNotification] = useState<BadgeType | null>(null);

  const addUnlockedBadge = (badge: BadgeType) => {
    setUnlockedBadges(prev => [...prev, badge]);
    setCurrentNotification(badge);
  };

  const clearCurrentNotification = () => {
    setCurrentNotification(null);
  };

  const getNextNotification = () => {
    if (unlockedBadges.length > 0 && !currentNotification) {
      const nextBadge = unlockedBadges[0];
      setUnlockedBadges(prev => prev.slice(1));
      setCurrentNotification(nextBadge);
      return nextBadge;
    }
    return null;
  };

  return {
    unlockedBadges,
    currentNotification,
    addUnlockedBadge,
    clearCurrentNotification,
    getNextNotification
  };
} 