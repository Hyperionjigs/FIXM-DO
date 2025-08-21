'use client';

import React, { forwardRef, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { designSystem } from '@/lib/design-system';
import { AnimationController, animationPresets } from '@/lib/animation-library';

export interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  animation?: 'none' | 'fadeIn' | 'scaleIn' | 'bounceIn' | 'slideInUp' | 'slideInLeft';
  hoverEffect?: 'scale' | 'glow' | 'slide' | 'rotate' | 'none';
  clickEffect?: 'ripple' | 'pulse' | 'shake' | 'none';
  disabled?: boolean;
  fullWidth?: boolean;
  rounded?: boolean;
  gradient?: boolean;
  glass?: boolean;
  children: React.ReactNode;
}

const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      animation = 'none',
      hoverEffect = 'scale',
      clickEffect = 'ripple',
      disabled = false,
      fullWidth = false,
      rounded = false,
      gradient = false,
      glass = false,
      className,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const animationController = useRef<AnimationController | null>(null);
    const rippleRef = useRef<HTMLDivElement>(null);

    // Initialize animation controller
    useEffect(() => {
      if (buttonRef.current) {
        animationController.current = new AnimationController(buttonRef.current);
        
        // Apply initial animation
        if (animation !== 'none') {
          const preset = animationPresets[animation];
          if (preset) {
            animationController.current.animate(preset, { delay: '100ms' });
          }
        }
      }
    }, [animation]);

    // Handle click effects
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return;

      // Create ripple effect
      if (clickEffect === 'ripple' && rippleRef.current) {
        const rect = buttonRef.current?.getBoundingClientRect();
        if (rect) {
          const size = Math.max(rect.width, rect.height);
          const x = event.clientX - rect.left - size / 2;
          const y = event.clientY - rect.top - size / 2;

          rippleRef.current.style.width = rippleRef.current.style.height = `${size}px`;
          rippleRef.current.style.left = `${x}px`;
          rippleRef.current.style.top = `${y}px`;
          rippleRef.current.classList.add('animate-ripple');
        }
      }

      // Apply click animation
      if (clickEffect === 'pulse' && animationController.current) {
        animationController.current.pulse();
      } else if (clickEffect === 'shake' && animationController.current) {
        animationController.current.animate(animationPresets.shake);
      }

      onClick?.(event);
    };

    // Handle hover effects
    const handleMouseEnter = () => {
      if (disabled || loading) return;

      if (hoverEffect === 'scale' && animationController.current) {
        animationController.current.animate(animationPresets.scaleUp);
      } else if (hoverEffect === 'glow') {
        buttonRef.current?.classList.add('glow-effect');
      } else if (hoverEffect === 'slide') {
        buttonRef.current?.classList.add('slide-effect');
      } else if (hoverEffect === 'rotate') {
        buttonRef.current?.classList.add('rotate-effect');
      }
    };

    const handleMouseLeave = () => {
      if (disabled || loading) return;

      if (hoverEffect === 'scale' && animationController.current) {
        animationController.current.animate(animationPresets.scaleDown);
      } else if (hoverEffect === 'glow') {
        buttonRef.current?.classList.remove('glow-effect');
      } else if (hoverEffect === 'slide') {
        buttonRef.current?.classList.remove('slide-effect');
      } else if (hoverEffect === 'rotate') {
        buttonRef.current?.classList.remove('rotate-effect');
      }
    };

    // Base styles
    const baseStyles = cn(
      'relative inline-flex items-center justify-center font-medium transition-all duration-300 ease-out',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
      'overflow-hidden', // For ripple effect
      {
        'w-full': fullWidth,
        'rounded-full': rounded,
        'backdrop-blur-sm bg-white/10 border border-white/20': glass,
      }
    );

    // Size styles
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-base gap-2',
      lg: 'px-6 py-3 text-lg gap-2.5',
      xl: 'px-8 py-4 text-xl gap-3',
    };

    // Variant styles
    const variantStyles = {
      primary: cn(
        'bg-primary-600 text-white border border-primary-600',
        'hover:bg-primary-700 hover:border-primary-700',
        'focus:ring-primary-500',
        'active:bg-primary-800',
        {
          'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800': gradient,
        }
      ),
      secondary: cn(
        'bg-secondary-600 text-white border border-secondary-600',
        'hover:bg-secondary-700 hover:border-secondary-700',
        'focus:ring-secondary-500',
        'active:bg-secondary-800',
        {
          'bg-gradient-to-r from-secondary-600 to-secondary-700 hover:from-secondary-700 hover:to-secondary-800': gradient,
        }
      ),
      outline: cn(
        'bg-transparent text-primary-600 border border-primary-600',
        'hover:bg-primary-50 hover:border-primary-700',
        'focus:ring-primary-500',
        'active:bg-primary-100',
      ),
      ghost: cn(
        'bg-transparent text-gray-700 border border-transparent',
        'hover:bg-gray-100 hover:text-gray-900',
        'focus:ring-gray-500',
        'active:bg-gray-200',
      ),
      destructive: cn(
        'bg-red-600 text-white border border-red-600',
        'hover:bg-red-700 hover:border-red-700',
        'focus:ring-red-500',
        'active:bg-red-800',
        {
          'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800': gradient,
        }
      ),
      success: cn(
        'bg-green-600 text-white border border-green-600',
        'hover:bg-green-700 hover:border-green-700',
        'focus:ring-green-500',
        'active:bg-green-800',
        {
          'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800': gradient,
        }
      ),
      warning: cn(
        'bg-yellow-600 text-white border border-yellow-600',
        'hover:bg-yellow-700 hover:border-yellow-700',
        'focus:ring-yellow-500',
        'active:bg-yellow-800',
        {
          'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800': gradient,
        }
      ),
    };

    return (
      <button
        ref={(node) => {
          // Handle both refs
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
          buttonRef.current = node;
        }}
        className={cn(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        disabled={disabled || loading}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-inherit">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Content */}
        <div className={cn('flex items-center', { 'opacity-0': loading })}>
          {icon && iconPosition === 'left' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
          <span>{children}</span>
          {icon && iconPosition === 'right' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
        </div>

        {/* Ripple effect */}
        {clickEffect === 'ripple' && (
          <div
            ref={rippleRef}
            className="absolute pointer-events-none rounded-full bg-white/30 transform scale-0"
            style={{
              transition: 'transform 0.6s ease-out, opacity 0.6s ease-out',
            }}
          />
        )}
      </button>
    );
  }
);

EnhancedButton.displayName = 'EnhancedButton';

export { EnhancedButton };

// CSS for additional effects
const styles = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }

  .animate-ripple {
    animation: ripple 0.6s ease-out;
  }

  .glow-effect {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
  }

  .slide-effect {
    transform: translateY(-2px);
  }

  .rotate-effect {
    transform: rotate(5deg);
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
} 