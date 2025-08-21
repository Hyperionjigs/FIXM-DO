"use client";

import { AvailabilityManager } from '@/components/availability-manager';
import { useAuth } from '@/hooks/use-auth';

export default function AvailabilityPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Manage Availability</h1>
          <p className="text-muted-foreground">Please log in to manage your availability.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Manage Your Availability</h1>
        <p className="text-muted-foreground">
          Set your working hours and availability for each day of the week.
        </p>
      </div>

      <AvailabilityManager taskerId={user.uid} />
    </div>
  );
} 