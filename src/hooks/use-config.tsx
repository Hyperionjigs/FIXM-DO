import { useState, useEffect, useCallback } from 'react';
import { configService, SystemConfig } from '@/lib/config-service';

interface UseConfigReturn {
  config: SystemConfig | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateConfig: (updates: Partial<SystemConfig>) => Promise<void>;
  resetConfig: () => Promise<void>;
  isMaintenanceMode: boolean;
  isDebugMode: boolean;
  isSelfieVerificationEnabled: boolean;
  isAntiSpoofingEnabled: boolean;
  isPaymentEnabled: boolean;
  getAIModelVersion: () => string;
  getAIConfidenceThreshold: () => number;
  getVerificationTimeout: () => number;
  getMaxVerificationAttempts: () => number;
  getPaymentLimits: () => { min: number; max: number; fee: number };
  getNotificationSettings: () => {
    email: boolean;
    push: boolean;
    sms: boolean;
    frequency: 'immediate' | 'hourly' | 'daily';
  };
  getPerformanceSettings: () => {
    cacheEnabled: boolean;
    cacheTimeout: number;
    imageCompression: boolean;
    maxImageSize: number;
  };
}

export function useConfig(): UseConfigReturn {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await configService.initialize();
      const currentConfig = configService.getConfig();
      setConfig(currentConfig);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load configuration';
      setError(errorMessage);
      console.error('Error loading configuration:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await configService.refresh();
      const currentConfig = configService.getConfig();
      setConfig(currentConfig);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh configuration';
      setError(errorMessage);
      console.error('Error refreshing configuration:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateConfig = useCallback(async (updates: Partial<SystemConfig>) => {
    try {
      setError(null);
      await configService.updateConfig(updates);
      const currentConfig = configService.getConfig();
      setConfig(currentConfig);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update configuration';
      setError(errorMessage);
      console.error('Error updating configuration:', err);
      throw err;
    }
  }, []);

  const resetConfig = useCallback(async () => {
    try {
      setError(null);
      await configService.reset();
      const currentConfig = configService.getConfig();
      setConfig(currentConfig);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset configuration';
      setError(errorMessage);
      console.error('Error resetting configuration:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return {
    config,
    loading,
    error,
    refresh,
    updateConfig,
    resetConfig,
    isMaintenanceMode: config?.maintenanceMode ?? false,
    isDebugMode: config?.debugMode ?? false,
    isSelfieVerificationEnabled: config?.selfieVerificationEnabled ?? true,
    isAntiSpoofingEnabled: config?.antiSpoofingEnabled ?? true,
    isPaymentEnabled: config?.paymentEnabled ?? true,
    getAIModelVersion: () => config?.aiModelVersion ?? 'v2.1.0',
    getAIConfidenceThreshold: () => config?.aiConfidenceThreshold ?? 0.85,
    getVerificationTimeout: () => config?.verificationTimeout ?? 300,
    getMaxVerificationAttempts: () => config?.maxVerificationAttempts ?? 3,
    getPaymentLimits: () => ({
      min: config?.minimumPayment ?? 100,
      max: config?.maximumPayment ?? 10000,
      fee: config?.transactionFee ?? 2.5,
    }),
    getNotificationSettings: () => ({
      email: config?.emailNotifications ?? true,
      push: config?.pushNotifications ?? true,
      sms: config?.smsNotifications ?? false,
      frequency: config?.notificationFrequency ?? 'immediate',
    }),
    getPerformanceSettings: () => ({
      cacheEnabled: config?.cacheEnabled ?? true,
      cacheTimeout: config?.cacheTimeout ?? 1800,
      imageCompression: config?.imageCompression ?? true,
      maxImageSize: config?.maxImageSize ?? 5242880,
    }),
  };
} 