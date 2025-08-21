"use client";

import { useEffect, useState } from 'react';
import { pwaService } from '@/lib/pwa-service';

interface PWAStatus {
  isInstalled: boolean;
  isOnline: boolean;
  hasPushPermission: boolean;
  isServiceWorkerActive: boolean;
}

export default function PWAInitializer() {
  const [pwaStatus, setPwaStatus] = useState<PWAStatus>({
    isInstalled: false,
    isOnline: navigator.onLine,
    hasPushPermission: false,
    isServiceWorkerActive: false
  });

  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const initializePWA = async () => {
      try {
        // Check PWA status
        const status: PWAStatus = {
          isInstalled: pwaService.isAppInstalled(),
          isOnline: pwaService.isOnline(),
          hasPushPermission: Notification.permission === 'granted',
          isServiceWorkerActive: !!pwaService.getRegistration()
        };

        setPwaStatus(status);

        // Show install banner if not installed and conditions are met
        if (!status.isInstalled && status.isServiceWorkerActive) {
          // Check if user has been on the site for more than 30 seconds
          setTimeout(() => {
            setShowInstallBanner(true);
          }, 30000);
        }

        console.log('[PWA] Status initialized:', status);
      } catch (error) {
        console.error('[PWA] Failed to initialize:', error);
      }
    };

    initializePWA();

    // Listen for online/offline changes
    const handleOnlineStatus = () => {
      setPwaStatus(prev => ({
        ...prev,
        isOnline: navigator.onLine
      }));
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  const handleInstallApp = async () => {
    try {
      await pwaService.installApp();
      setShowInstallBanner(false);
    } catch (error) {
      console.error('[PWA] Failed to install app:', error);
    }
  };

  const handleDismissBanner = () => {
    setShowInstallBanner(false);
    // Store dismissal in localStorage to avoid showing again for 24 hours
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  const handleRequestPushPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setPwaStatus(prev => ({
        ...prev,
        hasPushPermission: permission === 'granted'
      }));
    } catch (error) {
      console.error('[PWA] Failed to request push permission:', error);
    }
  };

  // Don't render anything if PWA is not supported
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  return (
    <>
      {/* Install Banner */}
      {showInstallBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 shadow-lg">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">📱</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Install FixMo</h3>
                <p className="text-sm text-gray-600">Get the full app experience</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleInstallApp}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Install
              </button>
              <button
                onClick={handleDismissBanner}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connection Status Indicator */}
      {!pwaStatus.isOnline && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-3 py-2 rounded-lg text-sm z-40 flex items-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span>Offline</span>
        </div>
      )}

      {/* PWA Status Debug Panel (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-xs z-40">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span>📱</span>
              <span>{pwaStatus.isInstalled ? 'Installed' : 'Not Installed'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🌐</span>
              <span>{pwaStatus.isOnline ? 'Online' : 'Offline'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🔔</span>
              <span>{pwaStatus.hasPushPermission ? 'Push Enabled' : 'Push Disabled'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>⚙️</span>
              <span>{pwaStatus.isServiceWorkerActive ? 'SW Active' : 'SW Inactive'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Push Permission Request (if not granted) */}
      {!pwaStatus.hasPushPermission && pwaStatus.isServiceWorkerActive && (
        <div className="fixed bottom-20 right-4 bg-blue-500 text-white p-3 rounded-lg text-sm z-40 max-w-xs">
          <div className="flex items-start space-x-3">
            <span className="text-lg">🔔</span>
            <div>
              <p className="font-medium">Stay Updated</p>
              <p className="text-xs opacity-90 mb-2">Get notified about new tasks and updates</p>
              <button
                onClick={handleRequestPushPermission}
                className="bg-white text-blue-500 px-3 py-1 rounded text-xs font-medium hover:bg-gray-100 transition-colors"
              >
                Enable Notifications
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 