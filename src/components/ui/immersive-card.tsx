'use client';

import React, { forwardRef, useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { designSystem } from '@/lib/design-system';
import { AnimationController, animationPresets, GestureRecognizer } from '@/lib/animation-library';

export interface ImmersiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gradient' | 'neon' | 'holographic';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  parallax?: boolean;
  tilt?: boolean;
  glow?: boolean;
  border?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  animation?: 'none' | 'fadeIn' | 'scaleIn' | 'bounceIn' | 'slideInUp' | 'slideInLeft';
  hoverEffect?: 'lift' | 'glow' | 'scale' | 'rotate' | 'tilt' | 'none';
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  image?: string;
  imageAlt?: string;
  overlay?: React.ReactNode;
}

const ImmersiveCard = forwardRef<HTMLDivElement, ImmersiveCardProps>(
  (
    {
      variant = 'default',
      size = 'md',
      interactive = true,
      parallax = false,
      tilt = false,
      glow = false,
      border = true,
      shadow = 'md',
      animation = 'none',
      hoverEffect = 'lift',
      className,
      children,
      header,
      footer,
      image,
      imageAlt,
      overlay,
      ...props
    },
    ref
  ) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const animationController = useRef<AnimationController | null>(null);
    const gestureRecognizer = useRef<GestureRecognizer | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Initialize components
    useEffect(() => {
      if (cardRef.current) {
        // Initialize animation controller
        animationController.current = new AnimationController(cardRef.current);
        
        // Apply initial animation
        if (animation !== 'none') {
          const preset = animationPresets[animation];
          if (preset) {
            animationController.current.animate(preset, { delay: '200ms' });
          }
        }

        // Initialize gesture recognizer for mobile interactions
        if (interactive) {
          gestureRecognizer.current = new GestureRecognizer(cardRef.current);
          
          // Add swipe gestures
          gestureRecognizer.current.addGesture({
            type: 'swipe',
            direction: 'left',
            callback: () => {
              if (animationController.current) {
                animationController.current.animate(animationPresets.slideInLeft);
              }
            },
          });

          gestureRecognizer.current.addGesture({
            type: 'swipe',
            direction: 'right',
            callback: () => {
              if (animationController.current) {
                animationController.current.animate(animationPresets.slideInRight);
              }
            },
          });
        }
      }
    }, [animation, interactive]);

    // Handle mouse movement for tilt effect
    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
      if (!interactive || !tilt || !cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;

      setMousePosition({ x, y });
      
      cardRef.current.style.transform = `
        perspective(1000px) 
        rotateX(${rotateX}deg) 
        rotateY(${rotateY}deg)
        ${isHovered && hoverEffect === 'scale' ? 'scale(1.02)' : 'scale(1)'}
      `;
    };

    // Handle mouse leave
    const handleMouseLeave = () => {
      if (!interactive || !cardRef.current) return;

      setIsHovered(false);
      
      if (tilt) {
        cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
      } else if (hoverEffect === 'scale') {
        cardRef.current.style.transform = 'scale(1)';
      }
    };

    // Handle mouse enter
    const handleMouseEnter = () => {
      if (!interactive) return;
      setIsHovered(true);
    };

    // Handle scroll for parallax effect
    useEffect(() => {
      if (!parallax || !imageRef.current) return;

      const handleScroll = () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        imageRef.current!.style.transform = `translateY(${rate}px)`;
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, [parallax]);

    // Base styles
    const baseStyles = cn(
      'relative overflow-hidden transition-all duration-500 ease-out',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      {
        'cursor-pointer': interactive,
        'transform-gpu': tilt || hoverEffect === 'scale',
        'backdrop-blur-sm': variant === 'glass',
      }
    );

    // Size styles
    const sizeStyles = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
    };

    // Variant styles
    const variantStyles = {
      default: cn(
        'bg-white dark:bg-gray-800',
        border && 'border border-gray-200 dark:border-gray-700',
      ),
      glass: cn(
        'bg-white/10 backdrop-blur-md',
        border && 'border border-white/20',
      ),
      gradient: cn(
        'bg-gradient-to-br from-primary-500 via-secondary-500 to-purple-500',
        border && 'border border-primary-400',
      ),
      neon: cn(
        'bg-gray-900',
        border && 'border border-cyan-400',
        glow && 'shadow-cyan-400/50',
      ),
      holographic: cn(
        'bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600',
        'animate-gradient-x',
        border && 'border border-cyan-300',
      ),
    };

    // Shadow styles
    const shadowStyles = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
      '2xl': 'shadow-2xl',
    };

    // Hover effect styles
    const hoverStyles = {
      lift: 'hover:-translate-y-2',
      glow: 'hover:shadow-2xl',
      scale: 'hover:scale-105',
      rotate: 'hover:rotate-1',
      tilt: '', // Handled by JavaScript
      none: '',
    };

    return (
      <div
        ref={(node) => {
          // Handle both refs
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
          cardRef.current = node;
        }}
        className={cn(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          shadowStyles[shadow],
          hoverStyles[hoverEffect],
          className
        )}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transformStyle: 'preserve-3d',
          transition: tilt ? 'transform 0.1s ease-out' : 'all 0.3s ease-out',
        }}
        {...props}
      >
        {/* Background gradient overlay for holographic effect */}
        {variant === 'holographic' && (
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent animate-pulse" />
        )}

        {/* Neon glow effect */}
        {variant === 'neon' && glow && (
          <div className="absolute inset-0 bg-cyan-400/20 blur-xl animate-pulse" />
        )}

        {/* Image with parallax effect */}
        {image && (
          <div className="relative overflow-hidden">
            <img
              ref={imageRef}
              src={image}
              alt={imageAlt || 'Card image'}
              className={cn(
                'w-full h-48 object-cover transition-transform duration-700',
                parallax && 'transform-gpu'
              )}
            />
            {overlay && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                {overlay}
              </div>
            )}
          </div>
        )}

        {/* Header */}
        {header && (
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            {header}
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            {footer}
          </div>
        )}

        {/* Interactive overlay for glass effect */}
        {variant === 'glass' && interactive && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        )}
      </div>
    );
  }
);

ImmersiveCard.displayName = 'ImmersiveCard';

export { ImmersiveCard };

// CSS for additional effects
const styles = `
  @keyframes gradient-x {
    0%, 100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }

  .animate-gradient-x {
    background-size: 200% 200%;
    animation: gradient-x 3s ease infinite;
  }

  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
} 