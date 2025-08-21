/**
 * Configuration Service
 * 
 * This service manages system configuration with caching, validation,
 * and integration with the admin API.
 */

import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';

const auth = getAuth(app);

export interface SystemConfig {
  // General Settings
  platformName: string;
  platformDescription: string;
  maintenanceMode: boolean;
  debugMode: boolean;
  
  // Security Settings
  maxLoginAttempts: number;
  sessionTimeout: number;
  requireTwoFactor: boolean;
  passwordMinLength: number;
  
  // Verification Settings
  selfieVerificationEnabled: boolean;
  antiSpoofingEnabled: boolean;
  verificationTimeout: number;
  maxVerificationAttempts: number;
  
  // Notification Settings
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  notificationFrequency: 'immediate' | 'hourly' | 'daily';
  
  // Payment Settings
  paymentEnabled: boolean;
  currency: string;
  minimumPayment: number;
  maximumPayment: number;
  transactionFee: number;
  
  // AI Settings
  aiModelVersion: string;
  aiConfidenceThreshold: number;
  aiProcessingTimeout: number;
  enableAITesting: boolean;
  
  // Performance Settings
  cacheEnabled: boolean;
  cacheTimeout: number;
  imageCompression: boolean;
  maxImageSize: number;
}

export const defaultConfig: SystemConfig = {
  // General Settings
  platformName: 'Fixmotech Reference',
  platformDescription: 'Advanced verification and task management platform',
  maintenanceMode: false,
  debugMode: false,
  
  // Security Settings
  maxLoginAttempts: 5,
  sessionTimeout: 3600,
  requireTwoFactor: false,
  passwordMinLength: 8,
  
  // Verification Settings
  selfieVerificationEnabled: true,
  antiSpoofingEnabled: true,
  verificationTimeout: 300,
  maxVerificationAttempts: 3,
  
  // Notification Settings
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  notificationFrequency: 'immediate',
  
  // Payment Settings
  paymentEnabled: true,
  currency: 'PHP',
  minimumPayment: 100,
  maximumPayment: 10000,
  transactionFee: 2.5,
  
  // AI Settings
  aiModelVersion: 'v2.1.0',
  aiConfidenceThreshold: 0.85,
  aiProcessingTimeout: 30,
  enableAITesting: false,
  
  // Performance Settings
  cacheEnabled: true,
  cacheTimeout: 1800,
  imageCompression: true,
  maxImageSize: 5242880, // 5MB
};

class ConfigService {
  private config: SystemConfig = defaultConfig;
  private lastUpdated: Date | null = null;
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private isInitialized = false;

  /**
   * Initialize the configuration service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.loadConfig();
      this.isInitialized = true;
    } catch (error) {
      console.warn('Failed to load configuration, using defaults:', error);
      this.config = { ...defaultConfig };
      this.isInitialized = true;
    }
  }

  /**
   * Get the current configuration
   */
  getConfig(): SystemConfig {
    return { ...this.config };
  }

  /**
   * Get a specific configuration value
   */
  get<K extends keyof SystemConfig>(key: K): SystemConfig[K] {
    return this.config[key];
  }

  /**
   * Check if configuration is stale and needs refresh
   */
  private isStale(): boolean {
    if (!this.lastUpdated) return true;
    return Date.now() - this.lastUpdated.getTime() > this.cacheTimeout;
  }

  /**
   * Load configuration from the API
   */
  private async loadConfig(): Promise<void> {
    try {
      // Get the current user's ID token
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const idToken = await currentUser.getIdToken();
      console.log('Config service - User:', {
        uid: currentUser.uid,
        email: currentUser.email,
        tokenLength: idToken.length
      });

      const response = await fetch('/api/admin/config', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Config API error:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      if (data.success && data.config) {
        this.config = { ...defaultConfig, ...data.config };
        this.lastUpdated = new Date();
      } else {
        throw new Error(data.error || 'Invalid response format');
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
      throw error;
    }
  }

  /**
   * Refresh configuration from the API
   */
  async refresh(): Promise<void> {
    await this.loadConfig();
  }

  /**
   * Update configuration
   */
  async updateConfig(updates: Partial<SystemConfig>): Promise<void> {
    try {
      // Get the current user's ID token
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const idToken = await currentUser.getIdToken();
      const updatedConfig = { ...this.config, ...updates };
      
      const response = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ config: updatedConfig }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        this.config = { ...this.config, ...updates };
        this.lastUpdated = new Date();
      } else {
        throw new Error(data.error || 'Failed to update configuration');
      }
    } catch (error) {
      console.error('Error updating configuration:', error);
      throw error;
    }
  }

  /**
   * Reset configuration to defaults
   */
  async reset(): Promise<void> {
    try {
      // Get the current user's ID token
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const idToken = await currentUser.getIdToken();

      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ action: 'reset' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        this.config = { ...defaultConfig };
        this.lastUpdated = new Date();
      } else {
        throw new Error(data.error || 'Failed to reset configuration');
      }
    } catch (error) {
      console.error('Error resetting configuration:', error);
      throw error;
    }
  }

  /**
   * Get configuration with automatic refresh if stale
   */
  async getConfigWithRefresh(): Promise<SystemConfig> {
    if (this.isStale()) {
      await this.refresh();
    }
    return this.getConfig();
  }

  /**
   * Check if maintenance mode is enabled
   */
  isMaintenanceMode(): boolean {
    return this.config.maintenanceMode;
  }

  /**
   * Check if debug mode is enabled
   */
  isDebugMode(): boolean {
    return this.config.debugMode;
  }

  /**
   * Check if selfie verification is enabled
   */
  isSelfieVerificationEnabled(): boolean {
    return this.config.selfieVerificationEnabled;
  }

  /**
   * Check if anti-spoofing is enabled
   */
  isAntiSpoofingEnabled(): boolean {
    return this.config.antiSpoofingEnabled;
  }

  /**
   * Check if payments are enabled
   */
  isPaymentEnabled(): boolean {
    return this.config.paymentEnabled;
  }

  /**
   * Get AI model version
   */
  getAIModelVersion(): string {
    return this.config.aiModelVersion;
  }

  /**
   * Get AI confidence threshold
   */
  getAIConfidenceThreshold(): number {
    return this.config.aiConfidenceThreshold;
  }

  /**
   * Get verification timeout
   */
  getVerificationTimeout(): number {
    return this.config.verificationTimeout;
  }

  /**
   * Get maximum verification attempts
   */
  getMaxVerificationAttempts(): number {
    return this.config.maxVerificationAttempts;
  }

  /**
   * Get payment limits
   */
  getPaymentLimits(): { min: number; max: number; fee: number } {
    return {
      min: this.config.minimumPayment,
      max: this.config.maximumPayment,
      fee: this.config.transactionFee,
    };
  }

  /**
   * Get notification settings
   */
  getNotificationSettings(): {
    email: boolean;
    push: boolean;
    sms: boolean;
    frequency: 'immediate' | 'hourly' | 'daily';
  } {
    return {
      email: this.config.emailNotifications,
      push: this.config.pushNotifications,
      sms: this.config.smsNotifications,
      frequency: this.config.notificationFrequency,
    };
  }

  /**
   * Get performance settings
   */
  getPerformanceSettings(): {
    cacheEnabled: boolean;
    cacheTimeout: number;
    imageCompression: boolean;
    maxImageSize: number;
  } {
    return {
      cacheEnabled: this.config.cacheEnabled,
      cacheTimeout: this.config.cacheTimeout,
      imageCompression: this.config.imageCompression,
      maxImageSize: this.config.maxImageSize,
    };
  }

  /**
   * Validate configuration values
   */
  validateConfig(config: Partial<SystemConfig>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (config.platformName !== undefined && typeof config.platformName !== 'string') {
      errors.push('Platform name must be a string');
    }

    if (config.maxLoginAttempts !== undefined && (config.maxLoginAttempts < 1 || config.maxLoginAttempts > 10)) {
      errors.push('Max login attempts must be between 1 and 10');
    }

    if (config.sessionTimeout !== undefined && (config.sessionTimeout < 300 || config.sessionTimeout > 86400)) {
      errors.push('Session timeout must be between 300 and 86400 seconds');
    }

    if (config.passwordMinLength !== undefined && (config.passwordMinLength < 6 || config.passwordMinLength > 32)) {
      errors.push('Password minimum length must be between 6 and 32');
    }

    if (config.verificationTimeout !== undefined && (config.verificationTimeout < 60 || config.verificationTimeout > 1800)) {
      errors.push('Verification timeout must be between 60 and 1800 seconds');
    }

    if (config.maxVerificationAttempts !== undefined && (config.maxVerificationAttempts < 1 || config.maxVerificationAttempts > 10)) {
      errors.push('Max verification attempts must be between 1 and 10');
    }

    if (config.transactionFee !== undefined && (config.transactionFee < 0 || config.transactionFee > 10)) {
      errors.push('Transaction fee must be between 0 and 10 percent');
    }

    if (config.aiConfidenceThreshold !== undefined && (config.aiConfidenceThreshold < 0 || config.aiConfidenceThreshold > 1)) {
      errors.push('AI confidence threshold must be between 0 and 1');
    }

    if (config.aiProcessingTimeout !== undefined && (config.aiProcessingTimeout < 10 || config.aiProcessingTimeout > 300)) {
      errors.push('AI processing timeout must be between 10 and 300 seconds');
    }

    if (config.cacheTimeout !== undefined && (config.cacheTimeout < 60 || config.cacheTimeout > 86400)) {
      errors.push('Cache timeout must be between 60 and 86400 seconds');
    }

    if (config.maxImageSize !== undefined && (config.maxImageSize < 1048576 || config.maxImageSize > 10485760)) {
      errors.push('Max image size must be between 1MB and 10MB');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Export a singleton instance
export const configService = new ConfigService();

// Export types
export type { SystemConfig }; 