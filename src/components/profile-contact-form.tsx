"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Phone,
  Mail,
  Smartphone,
  Shield
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface ProfileContactFormProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
  initialContactPreference?: string;
}

export function ProfileContactForm({ 
  isOpen, 
  onClose, 
  onNext, 
  onBack,
  currentStep,
  totalSteps,
  initialContactPreference = ""
}: ProfileContactFormProps) {
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [contactPreference, setContactPreference] = useState(initialContactPreference);
  const [isLoading, setIsLoading] = useState(false);

  const progressPercentage = (currentStep / totalSteps) * 100;

  const contactOptions = [
    {
      value: "in-app",
      label: "In-app messaging only",
      description: "Keep all communication within the platform",
      icon: MessageCircle
    },
    {
      value: "phone",
      label: "Phone calls allowed",
      description: "Allow phone calls for urgent matters",
      icon: Phone
    },
    {
      value: "email",
      label: "Email preferred",
      description: "Prefer email communication",
      icon: Mail
    },
    {
      value: "flexible",
      label: "I'm flexible",
      description: "Open to any communication method",
      icon: Smartphone
    }
  ];

  const handleSave = async () => {
    if (!contactPreference) {
      toast({
        variant: "destructive",
        title: "Contact Preference Required",
        description: "Please select your preferred contact method.",
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
          contactPreference: contactPreference,
          updatedAt: new Date()
        });

        // Save progress to localStorage
        const savedProgress = localStorage.getItem(`profile_completion_${user.uid}`);
        const progressData = savedProgress ? JSON.parse(savedProgress) : { completedSteps: [], formData: {} };
        
        progressData.formData.contactPreference = contactPreference;
        if (!progressData.completedSteps.includes(4)) {
          progressData.completedSteps.push(4);
        }
        progressData.currentStep = 5;
        progressData.lastUpdated = new Date().toISOString();
        
        localStorage.setItem(`profile_completion_${user.uid}`, JSON.stringify(progressData));

        toast({
          title: "Contact Preference Saved! 📞",
          description: "Your contact preference has been updated.",
        });
      }
      onNext();
    } catch (error) {
      console.error('Error updating contact preference:', error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "There was an error updating your contact preference. Please try again.",
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
              <CardTitle className="text-2xl font-bold">Contact Preference</CardTitle>
              <CardDescription>How would you like to be contacted by other community members?</CardDescription>
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
              Choose how you'd prefer to be contacted by other community members.
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Contact Preference</label>
            <Select 
              value={contactPreference} 
              onValueChange={setContactPreference}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select your preference" />
              </SelectTrigger>
              <SelectContent>
                {contactOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="h-4 w-4" />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Contact Option Details */}
          {contactPreference && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">
                    {contactOptions.find(opt => opt.value === contactPreference)?.label}
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    {contactOptions.find(opt => opt.value === contactPreference)?.description}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-indigo-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-indigo-900 dark:text-indigo-100">You're in Control</h4>
                <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
                  You can change this preference anytime in your profile settings. Your privacy is always protected.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <MessageCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900 dark:text-green-100">Better Communication</h4>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Setting your preference helps others know the best way to reach you, leading to faster responses.
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
                disabled={isLoading || !contactPreference}
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