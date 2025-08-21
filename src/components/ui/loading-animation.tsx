"use client";

import { cn } from "@/lib/utils";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface LoadingAnimationProps {
  type?: 'spinner' | 'dots' | 'pulse' | 'progress';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  progress?: number;
  status?: 'loading' | 'success' | 'error';
  className?: string;
}

export function LoadingAnimation({ 
  type = 'spinner', 
  size = 'md', 
  text, 
  progress, 
  status = 'loading',
  className 
}: LoadingAnimationProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const renderAnimation = () => {
    switch (type) {
      case 'spinner':
        return (
          <Loader2 className={cn(
            "animate-spin",
            sizeClasses[size],
            status === 'success' && "text-green-600",
            status === 'error' && "text-red-600"
          )} />
        );
      
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "rounded-full bg-current",
                  size === 'sm' ? 'h-1 w-1' : size === 'md' ? 'h-1.5 w-1.5' : 'h-2 w-2',
                  "animate-pulse"
                )}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        );
      
      case 'pulse':
        return (
          <div className={cn(
            "rounded-full bg-current animate-pulse",
            size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-6 w-6' : 'h-8 w-8'
          )} />
        );
      
      case 'progress':
        return (
          <div className="w-full max-w-xs">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={cn(
                  "h-2 rounded-full transition-all duration-300 ease-out",
                  status === 'success' ? 'bg-green-600' : 
                  status === 'error' ? 'bg-red-600' : 'bg-blue-600'
                )}
                style={{ width: `${progress || 0}%` }}
              />
            </div>
            {progress !== undefined && (
              <div className={cn("text-center mt-1", textSizes[size])}>
                {Math.round(progress)}%
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderStatusIcon = () => {
    if (status === 'success') {
      return <CheckCircle className={cn("text-green-600", sizeClasses[size])} />;
    }
    if (status === 'error') {
      return <AlertCircle className={cn("text-red-600", sizeClasses[size])} />;
    }
    return null;
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center space-y-2",
      className
    )}>
      {status !== 'loading' ? renderStatusIcon() : renderAnimation()}
      
      {text && (
        <div className={cn(
          "text-center font-medium",
          textSizes[size],
          status === 'success' && "text-green-600",
          status === 'error' && "text-red-600"
        )}>
          {text}
        </div>
      )}
    </div>
  );
}

// Specialized loading components
export function Spinner({ size = 'md', text, className }: Omit<LoadingAnimationProps, 'type'>) {
  return <LoadingAnimation type="spinner" size={size} text={text} className={className} />;
}

export function DotsLoader({ size = 'md', text, className }: Omit<LoadingAnimationProps, 'type'>) {
  return <LoadingAnimation type="dots" size={size} text={text} className={className} />;
}

export function PulseLoader({ size = 'md', text, className }: Omit<LoadingAnimationProps, 'type'>) {
  return <LoadingAnimation type="pulse" size={size} text={text} className={className} />;
}

export function ProgressLoader({ 
  progress, 
  text, 
  status = 'loading', 
  className 
}: Omit<LoadingAnimationProps, 'type' | 'size'>) {
  return (
    <LoadingAnimation 
      type="progress" 
      progress={progress} 
      text={text} 
      status={status} 
      className={className} 
    />
  );
} 