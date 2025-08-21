// Storage utilities for managing verification data and preventing quota issues

export interface StorageQuotaInfo {
  used: number;
  total: number;
  available: number;
}

export class StorageManager {
  private static readonly VERIFICATION_PREFIX = 'verification_';
  private static readonly IMAGE_PREFIX = 'verification_image_';
  private static readonly MAX_STORAGE_SIZE = 4 * 1024 * 1024; // 4MB limit
  private static readonly MAX_VERIFICATION_ENTRIES = 5; // Keep only last 5 attempts

  /**
   * Clean up old verification data to prevent quota issues
   */
  static cleanupOldVerificationData(userId: string): void {
    try {
      const allKeys = Object.keys(localStorage);
      
      // Get all verification keys for this user
      const userVerificationKeys = allKeys.filter(key => 
        key.startsWith(this.VERIFICATION_PREFIX) && key.includes(userId)
      );
      
      const userImageKeys = allKeys.filter(key => 
        key.startsWith(this.IMAGE_PREFIX) && key.includes(userId)
      );

      // Sort by timestamp (newest first)
      const sortedVerificationKeys = userVerificationKeys.sort((a, b) => {
        const timeA = this.extractTimestamp(a);
        const timeB = this.extractTimestamp(b);
        return timeB - timeA;
      });

      const sortedImageKeys = userImageKeys.sort((a, b) => {
        const timeA = this.extractTimestamp(a);
        const timeB = this.extractTimestamp(b);
        return timeB - timeA;
      });

      // Remove old entries, keeping only the most recent ones
      if (sortedVerificationKeys.length > this.MAX_VERIFICATION_ENTRIES) {
        const keysToRemove = sortedVerificationKeys.slice(this.MAX_VERIFICATION_ENTRIES);
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
          console.log(`🗑️ Removed old verification data: ${key}`);
        });
      }

      if (sortedImageKeys.length > this.MAX_VERIFICATION_ENTRIES) {
        const keysToRemove = sortedImageKeys.slice(this.MAX_VERIFICATION_ENTRIES);
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
          console.log(`🗑️ Removed old verification image: ${key}`);
        });
      }

      console.log(`🧹 Cleaned up verification data for user: ${userId}`);
    } catch (error) {
      console.warn('⚠️ Failed to cleanup old verification data:', error);
    }
  }

  /**
   * Compress base64 image data to reduce storage size
   */
  static compressImageData(base64Data: string, quality: number = 0.7): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Calculate new dimensions (max 800px width/height)
          const maxSize = 800;
          let { width, height } = img;
          
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }

          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          const compressedData = canvas.toDataURL('image/jpeg', quality);
          
          console.log(`📦 Compressed image: ${(base64Data.length / 1024).toFixed(1)}KB → ${(compressedData.length / 1024).toFixed(1)}KB`);
          resolve(compressedData);
        };
        
        img.onerror = () => reject(new Error('Failed to load image for compression'));
        img.src = base64Data;
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Check if we have enough storage space
   */
  static checkStorageQuota(): StorageQuotaInfo | null {
    try {
      // Estimate based on localStorage usage
      const used = this.getLocalStorageSize();
      const total = 5 * 1024 * 1024; // Assume 5MB limit
      const available = total - used;
      
      return { used, total, available };
    } catch (error) {
      console.warn('⚠️ Could not check storage quota:', error);
      return null;
    }
  }

  /**
   * Get current localStorage usage in bytes
   */
  static getLocalStorageSize(): number {
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  }

  /**
   * Safely store verification data with cleanup and compression
   */
  static async storeVerificationData(
    userId: string, 
    verificationData: any, 
    imageData: string
  ): Promise<{ success: boolean; error?: string; imageKey?: string }> {
    try {
      // Clean up old data first
      this.cleanupOldVerificationData(userId);
      
      // Check storage quota
      const quota = this.checkStorageQuota();
      if (quota && quota.available < 1024 * 1024) { // Less than 1MB available
        console.warn('⚠️ Low storage space available:', quota.available);
      }
      
      // Compress image data
      const compressedImage = await this.compressImageData(imageData);
      
      // Generate keys
      const verificationKey = `${this.VERIFICATION_PREFIX}${userId}`;
      const imageKey = `${this.IMAGE_PREFIX}${userId}_${Date.now()}`;
      
      // Store data
      localStorage.setItem(verificationKey, JSON.stringify(verificationData));
      localStorage.setItem(imageKey, compressedImage);
      
      console.log('✅ Verification data stored successfully');
      return { success: true, imageKey };
      
    } catch (error) {
      console.error('❌ Failed to store verification data:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Extract timestamp from storage key
   */
  private static extractTimestamp(key: string): number {
    const match = key.match(/_(\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Clear all verification data for a user
   */
  static clearUserVerificationData(userId: string): void {
    try {
      const allKeys = Object.keys(localStorage);
      
      const userKeys = allKeys.filter(key => 
        (key.startsWith(this.VERIFICATION_PREFIX) || key.startsWith(this.IMAGE_PREFIX)) && 
        key.includes(userId)
      );
      
      userKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ Removed verification data: ${key}`);
      });
      
      console.log(`🧹 Cleared all verification data for user: ${userId}`);
    } catch (error) {
      console.warn('⚠️ Failed to clear verification data:', error);
    }
  }
} 