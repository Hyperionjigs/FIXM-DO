"use client"
import { useEffect } from 'react';
// Import camera preloader to start loading early
import '@/lib/camera-preloader';
// Import performance and accessibility utilities
import '@/lib/performance-optimizer';
import '@/lib/accessibility-seo';

export function ClientInitializer() {
  useEffect(() => {
    // Performance monitoring
    if ('performance' in window) {
      window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0];
        if (perfData) {
          console.log('🚀 Page Load Performance:', {
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
            totalLoadTime: perfData.loadEventEnd - perfData.fetchStart
          });
        }
      });
    }
    
    // Service Worker registration for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
    
    // Accessibility enhancements
    const addAccessibilityStyles = () => {
      // Add focus indicators for keyboard navigation
      const style = document.createElement('style');
      style.textContent = `
        .focus-visible:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
        
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
        
        .high-contrast {
          --background: #000000;
          --foreground: #ffffff;
          --primary: #ffffff;
          --primary-foreground: #000000;
        }
        
        /* Performance optimizations */
        .optimized-animation {
          will-change: transform;
          transform: translateZ(0);
        }
        
        .smooth-scroll {
          scroll-behavior: smooth;
        }
        
        .hardware-accelerated {
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          perspective: 1000px;
        }
        
        /* Loading animations */
        .loading-shimmer {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        /* Hover effects */
        .hover-lift {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        /* Fade in animations */
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-slide-up {
          animation: slideUp 0.6s ease-out;
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* Gradient text effect */
        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        /* Professional input styling */
        .input-professional {
          border: 2px solid transparent;
          background: linear-gradient(white, white) padding-box,
                      linear-gradient(135deg, #667eea 0%, #764ba2 100%) border-box;
          transition: all 0.3s ease;
        }
        
        .input-professional:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        /* Button styling */
        .btn-secondary {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          border: none;
          color: white;
          transition: all 0.3s ease;
        }
        
        .btn-secondary:hover {
          transform: translateY(-1px);
          box-shadow: 0 5px 15px rgba(245, 87, 108, 0.3);
        }
      `;
      document.head.appendChild(style);
    };

    // Initialize accessibility and performance features
    addAccessibilityStyles();
    
    // Initialize performance optimizer
    const performanceOptimizer = (window as any).performanceOptimizer;
    if (performanceOptimizer) {
      performanceOptimizer.optimizeImages();
      performanceOptimizer.optimizeAnimations();
    }
    
    // Initialize accessibility SEO
    const accessibilitySEO = (window as any).accessibilitySEO;
    if (accessibilitySEO) {
      accessibilitySEO.setupImageAccessibility();
      accessibilitySEO.setupButtonAccessibility();
      accessibilitySEO.setupNavigationAccessibility();
      accessibilitySEO.trackAccessibilityMetrics();
    }
    
    // Add performance monitoring
    const performanceMonitor = (window as any).performanceMonitor;
    if (performanceMonitor) {
      performanceMonitor.startTimer('client-initialization');
      performanceMonitor.endTimer('client-initialization');
    }
    
    console.log('🎯 Client initialization complete!');
  }, []);

  return null; // This component doesn't render anything
} 