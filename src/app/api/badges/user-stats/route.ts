import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BadgeSystem, UserStats } from '@/lib/badge-system';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID is required' 
      }, { status: 400 });
    }

    // Fetch user's completed tasks
    const tasksQuery = query(
      collection(db, 'posts'),
      where('authorId', '==', userId),
      where('status', '==', 'completed'),
      orderBy('createdAt', 'desc')
    );
    const tasksSnapshot = await getDocs(tasksQuery);
    const completedTasks = tasksSnapshot.docs.length;

    // Fetch tasks where user was the tasker
    const taskerQuery = query(
      collection(db, 'posts'),
      where('taskerId', '==', userId),
      where('status', '==', 'completed'),
      orderBy('createdAt', 'desc')
    );
    const taskerSnapshot = await getDocs(taskerQuery);
    const taskerCompletedTasks = taskerSnapshot.docs.length;

    // Fetch reviews for the user
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('revieweeId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const reviewsSnapshot = await getDocs(reviewsQuery);
    const reviews = reviewsSnapshot.docs.map(doc => doc.data());

    // Calculate review statistics
    const totalReviews = reviews.length;
    const positiveReviews = reviews.filter(review => review.rating >= 4).length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews 
      : 0;

    // Fetch user verification status (you'll need to implement this based on your verification system)
    // For now, we'll use placeholder values
    const profileVerified = true; // This should come from your verification system
    const photoVerified = true; // This should come from your verification system

    // Calculate response and completion rates
    // These would need to be calculated based on your business logic
    const responseRate = 95; // Placeholder - should be calculated from actual data
    const completionRate = 98; // Placeholder - should be calculated from actual data

    // Fetch mentorship count (if you have a mentorship system)
    const mentorshipCount = 0; // Placeholder

    // Staff recognition (admin-managed)
    const staffRecognition = false; // Placeholder

    // Check for first task milestones
    const firstTaskPosted = completedTasks > 0;
    const firstTaskAccepted = taskerCompletedTasks > 0;
    const firstTaskCompleted = (completedTasks + taskerCompletedTasks) > 0;

    const userStats: UserStats = {
      tasksCompleted: completedTasks + taskerCompletedTasks,
      averageRating,
      totalReviews,
      positiveReviews,
      responseRate,
      completionRate,
      profileVerified,
      photoVerified,
      mentorshipCount,
      staffRecognition,
      firstTaskPosted,
      firstTaskAccepted,
      firstTaskCompleted
    };

    return NextResponse.json({ 
      success: true, 
      userStats 
    });
  } catch (error: any) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch user stats' 
    }, { status: 500 });
  }
} 