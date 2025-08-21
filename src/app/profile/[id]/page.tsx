
// src/app/profile/[id]/page.tsx

"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, Timestamp, orderBy, limit } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Edit, 
  Star, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  MessageCircle, 
  Award, 
  Shield, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Users,
  Briefcase,
  Heart,
  Share2,
  Flag,
  MoreHorizontal,
  ExternalLink,
  Globe
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import TaskCard from '@/components/task-card';
import type { Task, Review } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { ReportDialog } from '@/components/report-dialog';
import { UserBadge } from '@/components/user-badge';
import { BadgeSystem } from '@/lib/badge-system';
import { getPHPSymbol } from '@/lib/currency-utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface UserProfile {
  uid: string;
  name: string;
  email?: string;
  bio: string;
  photoURL?: string;
  location?: string;
  memberSince: string | null;
  phone?: string;
  website?: string;
  skills?: string[];
  availability?: {
    status: 'available' | 'busy' | 'unavailable';
    schedule?: string;
    responseTime?: string;
  };
  verification?: {
    email: boolean;
    phone: boolean;
    identity: boolean;
    background: boolean;
  };
  preferences?: {
    maxDistance?: number;
    hourlyRate?: number;
    preferredCategories?: string[];
  };
}

interface UserStats {
  totalPosts: number;
  completedTasks: number;
  totalEarnings: number;
  responseRate: number;
  averageResponseTime: number;
  repeatClients: number;
  memberSince: string;
}

const UserProfilePage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  
  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
    : 0;

  const fetchProfileData = useCallback(async () => {
    console.log('fetchProfileData called with userId:', userId);
    if (!userId) return;
    setLoading(true);
    try {
        let profileData: UserProfile | null = null;
        const isOwnProfile = currentUser && currentUser.uid === userId;
        console.log('Current user:', currentUser?.uid, 'Profile userId:', userId, 'isOwnProfile:', isOwnProfile);

        // Fetch user's tasks
        let tasks: Task[] = [];
        let fetchedReviews: Review[] = [];
        
        try {
            const tasksQuery = query(
              collection(db, "posts"), 
              where("authorId", "==", userId),
              orderBy("createdAt", "desc")
            );
            const tasksSnapshot = await getDocs(tasksQuery);
            tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
            console.log('Fetched tasks:', tasks.length);
        } catch (tasksError) {
            console.log('Tasks query failed, using empty array:', tasksError);
            tasks = [];
        }
        setUserTasks(tasks);

        // Fetch reviews
        try {
            const reviewsQuery = query(
              collection(db, "reviews"), 
              where("revieweeId", "==", userId),
              orderBy("createdAt", "desc"),
              limit(10)
            );
            const reviewsSnapshot = await getDocs(reviewsQuery);
            fetchedReviews = reviewsSnapshot.docs.map(doc => doc.data() as Review);
            console.log('Fetched reviews:', fetchedReviews.length);
        } catch (reviewsError) {
            console.log('Reviews query failed, using empty array:', reviewsError);
            fetchedReviews = [];
        }
        setReviews(fetchedReviews);
        
        // Calculate stats
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        const totalEarnings = tasks
          .filter(task => task.status === 'completed' && task.budget)
          .reduce((sum, task) => sum + (task.budget || 0), 0);
        
        const stats: UserStats = {
          totalPosts: tasks.length,
          completedTasks,
          totalEarnings,
          responseRate: 95,
          averageResponseTime: 2.5,
          repeatClients: 3,
          memberSince: currentUser?.metadata.creationTime 
            ? new Date(currentUser.metadata.creationTime).toLocaleDateString() 
            : 'Recently'
        };
        setUserStats(stats);
        
        // Construct comprehensive profile
        if (isOwnProfile && currentUser) {
            console.log('Creating profile for own user');
            profileData = {
                uid: currentUser.uid,
                name: currentUser.displayName || currentUser.email?.split('@')[0] || 'New User',
                email: currentUser.email || '',
                photoURL: currentUser.photoURL || undefined,
                bio: 'A valued member of the FixMo community. I\'m passionate about helping others and building connections in our neighborhood.',
                location: 'Manila, Philippines',
                memberSince: currentUser.metadata.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : null,
                phone: '+63 912 345 6789',
                website: 'https://example.com',
                skills: ['Plumbing', 'Electrical Work', 'Home Repairs', 'Gardening', 'Cleaning'],
                availability: {
                  status: 'available',
                  schedule: 'Mon-Fri 9AM-6PM, Sat 10AM-4PM',
                  responseTime: 'Usually responds within 2 hours'
                },
                verification: {
                  email: true,
                  phone: true,
                  identity: false,
                  background: false
                },
                preferences: {
                  maxDistance: 10,
                  hourlyRate: 500,
                  preferredCategories: ['Home Repairs', 'Cleaning', 'Gardening']
                }
            };
        } else if (tasks.length > 0) {
            const firstTask = tasks[0];
            profileData = {
                 uid: firstTask.authorId,
                 name: firstTask.authorName,
                 photoURL: firstTask.authorPhotoURL,
                 bio: 'A valued member of the FixMo community. I\'m dedicated to providing quality services and building trust with my clients.',
                 location: firstTask.location,
                 memberSince: null,
                 phone: '+63 912 345 6789',
                 website: 'https://example.com',
                 skills: ['Home Repairs', 'Cleaning', 'Gardening', 'Pet Care'],
                 availability: {
                   status: 'available',
                   schedule: 'Mon-Fri 9AM-6PM',
                   responseTime: 'Usually responds within 4 hours'
                 },
                 verification: {
                   email: true,
                   phone: true,
                   identity: false,
                   background: false
                 },
                 preferences: {
                   maxDistance: 15,
                   hourlyRate: 400,
                   preferredCategories: ['Home Repairs', 'Cleaning']
                 }
            };
        } else {
            // Fallback for users with no posts - create a basic profile
            console.log('Creating fallback profile for user:', userId, 'isOwnProfile:', isOwnProfile, 'currentUser:', !!currentUser);
            profileData = {
                uid: userId,
                name: 'User',
                email: '',
                photoURL: undefined,
                bio: 'A valued member of the FixMo community.',
                location: 'Manila, Philippines',
                memberSince: null,
                phone: '+63 912 345 6789',
                website: 'https://example.com',
                skills: ['Home Repairs', 'Cleaning', 'Gardening'],
                availability: {
                  status: 'available',
                  schedule: 'Mon-Fri 9AM-6PM',
                  responseTime: 'Usually responds within 4 hours'
                },
                verification: {
                  email: true,
                  phone: true,
                  identity: false,
                  background: false
                },
                preferences: {
                  maxDistance: 15,
                  hourlyRate: 400,
                  preferredCategories: ['Home Repairs', 'Cleaning']
                }
            };
        }
        
        console.log('Final profileData:', profileData);
        if (!profileData) {
            console.log('No profile data created! This should not happen.');
        }
        setProfile(profileData);

    } catch (err) {
      console.error("Error fetching profile data:", err);
    } finally {
      setLoading(false);
    }
  }, [userId, currentUser]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  console.log('Rendering profile page - loading:', loading, 'profile:', profile);
  if (!profile) {
    return (
        <div className="container mx-auto py-8 text-center">
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>User Not Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Could not find a profile for this user. They may not have created any posts yet.</p>
                    <p className="text-sm text-muted-foreground mt-2">Debug: loading={loading.toString()}, userId={userId}</p>
                </CardContent>
            </Card>
        </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.uid === userId;

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'unavailable': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-4 w-4" />;
      case 'busy': return <Clock className="h-4 w-4" />;
      case 'unavailable': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header Section */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row items-start gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center lg:items-start gap-4">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-primary">
                  <AvatarImage src={profile.photoURL} alt={profile.name} />
                  <AvatarFallback className="text-2xl">{profile.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <UserBadge 
                  userStats={BadgeSystem.calculateUserStats({
                    tasksCompleted: userStats?.completedTasks || 0,
                    averageRating: reviews.length > 0 ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length : 0,
                    totalReviews: reviews.length,
                    positiveReviews: reviews.filter(review => review.rating >= 4).length,
                    responseRate: userStats?.responseRate || 100,
                    completionRate: 100, // Default for now
                    profileVerified: profile?.verification?.email || false,
                    photoVerified: profile?.verification?.identity || false,
                    mentorshipCount: 0, // Default for now
                    staffRecognition: false, // Default for now
                    firstTaskPosted: userTasks.length > 0,
                    firstTaskAccepted: userTasks.length > 0,
                    firstTaskCompleted: userStats?.completedTasks || 0 > 0
                  })}
                  size="sm" 
                  className="absolute -bottom-2 -right-2"
                />
              </div>
              
              {/* Availability Badge */}
              {profile.availability && (
                <Badge className={`flex items-center gap-1 ${getAvailabilityColor(profile.availability.status)}`}>
                  {getAvailabilityIcon(profile.availability.status)}
                  <span className="capitalize">{profile.availability.status}</span>
                </Badge>
              )}
            </div>

            {/* Main Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold truncate">{profile.name}</h1>
                  </div>
                  
                  {profile.location && (
                    <div className="flex items-center text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{profile.location}</span>
                    </div>
                  )}

                  {/* Rating */}
                  {reviews.length > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-5 h-5 ${i < averageRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="font-semibold">{averageRating.toFixed(1)}</span>
                      <span className="text-muted-foreground">({reviews.length} reviews)</span>
                    </div>
                  )}

                  <p className="text-foreground/80 mb-4">{profile.bio}</p>

                  {/* Skills */}
                  {profile.skills && profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {profile.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  {isOwnProfile ? (
                    <Button onClick={() => router.push('/dashboard')}>
                      <Edit className="mr-2 h-4 w-4"/>
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button>
                        <MessageCircle className="mr-2 h-4 w-4"/>
                        Message
                      </Button>
                      <Button variant="outline">
                        <Heart className="mr-2 h-4 w-4"/>
                        Follow
                      </Button>
                    </>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share Profile
                      </DropdownMenuItem>
                      {!isOwnProfile && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => setIsReportDialogOpen(true)}
                          >
                            <Flag className="mr-2 h-4 w-4" />
                            Report User
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      {userStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{userStats.totalPosts}</p>
                  <p className="text-sm text-muted-foreground">Total Posts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{userStats.completedTasks}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{getPHPSymbol()}{userStats.totalEarnings.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{userStats.repeatClients}</p>
                  <p className="text-sm text-muted-foreground">Repeat Clients</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="posts">Posts ({userTasks.length})</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* About Section */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground/80">{profile.bio}</p>
                
                {profile.availability && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Availability</h4>
                    <div className="flex items-center gap-2">
                      <Badge className={getAvailabilityColor(profile.availability.status)}>
                        {getAvailabilityIcon(profile.availability.status)}
                        <span className="ml-1 capitalize">{profile.availability.status}</span>
                      </Badge>
                    </div>
                    {profile.availability.schedule && (
                      <p className="text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        {profile.availability.schedule}
                      </p>
                    )}
                    {profile.availability.responseTime && (
                      <p className="text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 inline mr-1" />
                        {profile.availability.responseTime}
                      </p>
                    )}
                  </div>
                )}

                {profile.preferences && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Preferences</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {profile.preferences.maxDistance && (
                        <div>
                          <span className="text-muted-foreground">Max Distance:</span>
                          <p className="font-medium">{profile.preferences.maxDistance} km</p>
                        </div>
                      )}
                      {profile.preferences.hourlyRate && (
                        <div>
                          <span className="text-muted-foreground">Hourly Rate:</span>
                          <p className="font-medium">{getPHPSymbol()}{profile.preferences.hourlyRate}/hr</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Verification & Stats */}
            <div className="space-y-6">
              {/* Verification Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile.verification && Object.entries(profile.verification).map(([key, verified]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{key}</span>
                      {verified ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Response Stats */}
              {userStats && (
                <Card>
                  <CardHeader>
                    <CardTitle>Response Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Response Rate</span>
                      <span className="font-semibold">{userStats.responseRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Avg Response Time</span>
                      <span className="font-semibold">{userStats.averageResponseTime}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Member Since</span>
                      <span className="font-semibold">{userStats.memberSince}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="posts" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              {isOwnProfile ? "My Posts" : `${profile.name}'s Posts`}
            </h2>
            {isOwnProfile && (
              <Button onClick={() => router.push('/post')}>
                Create New Post
              </Button>
            )}
          </div>
          
          {userTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userTasks.map(task => <TaskCard key={task.id} task={task} />)}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  {isOwnProfile ? "You haven't posted any tasks or services yet." : "This user hasn't posted anything yet."}
                </p>
                {isOwnProfile && (
                  <Button onClick={() => router.push('/post')}>Create Your First Post</Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Reviews</h2>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
                <span className="text-muted-foreground">({reviews.length} reviews)</span>
              </div>
            )}
          </div>
          
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{review.reviewerName?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{review.reviewerName}</p>
                          <p className="text-sm text-muted-foreground">
                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recently'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-foreground/90">{review.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No reviews yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{profile.email}</p>
                    </div>
                  </div>
                )}
                
                {profile.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{profile.phone}</p>
                    </div>
                  </div>
                )}
                
                {profile.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Website</p>
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                        {profile.website}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            {!isOwnProfile && (
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                    <Button variant="outline">
                      <Phone className="mr-2 h-4 w-4" />
                      Call Now
                    </Button>
                    <Button variant="outline">
                      <Heart className="mr-2 h-4 w-4" />
                      Follow
                    </Button>
                    <Button variant="outline">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <ReportDialog
        isOpen={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        reportedUserId={userId}
        reportedUserName={profile?.name}
      />
    </div>
  );
};

const ProfileSkeleton = () => {
    return (
         <div className="container mx-auto px-4 py-8 max-w-7xl">
            <Card className="mb-8">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row items-start gap-6">
                        <Skeleton className="h-32 w-32 rounded-full" />
                        <div className="flex-1 space-y-3">
                             <Skeleton className="h-8 w-48" />
                             <Skeleton className="h-5 w-32" />
                             <Skeleton className="h-5 w-40" />
                             <Skeleton className="h-12 w-full" />
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
            
            <div className="space-y-6">
              <Skeleton className="h-10 w-48" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="h-64 w-full lg:col-span-2" />
                <Skeleton className="h-64 w-full" />
              </div>
            </div>
         </div>
    );
}

export default UserProfilePage;
