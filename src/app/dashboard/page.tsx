
"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import TaskCard from "@/components/task-card";
import type { Task, Review } from "@/types";
import { Timestamp, collection, query, where, getDocs, addDoc, doc, updateDoc } from "firebase/firestore";
import { AlertTriangle, Star, Shield, UserCheck } from "lucide-react";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop, type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth";
import { useVerificationStatus } from "@/hooks/use-verification-status";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

import { NotificationService } from "@/lib/notifications";
import PotMoneyDonation from "@/components/pot-money-donation";
import { BonusService } from "@/lib/bonus-service";
import { ProfileCompletionReminder } from "@/components/profile-completion-reminder";
import { UserBadge } from "@/components/user-badge";
import { BadgeSystem } from "@/lib/badge-system";
import { getPHPSymbol } from "@/lib/currency-utils";

import { VerificationModal } from "@/components/verification-modal";

function PlaceholderContent({ title, description, action }: { title: string; description: string, action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// Helper to get the cropped image
function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): Promise<string> {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return Promise.reject(new Error('Failed to get canvas context'));
  }

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );
  
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }
      resolve(URL.createObjectURL(blob));
    }, 'image/png');
  });
}

function ReviewDialog({ task, isOpen, onOpenChange, onReviewSubmitted }: { task: Task; isOpen: boolean; onOpenChange: (open: boolean) => void; onReviewSubmitted: () => void; }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const personToReview = user?.uid === task.authorId ? task.taskerId : task.authorId;
    const personToReviewName = user?.uid === task.authorId ? task.taskerName : task.authorName;

    const handleSubmit = async () => {
        if (!user || !personToReview) return;
        if (rating === 0) {
            toast({ variant: 'destructive', title: 'Rating required', description: 'Please select a star rating.' });
            return;
        }
        setIsSubmitting(true);
        try {
            // 1. Add the review
            await addDoc(collection(db, 'reviews'), {
                taskId: task.id,
                revieweeId: personToReview,
                reviewerId: user.uid,
                reviewerName: user.displayName,
                rating,
                comment,
                createdAt: Timestamp.now(),
            });

            // 2. Update the task to mark that a review has been left
            const taskRef = doc(db, 'posts', task.id);
            if (user.uid === task.authorId) {
                await updateDoc(taskRef, { clientHasReviewed: true });
            } else {
                 await updateDoc(taskRef, { taskerHasReviewed: true });
            }

            // 3. Create notification for the person being reviewed
            await NotificationService.notifyNewReview(
                'temp-review-id', // We don't have the review ID yet, but we can use the task info
                task.title,
                personToReview,
                user.displayName || 'Anonymous'
            );

            toast({ title: 'Review Submitted!', description: `Your review for ${personToReviewName} has been recorded.` });
            onReviewSubmitted();
            onOpenChange(false);
        } catch (error) {
            console.error("Error submitting review: ", error);
            toast({ variant: 'destructive', title: 'Submission Failed', description: 'There was an error submitting your review.' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Reset state when dialog opens/closes
    useEffect(() => {
      if (!isOpen) {
        setRating(0);
        setComment('');
      }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Leave a Review for {personToReviewName}</DialogTitle>
                    <DialogDescription>Your feedback is important for the community.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <div className="mb-4">
                        <label className="text-sm font-medium mb-2 block">Rating</label>
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-8 h-8 cursor-pointer ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                    onClick={() => setRating(i + 1)}
                                />
                            ))}
                        </div>
                    </div>
                    <div>
                         <label htmlFor="comment" className="text-sm font-medium mb-2 block">Comment (Optional)</label>
                         <Textarea
                            id="comment"
                            placeholder="Describe your experience..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit Review'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function DashboardPage() {
  const { user, updateUserProfile } = useAuth();
  const { verificationData, isVerified, isPending, canPost, loading: verificationLoading } = useVerificationStatus();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  const [postedTasks, setPostedTasks] = useState<Task[]>([]);
  const [acceptedTasks, setAcceptedTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [sourceImg, setSourceImg] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);


  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedTaskForReview, setSelectedTaskForReview] = useState<Task | null>(null);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
        const postsRef = collection(db, 'posts');
        
        // My Posted Tasks
        const postedQuery = query(postsRef, where('authorId', '==', user.uid));
        const postedSnapshot = await getDocs(postedQuery);
        const posted = postedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
        setPostedTasks(posted.filter(t => t.status !== 'completed'));

        // My Accepted Tasks
        const acceptedQuery = query(postsRef, where('taskerId', '==', user.uid));
        const acceptedSnapshot = await getDocs(acceptedQuery);
        const accepted = acceptedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
        setAcceptedTasks(accepted.filter(t => t.status !== 'completed'));

        // Completed Tasks (can be either author or tasker)
        const completedAuthorQuery = query(postsRef, where('authorId', '==', user.uid), where('status', '==', 'completed'));
        const completedTaskerQuery = query(postsRef, where('taskerId', '==', user.uid), where('status', '==', 'completed'));
        
        const [completedAuthorSnapshot, completedTaskerSnapshot] = await Promise.all([
            getDocs(completedAuthorQuery),
            getDocs(completedTaskerQuery)
        ]);
        
        const completedByAuthor = completedAuthorSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
        const completedByTasker = completedTaskerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));

        // Combine and remove duplicates
        const allCompleted = [...completedByAuthor, ...completedByTasker];
        const uniqueCompleted = Array.from(new Map(allCompleted.map(task => [task.id, task])).values());
        setCompletedTasks(uniqueCompleted);

    } catch (error) {
        console.error("Error fetching tasks: ", error);
        toast({ variant: 'destructive', title: 'Failed to load tasks', description: 'Could not fetch your tasks from the database.' });
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    if (user) {
        fetchTasks();
    }
  }, [user, fetchTasks]);

  const handlePhotoChange = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourceImg(reader.result as string);
        setIsCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropSave = async () => {
    if (completedCrop && imgRef.current && user) {
      setIsUploading(true);
      const croppedImageBlobUrl = await getCroppedImg(imgRef.current, completedCrop);
      
      const response = await fetch(croppedImageBlobUrl);
      const blob = await response.blob();
      const file = new File([blob], "profile.png", { type: "image/png" });
      
      try {
        await updateUserProfile(user.displayName || "User", file);
        setAvatarPreview(croppedImageBlobUrl);
      } catch (error) {
         console.error("Failed to upload new profile picture:", error);
         toast({ variant: "destructive", title: "Upload Failed", description: "There was an error uploading your photo."});
      } finally {
        setIsUploading(false);
        setIsCropDialogOpen(false);
      }
    }
  };
  
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, 1, width, height),
      width, height
    );
    setCrop(crop);
  };
  
  const handleReviewClick = (task: Task) => {
    setSelectedTaskForReview(task);
    setIsReviewDialogOpen(true);
  }

  const profileLink = user ? `/profile/${user.uid}` : '/login';

  const renderTaskList = (tasks: Task[], placeholderTitle: string, placeholderDesc: string, action?: React.ReactNode) => (
      tasks.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map(task => <TaskCard key={task.id} task={task} />)}
        </div>
        ) : (
        <PlaceholderContent title={placeholderTitle} description={placeholderDesc} action={action} />
      )
  );

  const renderCompletedTaskList = (tasks: Task[]) => (
    tasks.length > 0 ? (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map(task => {
              const amIClient = user?.uid === task.authorId;
              const hasReviewed = amIClient ? task.clientHasReviewed : task.taskerHasReviewed;
              return (
                  <div key={task.id} className="flex flex-col gap-2">
                    <TaskCard task={task} />
                    {!hasReviewed && (
                      <Button onClick={() => handleReviewClick(task)}>Leave a Review</Button>
                    )}
                     {hasReviewed && (
                      <Button variant="outline" disabled>Review Submitted</Button>
                    )}
                  </div>
              )
          })}
      </div>
      ) : (
      <PlaceholderContent title="No completed tasks yet" description="Completed tasks will appear here." />
    )
  );
  
  if (loading && !user) {
    return (
       <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Verification Status Alert */}
      {!verificationLoading && isPending && (
        <Alert className="mb-6 cursor-pointer hover:bg-destructive/10 transition-colors" onClick={() => setVerificationModalOpen(true)}>
          <Shield className="h-4 w-4" />
          <AlertTitle className="flex items-center justify-between">
            Verification Required: Complete Your Profile
            <Button variant="outline" size="sm" className="ml-2" onClick={(e) => { e.stopPropagation(); setVerificationModalOpen(true); }}>
              Verify Now
            </Button>
          </AlertTitle>
          <AlertDescription>
            For the safety and security of our community, you must complete identity verification before you can post tasks or services. Click here to start the verification process.
          </AlertDescription>
        </Alert>
      )}

      {/* Verification Status Badge */}
      {!verificationLoading && (
        <div className="mb-6">
          <div className="flex items-center gap-2">
            {isVerified ? (
              <div className="flex items-center gap-2 text-green-600">
                <UserCheck className="h-4 w-4" />
                <span className="font-medium">Verified</span>
              </div>
            ) : (
              <div 
                className="flex items-center gap-2 text-yellow-600 cursor-pointer hover:text-yellow-700 transition-colors"
                onClick={() => router.push('/photo-verification')}
              >
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Pending Verification</span>
                <span className="text-xs opacity-70">(Click to verify)</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col items-start gap-6 mb-8 md:flex-row md:items-center">
        <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-primary flex-shrink-0">
              <AvatarImage 
                src={avatarPreview || user?.photoURL || "https://placehold.co/96x96"} 
                alt={user?.displayName || "User"}
                className="object-cover aspect-square"
              />
              <AvatarFallback>{user?.displayName?.[0].toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
           <UserBadge 
             userStats={BadgeSystem.calculateUserStats({
               tasksCompleted: completedTasks.length,
               averageRating: completedTasks.length > 0 ? completedTasks.reduce((acc, task) => acc + (task.rating || 0), 0) / completedTasks.length : 0,
               totalReviews: completedTasks.length,
               positiveReviews: completedTasks.filter(task => (task.rating || 0) >= 4).length,
               responseRate: 100, // Default for now
               completionRate: 100, // Default for now
               profileVerified: isVerified,
               photoVerified: user?.verification?.photo || false,
               mentorshipCount: 0, // Default for now
               staffRecognition: false, // Default for now
               firstTaskPosted: postedTasks.length > 0,
               firstTaskAccepted: acceptedTasks.length > 0,
               firstTaskCompleted: completedTasks.length > 0
             })}
             size="sm" 
             className="absolute bottom-0 right-0"
           />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*"
            />
        </div>
        <div>
          <h1 className="text-4xl font-headline font-bold">{user?.displayName || "Your Name"}</h1>
          <p className="text-muted-foreground">Quezon City, Philippines</p>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={() => router.push(profileLink)}>Edit Profile</Button>
          </div>
        </div>
      </div>

      {/* Profile Completion Reminder */}
      <ProfileCompletionReminder className="mb-6" />
      
      <Tabs defaultValue="posted-tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:w-auto sm:grid-cols-4">
          <TabsTrigger value="posted-tasks">My Posted Tasks</TabsTrigger>
          <TabsTrigger value="accepted-tasks">My Accepted Tasks</TabsTrigger>
          <TabsTrigger value="completed-tasks">Completed Tasks</TabsTrigger>
          <TabsTrigger value="bonus-system">Bonus System</TabsTrigger>
        </TabsList>
        <TabsContent value="posted-tasks" className="mt-6">
          <Card className="border-none bg-transparent shadow-none">
            <CardHeader>
              <CardTitle>My Posted Tasks</CardTitle>
              <CardDescription>Tasks you have created and are looking for help with.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-24 w-full" /> : renderTaskList(postedTasks, "No posted tasks yet", "Create a new post to find help in your community.",  <Button onClick={() => router.push('/post')} disabled={!canPost}>Post a Task</Button>)}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="accepted-tasks" className="mt-6">
           <Card className="border-none bg-transparent shadow-none">
            <CardHeader>
              <CardTitle>My Accepted Tasks</CardTitle>
              <CardDescription>Tasks you have agreed to work on for others.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-24 w-full" /> : renderTaskList(acceptedTasks, "No accepted tasks", "Browse the homepage and offer your skills to others.", <Button onClick={() => router.push('/')}>Browse Tasks</Button>)}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="completed-tasks" className="mt-6">
           <Card className="border-none bg-transparent shadow-none">
            <CardHeader>
              <CardTitle>Completed Tasks</CardTitle>
              <CardDescription>A history of your completed jobs. Leave a review to help others.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-24 w-full" /> : renderCompletedTaskList(completedTasks)}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="bonus-system" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🎁</span>
                  Bonus System
                </CardTitle>
                <CardDescription>
                  Support taskers and earn random bonuses when completing tasks!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">How It Works</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• 30% chance of bonus on task completion</li>
                      <li>• Bonuses range from 1% to 10% of pot money</li>
                                  <li>• Maximum bonus: {getPHPSymbol()}500 per task</li>
            <li>• Minimum task amount: {getPHPSymbol()}100 to be eligible</li>
                    </ul>
                  </div>
                  <Button 
                    onClick={() => router.push('/test-bonus')} 
                    className="w-full"
                    variant="outline"
                  >
                    Test Bonus System
                  </Button>
                </div>
              </CardContent>
            </Card>
            <PotMoneyDonation />
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crop your photo</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            {sourceImg && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                minWidth={100}
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={sourceImg}
                  onLoad={onImageLoad}
                  style={{ maxHeight: '70vh' }}
                />
              </ReactCrop>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCropSave} disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
       {selectedTaskForReview && (
          <ReviewDialog 
              task={selectedTaskForReview} 
              isOpen={isReviewDialogOpen} 
              onOpenChange={setIsReviewDialogOpen}
              onReviewSubmitted={fetchTasks}
          />
        )}
        
              {/* Verification Modal */}
      <VerificationModal
        isOpen={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        onComplete={() => {
          setVerificationModalOpen(false);
          toast({
            title: "Verification Complete!",
            description: "You can now access all platform features.",
          });
          // Refresh verification status
          window.location.reload();
        }}
      />


    </div>
  );
}
