"use client";

import { useState, useEffect, useCallback } from 'react';
import { Appointment, AppointmentStatus, AppointmentType } from '@/types';

interface UseAppointmentsOptions {
  userId: string;
  role: 'client' | 'tasker';
  status?: AppointmentStatus;
  limit?: number;
}

interface UseAppointmentsReturn {
  appointments: Appointment[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Appointment | null>;
  updateAppointmentStatus: (appointmentId: string, status: AppointmentStatus, notes?: string) => Promise<boolean>;
  cancelAppointment: (appointmentId: string, reason?: string) => Promise<boolean>;
}

export function useAppointments({
  userId,
  role,
  status,
  limit = 50
}: UseAppointmentsOptions): UseAppointmentsReturn {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        userId,
        role,
        limit: limit.toString()
      });

      if (status) {
        params.append('status', status);
      }

      const response = await fetch(`/api/appointments/user?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch appointments');
      console.error('Error fetching appointments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, role, status, limit]);

  const createAppointment = useCallback(async (
    appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Appointment | null> => {
    try {
      const response = await fetch('/api/appointments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointment),
      });

      if (!response.ok) {
        throw new Error('Failed to create appointment');
      }

      const data = await response.json();
      const newAppointment = data.appointment;

      // Add the new appointment to the list
      setAppointments(prev => [newAppointment, ...prev]);

      return newAppointment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create appointment');
      console.error('Error creating appointment:', err);
      return null;
    }
  }, []);

  const updateAppointmentStatus = useCallback(async (
    appointmentId: string,
    status: AppointmentStatus,
    notes?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes }),
      });

      if (!response.ok) {
        throw new Error('Failed to update appointment status');
      }

      // Update the appointment in the list
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === appointmentId
            ? { ...appointment, status, notes: notes || appointment.notes }
            : appointment
        )
      );

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update appointment status');
      console.error('Error updating appointment status:', err);
      return false;
    }
  }, []);

  const cancelAppointment = useCallback(async (
    appointmentId: string,
    reason?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel appointment');
      }

      // Update the appointment status to cancelled
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === appointmentId
            ? { ...appointment, status: 'cancelled', notes: reason || appointment.notes }
            : appointment
        )
      );

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel appointment');
      console.error('Error cancelling appointment:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    isLoading,
    error,
    refetch: fetchAppointments,
    createAppointment,
    updateAppointmentStatus,
    cancelAppointment,
  };
} 