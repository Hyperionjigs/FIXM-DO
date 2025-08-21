"use client";

import { useEffect } from 'react';
import { StorageCleanup } from '@/lib/storage-cleanup';

export function StorageCleanupInitializer() {
  useEffect(() => {
    // Run cleanup on app initialization
    const initializeStorage = () => {
      try {
        console.log('🔍 Checking storage status...');
        
        // Get current storage stats
        const stats = StorageCleanup.getStorageStats();
        console.log('📊 Storage stats:', {
          totalKeys: stats.totalKeys,
          verificationKeys: stats.verificationKeys,
          imageKeys: stats.imageKeys,
          totalSizeMB: (stats.totalSize / (1024 * 1024)).toFixed(2),
          verificationSizeMB: (stats.verificationSize / (1024 * 1024)).toFixed(2)
        });
        
        // Perform auto-cleanup if needed
        StorageCleanup.autoCleanup();
        
        // Set up periodic cleanup check (every 5 minutes)
        const cleanupInterval = setInterval(() => {
          StorageCleanup.autoCleanup();
        }, 5 * 60 * 1000);
        
        // Cleanup interval on unmount
        return () => clearInterval(cleanupInterval);
        
      } catch (error) {
        console.error('❌ Storage initialization failed:', error);
      }
    };
    
    // Run initialization after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(initializeStorage, 1000);
    
    return () => clearTimeout(timeoutId);
  }, []);
  
  // This component doesn't render anything
  return null;
} 