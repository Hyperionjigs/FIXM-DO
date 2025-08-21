"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  context?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      errorInfo
    });

    // Log error to external service (Sentry, etc.)
    this.logError(error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private logError(error: Error, errorInfo: ErrorInfo) {
    // Log to console for development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error ID:', this.state.errorId);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }

    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleGoBack = () => {
    window.history.back();
  };

  private getErrorContext() {
    const { error } = this.state;
    if (!error) return { title: 'Unknown Error', description: 'An unexpected error occurred' };

    const errorMessage = error.message.toLowerCase();
    
    // Authentication errors
    if (errorMessage.includes('auth') || errorMessage.includes('unauthorized')) {
      return {
        title: 'Authentication Error',
        description: 'There was an issue with your login session.',
        solutions: ['Try refreshing the page', 'Log out and log back in']
      };
    }

    // Network errors
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return {
        title: 'Connection Error',
        description: 'Unable to connect to the server.',
        solutions: ['Check your internet connection', 'Try again in a moment']
      };
    }

    // Firebase errors
    if (errorMessage.includes('firebase') || errorMessage.includes('firestore')) {
      return {
        title: 'Database Error',
        description: 'There was an issue accessing the database.',
        solutions: ['Try refreshing the page', 'Contact support if the issue persists']
      };
    }

    // Camera/Media errors
    if (errorMessage.includes('camera') || errorMessage.includes('media')) {
      return {
        title: 'Camera Access Error',
        description: 'Unable to access your camera.',
        solutions: ['Check camera permissions', 'Try refreshing the page']
      };
    }

    // Default error
    return {
      title: 'Something Went Wrong',
      description: 'An unexpected error occurred while loading this page.',
      solutions: ['Try refreshing the page', 'Go back to the previous page']
    };
  }

  render() {
    if (this.state.hasError) {
      const errorContext = this.getErrorContext();

      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                {errorContext.title}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                {errorContext.description}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Error ID for debugging */}
              <div className="text-center">
                <Badge variant="outline" className="text-xs">
                  Error ID: {this.state.errorId}
                </Badge>
              </div>

              {/* Solutions */}
              {errorContext.solutions && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Try these solutions:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {errorContext.solutions.map((solution, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                        {solution}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={this.handleRetry}
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={this.handleGoBack}
                    variant="outline"
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                  </Button>
                  
                  <Button 
                    onClick={this.handleGoHome}
                    variant="outline"
                    className="flex-1"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Button>
                </div>
              </div>

              {/* Development Error Details */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                    Show Error Details (Development)
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-auto max-h-40">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    <div className="mb-2">
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to handle errors
export function useErrorHandler() {
  const router = useRouter();

  const handleError = (error: Error, context?: string) => {
    console.error(`Error in ${context || 'component'}:`, error);
    
    // Log to external service
    // TODO: Send to error tracking service
    
    // Show user-friendly error message
    // You can integrate with your toast system here
  };

  const handleAsyncError = (promise: Promise<any>, context?: string) => {
    return promise.catch((error) => {
      handleError(error, context);
      throw error; // Re-throw to maintain promise rejection
    });
  };

  return { handleError, handleAsyncError };
} 