"use client";

import React, { useState } from 'react';
import { AlertTriangle, Info, HelpCircle, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { isAdmin } from '@/lib/admin-config';

interface SmartErrorTooltipProps {
  error: string;
  context?: 'config' | 'auth' | 'admin' | 'general';
  onDismiss?: () => void;
  showDetails?: boolean;
}

interface ErrorExplanation {
  title: string;
  description: string;
  solutions: string[];
  severity: 'info' | 'warning' | 'error';
  icon: React.ReactNode;
}

export function SmartErrorTooltip({ 
  error, 
  context = 'general', 
  onDismiss,
  showDetails = false 
}: SmartErrorTooltipProps) {
  const { user } = useAuth();
  const [showTooltip, setShowTooltip] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(showDetails);

  const getErrorExplanation = (): ErrorExplanation => {
    const lowerError = error.toLowerCase();
    
    // Authentication errors
    if (lowerError.includes('unauthorized') || lowerError.includes('invalid token')) {
      return {
        title: 'Authentication Required',
        description: 'Your session has expired or you need to log in again.',
        solutions: [
          'Try refreshing the page',
          'Log out and log back in',
          'Check if you\'re logged in as an admin user',
          'Clear browser cache and cookies'
        ],
        severity: 'warning',
        icon: <AlertTriangle className="h-4 w-4" />
      };
    }

    // Admin access errors
    if (lowerError.includes('access denied') || lowerError.includes('not an admin')) {
      const userEmail = user?.email;
      const isUserAdmin = user ? isAdmin(user.uid, user.email || null) : false;
      
      return {
        title: 'Admin Access Required',
        description: `You need admin privileges to access this feature.${userEmail ? ` You're logged in as: ${userEmail}` : ''}`,
        solutions: [
          'Contact your system administrator',
          'Verify your email domain is in the admin list',
          'Check if your account has admin permissions',
          'Try logging in with a different admin account'
        ],
        severity: 'error',
        icon: <X className="h-4 w-4" />
      };
    }

    // Permission errors
    if (lowerError.includes('insufficient permissions') || lowerError.includes('permissions')) {
      return {
        title: 'Insufficient Permissions',
        description: 'You don\'t have the required permissions for this action.',
        solutions: [
          'Contact your administrator for access',
          'Check your user role and permissions',
          'Verify you have the correct admin level',
          'Request permission elevation'
        ],
        severity: 'error',
        icon: <X className="h-4 w-4" />
      };
    }

    // Network/connection errors
    if (lowerError.includes('network') || lowerError.includes('connection') || lowerError.includes('fetch')) {
      return {
        title: 'Connection Issue',
        description: 'Unable to connect to the server or service.',
        solutions: [
          'Check your internet connection',
          'Try refreshing the page',
          'Wait a moment and try again',
          'Contact support if the issue persists'
        ],
        severity: 'warning',
        icon: <AlertTriangle className="h-4 w-4" />
      };
    }

    // Default error
    return {
      title: 'An Error Occurred',
      description: 'Something went wrong while processing your request.',
      solutions: [
        'Try refreshing the page',
        'Check your input and try again',
        'Contact support if the issue persists',
        'Check the browser console for more details'
      ],
      severity: 'error',
      icon: <AlertTriangle className="h-4 w-4" />
    };
  };

  const explanation = getErrorExplanation();
  const userEmail = user?.email;
  const isUserAdmin = user ? isAdmin(user.uid, user.email || null) : false;

  return (
    <div className="relative">
      {/* Main Error Display */}
      <Card className={`border-l-4 ${
        explanation.severity === 'error' ? 'border-red-500 bg-red-50' :
        explanation.severity === 'warning' ? 'border-yellow-500 bg-yellow-50' :
        'border-blue-500 bg-blue-50'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className={`mt-0.5 ${
                explanation.severity === 'error' ? 'text-red-600' :
                explanation.severity === 'warning' ? 'text-yellow-600' :
                'text-blue-600'
              }`}>
                {explanation.icon}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`font-medium ${
                    explanation.severity === 'error' ? 'text-red-800' :
                    explanation.severity === 'warning' ? 'text-yellow-800' :
                    'text-blue-800'
                  }`}>
                    {explanation.title}
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setShowTooltip(!showTooltip)}
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </div>
                
                <p className={`text-sm ${
                  explanation.severity === 'error' ? 'text-red-700' :
                  explanation.severity === 'warning' ? 'text-yellow-700' :
                  'text-blue-700'
                }`}>
                  {error}
                </p>

                {/* User Context Info */}
                {userEmail && (
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Logged in as: {userEmail}
                    </Badge>
                    <Badge variant={isUserAdmin ? "default" : "secondary"} className="text-xs">
                      {isUserAdmin ? 'Admin User' : 'Regular User'}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={onDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Expandable Details */}
          {showTooltip && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="space-y-3">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Why is this happening?</h5>
                  <p className="text-sm text-gray-600">{explanation.description}</p>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">How to fix it:</h5>
                  <ul className="space-y-1">
                    {explanation.solutions.map((solution, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        {solution}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Technical Details */}
                {showFullDetails && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <h6 className="font-medium text-gray-900 mb-2">Technical Details:</h6>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div><strong>Error:</strong> {error}</div>
                      <div><strong>Context:</strong> {context}</div>
                      <div><strong>User ID:</strong> {user?.uid || 'Not available'}</div>
                      <div><strong>Email:</strong> {user?.email || 'Not available'}</div>
                      <div><strong>Admin Status:</strong> {isUserAdmin ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFullDetails(!showFullDetails)}
                  >
                    {showFullDetails ? 'Hide' : 'Show'} Technical Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.reload()}
                  >
                    Refresh Page
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 