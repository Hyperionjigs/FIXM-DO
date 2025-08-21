
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Task } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, Truck, BookOpen, Calendar, Sparkles, MapPin, Tag, MessageSquare, CheckCircle, PartyPopper } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { NotificationService } from '@/lib/notifications';
import { getPHPSymbol } from '@/lib/currency-utils';

const categoryIcons: Record<string, React.ElementType> = {
  'Home Services': Home,
  'Delivery': Truck,
  'Tutoring': BookOpen,
  'Events': Calendar,
  'Other': Sparkles,
};

function PostDetailPageContent() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    const id = typeof params.id === 'string' ? params.id : '';
    const [post, setPost] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const fetchPost = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const docRef = doc(db, 'posts', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setPost({ id: docSnap.id, ...docSnap.data() } as Task);
            } else {
                console.log("No such document!");
                setPost(null);
            }
        } catch (error) {
            console.error("Error fetching post:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to load the post.' });
        } finally {
            setLoading(false);
        }
    }, [id, toast]);

    useEffect(() => {
        fetchPost();
    }, [fetchPost]);
    
    const handleAction = async (newStatus: 'claimed' | 'completed') => {
        if (!user || !post) return;
        setIsActionLoading(true);

        const taskRef = doc(db, 'posts', post.id);

        try {
            let updateData: any = { status: newStatus };
            if (newStatus === 'claimed') {
                updateData.taskerId = user.uid;
                updateData.taskerName = user.displayName;
                updateData.taskerPhotoURL = user.photoURL;
            }
            await updateDoc(taskRef, updateData);

            // Create notifications based on the action
            if (newStatus === 'claimed') {
                // Notify the task author that their task was accepted
                await NotificationService.notifyTaskAccepted(
                    post.id,
                    post.title,
                    post.authorId,
                    user.displayName || 'Anonymous'
                );
            } else if (newStatus === 'completed') {
                // Notify both parties about task completion
                await NotificationService.notifyTaskCompleted(
                    post.id,
                    post.title,
                    post.authorId,
                    user.uid,
                    post.authorName
                );
            }

            toast({
                title: 'Success!',
                description: `Task has been marked as ${newStatus}.`
            });
            // Re-fetch post data to show the latest status
            await fetchPost();
            router.push('/dashboard'); // Redirect to dashboard to see the task in the correct tab
        } catch (error) {
            console.error(`Error updating task to ${newStatus}:`, error);
            toast({ variant: 'destructive', title: 'Action Failed', description: 'There was an error performing this action.' });
        } finally {
            setIsActionLoading(false);
        }
    };


    if (loading) {
        return <PostDetailSkeleton />;
    }

    if (!post) {
        return (
             <div className="container mx-auto max-w-4xl px-4 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Post Not Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>The post you are looking for does not exist or has been removed.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    const isOwner = user?.uid === post.authorId;
    const isTasker = user?.uid === post.taskerId;
    const canAccept = user && !isOwner && post.status === 'open';
    const canMarkComplete = user && isTasker && post.status === 'claimed';
    const canConfirmCompletion = user && isOwner && post.status === 'claimed';


    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'open': return 'secondary';
            case 'claimed': return 'default';
            case 'completed': return 'outline';
            default: return 'secondary';
        }
    }

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            <Card className="overflow-hidden">
                <CardHeader className="bg-muted/30 p-6">
                     <div className="flex items-center gap-2 mb-2">
                        <Badge variant={post.type === 'task' ? 'destructive' : 'secondary'}>
                            {post.type === 'task' ? 'Task' : 'Service'}
                        </Badge>
                        <Badge variant="outline">{post.category}</Badge>
                         <Badge variant={getStatusBadgeVariant(post.status)} className="capitalize">{post.status}</Badge>
                    </div>
                    <CardTitle className="font-headline text-4xl">{post.title}</CardTitle>
                    <div className="flex items-center gap-4 text-muted-foreground pt-2">
                         <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{post.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            <span className="font-semibold text-primary text-lg">{getPHPSymbol()}{post.pay.toLocaleString()}</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <h3 className="text-xl font-bold mb-4">Details</h3>
                        <p className="text-foreground/80 whitespace-pre-wrap">{post.description}</p>
                    </div>
                    <div className="space-y-6">
                        <div>
                             <h3 className="text-xl font-bold mb-4">{post.type === 'task' ? 'Posted by' : 'Offered by'}</h3>
                             <Link href={`/profile/${post.authorId}`} className="flex items-center gap-4 group">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={post.authorPhotoURL || "https://placehold.co/64x64"} alt={post.authorName} data-ai-hint="profile person"/>
                                    <AvatarFallback>{post.authorName?.[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-bold text-lg group-hover:underline">{post.authorName}</p>
                                </div>
                            </Link>
                        </div>

                        {post.taskerId && (
                             <div>
                                 <h3 className="text-xl font-bold mb-4">Accepted by</h3>
                                 <Link href={`/profile/${post.taskerId}`} className="flex items-center gap-4 group">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src={post.taskerPhotoURL || "https://placehold.co/64x64"} alt={post.taskerName} data-ai-hint="profile person"/>
                                        <AvatarFallback>{post.taskerName?.[0].toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-bold text-lg group-hover:underline">{post.taskerName}</p>
                                    </div>
                                </Link>
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            { canAccept && (
                                <Button size="lg" onClick={() => handleAction('claimed')} disabled={isActionLoading}>
                                    <CheckCircle className="mr-2 h-5 w-5" />
                                    {isActionLoading ? 'Accepting...' : (post.type === 'task' ? 'Accept Task' : 'Book Service')}
                                </Button>
                            )}
                            { canMarkComplete && (
                                <Button size="lg" onClick={() => handleAction('completed')} disabled={isActionLoading}>
                                    <PartyPopper className="mr-2 h-5 w-5" />
                                    {isActionLoading ? 'Completing...' : 'Mark as Complete'}
                                </Button>
                            )}
                            { canConfirmCompletion && (
                               <div className="p-4 bg-secondary rounded-lg text-center">
                                 <p className="text-sm text-secondary-foreground">The tasker has marked this as complete. You can confirm and leave a review from your dashboard.</p>
                                 <Button className="mt-2" size="sm" onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
                               </div>
                            )}

                             <Button size="lg" variant="outline">
                                <MessageSquare className="mr-2 h-5 w-5" />
                                {post.type === 'task' ? 'Contact Poster' : 'Contact Seller'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function PostDetailSkeleton() {
    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
             <Card className="overflow-hidden">
                <CardHeader className="bg-muted/30 p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-24" />
                    </div>
                    <Skeleton className="h-10 w-3/4 mt-2" />
                    <div className="flex items-center gap-4 pt-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-24" />
                    </div>
                </CardHeader>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <Skeleton className="h-6 w-32 mb-4" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>
                    </div>
                    <div className="space-y-6">
                         <div>
                            <Skeleton className="h-6 w-32 mb-4" />
                             <div className="flex items-center gap-4">
                                <Skeleton className="h-16 w-16 rounded-full" />
                                <div className="w-full space-y-2">
                                    <Skeleton className="h-6 w-3/4" />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function PostDetailPage() {
    return (
        <React.Suspense fallback={<PostDetailSkeleton />}>
            <PostDetailPageContent />
        </React.Suspense>
    )
}
