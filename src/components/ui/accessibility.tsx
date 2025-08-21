"use client";

import { ReactNode, forwardRef } from "react";
import { cn } from "@/lib/utils";

// Accessible button with proper ARIA attributes
interface AccessibleButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  role?: string;
  tabIndex?: number;
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ 
    children, 
    onClick, 
    className, 
    disabled = false,
    ariaLabel,
    ariaDescribedBy,
    role = "button",
    tabIndex = 0,
    ...props 
  }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          "transition-all duration-200",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        role={role}
        tabIndex={tabIndex}
        {...props}
      >
        {children}
      </button>
    );
  }
);

AccessibleButton.displayName = "AccessibleButton";

// Accessible input with proper labeling
interface AccessibleInputProps {
  id: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function AccessibleInput({ 
  id, 
  label, 
  description, 
  error, 
  required = false,
  className,
  children 
}: AccessibleInputProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label 
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>
      
      {description && (
        <p 
          id={`${id}-description`}
          className="text-sm text-gray-500 dark:text-gray-400"
        >
          {description}
        </p>
      )}
      
      <div className="relative">
        {children}
      </div>
      
      {error && (
        <p 
          id={`${id}-error`}
          className="text-sm text-red-600 dark:text-red-400"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
}

// Skip link for keyboard navigation
interface SkipLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "sr-only focus:not-sr-only",
        "absolute top-4 left-4 z-50",
        "px-4 py-2 bg-blue-600 text-white rounded-md",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        className
      )}
    >
      {children}
    </a>
  );
}

// Screen reader only text
interface ScreenReaderOnlyProps {
  children: ReactNode;
  className?: string;
}

export function ScreenReaderOnly({ children, className }: ScreenReaderOnlyProps) {
  return (
    <span className={cn("sr-only", className)}>
      {children}
    </span>
  );
}

// High contrast mode support
interface HighContrastProps {
  children: ReactNode;
  className?: string;
}

export function HighContrast({ children, className }: HighContrastProps) {
  return (
    <div className={cn(
      "high-contrast",
      "border-2 border-current",
      "bg-white dark:bg-black",
      "text-black dark:text-white",
      className
    )}>
      {children}
    </div>
  );
}

// Focus trap for modals
interface FocusTrapProps {
  children: ReactNode;
  className?: string;
}

export function FocusTrap({ children, className }: FocusTrapProps) {
  return (
    <div 
      className={cn("focus-trap", className)}
      role="dialog"
      aria-modal="true"
    >
      {children}
    </div>
  );
}

// Live region for dynamic content
interface LiveRegionProps {
  children: ReactNode;
  className?: string;
  ariaLive?: "polite" | "assertive" | "off";
  ariaAtomic?: boolean;
}

export function LiveRegion({ 
  children, 
  className, 
  ariaLive = "polite",
  ariaAtomic = true 
}: LiveRegionProps) {
  return (
    <div
      className={cn("live-region", className)}
      aria-live={ariaLive}
      aria-atomic={ariaAtomic}
    >
      {children}
    </div>
  );
}

// Keyboard navigation wrapper
interface KeyboardNavigationProps {
  children: ReactNode;
  className?: string;
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

export function KeyboardNavigation({ 
  children, 
  className,
  onKeyDown 
}: KeyboardNavigationProps) {
  return (
    <div
      className={cn("keyboard-navigation", className)}
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      {children}
    </div>
  );
}

// Accessible progress indicator
interface AccessibleProgressProps {
  value: number;
  max: number;
  label: string;
  className?: string;
}

export function AccessibleProgress({ 
  value, 
  max, 
  label, 
  className 
}: AccessibleProgressProps) {
  const percentage = Math.round((value / max) * 100);
  
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-gray-500">{percentage}%</span>
      </div>
      
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        className="w-full bg-gray-200 rounded-full h-2"
      >
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Accessible status indicator
interface AccessibleStatusProps {
  status: 'success' | 'error' | 'warning' | 'info';
  message: string;
  className?: string;
}

export function AccessibleStatus({ 
  status, 
  message, 
  className 
}: AccessibleStatusProps) {
  const statusConfig = {
    success: {
      icon: '✓',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    error: {
      icon: '✗',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    warning: {
      icon: '⚠',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    info: {
      icon: 'ℹ',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    }
  };

  const config = statusConfig[status];

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-3 rounded-md border",
        config.bgColor,
        config.borderColor,
        className
      )}
      role="status"
      aria-live="polite"
    >
      <span className={cn("text-lg", config.color)} aria-hidden="true">
        {config.icon}
      </span>
      <span className={cn("text-sm font-medium", config.color)}>
        {message}
      </span>
    </div>
  );
} 