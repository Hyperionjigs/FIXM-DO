"use client"
import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { performanceOptimizer } from '@/lib/performance-optimizer';

interface UXEnhancerProps {
  children: React.ReactNode;
  className?: string;
}

interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

// Toast notification system
const Toast: React.FC<ToastProps & { onClose: (id: string) => void }> = ({ 
  id, 
  type, 
  title, 
  message, 
  duration = 5000, 
  onClose 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '💬';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      case 'info': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`fixed bottom-4 right-4 z-50 max-w-sm w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden`}
    >
      <div className={`h-1 ${getColor()}`} />
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-2xl">{getIcon()}</span>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => onClose(id)}
              className="bg-white dark:bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Loading overlay component
const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible, message = "Loading..." }) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl"
      >
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-700 dark:text-gray-300">{message}</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Progress bar component
const ProgressBar: React.FC<{ progress: number; className?: string }> = ({ progress, className = "" }) => {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <motion.div
        className="bg-blue-600 h-2 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  );
};

// Smooth scroll component
const SmoothScroll: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => {
  return (
    <motion.div
      className={`overflow-y-auto ${className}`}
      style={{ scrollBehavior: 'smooth' }}
    >
      {children}
    </motion.div>
  );
};

// Hover effect wrapper
const HoverEffect: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => {
  return (
    <motion.div
      className={className}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.div>
  );
};

// Fade in wrapper
const FadeIn: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ 
  children, 
  delay = 0, 
  className = "" 
}) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
};

// Slide in wrapper
const SlideIn: React.FC<{ 
  children: React.ReactNode; 
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  className?: string;
}> = ({ children, direction = 'up', delay = 0, className = "" }) => {
  const getInitialPosition = () => {
    switch (direction) {
      case 'left': return { x: -100, opacity: 0 };
      case 'right': return { x: 100, opacity: 0 };
      case 'up': return { y: 50, opacity: 0 };
      case 'down': return { y: -50, opacity: 0 };
      default: return { y: 50, opacity: 0 };
    }
  };

  return (
    <motion.div
      className={className}
      initial={getInitialPosition()}
      animate={{ x: 0, y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

// Pulse animation wrapper
const Pulse: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => {
  return (
    <motion.div
      className={className}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
};

// Shake animation wrapper
const Shake: React.FC<{ children: React.ReactNode; className?: string; trigger?: boolean }> = ({ 
  children, 
  className = "", 
  trigger = false 
}) => {
  return (
    <motion.div
      className={className}
      animate={trigger ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
};

// Main UX Enhancer component
export const UXEnhancer: React.FC<UXEnhancerProps> = ({ children, className = "" }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // Toast management
  const addToast = useCallback((toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Loading management
  const showLoading = useCallback((message?: string) => {
    setIsLoading(true);
    if (message) setLoadingMessage(message);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingMessage("");
  }, []);

  // Expose methods globally for easy access
  useEffect(() => {
    (window as any).uxEnhancer = {
      addToast,
      showLoading,
      hideLoading
    };
  }, [addToast, showLoading, hideLoading]);

  return (
    <div className={className}>
      {children}
      
      {/* Toast notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map(toast => (
            <Toast key={toast.id} {...toast} onClose={removeToast} />
          ))}
        </AnimatePresence>
      </div>

      {/* Loading overlay */}
      <LoadingOverlay isVisible={isLoading} message={loadingMessage} />
    </div>
  );
};

// Export individual components
export { 
  Toast, 
  LoadingOverlay, 
  ProgressBar, 
  SmoothScroll, 
  HoverEffect, 
  FadeIn, 
  SlideIn, 
  Pulse, 
  Shake 
};

// Export utility functions
export const uxUtils = {
  showSuccessToast: (title: string, message: string) => {
    if ((window as any).uxEnhancer) {
      (window as any).uxEnhancer.addToast({ type: 'success', title, message });
    }
  },
  showErrorToast: (title: string, message: string) => {
    if ((window as any).uxEnhancer) {
      (window as any).uxEnhancer.addToast({ type: 'error', title, message });
    }
  },
  showInfoToast: (title: string, message: string) => {
    if ((window as any).uxEnhancer) {
      (window as any).uxEnhancer.addToast({ type: 'info', title, message });
    }
  },
  showWarningToast: (title: string, message: string) => {
    if ((window as any).uxEnhancer) {
      (window as any).uxEnhancer.addToast({ type: 'warning', title, message });
    }
  },
  showLoading: (message?: string) => {
    if ((window as any).uxEnhancer) {
      (window as any).uxEnhancer.showLoading(message);
    }
  },
  hideLoading: () => {
    if ((window as any).uxEnhancer) {
      (window as any).uxEnhancer.hideLoading();
    }
  }
}; 