/**
 * Scheduling Service
 * 
 * Handles appointment booking, availability management, and calendar operations
 */

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  Firestore,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Appointment, 
  AppointmentStatus, 
  AppointmentType, 
  AvailabilitySlot, 
  ScheduleBlock 
} from '@/types';

export class SchedulingService {
  private static readonly APPOINTMENTS_COLLECTION = 'appointments';
  private static readonly AVAILABILITY_COLLECTION = 'availability_slots';
  private static readonly SCHEDULE_BLOCKS_COLLECTION = 'schedule_blocks';

  /**
   * Create a new appointment
   */
  static async createAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    try {
      const now = Timestamp.now();
      const appointmentData: Omit<Appointment, 'id'> = {
        ...appointment,
        createdAt: now,
        updatedAt: now,
        reminderSent: false
      };

      const docRef = await addDoc(
        collection(db as Firestore, this.APPOINTMENTS_COLLECTION), 
        appointmentData
      );

      return {
        id: docRef.id,
        ...appointmentData
      };
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw new Error('Failed to create appointment');
    }
  }

  /**
   * Get appointments for a user (client or tasker)
   */
  static async getUserAppointments(
    userId: string, 
    role: 'client' | 'tasker',
    status?: AppointmentStatus,
    limitCount: number = 50
  ): Promise<Appointment[]> {
    try {
      const field = role === 'client' ? 'clientId' : 'taskerId';
      let q = query(
        collection(db as Firestore, this.APPOINTMENTS_COLLECTION),
        where(field, '==', userId),
        orderBy('startTime', 'desc'),
        limit(limitCount)
      );

      if (status) {
        q = query(
          collection(db as Firestore, this.APPOINTMENTS_COLLECTION),
          where(field, '==', userId),
          where('status', '==', status),
          orderBy('startTime', 'desc'),
          limit(limitCount)
        );
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
    } catch (error) {
      console.error('Error getting user appointments:', error);
      throw new Error('Failed to get appointments');
    }
  }

  /**
   * Update appointment status
   */
  static async updateAppointmentStatus(
    appointmentId: string, 
    status: AppointmentStatus,
    notes?: string
  ): Promise<void> {
    try {
      const appointmentRef = doc(db as Firestore, this.APPOINTMENTS_COLLECTION, appointmentId);
      const updateData: Partial<Appointment> = {
        status,
        updatedAt: Timestamp.now()
      };

      if (notes) {
        updateData.notes = notes;
      }

      await updateDoc(appointmentRef, updateData);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw new Error('Failed to update appointment status');
    }
  }

  /**
   * Cancel appointment
   */
  static async cancelAppointment(appointmentId: string, reason?: string): Promise<void> {
    await this.updateAppointmentStatus(appointmentId, 'cancelled', reason);
  }

  /**
   * Get appointment by ID
   */
  static async getAppointment(appointmentId: string): Promise<Appointment | null> {
    try {
      const docRef = doc(db as Firestore, this.APPOINTMENTS_COLLECTION, appointmentId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Appointment;
    } catch (error) {
      console.error('Error getting appointment:', error);
      throw new Error('Failed to get appointment');
    }
  }

  /**
   * Check if a time slot is available for a tasker
   */
  static async isTimeSlotAvailable(
    taskerId: string,
    startTime: Timestamp,
    endTime: Timestamp
  ): Promise<boolean> {
    try {
      // Check for existing appointments in the time slot
      const appointmentsQuery = query(
        collection(db as Firestore, this.APPOINTMENTS_COLLECTION),
        where('taskerId', '==', taskerId),
        where('startTime', '<', endTime),
        where('endTime', '>', startTime),
        where('status', 'in', ['pending', 'confirmed'])
      );

      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      if (!appointmentsSnapshot.empty) {
        return false;
      }

      // Check for schedule blocks
      const blocksQuery = query(
        collection(db as Firestore, this.SCHEDULE_BLOCKS_COLLECTION),
        where('taskerId', '==', taskerId),
        where('startDate', '<=', startTime),
        where('endDate', '>=', endTime),
        where('isBlocked', '==', true)
      );

      const blocksSnapshot = await getDocs(blocksQuery);
      if (!blocksSnapshot.empty) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking time slot availability:', error);
      throw new Error('Failed to check availability');
    }
  }

  /**
   * Set availability slots for a tasker
   */
  static async setAvailabilitySlots(
    taskerId: string,
    slots: Omit<AvailabilitySlot, 'id' | 'taskerId' | 'createdAt' | 'updatedAt'>[]
  ): Promise<void> {
    try {
      const batch = writeBatch(db as Firestore);
      const now = Timestamp.now();

      // Delete existing slots for this tasker
      const existingSlotsQuery = query(
        collection(db as Firestore, this.AVAILABILITY_COLLECTION),
        where('taskerId', '==', taskerId)
      );
      const existingSlots = await getDocs(existingSlotsQuery);
      existingSlots.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Add new slots
      slots.forEach(slot => {
        const slotData: Omit<AvailabilitySlot, 'id'> = {
          ...slot,
          taskerId,
          createdAt: now,
          updatedAt: now
        };
        const docRef = doc(collection(db as Firestore, this.AVAILABILITY_COLLECTION));
        batch.set(docRef, slotData);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error setting availability slots:', error);
      throw new Error('Failed to set availability slots');
    }
  }

  /**
   * Get availability slots for a tasker
   */
  static async getAvailabilitySlots(taskerId: string): Promise<AvailabilitySlot[]> {
    try {
      const q = query(
        collection(db as Firestore, this.AVAILABILITY_COLLECTION),
        where('taskerId', '==', taskerId),
        orderBy('dayOfWeek', 'asc'),
        orderBy('startTime', 'asc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AvailabilitySlot[];
    } catch (error) {
      console.error('Error getting availability slots:', error);
      throw new Error('Failed to get availability slots');
    }
  }

  /**
   * Create a schedule block (unavailable time)
   */
  static async createScheduleBlock(block: Omit<ScheduleBlock, 'id' | 'createdAt'>): Promise<ScheduleBlock> {
    try {
      const now = Timestamp.now();
      const blockData: Omit<ScheduleBlock, 'id'> = {
        ...block,
        createdAt: now
      };

      const docRef = await addDoc(
        collection(db as Firestore, this.SCHEDULE_BLOCKS_COLLECTION),
        blockData
      );

      return {
        id: docRef.id,
        ...blockData
      };
    } catch (error) {
      console.error('Error creating schedule block:', error);
      throw new Error('Failed to create schedule block');
    }
  }

  /**
   * Get schedule blocks for a tasker
   */
  static async getScheduleBlocks(
    taskerId: string,
    startDate?: Timestamp,
    endDate?: Timestamp
  ): Promise<ScheduleBlock[]> {
    try {
      let q = query(
        collection(db as Firestore, this.SCHEDULE_BLOCKS_COLLECTION),
        where('taskerId', '==', taskerId),
        orderBy('startDate', 'asc')
      );

      if (startDate && endDate) {
        q = query(
          collection(db as Firestore, this.SCHEDULE_BLOCKS_COLLECTION),
          where('taskerId', '==', taskerId),
          where('startDate', '>=', startDate),
          where('endDate', '<=', endDate),
          orderBy('startDate', 'asc')
        );
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ScheduleBlock[];
    } catch (error) {
      console.error('Error getting schedule blocks:', error);
      throw new Error('Failed to get schedule blocks');
    }
  }

  /**
   * Delete a schedule block
   */
  static async deleteScheduleBlock(blockId: string): Promise<void> {
    try {
      await deleteDoc(doc(db as Firestore, this.SCHEDULE_BLOCKS_COLLECTION, blockId));
    } catch (error) {
      console.error('Error deleting schedule block:', error);
      throw new Error('Failed to delete schedule block');
    }
  }

  /**
   * Get upcoming appointments for a user
   */
  static async getUpcomingAppointments(
    userId: string,
    role: 'client' | 'tasker',
    limitCount: number = 10
  ): Promise<Appointment[]> {
    try {
      const now = Timestamp.now();
      const field = role === 'client' ? 'clientId' : 'taskerId';
      
      const q = query(
        collection(db as Firestore, this.APPOINTMENTS_COLLECTION),
        where(field, '==', userId),
        where('startTime', '>=', now),
        where('status', 'in', ['pending', 'confirmed']),
        orderBy('startTime', 'asc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
    } catch (error) {
      console.error('Error getting upcoming appointments:', error);
      throw new Error('Failed to get upcoming appointments');
    }
  }

  /**
   * Send appointment reminders
   */
  static async sendAppointmentReminders(): Promise<void> {
    try {
      const now = Timestamp.now();
      const reminderTime = new Date(now.toDate().getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
      const reminderTimestamp = Timestamp.fromDate(reminderTime);

      const q = query(
        collection(db as Firestore, this.APPOINTMENTS_COLLECTION),
        where('startTime', '>=', now),
        where('startTime', '<=', reminderTimestamp),
        where('status', 'in', ['pending', 'confirmed']),
        where('reminderSent', '==', false)
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db as Firestore);

      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          reminderSent: true,
          reminderSentAt: now
        });
      });

      await batch.commit();

      // Here you would integrate with your notification service
      // to send actual reminders to users
      console.log(`Sent reminders for ${snapshot.docs.length} appointments`);
    } catch (error) {
      console.error('Error sending appointment reminders:', error);
      throw new Error('Failed to send appointment reminders');
    }
  }
} 