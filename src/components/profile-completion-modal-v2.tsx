"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  MapPin, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  X
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ProfileTitleForm } from "./profile-title-form";
import { ProfileBioForm } from "./profile-bio-form";
import { ProfileContactForm } from "./profile-contact-form";

interface ProfileCompletionModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
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
    title: "Professional Title",
    description: "What do you do?",
    icon: User,
    fields: ["title"]
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
    icon: User,
    fields: ["bio"]
  },
  {
    id: 5,
    title: "Contact Preference",
    description: "How should people reach you?",
    icon: User,
    fields: ["contactPreference"]
  }
];

export function ProfileCompletionModalV2({ isOpen, onClose, onComplete }: ProfileCompletionModalV2Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    title: "",
    location: "",
    bio: "",
    contactPreference: ""
  });

  const totalSteps = profileSteps.length;

  // Load saved progress when modal opens
  useEffect(() => {
    if (isOpen && user) {
      const savedProgress = localStorage.getItem(`profile_completion_${user.uid}`);
      if (savedProgress) {
        try {
          const data = JSON.parse(savedProgress);
          setFormData(data.formData || formData);
          setCompletedSteps(data.completedSteps || []);
          setCurrentStep(data.currentStep || 1);
        } catch (error) {
          console.log('Error parsing saved progress:', error);
        }
      }
    }
  }, [isOpen, user]);

  const calculateProgress = () => {
    const completedCount = completedSteps.length;
    return (completedCount / totalSteps) * 100;
  };

  const progressPercentage = calculateProgress();

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepComplete = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId]);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      if (user) {
        const { doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          title: formData.title,
          bio: formData.bio,
          location: formData.location,
          contactPreference: formData.contactPreference,
          updatedAt: new Date()
        });
        
        // Clear profile completion progress from localStorage since it's complete
        localStorage.removeItem(`profile_completion_${user.uid}`);
        
        toast({
          title: "Profile Updated! 🎉",
          description: "Your profile is now complete and you're verified!",
        });
      }
      onComplete();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "There was an error updating your profile. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // Save current progress to localStorage for later completion
    if (user) {
      const progressData = {
        currentStep,
        completedSteps,
        formData,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(`profile_completion_${user.uid}`, JSON.stringify(progressData));
      
      toast({
        title: "Progress Saved! 📝",
        description: "You can complete your profile later from your dashboard.",
      });
    }
    onClose();
  };

  const saveProgress = () => {
    if (user) {
      const progressData = {
        currentStep,
        completedSteps,
        formData,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(`profile_completion_${user.uid}`, JSON.stringify(progressData));
    }
  };

  if (!isOpen) return null;

  // Render the appropriate form based on current step
  if (currentStep === 2) {
    return (
      <ProfileTitleForm
        isOpen={isOpen}
        onClose={onClose}
        onNext={handleNext}
        onBack={handleBack}
        currentStep={currentStep}
        totalSteps={totalSteps}
        initialTitle={formData.title}
      />
    );
  }

  if (currentStep === 4) {
    return (
      <ProfileBioForm
        isOpen={isOpen}
        onClose={onClose}
        onNext={handleNext}
        onBack={handleBack}
        currentStep={currentStep}
        totalSteps={totalSteps}
        initialBio={formData.bio}
        userTitle={formData.title}
      />
    );
  }

  if (currentStep === 5) {
    return (
      <ProfileContactForm
        isOpen={isOpen}
        onClose={onClose}
        onNext={handleNext}
        onBack={handleBack}
        currentStep={currentStep}
        totalSteps={totalSteps}
        initialContactPreference={formData.contactPreference}
      />
    );
  }

  // Default modal for other steps (Basic Info, Location)
  const currentStepData = profileSteps.find(step => step.id === currentStep) || profileSteps[0];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <currentStepData.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">{currentStepData.title}</CardTitle>
              <CardDescription>{currentStepData.description}</CardDescription>
            </div>
          </div>
          
          {/* Progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Step {currentStep} of {totalSteps}</span>
              <span className="font-medium">{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              {profileSteps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`w-2 h-2 rounded-full mb-1 ${
                    index + 1 <= currentStep ? 'bg-primary' : 'bg-border'
                  }`} />
                  <span className="hidden sm:block">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Step Content */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-muted-foreground">
                  Let's start with your basic information. This helps others identify you in the community.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">First Name</label>
                  <Input
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="h-11"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Last Name</label>
                  <Input
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="h-11"
                  />
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">Why We Need This</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Your name helps build trust in the community and makes it easier for others to connect with you.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-muted-foreground">
                  Your location helps us match you with relevant tasks and services in your area.
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">City/Area</label>
                <Input
                  placeholder="e.g., Quezon City, Philippines"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  This helps match you with local tasks and services.
                </p>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-purple-900 dark:text-purple-100">Privacy Protected</h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                      Your exact location is never shared. We only use your general area for matching.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Navigation */}
          <div className="flex items-center justify-between pt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                <CheckCircle className="h-3 w-3 mr-1" />
                {Math.round(progressPercentage)}% Complete
              </Badge>
            </div>
            
            <Button
              onClick={handleNext}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {currentStep === totalSteps ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  Complete Profile
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
          
          {/* Skip option */}
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              Complete later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 