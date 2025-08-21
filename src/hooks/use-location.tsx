import { useState, useEffect } from 'react';
import { LocationService, LocationData } from '@/lib/location';

export function useLocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getLocation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const locationData = await LocationService.getCurrentLocation();
      if (locationData) {
        setLocation(locationData);
      } else {
        setError('Unable to get location');
      }
    } catch (err) {
      setError('Failed to get location');
      console.error('Location error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  const refreshLocation = () => {
    getLocation();
  };

  return {
    location,
    loading,
    error,
    refreshLocation,
    getLocation
  };
} 