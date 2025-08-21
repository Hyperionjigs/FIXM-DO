"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Eye, EyeOff, CheckCircle, UserPlus, ArrowRight } from 'lucide-react';
import { useVerificationStatus } from '@/hooks/use-verification-status';
import { VerificationModal } from './verification-modal';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VerificationGateProps {
  children: React.ReactNode;
  previewContent?: React.ReactNode;
  title?: string;
  description?: string;
  showVerificationModal?: boolean;
  onVerificationComplete?: () => void;
  tooltipOnly?: boolean;
}

export function VerificationGate({
  children,
  previewContent,
  title = "Verification Required",
  description = "Complete your verification to view this content",
  showVerificationModal = true,
  onVerificationComplete,
  tooltipOnly = false
}: VerificationGateProps) {
  const { isVerified, isPending, loading, registrationStatus } = useVerificationStatus();
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [verificationType, setVerificationType] = useState<'selfie' | 'id-document' | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleActionClick = () => {
    const { nextStep, registrationStep } = registrationStatus;
    
    console.log('🔍 VerificationGate: User clicked action button', {
      nextStep,
      registrationStep,
      isAuthenticated: registrationStatus.isAuthenticated,
      isRegistered: registrationStatus.isRegistered,
      isVerificationComplete: registrationStatus.isVerificationComplete
    });
    
    switch (nextStep) {
      case 'register':
        // Unregistered user - redirect to signup
        console.log('🔍 Redirecting unregistered user to signup');
        router.push('/signup');
        break;
        
      case 'complete-registration':
        // Incomplete registration - redirect to signup with step
        console.log('🔍 Redirecting incomplete registration to step:', registrationStep);
        router.push(`/signup?step=${registrationStep || 1}`);
        break;
        
      case 'verify':
        // Registered but unverified - show verification modal
        console.log('🔍 Showing verification modal for registered but unverified user');
        if (showVerificationModal) {
          setVerificationType('selfie');
          setVerificationModalOpen(true);
        } else {
          toast({
            title: "Verification Required",
            description: "Please complete your verification in your profile settings.",
            variant: "destructive",
          });
        }
        break;
        
      default:
        // Shouldn't happen, but fallback
        console.log('🔍 Unknown next step:', nextStep);
        break;
    }
  };

  const getActionButtonText = () => {
    const { nextStep } = registrationStatus;
    
    switch (nextStep) {
      case 'register':
        return 'Sign Up';
      case 'complete-registration':
        return 'Complete Registration';
      case 'verify':
        return isPending ? 'Verification Pending' : 'Verify Now';
      default:
        return 'Verify Now';
    }
  };

  const getActionButtonIcon = () => {
    const { nextStep } = registrationStatus;
    
    switch (nextStep) {
      case 'register':
        return <UserPlus className="mr-2 h-4 w-4" />;
      case 'complete-registration':
        return <ArrowRight className="mr-2 h-4 w-4" />;
      case 'verify':
        return isPending ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        ) : (
          <CheckCircle className="mr-2 h-4 w-4" />
        );
      default:
        return <CheckCircle className="mr-2 h-4 w-4" />;
    }
  };

  const getTitle = () => {
    const { nextStep } = registrationStatus;
    
    switch (nextStep) {
      case 'register':
        return 'Registration Required';
      case 'complete-registration':
        return 'Complete Your Registration';
      case 'verify':
        return 'Verification Required';
      default:
        return title;
    }
  };

  const getDescription = () => {
    const { nextStep } = registrationStatus;
    
    switch (nextStep) {
      case 'register':
        return 'Create an account to view this content and access all features';
      case 'complete-registration':
        return 'Complete your registration to continue where you left off';
      case 'verify':
        return description;
      default:
        return description;
    }
  };

  const handleVerificationComplete = (profilePictureUrl?: string) => {
    setVerificationModalOpen(false);
    setVerificationType(null);
    if (onVerificationComplete) {
      onVerificationComplete();
    }
    toast({
      title: "Verification Complete",
      description: "You can now view this content.",
    });
  };

  const handleVerificationSkip = () => {
    setVerificationModalOpen(false);
    setVerificationType(null);
    toast({
      title: "Verification Skipped",
      description: "You can complete verification later. Some features will be limited.",
    });
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-3/4"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isVerified) {
    return <>{children}</>;
  }

  // If tooltipOnly is true, show the content with verification tooltip on interaction
  if (tooltipOnly) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-pointer">
              {children}
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm p-4">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold flex items-center justify-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  {getTitle()}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">{getDescription()}</p>
              </div>
              
              {isPending && (
                <div className="flex items-center justify-center gap-2 text-amber-600">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-amber-600"></div>
                  <span className="text-xs">Verification in progress...</span>
                </div>
              )}
              
              <Button 
                onClick={handleActionClick}
                size="sm"
                className="w-full"
                disabled={isPending}
              >
                {getActionButtonIcon()}
                {getActionButtonText()}
              </Button>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Original full overlay behavior (fallback)
  return (
    <>
      <Card className="relative overflow-hidden border-dashed border-2 border-muted">
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 to-background/95 backdrop-blur-sm z-10"></div>
        
        {previewContent && (
          <div className="relative z-0 opacity-100 pointer-events-none">
            {previewContent}
          </div>
        )}
        
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4 bg-background/95 backdrop-blur-sm border-2 border-primary/20">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="flex items-center justify-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                {getTitle()}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">{getDescription()}</p>
              
              {isPending && (
                <div className="flex items-center justify-center gap-2 text-amber-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
                  <span className="text-sm">Verification in progress...</span>
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleActionClick}
                  className="w-full"
                  disabled={isPending}
                >
                  {getActionButtonIcon()}
                  {getActionButtonText()}
                </Button>
                
                <div className="text-xs text-muted-foreground">
                  <EyeOff className="inline h-3 w-3 mr-1" />
                  Sensitive details blurred
                </div>
                
                {isPending && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/verification-status">
                      Check Status
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </Card>

      {showVerificationModal && (
        <VerificationModal
          isOpen={verificationModalOpen}
          onClose={handleVerificationSkip}
          onComplete={handleVerificationComplete}
          verificationType={verificationType}
        />
      )}
    </>
  );
} 