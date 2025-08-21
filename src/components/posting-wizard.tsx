"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  MapPin, 
  FileText,
  Wand2,
  Eye,
  Edit
} from "lucide-react";
import { getPHPSymbol } from "@/lib/currency-utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TaskCategoryEnum } from "@/types";
import { suggestDetails } from "@/ai/flows/suggest-details-flow";
import { useToast } from "@/hooks/use-toast";
import { createEnhancedFormSchema, assessContentQuality, ContentQualityResult } from "@/lib/content-quality";
import { ContentQualityFeedback } from "@/components/content-quality-feedback";
import { getRandomPlaceholder } from "@/lib/placeholder-examples";

const formSchema = createEnhancedFormSchema();

interface PostingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>;
  isSubmitting: boolean;
  canPost: boolean;
}

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

const steps = [
  {
    id: 1,
    title: "Basic Information",
    description: "What are you posting?",
    icon: FileText
  },
  {
    id: 2,
    title: "Details & Description",
    description: "Tell us more about it",
    icon: Wand2
  },
  {
    id: 3,
    title: "Location & Budget",
    description: "Where and how much?",
    icon: MapPin
  },
  {
    id: 4,
    title: "Review & Submit",
    description: "Final check before posting",
    icon: Eye
  }
];

export function PostingWizard({ isOpen, onClose, onSubmit, isSubmitting, canPost }: PostingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [qualityResult, setQualityResult] = useState<ContentQualityResult | null>(null);
  const [categorySearch, setCategorySearch] = useState('');
  const [taskPlaceholder] = useState(() => getRandomPlaceholder('task'));
  const [servicePlaceholder] = useState(() => getRandomPlaceholder('service'));
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "task",
      title: "",
      description: "",
      location: "",
      pay: 0,
    },
  });

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSuggest = async () => {
    const title = form.getValues("title");
    if (!title) {
      form.setError("title", { type: "manual", message: "Please enter a title first to get suggestions." });
      return;
    }
    setIsSuggesting(true);
    try {
      const result = await suggestDetails({
        userInput: title,
        postType: form.getValues("type"),
      });
      if (result.category) form.setValue("category", result.category);
      if (result.description) form.setValue("description", result.description);
      toast({
        title: "AI Suggestions Applied! ✨",
        description: "We've enhanced your post with intelligent suggestions.",
      });
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

  const handleSubmit = async () => {
    const values = form.getValues();
    
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

    await onSubmit(values);
  };

  const currentStepData = steps[currentStep - 1];

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">What are you posting?</h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                      <input
                        type="radio"
                        name="type"
                        value="task"
                        checked={form.watch("type") === "task"}
                        onChange={(e) => form.setValue("type", e.target.value as "task" | "service")}
                        className="text-primary"
                      />
                      <div>
                        <div className="font-medium">I need something done</div>
                        <div className="text-sm text-muted-foreground">Post a task you need help with</div>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                      <input
                        type="radio"
                        name="type"
                        value="service"
                        checked={form.watch("type") === "service"}
                        onChange={(e) => form.setValue("type", e.target.value as "task" | "service")}
                        className="text-primary"
                      />
                      <div>
                        <div className="font-medium">I am offering my help</div>
                        <div className="text-sm text-muted-foreground">Offer a service you can provide</div>
                      </div>
                    </label>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Give it a clear title</h3>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder={form.watch("type") === "task" ? taskPlaceholder : servicePlaceholder}
                      {...form.register("title")}
                      className="w-full p-3 border rounded-lg"
                    />
                    {form.formState.errors.title && (
                      <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Details & Description */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Category & Description</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSuggest}
                    disabled={isSuggesting || !form.watch("title")}
                  >
                    <Wand2 className="mr-2 h-4 w-4" />
                    {isSuggesting ? "Suggesting..." : "AI Suggestions"}
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-medium">Category</label>
                    
                    {/* Category Search Input */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search categories..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        className="w-full p-3 border rounded-lg mb-2"
                      />
                      {categorySearch && (
                        <button
                          type="button"
                          onClick={() => setCategorySearch('')}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Enhanced Category Dropdown */}
                    <div className="relative">
                      <select
                        {...form.register("category")}
                        className="w-full p-3 border rounded-lg"
                      >
                        <option value="">Select a category</option>
                        {Object.entries(groupedCategories).map(([emoji, categories]) => (
                          <optgroup key={emoji} label={`${emoji} ${getCategoryGroupName(emoji)}`}>
                            {categories.map(category => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      
                      {/* Search Results Summary */}
                      {categorySearch && (
                        <div className="mt-2 text-sm text-gray-600">
                          Found {filteredCategories.length} category{filteredCategories.length !== 1 ? 'ies' : 'y'}
                          {filteredCategories.length === 0 && ' - No matches found'}
                        </div>
                      )}
                    </div>
                    
                    {form.formState.errors.category && (
                      <p className="text-sm text-red-500">{form.formState.errors.category.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="font-medium">Description</label>
                    <textarea
                      placeholder="Include specific requirements, timeline, experience needed, or what makes your service unique. Be detailed and professional."
                      {...form.register("description")}
                      rows={4}
                      className="w-full p-3 border rounded-lg resize-none"
                    />
                    {form.formState.errors.description && (
                      <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
                    )}
                  </div>
                </div>

                {/* Content Quality Feedback */}
                <ContentQualityFeedback
                  title={form.watch("title")}
                  description={form.watch("description")}
                  onQualityChange={setQualityResult}
                  className="mt-4"
                />
              </div>
            </div>
          )}

          {/* Step 3: Location & Budget */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location
                  </h3>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="e.g., Makati, Metro Manila"
                      {...form.register("location")}
                      className="w-full p-3 border rounded-lg"
                    />
                    {form.formState.errors.location && (
                      <p className="text-sm text-red-500">{form.formState.errors.location.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <span className="text-2xl font-bold text-green-600">{getPHPSymbol()}</span>
                    {form.watch("type") === "task" ? "Budget" : "Rate"} (PHP)
                  </h3>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="e.g., 1500"
                      {...form.register("pay")}
                      className="w-full p-3 border rounded-lg"
                    />
                    {form.formState.errors.pay && (
                      <p className="text-sm text-red-500">{form.formState.errors.pay.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Review Your Post
                </h3>
                
                <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant={form.watch("type") === "task" ? "default" : "secondary"}>
                      {form.watch("type") === "task" ? "Task" : "Service"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {form.watch("category")}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-lg">{form.watch("title")}</h4>
                    <p className="text-muted-foreground mt-2">{form.watch("description")}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Location:</span>
                      <p className="font-medium">{form.watch("location")}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        {form.watch("type") === "task" ? "Budget:" : "Rate:"}
                      </span>
                      <p className="font-medium">{getPHPSymbol()}{form.watch("pay")?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Navigation */}
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
            
            {currentStep < steps.length ? (
              <Button
                onClick={handleNext}
                className="flex items-center gap-2"
                disabled={!canPost}
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !canPost}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Submit Post
                  </>
                )}
              </Button>
            )}
          </div>
          
          {/* Close option */}
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 