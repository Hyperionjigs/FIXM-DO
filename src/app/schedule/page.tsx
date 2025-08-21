"use client";

import { AppointmentCalendar } from '@/components/appointment-calendar';
import { useAuth } from '@/hooks/use-auth';

export default function SchedulePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Schedule</h1>
          <p className="text-muted-foreground">Please log in to view your schedule.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Schedule & Appointments</h1>
        <p className="text-muted-foreground">
          Manage your appointments and schedule new meetings with taskers.
        </p>
      </div>

      <AppointmentCalendar
        userId={user.uid}
        role="client" // You can make this dynamic based on user role
        onAppointmentSelect={(appointment) => {
          console.log('Selected appointment:', appointment);
        }}
      />
    </div>
  );
} 