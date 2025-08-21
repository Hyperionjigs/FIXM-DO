"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  MapPin, 
  Camera, 
  MessageCircle, 
  CheckCircle, 
  ArrowRight,
  Clock,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ProfileCompletionModal } from "./profile-completion-modal";

interface ProfileCompletionReminderProps {
  className?: string;
}

const profileSteps = [
  {
    id: 1,
    title: "Basic Information",
    description: "Tell us about yourself",
    icon: User,
    fields: ["firstName", "lastName"]
  },
  {
    id: 2,
    title: "Photo Verification",
    description: "Take a selfie for verification",
    icon: Camera,
    fields: ["photoVerified"]
  },
  {
    id: 3,
    title: "Location",
    description: "Set your location for local matching",
    icon: MapPin,
    fields: ["location"]
  },
  {
    id: 4,
    title: "Quick Bio",
    description: "Brief introduction about yourself",
    icon: MessageCircle,
    fields: ["bio"]
  },
  {
    id: 5,
    title: "Contact Preference",
    description: "How should people reach you?",
    icon: MessageCircle,
    fields: ["contactPreference"]
  }
];

export function ProfileCompletionReminder({ className }: ProfileCompletionReminderProps) {
  const { user } = useAuth();
  const [hasIncompleteProfile, setHasIncompleteProfile] = useState(false);
  const [progressData, setProgressData] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      const savedProgress = localStorage.getItem(`profile_completion_${user.uid}`);
      if (savedProgress) {
        try {
          const data = JSON.parse(savedProgress);
          setProgressData(data);
          setHasIncompleteProfile(true);
        } catch (error) {
          console.log('Error parsing saved progress:', error);
        }
      }
    }
  }, [user]);

  const calculateProgress = () => {
    if (!progressData) return 0;
    const completedCount = progressData.completedSteps?.length || 0;
    const totalSteps = profileSteps.length;
    return (completedCount / totalSteps) * 100;
  };

  const getNextStep = () => {
    if (!progressData) return profileSteps[0];
    const currentStepId = progressData.currentStep || 1;
    return profileSteps.find(step => step.id === currentStepId) || profileSteps[0];
  };

  const getLastUpdated = () => {
    if (!progressData?.lastUpdated) return null;
    return new Date(progressData.lastUpdated);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  if (!hasIncompleteProfile || !user) {
    return null;
  }

  const progress = calculateProgress();
  const nextStep = getNextStep();
  const lastUpdated = getLastUpdated();

  return (
    <>
      <Card className={`${className} border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Sparkles className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Complete Your Profile</CardTitle>
                <p className="text-sm text-muted-foreground">
                  You're {Math.round(progress)}% done! Just a few more steps to go.
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20">
              <Clock className="h-3 w-3 mr-1" />
              {lastUpdated ? formatTimeAgo(lastUpdated) : "Recently"}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Next Step Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <nextStep.icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">Next: {nextStep.title}</h4>
                <p className="text-xs text-muted-foreground">{nextStep.description}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setModalOpen(true)}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Continue Profile Setup
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                localStorage.removeItem(`profile_completion_${user.uid}`);
                setHasIncompleteProfile(false);
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              Dismiss
            </Button>
          </div>

          {/* Benefits */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Complete your profile to:</strong>
                <ul className="mt-1 space-y-1">
                  <li>• Build trust with other community members</li>
                  <li>• Get better matches for tasks and skills</li>
                  <li>• Unlock additional features and badges</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Completion Modal */}
      <ProfileCompletionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onComplete={() => {
          setModalOpen(false);
          setHasIncompleteProfile(false);
        }}
      />
    </>
  );
} 