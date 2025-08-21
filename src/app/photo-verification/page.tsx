"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useVerificationStatus } from "@/hooks/use-verification-status";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, UserCheck, FileText, Shield, AlertTriangle, Camera, Lock } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export default function PhotoVerificationPage() {
  const { user } = useAuth();
  const { isVerified, selfieVerified, idDocumentVerified, loading } = useVerificationStatus();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleStartVerification = () => {
    // Redirect to the proper verification process
    router.push('/signup?step=4');
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  // Show loading while checking verification status
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Checking verification status...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Verification Status</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Identity Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isVerified ? (
            // User is fully verified
            <>
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Verification Status</AlertTitle>
                <AlertDescription>
                  Your profile has been fully verified. You can now access all features of the platform.
                </AlertDescription>
              </Alert>
              
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
                <UserCheck className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  ✅ Fully Verified
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                  Both selfie and ID document verification are complete. You have full access to all platform features.
                </p>
                <Button 
                  onClick={handleGoToDashboard}
                  className="w-full"
                  size="lg"
                >
                  Continue to Dashboard
                </Button>
              </div>
            </>
          ) : (
            // User is not verified or partially verified
            <>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Verification Required</AlertTitle>
                <AlertDescription>
                  To access all platform features and protect our community, you must complete both selfie and ID document verification.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${selfieVerified ? 'border-green-500/50 bg-green-50/20' : 'border-border'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${selfieVerified ? 'bg-green-500/10' : 'bg-blue-500/10'}`}>
                      <Camera className={`h-5 w-5 ${selfieVerified ? 'text-green-600' : 'text-blue-500'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Selfie Verification</h3>
                      <p className="text-sm text-muted-foreground">
                        {selfieVerified ? 'Completed' : 'Take a photo for your profile'}
                      </p>
                    </div>
                    {selfieVerified && <UserCheck className="h-5 w-5 text-green-600" />}
                  </div>
                </div>

                <div className={`p-4 rounded-lg border ${idDocumentVerified ? 'border-green-500/50 bg-green-50/20' : 'border-border'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${idDocumentVerified ? 'bg-green-500/10' : 'bg-purple-500/10'}`}>
                      <FileText className={`h-5 w-5 ${idDocumentVerified ? 'text-green-600' : 'text-purple-500'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">ID Document Verification</h3>
                      <p className="text-sm text-muted-foreground">
                        {idDocumentVerified ? 'Completed' : 'Upload a valid ID document'}
                      </p>
                    </div>
                    {idDocumentVerified && <UserCheck className="h-5 w-5 text-green-600" />}
                  </div>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">⚠️ Limited Access</h4>
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                  <strong>Unverified users have severely limited access:</strong>
                </p>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  <li>• Cannot see complete user profiles or contact details</li>
                  <li>• Cannot contact other members</li>
                  <li>• Cannot post tasks or services</li>
                  <li>• Can only view task posts with redacted information</li>
                </ul>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleStartVerification}
                  size="lg"
                  className="w-full h-12 font-medium"
                >
                  <Lock className="h-5 w-5 mr-2" />
                  Complete Verification Process
                </Button>
                
                <Button 
                  onClick={handleGoToDashboard}
                  variant="outline"
                  className="w-full"
                >
                  Go to Dashboard (Limited Access)
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 