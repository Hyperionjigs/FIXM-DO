import { collection, addDoc, query, where, orderBy, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Notification } from '@/types';

export class NotificationService {
  /**
   * Create a new notification for a user
   */
  static async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<void> {
    try {
      await addDoc(collection(db, 'notifications'), {
        ...notification,
        createdAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Get all notifications for a user
   */
  static async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  /**
   * Mark a notification as read
   */
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { isRead: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<void> {
    try {
      const notifications = await this.getUserNotifications(userId);
      const unreadNotifications = notifications.filter(n => !n.isRead);
      
      const updatePromises = unreadNotifications.map(notification => 
        this.markAsRead(notification.id!)
      );
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count for a user
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const notifications = await this.getUserNotifications(userId);
      return notifications.filter(n => !n.isRead).length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Create notification for task accepted
   */
  static async notifyTaskAccepted(taskId: string, taskTitle: string, authorId: string, taskerName: string): Promise<void> {
    await this.createNotification({
      userId: authorId,
      type: 'task_accepted',
      title: 'Task Accepted!',
      message: `${taskerName} has accepted your task: "${taskTitle}"`,
      data: { taskId, taskerName },
      isRead: false,
    });
  }

  /**
   * Create notification for task completed
   */
  static async notifyTaskCompleted(taskId: string, taskTitle: string, authorId: string, taskerId: string, authorName: string): Promise<void> {
    // Notify the task author
    await this.createNotification({
      userId: authorId,
      type: 'task_completed',
      title: 'Task Completed!',
      message: `Your task "${taskTitle}" has been marked as completed. Don't forget to leave a review!`,
      data: { taskId, taskerId },
      isRead: false,
    });

    // Notify the tasker
    await this.createNotification({
      userId: taskerId,
      type: 'task_completed',
      title: 'Task Completed!',
      message: `You've completed the task "${taskTitle}". The client will be notified to leave a review.`,
      data: { taskId, authorId },
      isRead: false,
    });
  }

  /**
   * Create notification for new review
   */
  static async notifyNewReview(reviewId: string, taskTitle: string, revieweeId: string, reviewerName: string): Promise<void> {
    await this.createNotification({
      userId: revieweeId,
      type: 'new_review',
      title: 'New Review Received!',
      message: `${reviewerName} left you a review for the task "${taskTitle}"`,
      data: { reviewId, taskTitle, reviewerName },
      isRead: false,
    });
  }

  /**
   * Create system notification
   */
  static async notifySystem(userId: string, title: string, message: string, data?: Record<string, any>): Promise<void> {
    await this.createNotification({
      userId,
      type: 'system',
      title,
      message,
      data,
      isRead: false,
    });
  }

  static async notifyNewReview(
    reviewId: string,
    taskTitle: string,
    userId: string,
    reviewerName: string
  ) {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId,
        type: 'review',
        title: 'New Review Received',
        message: `${reviewerName} left you a review for "${taskTitle}"`,
        reviewId,
        taskTitle,
        reviewerName,
        read: false,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error creating review notification:', error);
    }
  }

  static async notifyVerificationStatus(
    userId: string,
    status: 'approved' | 'rejected',
    adminNotes?: string
  ) {
    try {
      const title = status === 'approved' ? 'Verification Approved' : 'Verification Rejected';
      const message = status === 'approved' 
        ? 'Your verification has been approved! You can now post tasks and services.'
        : `Your verification was rejected. ${adminNotes ? `Reason: ${adminNotes}` : 'Please try again with better quality photos.'}`;

      await addDoc(collection(db, 'notifications'), {
        userId,
        type: 'verification',
        title,
        message,
        status,
        adminNotes,
        read: false,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error creating verification notification:', error);
    }
  }

  static async notifyNewTask(
    userId: string,
    taskTitle: string,
    taskId: string,
    authorName: string
  ) {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId,
        type: 'new_task',
        title: 'New Task Available',
        message: `${authorName} posted a new task: "${taskTitle}"`,
        taskId,
        taskTitle,
        authorName,
        read: false,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error creating task notification:', error);
    }
  }

  static async notifyTaskAccepted(
    userId: string,
    taskTitle: string,
    taskerName: string
  ) {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId,
        type: 'task_accepted',
        title: 'Task Accepted',
        message: `${taskerName} accepted your task: "${taskTitle}"`,
        taskTitle,
        taskerName,
        read: false,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error creating task acceptance notification:', error);
    }
  }

  static async notifyTaskCompleted(
    userId: string,
    taskTitle: string,
    completedBy: string
  ) {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId,
        type: 'task_completed',
        title: 'Task Completed',
        message: `${completedBy} marked your task as completed: "${taskTitle}"`,
        taskTitle,
        completedBy,
        read: false,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error creating task completion notification:', error);
    }
  }
} 