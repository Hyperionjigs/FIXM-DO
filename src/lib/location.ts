export interface LocationData {
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
}

export class LocationService {
  /**
   * Get user's current location using GPS
   */
  static async getCurrentLocation(): Promise<LocationData | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.log('Geolocation is not supported by this browser.');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            const locationData = await this.reverseGeocode(latitude, longitude);
            resolve(locationData);
          } catch (error) {
            console.error('Error getting location data:', error);
            resolve(null);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  /**
   * Reverse geocode coordinates to get city/town name
   */
  static async reverseGeocode(latitude: number, longitude: number): Promise<LocationData> {
    try {
      // Using OpenStreetMap Nominatim API (free and no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }

      const data = await response.json();
      
      return {
        city: data.address?.city || data.address?.town || data.address?.village || data.address?.municipality || 'Unknown City',
        region: data.address?.state || data.address?.province || 'Unknown Region',
        country: data.address?.country || 'Unknown Country',
        latitude,
        longitude
      };
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
      // Fallback to coordinates if geocoding fails
      return {
        city: 'Location Unavailable',
        region: 'Unknown Region',
        country: 'Unknown Country',
        latitude,
        longitude
      };
    }
  }

  /**
   * Get a formatted location string
   */
  static formatLocation(location: LocationData): string {
    return `${location.city}, ${location.region}`;
  }

  /**
   * Get just the city name
   */
  static getCityName(location: LocationData): string {
    return location.city;
  }
} 