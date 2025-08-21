"use client";

import React, { useState } from 'react';
import { Appointment, AppointmentType, AppointmentStatus } from '@/types';

interface AppointmentCalendarProps {
  userId: string;
  role: 'client' | 'tasker';
  onAppointmentSelect?: (appointment: Appointment) => void;
}

export function AppointmentCalendar({ userId, role, onAppointmentSelect }: AppointmentCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Appointment Calendar</h2>
      <p>Selected date: {date?.toDateString()}</p>
    </div>
  );
} 