"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, AlertCircle } from 'lucide-react';
import { useLocation } from '@/hooks/use-location';

interface LocationPermissionProps {
  onGranted?: () => void;
  className?: string;
}

export function LocationPermission({ onGranted, className }: LocationPermissionProps) {
  const { location, loading, error, getLocation } = useLocation();
  const [requesting, setRequesting] = useState(false);

  const handleRequestPermission = async () => {
    setRequesting(true);
    try {
      await getLocation();
      if (onGranted) {
        onGranted();
      }
    } catch (err) {
      console.error('Failed to get location permission:', err);
    } finally {
      setRequesting(false);
    }
  };

  if (location) {
    return null; // Don't show if location is already available
  }

  return (
    <div className={`flex items-center gap-2 p-2 bg-muted/50 rounded-lg ${className}`}>
      <AlertCircle className="h-4 w-4 text-amber-500" />
      <div className="flex-1">
        <p className="text-sm font-medium">Location Access</p>
        <p className="text-xs text-muted-foreground">
          Enable location to see local tasks and services
        </p>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={handleRequestPermission}
        disabled={requesting || loading}
        className="flex items-center gap-1"
      >
        <MapPin className="h-3 w-3" />
        {requesting || loading ? 'Getting...' : 'Enable'}
      </Button>
    </div>
  );
} 