import { collection, addDoc, query, where, orderBy, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Report } from '@/types';

export class ReportService {
  /**
   * Create a new report
   */
  static async createReport(report: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, 'reports'), {
        ...report,
        createdAt: now,
        updatedAt: now,
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  }

  /**
   * Get all reports for a user (if they're an admin)
   */
  static async getAllReports(): Promise<Report[]> {
    try {
      const q = query(
        collection(db, 'reports'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report));
    } catch (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
  }

  /**
   * Get reports created by a specific user
   */
  static async getUserReports(userId: string): Promise<Report[]> {
    try {
      const q = query(
        collection(db, 'reports'),
        where('reporterId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report));
    } catch (error) {
      console.error('Error fetching user reports:', error);
      return [];
    }
  }

  /**
   * Update report status
   */
  static async updateReportStatus(reportId: string, status: Report['status'], adminNotes?: string): Promise<void> {
    try {
      const reportRef = doc(db, 'reports', reportId);
      const updateData: any = { 
        status, 
        updatedAt: Timestamp.now() 
      };
      
      if (adminNotes) {
        updateData.adminNotes = adminNotes;
      }
      
      await updateDoc(reportRef, updateData);
    } catch (error) {
      console.error('Error updating report status:', error);
      throw error;
    }
  }

  /**
   * Report a user
   */
  static async reportUser(
    reporterId: string,
    reporterName: string,
    reportedUserId: string,
    reportType: Report['reportType'],
    description: string
  ): Promise<string> {
    return this.createReport({
      reporterId,
      reporterName,
      reportedUserId,
      reportType,
      description,
      status: 'pending',
    });
  }

  /**
   * Report a task/post
   */
  static async reportTask(
    reporterId: string,
    reporterName: string,
    reportedTaskId: string,
    reportType: Report['reportType'],
    description: string
  ): Promise<string> {
    return this.createReport({
      reporterId,
      reporterName,
      reportedTaskId,
      reportType,
      description,
      status: 'pending',
    });
  }

  /**
   * Get report statistics
   */
  static async getReportStats(): Promise<{
    total: number;
    pending: number;
    reviewed: number;
    resolved: number;
    dismissed: number;
  }> {
    try {
      const reports = await this.getAllReports();
      return {
        total: reports.length,
        pending: reports.filter(r => r.status === 'pending').length,
        reviewed: reports.filter(r => r.status === 'reviewed').length,
        resolved: reports.filter(r => r.status === 'resolved').length,
        dismissed: reports.filter(r => r.status === 'dismissed').length,
      };
    } catch (error) {
      console.error('Error getting report stats:', error);
      return {
        total: 0,
        pending: 0,
        reviewed: 0,
        resolved: 0,
        dismissed: 0,
      };
    }
  }
} 