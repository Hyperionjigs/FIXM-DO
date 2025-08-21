"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Edit3,
  Lightbulb,
  Target,
  Star,
  X
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProfileBioFormProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
  initialBio?: string;
  userTitle?: string;
}

export function ProfileBioForm({ 
  isOpen, 
  onClose, 
  onNext, 
  onBack,
  currentStep,
  totalSteps,
  initialBio = "",
  userTitle = ""
}: ProfileBioFormProps) {
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [bio, setBio] = useState(initialBio);
  const [isLoading, setIsLoading] = useState(false);
  const [showBioGuidance, setShowBioGuidance] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string>("");
  const bioTextareaRef = useRef<HTMLTextAreaElement>(null);

  const progressPercentage = (currentStep / totalSteps) * 100;

  const generateBioSuggestions = (title: string) => {
    const lowerTitle = title.toLowerCase();
    
    // Medical & Healthcare specific suggestions
    if (lowerTitle.includes('physician') || lowerTitle.includes('doctor') || lowerTitle.includes('nurse') || 
        lowerTitle.includes('therapist') || lowerTitle.includes('midwife') || lowerTitle.includes('vet') ||
        lowerTitle.includes('vaccination') || lowerTitle.includes('laboratory')) {
      return [
        `Licensed ${title.toLowerCase()} with years of experience in home healthcare services. Professional, compassionate, and committed to quality patient care.`,
        `Experienced ${title.toLowerCase()} offering professional home medical services. Licensed, insured, and dedicated to providing quality healthcare in the comfort of your home.`,
        `Skilled ${title.toLowerCase()} with a passion for delivering excellent healthcare. Quick response time and competitive rates for home medical services.`,
        `Trusted ${title.toLowerCase()} with a proven track record in home healthcare. Specializing in quality medical care and patient satisfaction.`,
        `Professional ${title.toLowerCase()} available for immediate home visits. Licensed, experienced, and ready to provide quality healthcare services.`
      ];
    }
    
    // General suggestions for other professions
    const suggestions = [
      `Professional ${title.toLowerCase()} with years of experience. Reliable, punctual, and committed to quality work.`,
      `Experienced ${title.toLowerCase()} offering professional services. Available for both residential and commercial projects.`,
      `Skilled ${title.toLowerCase()} with a passion for delivering excellent results. Quick response time and competitive rates.`,
      `Trusted ${title.toLowerCase()} with a proven track record. Specializing in quality workmanship and customer satisfaction.`,
      `Professional ${title.toLowerCase()} available for immediate work. Licensed, insured, and ready to help with your needs.`
    ];
    
    return suggestions;
  };

  const handleBioSuggestionClick = (suggestion: string) => {
    setBio(suggestion);
    setSelectedSuggestion(suggestion);
    setShowBioGuidance(true);
    
    // Focus on textarea after a short delay
    setTimeout(() => {
      bioTextareaRef.current?.focus();
      bioTextareaRef.current?.setSelectionRange(suggestion.length, suggestion.length);
    }, 100);
  };

  const handleBioSuggestionKeyDown = (event: React.KeyboardEvent, suggestion: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleBioSuggestionClick(suggestion);
    }
  };

  const dismissGuidance = () => {
    setShowBioGuidance(false);
    setSelectedSuggestion("");
  };

  const handleGuidanceKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      dismissGuidance();
    }
  };

  const handleSave = async () => {
    if (!bio.trim()) {
      toast({
        variant: "destructive",
        title: "Bio Required",
        description: "Please enter a brief introduction about yourself.",
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
          bio: bio.trim(),
          updatedAt: new Date()
        });

        // Save progress to localStorage
        const savedProgress = localStorage.getItem(`profile_completion_${user.uid}`);
        const progressData = savedProgress ? JSON.parse(savedProgress) : { completedSteps: [], formData: {} };
        
        progressData.formData.bio = bio.trim();
        if (!progressData.completedSteps.includes(3)) {
          progressData.completedSteps.push(3);
        }
        progressData.currentStep = 4;
        progressData.lastUpdated = new Date().toISOString();
        
        localStorage.setItem(`profile_completion_${user.uid}`, JSON.stringify(progressData));

        toast({
          title: "Bio Saved! ✨",
          description: "Your bio has been updated successfully.",
        });
      }
      onNext();
    } catch (error) {
      console.error('Error updating bio:', error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "There was an error updating your bio. Please try again.",
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
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Quick Bio</CardTitle>
              <CardDescription>Tell others about yourself and what you offer.</CardDescription>
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
              A brief introduction helps others understand what you do or what you're looking for.
            </p>
          </div>
          
          {/* Bio Suggestions */}
          {userTitle && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">Bio Suggestions</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1 mb-3">
                    Based on your title, here are some professional bio suggestions:
                  </p>
                  <div className="space-y-2">
                    {generateBioSuggestions(userTitle).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleBioSuggestionClick(suggestion)}
                        onKeyDown={(event) => handleBioSuggestionKeyDown(event, suggestion)}
                        tabIndex={0}
                        className="w-full text-left p-3 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors text-sm cursor-pointer group active:scale-95 active:bg-blue-100 dark:active:bg-blue-950/50"
                        style={{
                          touchAction: 'manipulation',
                          WebkitTapHighlightColor: 'transparent'
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span>{suggestion}</span>
                          <Edit3 className="h-4 w-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div>
            <label className="text-sm font-medium mb-2 block">Quick Bio</label>
            <Textarea
              ref={bioTextareaRef}
              placeholder="e.g., 'Professional house cleaner with 5 years experience' or 'Looking for reliable help with household tasks'"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={200}
              onKeyDown={handleGuidanceKeyDown}
            />
            <p className="text-xs text-muted-foreground mt-2">
              {bio.length}/200 characters
            </p>
            
            {/* Bio Guidance - appears immediately after suggestion selection */}
            {showBioGuidance && (
              <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 relative">
                  <button
                    onClick={dismissGuidance}
                    onKeyDown={handleGuidanceKeyDown}
                    className="absolute top-2 right-2 p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 transition-colors"
                    aria-label="Dismiss guidance"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="flex items-start gap-3 pr-6">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Lightbulb className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                        {isMobile ? "Great choice! 💡" : "Great choice! Here's how to make it even better:"}
                      </h4>
                      <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
                        <div className="flex items-start gap-2">
                          <Target className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                          <span><strong>Customize it:</strong> {isMobile ? "Add your experience level and specializations" : "Add your specific experience level, specializations, or unique selling points"}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Star className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                          <span><strong>Make it personal:</strong> {isMobile ? "Include what makes you unique" : "Include what makes you different from others in your field"}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MessageCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                          <span><strong>Add a call-to-action:</strong> {isMobile ? "Mention your availability" : "Mention your availability or how people can reach you"}</span>
                        </div>
                      </div>
                      <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border border-green-200 dark:border-green-700">
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">💡 {isMobile ? "Quick Tips:" : "Quick Tips:"}</p>
                        <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
                          <li>• Keep it under 200 characters for best visibility</li>
                          <li>• Use action words like "experienced," "professional," "reliable"</li>
                          <li>• Mention your location if relevant</li>
                          <li>• Include your response time or availability</li>
                        </ul>
                      </div>
                      {isMobile && (
                        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-700">
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            💬 <strong>Pro tip:</strong> Tap and hold the text area to see character count and formatting options
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <MessageCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-900 dark:text-orange-100">Make It Count</h4>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                  A good bio increases your chances of getting responses by 3x.
                </p>
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
                disabled={isLoading || !bio.trim()}
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