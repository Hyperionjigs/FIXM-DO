// Storage cleanup utilities to resolve localStorage quota issues

export class StorageCleanup {
  /**
   * Emergency cleanup function to clear all verification data
   * This should be called when storage quota issues are detected
   */
  static emergencyCleanup(): void {
    try {
      const allKeys = Object.keys(localStorage);
      const verificationKeys = allKeys.filter(key => 
        key.startsWith('verification_') || key.startsWith('verification_image_')
      );
      
      console.log(`🧹 Emergency cleanup: Found ${verificationKeys.length} verification keys`);
      
      verificationKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ Removed: ${key}`);
      });
      
      console.log('✅ Emergency cleanup completed');
    } catch (error) {
      console.error('❌ Emergency cleanup failed:', error);
    }
  }

  /**
   * Clean up verification data for a specific user
   */
  static cleanupUserData(userId: string): void {
    try {
      const allKeys = Object.keys(localStorage);
      const userKeys = allKeys.filter(key => 
        (key.startsWith('verification_') || key.startsWith('verification_image_')) && 
        key.includes(userId)
      );
      
      console.log(`🧹 Cleaning up ${userKeys.length} keys for user: ${userId}`);
      
      userKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ Removed: ${key}`);
      });
      
      console.log('✅ User cleanup completed');
    } catch (error) {
      console.error('❌ User cleanup failed:', error);
    }
  }

  /**
   * Get storage usage statistics
   */
  static getStorageStats(): {
    totalKeys: number;
    verificationKeys: number;
    imageKeys: number;
    totalSize: number;
    verificationSize: number;
  } {
    try {
      const allKeys = Object.keys(localStorage);
      const verificationKeys = allKeys.filter(key => key.startsWith('verification_'));
      const imageKeys = allKeys.filter(key => key.startsWith('verification_image_'));
      
      let totalSize = 0;
      let verificationSize = 0;
      
      allKeys.forEach(key => {
        const size = localStorage[key].length + key.length;
        totalSize += size;
        
        if (key.startsWith('verification_') || key.startsWith('verification_image_')) {
          verificationSize += size;
        }
      });
      
      return {
        totalKeys: allKeys.length,
        verificationKeys: verificationKeys.length,
        imageKeys: imageKeys.length,
        totalSize,
        verificationSize
      };
    } catch (error) {
      console.error('❌ Failed to get storage stats:', error);
      return {
        totalKeys: 0,
        verificationKeys: 0,
        imageKeys: 0,
        totalSize: 0,
        verificationSize: 0
      };
    }
  }

  /**
   * Check if storage cleanup is needed
   */
  static needsCleanup(): boolean {
    try {
      const stats = this.getStorageStats();
      const totalSizeMB = stats.totalSize / (1024 * 1024);
      const verificationSizeMB = stats.verificationSize / (1024 * 1024);
      
      // Cleanup needed if:
      // - Total storage > 4MB
      // - Verification data > 2MB
      // - More than 10 verification keys
      return totalSizeMB > 4 || verificationSizeMB > 2 || stats.verificationKeys > 10;
    } catch (error) {
      console.error('❌ Failed to check cleanup needs:', error);
      return false;
    }
  }

  /**
   * Perform automatic cleanup if needed
   */
  static autoCleanup(): void {
    if (this.needsCleanup()) {
      console.log('🧹 Auto-cleanup needed, performing cleanup...');
      this.emergencyCleanup();
    } else {
      console.log('✅ Storage is clean, no cleanup needed');
    }
  }

  /**
   * Clear all data except essential app data
   */
  static clearAllExceptEssential(): void {
    try {
      const allKeys = Object.keys(localStorage);
      const essentialKeys = [
        'user', 'auth', 'theme', 'language', 'settings'
      ];
      
      const keysToRemove = allKeys.filter(key => 
        !essentialKeys.some(essential => key.startsWith(essential))
      );
      
      console.log(`🧹 Clearing ${keysToRemove.length} non-essential keys`);
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ Removed: ${key}`);
      });
      
      console.log('✅ Non-essential data cleared');
    } catch (error) {
      console.error('❌ Clear all failed:', error);
    }
  }
} 