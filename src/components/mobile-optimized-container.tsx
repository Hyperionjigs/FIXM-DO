"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface MobileOptimizedContainerProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  touchFriendly?: boolean;
  safeArea?: boolean;
}

export function MobileOptimizedContainer({ 
  children, 
  className,
  padding = 'md',
  maxWidth = 'lg',
  touchFriendly = true,
  safeArea = true
}: MobileOptimizedContainerProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6'
  };

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full'
  };

  const touchClasses = touchFriendly ? 'touch-manipulation' : '';
  const safeAreaClasses = safeArea ? 'safe-area-inset' : '';

  return (
    <div className={cn(
      "mx-auto w-full",
      paddingClasses[padding],
      maxWidthClasses[maxWidth],
      touchClasses,
      safeAreaClasses,
      "min-h-[44px]", // Minimum touch target size
      className
    )}>
      {children}
    </div>
  );
}

// Touch-friendly button wrapper
interface TouchFriendlyButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function TouchFriendlyButton({ 
  children, 
  onClick, 
  className,
  disabled = false,
  size = 'md'
}: TouchFriendlyButtonProps) {
  const sizeClasses = {
    sm: 'min-h-[32px] min-w-[32px] px-2 py-1 text-sm',
    md: 'min-h-[44px] min-w-[44px] px-4 py-2 text-base',
    lg: 'min-h-[48px] min-w-[48px] px-6 py-3 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "touch-manipulation select-none",
        "transition-all duration-200 ease-in-out",
        "active:scale-95 disabled:active:scale-100",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        sizeClasses[size],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
}

// Mobile-optimized input wrapper
interface MobileOptimizedInputProps {
  children: ReactNode;
  className?: string;
  error?: boolean;
}

export function MobileOptimizedInput({ 
  children, 
  className,
  error = false
}: MobileOptimizedInputProps) {
  return (
    <div className={cn(
      "min-h-[44px]", // Minimum touch target
      "touch-manipulation",
      "transition-all duration-200",
      error && "ring-2 ring-red-500",
      className
    )}>
      {children}
    </div>
  );
}

// Mobile-optimized card
interface MobileOptimizedCardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export function MobileOptimizedCard({ 
  children, 
  className,
  padding = 'md',
  interactive = false
}: MobileOptimizedCardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  return (
    <div className={cn(
      "bg-white dark:bg-gray-800",
      "rounded-lg shadow-sm border",
      "transition-all duration-200",
      paddingClasses[padding],
      interactive && "hover:shadow-md active:scale-[0.98]",
      "touch-manipulation",
      className
    )}>
      {children}
    </div>
  );
}

// Mobile-optimized list
interface MobileOptimizedListProps {
  children: ReactNode;
  className?: string;
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

export function MobileOptimizedList({ 
  children, 
  className,
  spacing = 'md'
}: MobileOptimizedListProps) {
  const spacingClasses = {
    none: '',
    sm: 'space-y-2',
    md: 'space-y-3',
    lg: 'space-y-4'
  };

  return (
    <div className={cn(
      "w-full",
      spacingClasses[spacing],
      className
    )}>
      {children}
    </div>
  );
}

// Mobile-optimized list item
interface MobileOptimizedListItemProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
}

export function MobileOptimizedListItem({ 
  children, 
  className,
  interactive = false,
  onClick
}: MobileOptimizedListItemProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "min-h-[44px]",
        "touch-manipulation",
        "transition-all duration-200",
        interactive && "hover:bg-gray-50 dark:hover:bg-gray-700",
        interactive && "active:bg-gray-100 dark:active:bg-gray-600",
        interactive && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
} 