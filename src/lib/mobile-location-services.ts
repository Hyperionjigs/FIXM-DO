// Mobile Location Services for FixMo
// Real-time GPS tracking, geofencing, and location-based features

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: Date;
  provider: 'gps' | 'network' | 'passive';
}

export interface Geofence {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  type: 'task' | 'safety' | 'custom';
  taskId?: string;
  isActive: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface LocationPermission {
  granted: boolean;
  type: 'always' | 'whenInUse' | 'denied' | 'restricted';
  canRequest: boolean;
  lastRequested?: Date;
}

export interface RouteOptimization {
  origin: LocationData;
  destination: LocationData;
  waypoints: LocationData[];
  mode: 'driving' | 'walking' | 'bicycling' | 'transit';
  optimize: 'time' | 'distance' | 'traffic';
  avoid: string[];
  result: {
    distance: number; // in meters
    duration: number; // in seconds
    polyline: string;
    steps: RouteStep[];
  };
}

export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  maneuver: {
    type: string;
    instruction: string;
    bearing: number;
  };
  polyline: string;
}

export interface SafetyAlert {
  id: string;
  type: 'emergency' | 'sos' | 'location_share' | 'geofence_exit' | 'route_deviation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  location: LocationData;
  timestamp: Date;
  acknowledged: boolean;
  actionRequired: boolean;
  emergencyContacts?: string[];
}

export interface LocationConfig {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
  distanceFilter: number;
  enableGeofencing: boolean;
  enableRouteOptimization: boolean;
  enableSafetyFeatures: boolean;
  emergencyContacts: string[];
  autoLocationShare: boolean;
  locationHistoryRetention: number; // days
}

class MobileLocationServices {
  private static instance: MobileLocationServices;
  private config: LocationConfig;
  private currentLocation: LocationData | null = null;
  private locationHistory: LocationData[] = [];
  private geofences: Map<string, Geofence> = new Map();
  private activeGeofences: Set<string> = new Set();
  private safetyAlerts: SafetyAlert[] = [];
  private locationWatcher: any = null;
  private geofenceWatcher: any = null;
  private routeOptimizer: any = null;

  private constructor() {
    this.config = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes
      distanceFilter: 10, // 10 meters
      enableGeofencing: true,
      enableRouteOptimization: true,
      enableSafetyFeatures: true,
      emergencyContacts: [],
      autoLocationShare: false,
      locationHistoryRetention: 30
    };

    this.initializeLocationServices();
  }

  static getInstance(): MobileLocationServices {
    if (!MobileLocationServices.instance) {
      MobileLocationServices.instance = new MobileLocationServices();
    }
    return MobileLocationServices.instance;
  }

  private async initializeLocationServices(): Promise<void> {
    try {
      console.log('[Location] Initializing mobile location services...');
      
      // Check location permissions
      const permission = await this.checkLocationPermission();
      if (!permission.granted) {
        console.log('[Location] Location permission not granted');
        return;
      }

      // Start location tracking
      await this.startLocationTracking();
      
      // Initialize geofencing
      if (this.config.enableGeofencing) {
        await this.initializeGeofencing();
      }

      // Initialize route optimization
      if (this.config.enableRouteOptimization) {
        await this.initializeRouteOptimization();
      }

      console.log('[Location] Mobile location services initialized successfully');

    } catch (error) {
      console.error('[Location] Failed to initialize location services:', error);
    }
  }

  // Location permission management
  public async checkLocationPermission(): Promise<LocationPermission> {
    try {
      // In a real React Native app, this would use react-native-permissions
      const permission: LocationPermission = {
        granted: true, // Mock permission granted
        type: 'whenInUse',
        canRequest: false,
        lastRequested: new Date()
      };

      return permission;
    } catch (error) {
      console.error('[Location] Failed to check permission:', error);
      return {
        granted: false,
        type: 'denied',
        canRequest: true
      };
    }
  }

  public async requestLocationPermission(): Promise<LocationPermission> {
    try {
      // In a real React Native app, this would request permission
      console.log('[Location] Requesting location permission...');
      
      const permission: LocationPermission = {
        granted: true,
        type: 'whenInUse',
        canRequest: false,
        lastRequested: new Date()
      };

      if (permission.granted) {
        await this.startLocationTracking();
      }

      return permission;
    } catch (error) {
      console.error('[Location] Failed to request permission:', error);
      return {
        granted: false,
        type: 'denied',
        canRequest: true
      };
    }
  }

  // Location tracking
  public async startLocationTracking(): Promise<void> {
    try {
      if (this.locationWatcher) {
        this.stopLocationTracking();
      }

      // In a real React Native app, this would use react-native-geolocation-service
      this.locationWatcher = setInterval(async () => {
        const location = await this.getCurrentLocation();
        if (location) {
          this.updateCurrentLocation(location);
        }
      }, 5000); // Update every 5 seconds

      console.log('[Location] Location tracking started');
    } catch (error) {
      console.error('[Location] Failed to start location tracking:', error);
    }
  }

  public stopLocationTracking(): void {
    if (this.locationWatcher) {
      clearInterval(this.locationWatcher);
      this.locationWatcher = null;
      console.log('[Location] Location tracking stopped');
    }
  }

  private async getCurrentLocation(): Promise<LocationData | null> {
    try {
      // In a real React Native app, this would use Geolocation.getCurrentPosition
      const mockLocation: LocationData = {
        latitude: 10.3157 + (Math.random() - 0.5) * 0.01, // Cebu City area
        longitude: 123.8854 + (Math.random() - 0.5) * 0.01,
        accuracy: 5 + Math.random() * 10,
        altitude: 10 + Math.random() * 50,
        heading: Math.random() * 360,
        speed: Math.random() * 5,
        timestamp: new Date(),
        provider: 'gps'
      };

      return mockLocation;
    } catch (error) {
      console.error('[Location] Failed to get current location:', error);
      return null;
    }
  }

  private updateCurrentLocation(location: LocationData): void {
    this.currentLocation = location;
    this.locationHistory.push(location);

    // Keep only recent history
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - this.config.locationHistoryRetention);
    this.locationHistory = this.locationHistory.filter(loc => loc.timestamp > cutoff);

    // Check geofences
    if (this.config.enableGeofencing) {
      this.checkGeofences(location);
    }

    // Check safety conditions
    if (this.config.enableSafetyFeatures) {
      this.checkSafetyConditions(location);
    }

    // Auto-share location if enabled
    if (this.config.autoLocationShare) {
      this.shareLocation(location);
    }
  }

  // Geofencing
  private async initializeGeofencing(): Promise<void> {
    try {
      // In a real React Native app, this would use react-native-geofencing
      console.log('[Location] Geofencing initialized');
    } catch (error) {
      console.error('[Location] Failed to initialize geofencing:', error);
    }
  }

  public async createGeofence(
    name: string,
    latitude: number,
    longitude: number,
    radius: number,
    type: Geofence['type'] = 'custom',
    taskId?: string,
    expiresAt?: Date
  ): Promise<Geofence> {
    const geofence: Geofence = {
      id: this.generateGeofenceId(),
      name,
      latitude,
      longitude,
      radius,
      type,
      taskId,
      isActive: true,
      createdAt: new Date(),
      expiresAt
    };

    this.geofences.set(geofence.id, geofence);
    this.activeGeofences.add(geofence.id);

    console.log(`[Location] Created geofence: ${name} at (${latitude}, ${longitude})`);
    return geofence;
  }

  public async removeGeofence(geofenceId: string): Promise<void> {
    this.geofences.delete(geofenceId);
    this.activeGeofences.delete(geofenceId);
    console.log(`[Location] Removed geofence: ${geofenceId}`);
  }

  private checkGeofences(location: LocationData): void {
    for (const geofenceId of this.activeGeofences) {
      const geofence = this.geofences.get(geofenceId);
      if (!geofence || !geofence.isActive) continue;

      // Check if expired
      if (geofence.expiresAt && geofence.expiresAt < new Date()) {
        this.activeGeofences.delete(geofenceId);
        continue;
      }

      const distance = this.calculateDistance(
        location.latitude,
        location.longitude,
        geofence.latitude,
        geofence.longitude
      );

      if (distance <= geofence.radius) {
        this.triggerGeofenceEvent(geofence, 'enter', location);
      } else {
        this.triggerGeofenceEvent(geofence, 'exit', location);
      }
    }
  }

  private triggerGeofenceEvent(geofence: Geofence, event: 'enter' | 'exit', location: LocationData): void {
    const alert: SafetyAlert = {
      id: this.generateAlertId(),
      type: event === 'exit' ? 'geofence_exit' : 'location_share',
      severity: 'medium',
      message: `${event === 'enter' ? 'Entered' : 'Exited'} geofence: ${geofence.name}`,
      location,
      timestamp: new Date(),
      acknowledged: false,
      actionRequired: event === 'exit'
    };

    this.safetyAlerts.push(alert);
    console.log(`[Location] Geofence ${event}: ${geofence.name}`);
  }

  // Route optimization
  private async initializeRouteOptimization(): Promise<void> {
    try {
      // In a real React Native app, this would use Google Maps Directions API
      console.log('[Location] Route optimization initialized');
    } catch (error) {
      console.error('[Location] Failed to initialize route optimization:', error);
    }
  }

  public async optimizeRoute(
    origin: LocationData,
    destination: LocationData,
    waypoints: LocationData[] = [],
    mode: RouteOptimization['mode'] = 'driving',
    optimize: RouteOptimization['optimize'] = 'time',
    avoid: string[] = []
  ): Promise<RouteOptimization> {
    try {
      // In a real implementation, this would call Google Maps Directions API
      const distance = this.calculateDistance(
        origin.latitude,
        origin.longitude,
        destination.latitude,
        destination.longitude
      );

      const routeOptimization: RouteOptimization = {
        origin,
        destination,
        waypoints,
        mode,
        optimize,
        avoid,
        result: {
          distance,
          duration: distance * 2, // Mock duration (2 seconds per meter)
          polyline: this.generateMockPolyline(origin, destination),
          steps: this.generateMockRouteSteps(origin, destination)
        }
      };

      console.log(`[Location] Route optimized: ${distance.toFixed(0)}m, ${routeOptimization.result.duration.toFixed(0)}s`);
      return routeOptimization;

    } catch (error) {
      console.error('[Location] Failed to optimize route:', error);
      throw new Error('Route optimization failed');
    }
  }

  private generateMockPolyline(origin: LocationData, destination: LocationData): string {
    // In a real implementation, this would be a proper polyline encoding
    return `mock_polyline_${origin.latitude}_${origin.longitude}_${destination.latitude}_${destination.longitude}`;
  }

  private generateMockRouteSteps(origin: LocationData, destination: LocationData): RouteStep[] {
    return [
      {
        instruction: 'Start at current location',
        distance: 0,
        duration: 0,
        maneuver: {
          type: 'depart',
          instruction: 'Start',
          bearing: 0
        },
        polyline: ''
      },
      {
        instruction: 'Continue straight',
        distance: this.calculateDistance(origin.latitude, origin.longitude, destination.latitude, destination.longitude),
        duration: this.calculateDistance(origin.latitude, origin.longitude, destination.latitude, destination.longitude) * 2,
        maneuver: {
          type: 'arrive',
          instruction: 'Arrive at destination',
          bearing: 0
        },
        polyline: ''
      }
    ];
  }

  // Safety features
  private checkSafetyConditions(location: LocationData): void {
    // Check for unusual speed
    if (location.speed && location.speed > 20) { // 20 m/s = ~72 km/h
      this.createSafetyAlert('speed_warning', 'High speed detected', location, 'medium');
    }

    // Check for route deviation
    this.checkRouteDeviation(location);

    // Check for extended stationary time
    this.checkStationaryTime(location);
  }

  private checkRouteDeviation(location: LocationData): void {
    // In a real implementation, this would check against planned route
    // For now, we'll create a mock check
    if (Math.random() < 0.1) { // 10% chance of route deviation
      this.createSafetyAlert('route_deviation', 'Route deviation detected', location, 'medium');
    }
  }

  private checkStationaryTime(location: LocationData): void {
    // Check if user has been stationary for too long
    const recentLocations = this.locationHistory.filter(loc => 
      Date.now() - loc.timestamp.getTime() < 300000 // Last 5 minutes
    );

    if (recentLocations.length > 1) {
      const avgDistance = recentLocations.reduce((sum, loc, index) => {
        if (index === 0) return 0;
        return sum + this.calculateDistance(
          recentLocations[index - 1].latitude,
          recentLocations[index - 1].longitude,
          loc.latitude,
          loc.longitude
        );
      }, 0) / (recentLocations.length - 1);

      if (avgDistance < 5) { // Less than 5 meters movement
        this.createSafetyAlert('stationary_warning', 'Extended stationary time detected', location, 'low');
      }
    }
  }

  private createSafetyAlert(
    type: string,
    message: string,
    location: LocationData,
    severity: SafetyAlert['severity']
  ): void {
    const alert: SafetyAlert = {
      id: this.generateAlertId(),
      type: type as SafetyAlert['type'],
      severity,
      message,
      location,
      timestamp: new Date(),
      acknowledged: false,
      actionRequired: severity === 'high' || severity === 'critical',
      emergencyContacts: this.config.emergencyContacts
    };

    this.safetyAlerts.push(alert);
    console.log(`[Location] Safety alert created: ${message}`);
  }

  // Emergency features
  public async triggerSOS(location: LocationData): Promise<void> {
    try {
      const sosAlert: SafetyAlert = {
        id: this.generateAlertId(),
        type: 'sos',
        severity: 'critical',
        message: 'SOS triggered - Emergency assistance needed',
        location,
        timestamp: new Date(),
        acknowledged: false,
        actionRequired: true,
        emergencyContacts: this.config.emergencyContacts
      };

      this.safetyAlerts.push(sosAlert);

      // Share location with emergency contacts
      await this.shareLocationWithEmergencyContacts(location);

      // In a real implementation, this would also:
      // - Call emergency services
      // - Send notifications to trusted contacts
      // - Start continuous location tracking
      // - Record audio/video for evidence

      console.log('[Location] SOS triggered - Emergency assistance requested');
    } catch (error) {
      console.error('[Location] Failed to trigger SOS:', error);
    }
  }

  private async shareLocationWithEmergencyContacts(location: LocationData): Promise<void> {
    try {
      for (const contact of this.config.emergencyContacts) {
        await this.shareLocation(location, contact);
      }
    } catch (error) {
      console.error('[Location] Failed to share location with emergency contacts:', error);
    }
  }

  // Location sharing
  public async shareLocation(location: LocationData, recipient?: string): Promise<void> {
    try {
      const shareData = {
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          timestamp: location.timestamp
        },
        sharedAt: new Date(),
        recipient,
        expiresAt: new Date(Date.now() + 3600000) // 1 hour
      };

      // In a real implementation, this would:
      // - Send via push notification
      // - Store in database
      // - Generate shareable link
      // - Handle recipient permissions

      console.log(`[Location] Location shared${recipient ? ` with ${recipient}` : ''}`);
    } catch (error) {
      console.error('[Location] Failed to share location:', error);
    }
  }

  // Utility functions
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = this.toRadians(lat1);
    const φ2 = this.toRadians(lat2);
    const Δφ = this.toRadians(lat2 - lat1);
    const Δλ = this.toRadians(lon2 - lon1);

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private generateGeofenceId(): string {
    return `GEO-${Date.now()}-${Math.random().toString(16).substr(2, 8)}`;
  }

  private generateAlertId(): string {
    return `ALT-${Date.now()}-${Math.random().toString(16).substr(2, 8)}`;
  }

  // Public API methods
  public getCurrentLocation(): LocationData | null {
    return this.currentLocation;
  }

  public getLocationHistory(): LocationData[] {
    return [...this.locationHistory];
  }

  public getGeofences(): Geofence[] {
    return Array.from(this.geofences.values());
  }

  public getSafetyAlerts(): SafetyAlert[] {
    return [...this.safetyAlerts];
  }

  public getConfig(): LocationConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<LocationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public addEmergencyContact(contact: string): void {
    if (!this.config.emergencyContacts.includes(contact)) {
      this.config.emergencyContacts.push(contact);
    }
  }

  public removeEmergencyContact(contact: string): void {
    this.config.emergencyContacts = this.config.emergencyContacts.filter(c => c !== contact);
  }

  public async getLocationStats(): Promise<any> {
    const totalLocations = this.locationHistory.length;
    const totalGeofences = this.geofences.size;
    const activeAlerts = this.safetyAlerts.filter(alert => !alert.acknowledged).length;

    return {
      totalLocations,
      totalGeofences,
      activeAlerts,
      currentLocation: this.currentLocation,
      locationPermission: await this.checkLocationPermission(),
      emergencyContacts: this.config.emergencyContacts.length
    };
  }

  public clearLocationHistory(): void {
    this.locationHistory = [];
  }

  public acknowledgeAlert(alertId: string): void {
    const alert = this.safetyAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  }
}

// Export singleton instance
export const mobileLocationServices = MobileLocationServices.getInstance();

// Convenience functions
export async function getCurrentLocation(): Promise<LocationData | null> {
  return mobileLocationServices.getCurrentLocation();
}

export async function createGeofence(
  name: string,
  latitude: number,
  longitude: number,
  radius: number,
  type?: Geofence['type'],
  taskId?: string
): Promise<Geofence> {
  return mobileLocationServices.createGeofence(name, latitude, longitude, radius, type, taskId);
}

export async function triggerSOS(location: LocationData): Promise<void> {
  return mobileLocationServices.triggerSOS(location);
} 