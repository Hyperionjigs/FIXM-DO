"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Wrench, Clock, RefreshCw } from 'lucide-react';
import { useConfig } from '@/hooks/use-config';

interface MaintenanceModeProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function MaintenanceMode({ children, fallback }: MaintenanceModeProps) {
  const { isMaintenanceMode, loading } = useConfig();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (isMaintenanceMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Wrench className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">
              Under Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              We're currently performing scheduled maintenance to improve your experience.
              Please check back soon.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Expected completion: Soon</span>
            </div>
            <div className="pt-4">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Page
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

export function MaintenanceBanner() {
  const { isMaintenanceMode, loading } = useConfig();

  if (loading || !isMaintenanceMode) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-b border-yellow-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                System Maintenance
              </p>
              <p className="text-xs text-yellow-700">
                Some features may be temporarily unavailable
              </p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="text-xs text-yellow-700 hover:text-yellow-800 underline"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
} 