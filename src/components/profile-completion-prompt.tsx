"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  CheckCircle, 
  ArrowRight, 
  Sparkles,
  X
} from "lucide-react";
import { ProfileCompletionModal } from "./profile-completion-modal";

interface ProfileCompletionPromptProps {
  profileCompletion: number; // 0-100
  onComplete?: () => void;
  onDismiss?: () => void;
}

export function ProfileCompletionPrompt({ 
  profileCompletion, 
  onComplete, 
  onDismiss 
}: ProfileCompletionPromptProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleComplete = () => {
    setModalOpen(false);
    onComplete?.();
  };

  const handleDismiss = () => {
    onDismiss?.();
  };

  const getCompletionMessage = () => {
    if (profileCompletion < 25) {
      return "Complete your profile to get started";
    } else if (profileCompletion < 50) {
      return "Almost there! Complete your profile";
    } else if (profileCompletion < 75) {
      return "Great progress! Add more details";
    } else {
      return "Excellent! Your profile looks great";
    }
  };

  const getCompletionColor = () => {
    if (profileCompletion < 25) return "text-red-600";
    if (profileCompletion < 50) return "text-orange-600";
    if (profileCompletion < 75) return "text-yellow-600";
    return "text-green-600";
  };

  const getProgressColor = () => {
    if (profileCompletion < 25) return "bg-red-500";
    if (profileCompletion < 50) return "bg-orange-500";
    if (profileCompletion < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <>
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-blue-500/5">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Complete Your Profile</h3>
                  <p className="text-sm text-muted-foreground">{getCompletionMessage()}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Profile Completion</span>
                  <span className={`font-medium ${getCompletionColor()}`}>
                    {profileCompletion}% Complete
                  </span>
                </div>
                <Progress 
                  value={profileCompletion} 
                  className="h-2"
                  style={{
                    '--progress-color': getProgressColor()
                  } as React.CSSProperties}
                />
              </div>
              
              <div className="flex items-center gap-2 mt-4">
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Fixmotech
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Complete profiles get 3x more responses
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              {profileCompletion < 50 ? (
                <Button 
                  onClick={() => setModalOpen(true)}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Complete Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={() => setModalOpen(true)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Add More
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Profile Completion Modal */}
      <ProfileCompletionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onComplete={handleComplete}
      />
    </>
  );
} 