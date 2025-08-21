"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  MapPin,
  CreditCard,
  MessageCircle
} from "lucide-react";
import { FixMoIcon } from "@/components/ui/fixmo-icon";


interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const steps = [
  {
    id: 1,
    title: "Welcome to FixMo",
    description: "Let's get you set up to start helping and getting help in your community",
    icon: FixMoIcon,
    content: "Welcome to FixMo! We're excited to have you join our community of trusted helpers and task creators."
  },

  {
    id: 2,
    title: "Location Setup",
    description: "Set your location to connect with nearby users",
    icon: MapPin,
    content: "Help us connect you with people in your area. Your location helps match you with relevant tasks and services."
  },
  {
    id: 3,
    title: "Payment Setup",
    description: "Set up secure payments for transactions",
    icon: CreditCard,
    content: "Secure payment processing ensures safe transactions between community members."
  },
  {
    id: 4,
    title: "Community Guidelines",
    description: "Learn about our community standards",
    icon: Users,
    content: "We maintain a safe, respectful community. Please review our guidelines to ensure the best experience for everyone."
  },
  {
    id: 5,
    title: "You're All Set!",
    description: "Ready to start helping and getting help",
    icon: CheckCircle,
    content: "Congratulations! You're now ready to post tasks, offer services, and connect with your community."
  }
];

export function OnboardingWizard({ isOpen, onClose, onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepComplete = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
    handleNext();
  };



  const currentStepData = steps[currentStep - 1];

  if (!isOpen) return null;

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
              <span className="text-muted-foreground">Step {currentStep} of {steps.length}</span>
              <span className="font-medium">{Math.round((currentStep / steps.length) * 100)}% Complete</span>
            </div>
            <Progress value={(currentStep / steps.length) * 100} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              {steps.map((step, index) => (
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
          <div className="text-center space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              {currentStepData.content}
            </p>
            
            {/* Step-specific content */}
            {currentStep === 1 && (
              <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-lg p-6 border border-primary/20">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                    Fixmotech
                  </Badge>
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                    Secure
                  </Badge>
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                    Community
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Join thousands of users helping each other in their communities every day
                </p>
              </div>
            )}
            

            
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900 dark:text-green-100">Location Privacy</h4>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        Your exact location is never shared. We only use your general area to match you with nearby tasks and services.
                      </p>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => handleStepComplete(2)}
                  className="w-full"
                  size="lg"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Set My Location
                </Button>
              </div>
            )}
            
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-purple-900 dark:text-purple-100">Secure Payments</h4>
                      <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                        All payments are processed securely through our trusted payment partners. Your financial information is protected.
                      </p>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => handleStepComplete(3)}
                  className="w-full"
                  size="lg"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Set Up Payment Method
                </Button>
              </div>
            )}
            
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-orange-900 dark:text-orange-100">Community Guidelines</h4>
                      <ul className="text-sm text-orange-700 dark:text-orange-300 mt-2 space-y-1">
                        <li>• Be respectful and professional</li>
                        <li>• Communicate clearly and promptly</li>
                        <li>• Complete tasks as agreed</li>
                        <li>• Report any issues or concerns</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => handleStepComplete(4)}
                  className="w-full"
                  size="lg"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  I Agree to Guidelines
                </Button>
              </div>
            )}
            
            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900 dark:text-green-100">You're Ready!</h4>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        You can now post tasks, offer services, and connect with your community. Welcome to FixMo!
                      </p>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={onComplete}
                  className="w-full"
                  size="lg"
                >
                  <FixMoIcon className="mr-2" size={16} />
                  Get Started
                </Button>
              </div>
            )}
          </div>
          
          {/* Navigation */}
          {currentStep !== 2 && currentStep !== 5 && (
            <div className="flex items-center justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
              
              {currentStep !== 3 && currentStep !== 4 && currentStep !== 5 && (
                <Button
                  onClick={handleNext}
                  className="flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
          
          {/* Skip option */}
          {currentStep !== 5 && (
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                Skip for now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      

    </div>
  );
} 