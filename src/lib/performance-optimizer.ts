// Performance optimization utilities for faster loading and better UX
import { performanceMonitor } from './performance-monitor';

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private lazyLoadObserver: IntersectionObserver | null = null;
  private preloadedResources: Set<string> = new Set();

  private constructor() {
    this.initializeLazyLoading();
    this.preloadCriticalResources();
  }

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  private initializeLazyLoading(): void {
    if ('IntersectionObserver' in window) {
      this.lazyLoadObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const target = entry.target as HTMLElement;
              this.loadLazyElement(target);
            }
          });
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.1
        }
      );
    }
  }

  private loadLazyElement(element: HTMLElement): void {
    const dataSrc = element.getAttribute('data-src');
    const dataSrcset = element.getAttribute('data-srcset');
    
    if (dataSrc) {
      if (element.tagName === 'IMG') {
        const img = element as HTMLImageElement;
        img.src = dataSrc;
        if (dataSrcset) img.srcset = dataSrcset;
        img.classList.remove('lazy');
        img.classList.add('loaded');
      }
    }

    this.lazyLoadObserver?.unobserve(element);
  }

  private preloadCriticalResources(): void {
    // Preload critical fonts
    this.preloadFont('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    // Preload critical images
    this.preloadImage('/favicon.svg');
    
    // Preload critical API endpoints
    this.preloadAPI('/api/verify-selfie');
  }

  private preloadFont(href: string): void {
    if (this.preloadedResources.has(href)) return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    link.onload = () => {
      const style = document.createElement('link');
      style.rel = 'stylesheet';
      style.href = href;
      document.head.appendChild(style);
    };
    document.head.appendChild(link);
    this.preloadedResources.add(href);
  }

  private preloadImage(src: string): void {
    if (this.preloadedResources.has(src)) return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
    this.preloadedResources.add(src);
  }

  private preloadAPI(endpoint: string): void {
    if (this.preloadedResources.has(endpoint)) return;
    
    // Preconnect to API domain
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = window.location.origin;
    document.head.appendChild(link);
    this.preloadedResources.add(endpoint);
  }

  // Optimize images with lazy loading
  optimizeImages(): void {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach((img) => {
      this.lazyLoadObserver?.observe(img);
    });
  }

  // Optimize Firebase operations
  optimizeFirebaseQueries(): void {
    // Implement query caching and optimization
    const cache = new Map();
    
    return {
      get: (key: string) => cache.get(key),
      set: (key: string, value: any, ttl: number = 300000) => {
        cache.set(key, {
          value,
          expiry: Date.now() + ttl
        });
      },
      clear: () => cache.clear()
    };
  }

  // Optimize component rendering
  optimizeComponentRender(componentName: string, renderFn: () => void): void {
    performanceMonitor.startComponentRender(componentName);
    
    // Use requestAnimationFrame for smooth rendering
    requestAnimationFrame(() => {
      renderFn();
      performanceMonitor.endComponentRender(componentName);
    });
  }

  // Optimize API calls with debouncing
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Optimize scroll performance
  optimizeScroll(callback: () => void): void {
    let ticking = false;
    
    const updateScroll = () => {
      callback();
      ticking = false;
    };

    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    return requestTick;
  }

  // Optimize memory usage
  optimizeMemory(): void {
    // Clear unused event listeners
    const cleanup = () => {
      // Force garbage collection if available
      if ('gc' in window) {
        (window as any).gc();
      }
    };

    // Run cleanup periodically
    setInterval(cleanup, 30000); // Every 30 seconds
  }

  // Optimize bundle loading
  async loadChunk(chunkName: string): Promise<any> {
    performanceMonitor.startTimer(`chunk-load-${chunkName}`);
    
    try {
      const module = await import(/* webpackChunkName: "[request]" */ `../${chunkName}`);
      performanceMonitor.endTimer(`chunk-load-${chunkName}`);
      return module;
    } catch (error) {
      console.error(`Failed to load chunk: ${chunkName}`, error);
      throw error;
    }
  }

  // Optimize animations
  optimizeAnimations(): void {
    // Use CSS transforms instead of changing layout properties
    const style = document.createElement('style');
    style.textContent = `
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
    `;
    document.head.appendChild(style);
  }

  // Optimize network requests
  optimizeNetworkRequests(): void {
    // Implement request batching
    const batchRequests = new Map();
    const batchTimeout = 100; // ms

    return {
      batch: (key: string, request: () => Promise<any>) => {
        if (batchRequests.has(key)) {
          return batchRequests.get(key);
        }

        const promise = new Promise((resolve, reject) => {
          setTimeout(async () => {
            try {
              const result = await request();
              resolve(result);
            } catch (error) {
              reject(error);
            } finally {
              batchRequests.delete(key);
            }
          }, batchTimeout);
        });

        batchRequests.set(key, promise);
        return promise;
      }
    };
  }

  // Get performance insights
  getPerformanceInsights(): Record<string, any> {
    const metrics = performanceMonitor.getAllMetrics();
    const coreWebVitals = performanceMonitor.getCoreWebVitals();
    const memoryUsage = performanceMonitor.getMemoryUsage();
    const performanceScore = performanceMonitor.calculatePerformanceScore();

    return {
      metrics,
      coreWebVitals,
      memoryUsage,
      performanceScore,
      recommendations: this.generateRecommendations(metrics, coreWebVitals, memoryUsage)
    };
  }

  private generateRecommendations(
    metrics: Record<string, number>,
    coreWebVitals: Record<string, number>,
    memoryUsage: Record<string, number>
  ): string[] {
    const recommendations: string[] = [];

    // LCP recommendations
    if (coreWebVitals.LCP > 4000) {
      recommendations.push('Optimize Largest Contentful Paint: Consider lazy loading images and optimizing critical resources');
    }

    // FID recommendations
    if (coreWebVitals.FID > 300) {
      recommendations.push('Improve First Input Delay: Reduce JavaScript execution time and optimize event handlers');
    }

    // CLS recommendations
    if (coreWebVitals.CLS > 0.25) {
      recommendations.push('Reduce Cumulative Layout Shift: Reserve space for dynamic content and avoid layout shifts');
    }

    // Memory recommendations
    if (memoryUsage.memoryUsagePercent > 80) {
      recommendations.push('High memory usage detected: Consider implementing memory cleanup and optimizing data structures');
    }

    return recommendations;
  }

  // Cleanup
  cleanup(): void {
    this.lazyLoadObserver?.disconnect();
    this.preloadedResources.clear();
  }
}

export const performanceOptimizer = PerformanceOptimizer.getInstance(); 