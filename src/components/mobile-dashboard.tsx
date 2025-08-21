"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smartphone, 
  MapPin, 
  Mic, 
  Camera, 
  CreditCard, 
  Fingerprint,
  Wifi,
  WifiOff,
  Bell,
  Shield,
  Zap,
  RefreshCw,
  Play,
  Pause,
  Settings,
  Navigation,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';
import { mobileLocationServices } from '@/lib/mobile-location-services';
import { mobileFeatures } from '@/lib/mobile-features';

interface MobileMetrics {
  location: {
    currentLocation: any;
    totalLocations: number;
    totalGeofences: number;
    activeAlerts: number;
    locationPermission: any;
    emergencyContacts: number;
  };
  features: {
    voiceRecognition: any;
    biometricAuth: any;
    offlineData: any;
    touchGestures: number;
    mobilePayments: number;
    config: any;
  };
  performance: {
    batteryLevel: number;
    networkStatus: 'online' | 'offline';
    appVersion: string;
    deviceInfo: string;
    lastSync: Date;
  };
}

export default function MobileDashboard() {
  const [metrics, setMetrics] = useState<MobileMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [locationTracking, setLocationTracking] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);

  useEffect(() => {
    loadMobileData();
    const interval = setInterval(loadMobileData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadMobileData = async () => {
    setLoading(true);
    try {
      const [locationStats, mobileStats] = await Promise.all([
        mobileLocationServices.getLocationStats(),
        mobileFeatures.getMobileStats()
      ]);

      const mobileMetrics: MobileMetrics = {
        location: {
          currentLocation: locationStats.currentLocation,
          totalLocations: locationStats.totalLocations,
          totalGeofences: locationStats.totalGeofences,
          activeAlerts: locationStats.activeAlerts,
          locationPermission: locationStats.locationPermission,
          emergencyContacts: locationStats.emergencyContacts
        },
        features: {
          voiceRecognition: mobileStats.voiceRecognition,
          biometricAuth: mobileStats.biometricAuth,
          offlineData: mobileStats.offlineData,
          touchGestures: mobileStats.touchGestures,
          mobilePayments: mobileStats.mobilePayments,
          config: mobileStats.config
        },
        performance: {
          batteryLevel: Math.floor(Math.random() * 30) + 70, // 70-100%
          networkStatus: Math.random() > 0.1 ? 'online' : 'offline',
          appVersion: '1.0.0',
          deviceInfo: 'iPhone 15 Pro',
          lastSync: new Date()
        }
      };

      setMetrics(mobileMetrics);
      setLocationTracking(!!locationStats.currentLocation);

    } catch (error) {
      console.error('[Mobile] Failed to load mobile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLocationTracking = async () => {
    try {
      if (locationTracking) {
        mobileLocationServices.stopLocationTracking();
        setLocationTracking(false);
      } else {
        await mobileLocationServices.startLocationTracking();
        setLocationTracking(true);
      }
    } catch (error) {
      console.error('[Mobile] Failed to toggle location tracking:', error);
    }
  };

  const toggleVoiceRecognition = async () => {
    try {
      if (voiceListening) {
        const transcript = await mobileFeatures.stopVoiceRecognition();
        setVoiceListening(false);
        console.log('Voice transcript:', transcript);
      } else {
        await mobileFeatures.startVoiceRecognition();
        setVoiceListening(true);
      }
    } catch (error) {
      console.error('[Mobile] Failed to toggle voice recognition:', error);
    }
  };

  const captureImage = async () => {
    try {
      const image = await mobileFeatures.captureImage('high');
      console.log('Image captured:', image);
    } catch (error) {
      console.error('[Mobile] Failed to capture image:', error);
    }
  };

  const authenticateBiometrics = async () => {
    try {
      const success = await mobileFeatures.authenticateWithBiometrics();
      console.log('Biometric authentication:', success ? 'success' : 'failed');
    } catch (error) {
      console.error('[Mobile] Failed to authenticate with biometrics:', error);
    }
  };

  const triggerSOS = async () => {
    try {
      const location = mobileLocationServices.getCurrentLocation();
      if (location) {
        await mobileLocationServices.triggerSOS(location);
        console.log('SOS triggered');
      }
    } catch (error) {
      console.error('[Mobile] Failed to trigger SOS:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mobile Dashboard</h1>
            <p className="text-gray-600">Mobile-specific features and location services</p>
          </div>
          <Button disabled>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Loading...
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold">Failed to load mobile data</h3>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mobile Dashboard</h1>
          <p className="text-gray-600">Mobile-specific features and location services</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={loadMobileData} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Button
          variant={locationTracking ? "default" : "outline"}
          onClick={toggleLocationTracking}
          className="flex flex-col items-center space-y-2 h-20"
        >
          <MapPin className="h-5 w-5" />
          <span className="text-xs">Location</span>
        </Button>

        <Button
          variant={voiceListening ? "default" : "outline"}
          onClick={toggleVoiceRecognition}
          className="flex flex-col items-center space-y-2 h-20"
        >
          <Mic className="h-5 w-5" />
          <span className="text-xs">Voice</span>
        </Button>

        <Button
          variant="outline"
          onClick={captureImage}
          className="flex flex-col items-center space-y-2 h-20"
        >
          <Camera className="h-5 w-5" />
          <span className="text-xs">Camera</span>
        </Button>

        <Button
          variant="outline"
          onClick={authenticateBiometrics}
          className="flex flex-col items-center space-y-2 h-20"
        >
          <Fingerprint className="h-5 w-5" />
          <span className="text-xs">Biometric</span>
        </Button>

        <Button
          variant="outline"
          onClick={triggerSOS}
          className="flex flex-col items-center space-y-2 h-20 bg-red-50 border-red-200 hover:bg-red-100"
        >
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <span className="text-xs text-red-600">SOS</span>
        </Button>

        <Button
          variant="outline"
          className="flex flex-col items-center space-y-2 h-20"
        >
          <Settings className="h-5 w-5" />
          <span className="text-xs">Settings</span>
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-600">Location Tracking</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{metrics.location.totalLocations}</span>
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Total locations recorded
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Geofences</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{metrics.location.totalGeofences}</span>
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Active geofences
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium text-gray-600">Battery</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{metrics.performance.batteryLevel}%</span>
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Battery level
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              {metrics.performance.networkStatus === 'online' ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-500" />
              )}
              <span className="text-sm font-medium text-gray-600">Network</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold capitalize">{metrics.performance.networkStatus}</span>
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Connection status
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="flex w-full flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <TabsTrigger value="overview" className="flex-1 sm:flex-none">Overview</TabsTrigger>
          <TabsTrigger value="location" className="flex-1 sm:flex-none">Location Services</TabsTrigger>
          <TabsTrigger value="features" className="flex-1 sm:flex-none">Mobile Features</TabsTrigger>
          <TabsTrigger value="performance" className="flex-1 sm:flex-none">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Location Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Location Services</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Location Permission</span>
                  <Badge variant={metrics.location.locationPermission.granted ? "default" : "destructive"}>
                    {metrics.location.locationPermission.granted ? 'Granted' : 'Denied'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Location Tracking</span>
                  <Badge variant={locationTracking ? "default" : "secondary"}>
                    {locationTracking ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Emergency Contacts</span>
                  <span className="font-semibold">{metrics.location.emergencyContacts}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Alerts</span>
                  <span className="font-semibold text-red-600">{metrics.location.activeAlerts}</span>
                </div>
              </CardContent>
            </Card>

            {/* Mobile Features Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Smartphone className="h-5 w-5" />
                  <span>Mobile Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Voice Recognition</span>
                  <Badge variant={metrics.features.voiceRecognition.isSupported ? "default" : "secondary"}>
                    {metrics.features.voiceRecognition.isSupported ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Biometric Auth</span>
                  <Badge variant={metrics.features.biometricAuth.isSupported ? "default" : "secondary"}>
                    {metrics.features.biometricAuth.isSupported ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Offline Mode</span>
                  <Badge variant={metrics.features.offlineData.syncStatus === 'synced' ? "default" : "secondary"}>
                    {metrics.features.offlineData.syncStatus}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Touch Gestures</span>
                  <span className="font-semibold">{metrics.features.touchGestures}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="location" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Navigation className="h-5 w-5" />
                  <span>Current Location</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {metrics.location.currentLocation ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Latitude:</span>
                        <div className="font-mono">{metrics.location.currentLocation.latitude.toFixed(6)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Longitude:</span>
                        <div className="font-mono">{metrics.location.currentLocation.longitude.toFixed(6)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Accuracy:</span>
                        <div>{metrics.location.currentLocation.accuracy.toFixed(1)}m</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Provider:</span>
                        <div className="capitalize">{metrics.location.currentLocation.provider}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Last updated: {metrics.location.currentLocation.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>No location data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Geofences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Geofences</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Geofences</span>
                    <span className="font-semibold">{metrics.location.totalGeofences}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Alerts</span>
                    <span className="font-semibold text-red-600">{metrics.location.activeAlerts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Emergency Contacts</span>
                    <span className="font-semibold">{metrics.location.emergencyContacts}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Voice Recognition */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mic className="h-5 w-5" />
                  <span>Voice Recognition</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge variant={voiceListening ? "default" : "secondary"}>
                    {voiceListening ? 'Listening' : 'Idle'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Language</span>
                  <span className="font-semibold">{metrics.features.voiceRecognition.language}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Confidence</span>
                  <span className="font-semibold">{(metrics.features.voiceRecognition.confidence * 100).toFixed(1)}%</span>
                </div>

                {metrics.features.voiceRecognition.transcript && (
                  <div>
                    <span className="text-sm text-gray-600">Last Transcript</span>
                    <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
                      "{metrics.features.voiceRecognition.transcript}"
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Biometric Authentication */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Fingerprint className="h-5 w-5" />
                  <span>Biometric Authentication</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Type</span>
                  <span className="font-semibold capitalize">{metrics.features.biometricAuth.type}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Supported</span>
                  <Badge variant={metrics.features.biometricAuth.isSupported ? "default" : "secondary"}>
                    {metrics.features.biometricAuth.isSupported ? 'Yes' : 'No'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Enabled</span>
                  <Badge variant={metrics.features.biometricAuth.isEnabled ? "default" : "secondary"}>
                    {metrics.features.biometricAuth.isEnabled ? 'Yes' : 'No'}
                  </Badge>
                </div>

                {metrics.features.biometricAuth.lastUsed && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Used</span>
                    <span className="text-sm">{metrics.features.biometricAuth.lastUsed.toLocaleTimeString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Device Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Device Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Battery Level</span>
                    <span>{metrics.performance.batteryLevel}%</span>
                  </div>
                  <Progress value={metrics.performance.batteryLevel} className="h-2" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Device</span>
                  <span className="font-semibold">{metrics.performance.deviceInfo}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">App Version</span>
                  <span className="font-semibold">{metrics.performance.appVersion}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Network Status</span>
                  <Badge variant={metrics.performance.networkStatus === 'online' ? "default" : "destructive"}>
                    {metrics.performance.networkStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Offline Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <WifiOff className="h-5 w-5" />
                  <span>Offline Data</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sync Status</span>
                  <Badge variant={metrics.features.offlineData.syncStatus === 'synced' ? "default" : "secondary"}>
                    {metrics.features.offlineData.syncStatus}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Sync</span>
                  <span className="text-sm">{metrics.features.offlineData.lastSync.toLocaleTimeString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Offline Tasks</span>
                  <span className="font-semibold">{metrics.features.offlineData.tasks.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Offline Messages</span>
                  <span className="font-semibold">{metrics.features.offlineData.messages.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 