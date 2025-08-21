"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Briefcase
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface ProfileTitleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
  initialTitle?: string;
}

export function ProfileTitleForm({ 
  isOpen, 
  onClose, 
  onNext, 
  onBack,
  currentStep,
  totalSteps,
  initialTitle = ""
}: ProfileTitleFormProps) {
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState(initialTitle);
  const [isLoading, setIsLoading] = useState(false);

  const progressPercentage = (currentStep / totalSteps) * 100;

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Title Required",
        description: "Please enter your professional title.",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (user) {
        const { doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          title: title.trim(),
          updatedAt: new Date()
        });

        // Save progress to localStorage
        const savedProgress = localStorage.getItem(`profile_completion_${user.uid}`);
        const progressData = savedProgress ? JSON.parse(savedProgress) : { completedSteps: [], formData: {} };
        
        progressData.formData.title = title.trim();
        if (!progressData.completedSteps.includes(2)) {
          progressData.completedSteps.push(2);
        }
        progressData.currentStep = 3;
        progressData.lastUpdated = new Date().toISOString();
        
        localStorage.setItem(`profile_completion_${user.uid}`, JSON.stringify(progressData));

        toast({
          title: "Title Saved! 🎯",
          description: "Your professional title has been updated.",
        });
      }
      onNext();
    } catch (error) {
      console.error('Error updating title:', error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "There was an error updating your title. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onNext();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Professional Title</CardTitle>
              <CardDescription>What do you do? This helps others understand your expertise.</CardDescription>
            </div>
          </div>
          
          {/* Progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Step {currentStep} of {totalSteps}</span>
              <span className="font-medium">{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center mb-6">
            <p className="text-muted-foreground">
              Your professional title helps others quickly understand what you do and your area of expertise.
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Professional Title</label>
            <Input
              placeholder="e.g., Carpenter, Plumber, Designer, Tutor, House Cleaner"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Be specific about your main skill or service.
            </p>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100">Why This Matters</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  A clear title helps you get matched with the right tasks and makes it easier for people to find your services.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-900 dark:text-orange-100">Examples</h4>
                <div className="text-sm text-orange-700 dark:text-orange-300 mt-1 space-y-1">
                  <p>• <strong>Service providers:</strong> House Cleaner, Plumber, Electrician</p>
                  <p>• <strong>Professionals:</strong> Graphic Designer, Web Developer, Tutor</p>
                  <p>• <strong>Specialists:</strong> Pet Sitter, Gardener, Handyman</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex items-center justify-between pt-6">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                <CheckCircle className="h-3 w-3 mr-1" />
                {Math.round(progressPercentage)}% Complete
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleSkip}
                className="text-muted-foreground hover:text-foreground"
              >
                Skip
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading || !title.trim()}
                className="flex items-center gap-2"
              >
                {isLoading ? 'Saving...' : (
                  <>
                    Save & Continue
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 