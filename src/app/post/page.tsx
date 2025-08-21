
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Wand2, Plus, Sparkles, Users, Shield, AlertTriangle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { suggestDetails } from "@/ai/flows/suggest-details-flow";
import { TaskCategoryEnum } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { useVerificationStatus } from "@/hooks/use-verification-status";
import { db } from "@/lib/firebase";
import { PostingWizard } from "@/components/posting-wizard";
import { FixmotechAssistant } from "@/components/fixmotech-assistant";
import { VerificationModal } from "@/components/verification-modal";
import { createEnhancedFormSchema, assessContentQuality, ContentQualityResult } from "@/lib/content-quality";
import { ContentQualityFeedback } from "@/components/content-quality-feedback";
import { getRandomPlaceholderPair } from "@/lib/placeholder-examples";

const formSchema = createEnhancedFormSchema();

function PostPageContent() {
  const { toast } = useToast()
  const { user } = useAuth();
  const { isVerified, isPending, canPost, loading: verificationLoading } = useVerificationStatus();
  const router = useRouter();
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGlowing, setIsGlowing] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [qualityResult, setQualityResult] = useState<ContentQualityResult | null>(null);
  const [categorySearch, setCategorySearch] = useState('');
  const searchParams = useSearchParams();
  const postType = searchParams.get("type");
  const [placeholderExamples] = useState(() => getRandomPlaceholderPair());

  // Helper function to get category group names
  const getCategoryGroupName = (emoji: string): string => {
    const groupNames: Record<string, string> = {
      '🔧': 'Construction & Carpentry',
      '🧰': 'Mechanical & Electrical',
      '🧼': 'Services & Maintenance',
      '🧑‍🍳': 'Hospitality & Culinary',
      '💅': 'Beauty & Wellness',
      '📦': 'Logistics & Transport',
      '⚙️': 'Technical and Industrial',
      '🏗️': 'High-risk Construction',
      '🛠️': 'Precision Trades',
      '🚢': 'Maritime',
      '🖥️': 'Tech-Related',
      '🧑‍⚕️': 'Healthcare Support',
      '🏥': 'Medical & Wellness Home Services',
      '🧪': 'Food & Beverage (Specialty)',
      '📚': 'Education and Training',
      '🎉': 'Events Planning and Hospitality',
      '🎨': 'Creative Arts, Media and Entertainment Services',
      '📋': 'Other'
    };
    return groupNames[emoji] || 'Other';
  };

  // Filter categories based on search
  const filteredCategories = TaskCategoryEnum.options.filter(category =>
    category.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // Group categories by emoji for better organization
  const groupedCategories = filteredCategories.reduce((groups, category) => {
    const emoji = category.match(/^[^\w\s]/)?.[0] || '📋';
    if (!groups[emoji]) groups[emoji] = [];
    groups[emoji].push(category);
    return groups;
  }, {} as Record<string, string[]>);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: postType === 'service' ? 'service' : 'task',
      title: "",
      description: "",
      location: "",
      pay: 0,
    },
  });

  useEffect(() => {
    if (postType === 'task' || postType === 'service') {
      form.setValue('type', postType);
    }
  }, [postType, form]);
  
  useEffect(() => {
    if (!user) {
       toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "You need to be logged in to create a post.",
      });
      router.push('/login');
      return;
    }
    
    // Check verification status
    if (!verificationLoading && !canPost) {
      toast({
        variant: "destructive",
        title: "Verification Required",
        description: "Please complete your verification before posting.",
        duration: 5000,
      });
    }
  }, [user, canPost, verificationLoading, toast, router]);

  const handleSuggest = async () => {
    const title = form.getValues("title");
    if (!title) {
      form.setError("title", { type: "manual", message: "Please enter a title first to get suggestions." });
      setIsGlowing(false);
      return;
    }
    setIsSuggesting(true);
    setIsGlowing(false);
    try {
      const result = await suggestDetails({
        userInput: title,
        postType: form.getValues("type"),
      });
      if (result.category) form.setValue("category", result.category);
      if (result.description) form.setValue("description", result.description);
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Suggestion Failed",
        description: "Could not generate AI suggestions. Please try again.",
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleTitleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setIsGlowing(true);
      setTimeout(() => {
        setIsGlowing(false);
      }, 2000);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({ variant: "destructive", title: "Not logged in", description: "Please log in to post." });
      return;
    }
     if (!canPost) {
      toast({ 
        variant: "destructive", 
        title: "Action Required", 
        description: "Please upload a real photo before posting.",
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push('/photo-verification')}
            className="ml-2"
          >
            Upload Photo
          </Button>
        )
      });
      return;
    }

    // Content quality assessment
    const qualityAssessment = assessContentQuality(values.title, values.description);
    
    if (!qualityAssessment.isValid) {
      toast({
        variant: "destructive",
        title: "Content Quality Issue",
        description: "Your post needs improvement. Please review the suggestions below.",
        duration: 5000,
      });
      setQualityResult(qualityAssessment);
      return;
    }

    // Warn about moderation if needed
    if (qualityAssessment.requiresModeration) {
      const proceed = confirm(
        "Your post may require moderation before being published. Do you want to proceed?"
      );
      if (!proceed) return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "posts"), {
        ...values,
        authorId: user.uid,
        authorName: user.displayName || user.email,
        authorPhotoURL: user.photoURL,
        createdAt: serverTimestamp(),
        status: qualityAssessment.requiresModeration ? 'pending' : 'open',
        qualityScore: qualityAssessment.score,
        moderationRequired: qualityAssessment.requiresModeration,
      });

      toast({
        title: "Post Submitted! 🎉",
        description: qualityAssessment.requiresModeration 
          ? "Your post has been submitted and is pending moderation." 
          : "Your post is now live for others to see.",
      });
      form.reset();
      setQualityResult(null);
      router.push('/');
    } catch (error) {
       console.error("Error adding document: ", error);
       toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "There was an error submitting your post. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Verification Alert */}
      {!verificationLoading && !canPost && (
        <Alert className="mb-6 cursor-pointer hover:bg-destructive/10 transition-colors" onClick={() => setVerificationModalOpen(true)}>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="flex items-center justify-between">
            Verification Required to Post
            <Button variant="outline" size="sm" className="ml-2" onClick={(e) => { e.stopPropagation(); setVerificationModalOpen(true); }}>
              Complete Verification
            </Button>
          </AlertTitle>
          <AlertDescription>
            For the safety and security of our community, you must complete identity verification before you can post tasks or services. Click here to start the verification process.
          </AlertDescription>
        </Alert>
      )}

      {/* Welcome Card for New Users */}
      {isNewUser && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Welcome to FixMo! 🎉</h3>
                <p className="text-muted-foreground mb-4">
                  Ready to post your first task or service? We've made it super easy with our step-by-step wizard!
                </p>
                <div className="flex items-center gap-4">
                  <Button 
                    onClick={() => setShowWizard(true)} 
                    className="flex items-center gap-2"
                    disabled={!canPost}
                  >
                    <Plus className="h-4 w-4" />
                    Start Posting Wizard
                  </Button>
                  <Button variant="outline" onClick={() => setIsNewUser(false)}>
                    Use Simple Form
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="text-center p-6">
          <div className="p-3 bg-blue-500/10 rounded-lg w-fit mx-auto mb-4">
            <Wand2 className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-semibold mb-2">AI-Powered Suggestions</h3>
          <p className="text-sm text-muted-foreground">
            Get intelligent suggestions to enhance your post
          </p>
        </Card>
        
        <Card className="text-center p-6">
          <div className="p-3 bg-green-500/10 rounded-lg w-fit mx-auto mb-4">
            <Users className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="font-semibold mb-2">Community Verified</h3>
          <p className="text-sm text-muted-foreground">
            Connect with trusted neighbors in your area
          </p>
        </Card>
        
        <Card className="text-center p-6">
          <div className="p-3 bg-purple-500/10 rounded-lg w-fit mx-auto mb-4">
            <Shield className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="font-semibold mb-2">Secure & Safe</h3>
          <p className="text-sm text-muted-foreground">
            Advanced verification ensures everyone is real
          </p>
        </Card>
      </div>

      {/* Quick Start Button */}
      <div className="text-center mb-8">
        <Button 
          onClick={() => setShowWizard(true)} 
          size="lg" 
          className="flex items-center gap-2 mx-auto"
          disabled={!canPost}
        >
          <Plus className="h-5 w-5" />
          Create New Post
        </Button>
        <p className="text-sm text-muted-foreground mt-2">
          Use our step-by-step wizard for the best experience
        </p>
      </div>

      {/* Original Form (Hidden by default for new users) */}
      {!isNewUser && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Post a Task or Offer a Service</CardTitle>
            <CardDescription>Fill out the details below to find help or offer your skills.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>What are you posting?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col space-y-1"
                          disabled={!canPost}
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="task" />
                            </FormControl>
                            <FormLabel className="font-normal">
                             I need something done (a Task)
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="service" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              I am offering my help (a Service)
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <fieldset disabled={!canPost}>
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormDescription>
                          Be specific and descriptive. Avoid generic terms like "help needed" or "service required."
                        </FormDescription>
                        <FormControl>
                          <Input 
                            placeholder={`${placeholderExamples.task} or ${placeholderExamples.service}`}
                            {...field} 
                            onKeyDown={handleTitleKeyDown} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="relative mt-8">
                    <Button type="button" variant="outline" size="sm" onClick={handleSuggest} disabled={isSuggesting || !canPost} className={isGlowing ? "absolute -top-4 right-0 glow-effect" : "absolute -top-4 right-0"}>
                      <Wand2 className="mr-2 h-4 w-4" />
                      {isSuggesting ? "Suggesting..." : "Suggest Details"}
                    </Button>
                  </div>

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        
                        {/* Category Search Input */}
                        <div className="relative mb-2">
                          <Input
                            type="text"
                            placeholder="Search categories..."
                            value={categorySearch}
                            onChange={(e) => setCategorySearch(e.target.value)}
                            className="w-full"
                          />
                          {categorySearch && (
                            <button
                              type="button"
                              onClick={() => setCategorySearch('')}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        <Select onValueChange={field.onChange} value={field.value} disabled={!canPost}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(groupedCategories).map(([emoji, categories]) => (
                              <SelectGroup key={emoji}>
                                <SelectLabel>{emoji} {getCategoryGroupName(emoji)}</SelectLabel>
                                {categories.map(category => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {/* Search Results Summary */}
                        {categorySearch && (
                          <div className="mt-2 text-sm text-gray-600">
                            Found {filteredCategories.length} category{filteredCategories.length !== 1 ? 'ies' : 'y'}
                            {filteredCategories.length === 0 && ' - No matches found'}
                          </div>
                        )}
                        
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="mt-8">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your task or service in detail..."
                            className="resize-none"
                            {...field}
                            />
                        </FormControl>
                        <FormDescription>
                          Include specific requirements, timeline, experience needed, or what makes your service unique. Be detailed and professional.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Content Quality Feedback */}
                  <ContentQualityFeedback
                    title={form.watch("title")}
                    description={form.watch("description")}
                    onQualityChange={setQualityResult}
                    className="mt-4"
                  />
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2 mt-8">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Makati, Metro Manila" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pay"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget / Rate (PHP)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g., 1500" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </fieldset>
                <Button type="submit" size="lg" className="w-full mt-8" disabled={isSubmitting || isSuggesting || !canPost}>
                  {isSubmitting ? "Loading..." : "Submit Post"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Posting Wizard */}
      <PostingWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        canPost={canPost}
      />

      {/* Fixmotech Assistant */}
      <FixmotechAssistant
        context="post"
        title="Post Assistant"
        placeholder="Ask about creating posts, categories, payments..."
        showSuggestions={true}
      />

      {/* Verification Modal */}
      <VerificationModal
        isOpen={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
      />
    </div>
  );
}

export default function PostPage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <PostPageContent />
    </React.Suspense>
  );
}
