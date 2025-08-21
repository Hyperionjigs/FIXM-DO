import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface ErrorLog {
  id?: string;
  timestamp: Date;
  error: {
    message: string;
    stack?: string;
    name: string;
    code?: string;
  };
  context: {
    url: string;
    userAgent: string;
    userId?: string;
    userEmail?: string;
    component?: string;
    action?: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'auth' | 'network' | 'database' | 'ui' | 'payment' | 'verification' | 'general';
  metadata?: Record<string, any>;
  resolved?: boolean;
  resolution?: string;
}

export interface ErrorRecoveryAction {
  type: 'retry' | 'fallback' | 'redirect' | 'refresh' | 'logout';
  description: string;
  automatic?: boolean;
  delay?: number;
}

export class ErrorLoggingService {
  private static instance: ErrorLoggingService;
  private errorQueue: ErrorLog[] = [];
  private isProcessing = false;
  private maxRetries = 3;
  private retryDelay = 1000;

  private constructor() {
    this.setupErrorListeners();
  }

  static getInstance(): ErrorLoggingService {
    if (!ErrorLoggingService.instance) {
      ErrorLoggingService.instance = new ErrorLoggingService();
    }
    return ErrorLoggingService.instance;
  }

  private setupErrorListeners() {
    // Global error handlers
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message,
        stack: event.error?.stack,
        name: event.error?.name || 'Error',
        code: event.error?.code
      }, {
        component: 'global',
        action: 'unhandled'
      }, 'high');
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        name: event.reason?.name || 'PromiseRejection',
        code: event.reason?.code
      }, {
        component: 'global',
        action: 'unhandled-promise'
      }, 'high');
    });
  }

  async logError(
    error: Error | { message: string; stack?: string; name: string; code?: string },
    context: Partial<ErrorLog['context']> = {},
    severity: ErrorLog['severity'] = 'medium',
    category: ErrorLog['category'] = 'general',
    metadata?: Record<string, any>
  ): Promise<string> {
    const errorLog: ErrorLog = {
      timestamp: new Date(),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name || 'Error',
        code: (error as any).code
      },
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...context
      },
      severity,
      category,
      metadata,
      resolved: false
    };

    // Add to queue for batch processing
    this.errorQueue.push(errorLog);

    // Process queue if not already processing
    if (!this.isProcessing) {
      this.processQueue();
    }

    // Return error ID for tracking
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async processQueue() {
    if (this.isProcessing || this.errorQueue.length === 0) return;

    this.isProcessing = true;

    try {
      const batch = this.errorQueue.splice(0, 10); // Process 10 at a time
      
      for (const errorLog of batch) {
        await this.saveErrorToFirestore(errorLog);
      }
    } catch (error) {
      console.error('Failed to process error queue:', error);
      
      // Re-queue failed errors with exponential backoff
      if (this.errorQueue.length < 100) { // Prevent infinite queue growth
        this.errorQueue.unshift(...this.errorQueue.splice(0, 10));
      }
    } finally {
      this.isProcessing = false;
      
      // Continue processing if there are more errors
      if (this.errorQueue.length > 0) {
        setTimeout(() => this.processQueue(), this.retryDelay);
      }
    }
  }

  private async saveErrorToFirestore(errorLog: ErrorLog): Promise<void> {
    try {
      await addDoc(collection(db, 'errorLogs'), {
        ...errorLog,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to save error to Firestore:', error);
      throw error;
    }
  }

  async getErrorRecoveryActions(error: Error, context?: string): Promise<ErrorRecoveryAction[]> {
    const errorMessage = error.message.toLowerCase();
    const actions: ErrorRecoveryAction[] = [];

    // Authentication errors
    if (errorMessage.includes('auth') || errorMessage.includes('unauthorized')) {
      actions.push(
        {
          type: 'refresh',
          description: 'Refresh the page to restore your session',
          automatic: true,
          delay: 2000
        },
        {
          type: 'logout',
          description: 'Log out and log back in',
          automatic: false
        }
      );
    }

    // Network errors
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      actions.push(
        {
          type: 'retry',
          description: 'Retry the operation',
          automatic: true,
          delay: 1000
        },
        {
          type: 'refresh',
          description: 'Refresh the page',
          automatic: false
        }
      );
    }

    // Database errors
    if (errorMessage.includes('firebase') || errorMessage.includes('firestore')) {
      actions.push(
        {
          type: 'retry',
          description: 'Retry the database operation',
          automatic: true,
          delay: 2000
        },
        {
          type: 'fallback',
          description: 'Use cached data',
          automatic: false
        }
      );
    }

    // Payment errors
    if (errorMessage.includes('payment') || errorMessage.includes('transaction')) {
      actions.push(
        {
          type: 'retry',
          description: 'Retry the payment',
          automatic: false
        },
        {
          type: 'redirect',
          description: 'Go to payment page',
          automatic: false
        }
      );
    }

    // Default actions
    if (actions.length === 0) {
      actions.push(
        {
          type: 'retry',
          description: 'Try again',
          automatic: true,
          delay: 1000
        },
        {
          type: 'refresh',
          description: 'Refresh the page',
          automatic: false
        }
      );
    }

    return actions;
  }

  async markErrorResolved(errorId: string, resolution: string): Promise<void> {
    // TODO: Update error log in Firestore
    console.log(`Error ${errorId} marked as resolved: ${resolution}`);
  }

  async getErrorAnalytics(): Promise<{
    totalErrors: number;
    errorsByCategory: Record<string, number>;
    errorsBySeverity: Record<string, number>;
    recentErrors: ErrorLog[];
  }> {
    // TODO: Implement analytics query from Firestore
    return {
      totalErrors: 0,
      errorsByCategory: {},
      errorsBySeverity: {},
      recentErrors: []
    };
  }
}

// Convenience functions
export const errorLogger = ErrorLoggingService.getInstance();

export const logError = (
  error: Error | { message: string; stack?: string; name: string; code?: string },
  context?: Partial<ErrorLog['context']>,
  severity?: ErrorLog['severity'],
  category?: ErrorLog['category'],
  metadata?: Record<string, any>
) => {
  return errorLogger.logError(error, context, severity, category, metadata);
};

export const getRecoveryActions = (error: Error, context?: string) => {
  return errorLogger.getErrorRecoveryActions(error, context);
}; 