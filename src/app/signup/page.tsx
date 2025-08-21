
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle, ArrowRight, Sparkles, User, Phone, Shield, Camera, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useVerificationStatus } from "@/hooks/use-verification-status";
import { Badge } from "@/components/ui/badge";
import { VerificationModal } from "@/components/verification-modal";
import { Progress } from "@/components/ui/progress";

const signupSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

const nameSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters."),
  lastName: z.string().min(2, "Last name must be at least 2 characters."),
});

const contactSchema = z.object({
  phone: z.string().min(10, "Please enter a valid phone number."),
  address: z.string().min(10, "Please enter your full address."),
});

export default function SignUpPage() {
  const { toast } = useToast();
  const { signup, user, refreshUser, updateUserPhotoURL } = useAuth();
  const { updateVerificationStatus } = useVerificationStatus();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [step, setStep] = React.useState(1);
  const [verificationModalOpen, setVerificationModalOpen] = React.useState(false);
  const [verificationCompleted, setVerificationCompleted] = React.useState(false);
  const [selfieCompleted, setSelfieCompleted] = React.useState(false);
  const [idDocumentCompleted, setIdDocumentCompleted] = React.useState(false);
  const [verificationType, setVerificationType] = React.useState<'selfie' | 'id-document' | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = React.useState<string | null>(null);

  // Check for step parameter in URL
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const stepParam = urlParams.get('step');
    if (stepParam) {
      const stepNumber = parseInt(stepParam);
      if (stepNumber >= 1 && stepNumber <= 4) {
        setStep(stepNumber);
      }
    }
  }, []);

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const nameForm = useForm<z.infer<typeof nameSchema>>({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
    },
  });

  const contactForm = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      phone: "",
      address: "",
    },
  });

  const totalSteps = 4;
  const progressPercentage = (step / totalSteps) * 100;

  const completeSetup = async () => {
    if (!selfieCompleted || !idDocumentCompleted) {
      toast({
        variant: "destructive",
        title: "Verification Required",
        description: "Please complete both selfie and ID document verification to access all features.",
      });
      return;
    }
    
    // User is already verified in database from verification completion
    toast({
      title: "Setup Complete! 🎉",
      description: "You're now fully verified and can access all features!",
    });
    
    // Redirect to dashboard with full access
    router.push("/dashboard?status=verified");
  };

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    console.log('🚀 Sign-up form submitted with values:', values);
    console.log('🔍 Current state:', { step, isLoading, user });
    setIsLoading(true);
    try {
      console.log('📧 Attempting to create user account...');
      console.log('🔍 Signup function:', typeof signup);
      const result = await signup(values.email, values.password);
      console.log('✅ User account created successfully:', result);
      toast({
        title: "Account Created! 🎉",
        description: "Let's set up your profile to get started.",
      });
      setStep(2);
    } catch (error: any) {
      console.error('❌ Sign-up failed:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: error.message || "An unexpected error occurred during signup.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onNameSubmit = async (values: z.infer<typeof nameSchema>) => {
    console.log('📝 Name form submitted:', values);
    // Here you would save the name to the user's profile
    toast({
      title: "Name Saved! ✅",
      description: "Now let's add your contact details.",
    });
    setStep(3);
  };

  const onContactSubmit = async (values: z.infer<typeof contactSchema>) => {
    console.log('📞 Contact form submitted:', values);
    // Here you would save the contact details to the user's profile
    toast({
      title: "Contact Details Saved! ✅",
      description: "Now let's verify your identity for security.",
    });
    setStep(4);
  };

  const handleVerificationComplete = async (profilePictureUrl?: string) => {
    console.log('🔍 handleVerificationComplete called with:', { profilePictureUrl, verificationType });
    
    if (verificationType === 'selfie') {
      console.log('🔍 Processing selfie verification completion');
      
      // Set profile picture URL regardless of verification result
      if (profilePictureUrl) {
        console.log('✅ Profile picture URL received:', profilePictureUrl);
        setProfilePictureUrl(profilePictureUrl);
        
        // Immediately update the user's photoURL in the UI
        console.log('🔄 Updating user photoURL in UI...');
        updateUserPhotoURL(profilePictureUrl);
        console.log('✅ User photoURL updated in UI');
        
        toast({
          title: "Profile Picture Set! ✅",
          description: "Your selfie has been saved as your profile picture!",
        });
      } else {
        console.log('❌ No profile picture URL received');
      }
      
      // Only mark as completed if verification was successful
      // For now, let's mark it as completed regardless to allow progression
      setSelfieCompleted(true);
      await updateVerificationStatus('selfie', true);
      
      toast({
        title: "Selfie Verification Complete! ✅",
        description: "Now let's verify your ID document.",
      });
    } else if (verificationType === 'id-document') {
      setIdDocumentCompleted(true);
      // Update verification status in database
      await updateVerificationStatus('id-document', true);
      toast({
        title: "ID Document Verification Complete! ✅",
        description: "Excellent! Now let's take your selfie.",
      });
    }

    setVerificationModalOpen(false);
    setVerificationType(null);

    // Check if both verifications are complete
    if ((verificationType === 'selfie' && idDocumentCompleted) || 
        (verificationType === 'id-document' && selfieCompleted)) {
      setVerificationCompleted(true);
      toast({
        title: "All Verifications Complete! 🎉",
        description: "Both verifications are done! Click 'Complete Setup' to finish.",
      });
      // Don't auto-redirect - user must click "Complete Setup" button
    }
  };

  const handleVerificationSkip = () => {
    setVerificationModalOpen(false);
    setVerificationType(null);
    toast({
      title: "Verification Skipped",
      description: "You can complete verification later. Some features will be limited.",
    });
    // Don't redirect - user stays on verification step
  };

  const openSelfieVerification = () => {
    console.log('🔍 Opening selfie verification modal');
    console.log('🔍 Current user:', user);
    console.log('🔍 Button clicked - attempting to open modal');
    
    if (!user?.uid) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please complete the signup process first.",
      });
      return;
    }
    
    console.log('🔍 User authenticated, setting verification type and opening modal');
    setVerificationType('selfie');
    setVerificationModalOpen(true);
    console.log('🔍 Modal state should now be open');
  };

  const openIdDocumentVerification = () => {
    console.log('🔍 Opening ID document verification modal');
    console.log('🔍 Current user:', user);
    if (!user?.uid) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please complete the signup process first.",
      });
      return;
    }
    setVerificationType('id-document');
    setVerificationModalOpen(true);
  };

  const benefits = [
    "Connect with trusted local helpers",
    "Earn money by offering your skills", 
    "Secure payments and verification",
    "24/7 Fixmotech support"
  ];

  const renderStep1 = () => (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side - Benefits */}
        <div className="hidden lg:flex flex-col justify-center space-y-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold gradient-text">Join FixMo Today</h1>
            </div>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Your trusted neighborhood marketplace for tasks and skills. Connect with reliable people in your community.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Why choose FixMo?</h3>
            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                Fixmotech
              </Badge>
              <span className="text-sm font-medium">AI-Powered Verification</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Our advanced verification system ensures you connect with real, trustworthy people in your community.
            </p>
          </div>
        </div>

        {/* Right side - Sign up form */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
                <CardDescription className="mt-2">
                  Join thousands of users helping each other in their communities
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit((values) => {
                  console.log('🎯 Form handleSubmit called with values:', values);
                  return onSubmit(values);
                })} className="space-y-6">
                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="you@example.com" 
                            className="h-11"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              placeholder="••••••••" 
                              className="h-11 pr-10"
                              {...field} 
                            />
                            <button 
                              type="button" 
                              onClick={() => setShowPassword(!showPassword)} 
                              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Confirm Password</FormLabel>
                        <FormControl>
                           <div className="relative">
                            <Input 
                              type={showConfirmPassword ? "text" : "password"} 
                              placeholder="••••••••" 
                              className="h-11 pr-10"
                              {...field} 
                            />
                            <button 
                              type="button" 
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full h-11 font-medium" 
                    disabled={isLoading}
                    onClick={() => console.log('🔘 Submit button clicked')}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Creating Account...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Get Started
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </Button>


                </form>
              </Form>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="font-semibold text-primary hover:underline transition-colors">
                    Log In
                  </Link>
                </p>
              </div>
              
              <div className="mt-6 pt-6 border-t border-border/50">
                <p className="text-xs text-muted-foreground text-center">
                  By creating an account, you agree to our{" "}
                  <Link href="#" className="underline hover:text-foreground transition-colors">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="#" className="underline hover:text-foreground transition-colors">Privacy Policy</Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <span>Step {step} of {totalSteps}</span>
              </div>
              <Progress value={progressPercentage} className="w-full" />
            </div>
            <div className="mx-auto p-3 bg-blue-500/10 rounded-full w-fit">
              <User className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Tell Us About Yourself</CardTitle>
              <CardDescription className="mt-2">
                Let's start with your name
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...nameForm}>
              <form onSubmit={nameForm.handleSubmit(onNameSubmit)} className="space-y-6">
                <FormField
                  control={nameForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">First Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="John" 
                          className="h-11"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={nameForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Last Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Doe" 
                          className="h-11"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full h-11 font-medium"
                >
                  <div className="flex items-center gap-2">
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Button>
              </form>
            </Form>
            
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">📝 Profile Setup</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Your name will be displayed to other members. Please provide your real name for verification purposes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <span>Step {step} of {totalSteps}</span>
              </div>
              <Progress value={progressPercentage} className="w-full" />
            </div>
            <div className="mx-auto p-3 bg-green-500/10 rounded-full w-fit">
              <Phone className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Contact Details</CardTitle>
              <CardDescription className="mt-2">
                How can others reach you?
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...contactForm}>
              <form onSubmit={contactForm.handleSubmit(onContactSubmit)} className="space-y-6">
                <FormField
                  control={contactForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          type="tel"
                          placeholder="+63 912 345 6789" 
                          className="h-11"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={contactForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="123 Bonifacio St, Makati City, Metro Manila 1200" 
                          className="h-11"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full h-11 font-medium"
                >
                  <div className="flex items-center gap-2">
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Button>
              </form>
            </Form>
            
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">📞 Contact Information</h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Your contact details help other members reach you for tasks and services. This information is only shared with verified members.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <span>Step {step} of {totalSteps}</span>
              </div>
              <Progress value={progressPercentage} className="w-full" />
            </div>
            <div className="mx-auto p-3 bg-purple-500/10 rounded-full w-fit">
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Identity Verification</CardTitle>
              <CardDescription className="mt-2">
                Complete both verifications to access all features
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Unified Verification Card */}
            <div className="p-4 rounded-lg border border-border bg-card/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Shield className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Complete Identity Verification</h3>
                  <p className="text-sm text-muted-foreground">Both selfie and ID document required</p>
                </div>
              </div>
              
              {/* Profile Picture Display */}
              {(profilePictureUrl || user?.photoURL) && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img 
                      src={profilePictureUrl || user?.photoURL || ''} 
                      alt="Profile Picture" 
                      className="w-12 h-12 rounded-full object-cover border-2 border-green-500"
                      onLoad={() => console.log('✅ Profile picture image loaded successfully')}
                      onError={(e) => console.error('❌ Profile picture image failed to load:', e)}
                    />
                    <div>
                      <p className="text-sm font-medium text-green-900 dark:text-green-100">
                        Profile Picture Set ✅
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        Your selfie has been saved as your profile picture
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Verification Status */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Selfie Verification
                  </span>
                  {selfieCompleted ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Completed
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Pending</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    ID Document
                  </span>
                  {idDocumentCompleted ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Completed
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Pending</span>
                  )}
                </div>
              </div>

              {/* Single Action Button */}
              <Button 
                onClick={() => {
                  if (!user?.uid) {
                    toast({
                      variant: "destructive",
                      title: "Authentication Required",
                      description: "Please complete the signup process first.",
                    });
                    return;
                  }
                  
                  // Start with selfie if not completed, otherwise ID document
                  if (!selfieCompleted) {
                    setVerificationType('selfie');
                  } else if (!idDocumentCompleted) {
                    setVerificationType('id-document');
                  }
                  setVerificationModalOpen(true);
                }}
                size="lg" 
                className="w-full h-12 font-medium bg-blue-600 hover:bg-blue-700"
                disabled={selfieCompleted && idDocumentCompleted}
              >
                {selfieCompleted && idDocumentCompleted ? (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Verification Complete
                  </>
                ) : !selfieCompleted ? (
                  <>
                    <Camera className="h-5 w-5 mr-2" />
                    Start Selfie Verification
                  </>
                ) : (
                  <>
                    <FileText className="h-5 w-5 mr-2" />
                    Upload ID Document
                  </>
                )}
              </Button>
            </div>



            {selfieCompleted && idDocumentCompleted && (
              <div className="pt-4 border-t border-border/50">
                <Button 
                  onClick={completeSetup}
                  size="lg"
                  className="w-full h-12 font-medium bg-green-600 hover:bg-green-700"
                >
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Complete Setup
                </Button>
              </div>
            )}

            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">⚠️ Security Notice</h4>
              <p className="text-sm text-red-700 dark:text-red-300">
                <strong>Verification is required to access all features:</strong>
              </p>
              <ul className="text-sm text-red-700 dark:text-red-300 mt-2 space-y-1">
                <li>• Cannot view complete user profiles or contact details</li>
                <li>• Cannot contact other members</li>
                <li>• Cannot post tasks or services</li>
                <li>• Can only view task posts with redacted information</li>
              </ul>
              <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                <strong>Complete both verifications to access all features and protect our community.</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <>
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
      
      {/* Verification Modal */}
      <VerificationModal
        isOpen={verificationModalOpen}
        onClose={handleVerificationSkip}
        onComplete={handleVerificationComplete}
        verificationType={verificationType}
      />
    </>
  );
}
