// Enhanced Performance monitoring utility for comprehensive app performance tracking
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();
  private startTimes: Map<string, number> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();
  private coreWebVitals: Map<string, number> = new Map();

  private constructor() {
    this.initializeCoreWebVitals();
    this.initializePerformanceObservers();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeCoreWebVitals(): void {
    // Track Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.coreWebVitals.set('LCP', lastEntry.startTime);
          console.log('🎯 LCP:', lastEntry.startTime.toFixed(2), 'ms');
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // Track First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            this.coreWebVitals.set('FID', entry.processingStart - entry.startTime);
            console.log('⚡ FID:', (entry.processingStart - entry.startTime).toFixed(2), 'ms');
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('fid', fidObserver);
      } catch (e) {
        console.warn('FID observer not supported');
      }

      // Track Cumulative Layout Shift (CLS)
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.coreWebVitals.set('CLS', clsValue);
          console.log('📐 CLS:', clsValue.toFixed(4));
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported');
      }
    }
  }

  private initializePerformanceObservers(): void {
    // Track navigation timing
    if ('PerformanceObserver' in window) {
      try {
        const navigationObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.entryType === 'navigation') {
              this.metrics.set('DOMContentLoaded', entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart);
              this.metrics.set('LoadComplete', entry.loadEventEnd - entry.loadEventStart);
              this.metrics.set('TotalLoadTime', entry.loadEventEnd - entry.fetchStart);
              console.log('🚀 Page Load Complete:', (entry.loadEventEnd - entry.fetchStart).toFixed(2), 'ms');
            }
          });
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.set('navigation', navigationObserver);
      } catch (e) {
        console.warn('Navigation observer not supported');
      }
    }
  }

  startTimer(label: string): void {
    this.startTimes.set(label, performance.now());
  }

  endTimer(label: string): number {
    const startTime = this.startTimes.get(label);
    if (!startTime) {
      console.warn(`Timer ${label} was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.metrics.set(label, duration);
    this.startTimes.delete(label);
    
    console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    return duration;
  }

  getMetric(label: string): number | undefined {
    return this.metrics.get(label);
  }

  getCoreWebVitals(): Record<string, number> {
    const result: Record<string, number> = {};
    this.coreWebVitals.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  getAllMetrics(): Record<string, number> {
    const result: Record<string, number> = {};
    this.metrics.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  logMetrics(): void {
    console.log('📊 Performance Metrics:', this.getAllMetrics());
    console.log('🎯 Core Web Vitals:', this.getCoreWebVitals());
  }

  // Enhanced camera-specific monitoring
  startCameraLoad(): void {
    this.startTimer('camera-permissions');
  }

  endCameraPermissions(): void {
    this.endTimer('camera-permissions');
    this.startTimer('camera-stream');
  }

  endCameraStream(): void {
    this.endTimer('camera-stream');
    this.startTimer('camera-metadata');
  }

  endCameraMetadata(): void {
    this.endTimer('camera-metadata');
    this.startTimer('camera-ready');
  }

  endCameraReady(): void {
    this.endTimer('camera-ready');
    console.log('📸 Camera fully loaded!');
  }

  // OpenCV-specific monitoring
  startOpenCVLoad(): void {
    this.startTimer('opencv-load');
  }

  endOpenCVLoad(): void {
    this.endTimer('opencv-load');
    console.log('🤖 OpenCV loaded!');
  }

  // Firebase performance monitoring
  startFirebaseOperation(operation: string): void {
    this.startTimer(`firebase-${operation}`);
  }

  endFirebaseOperation(operation: string): void {
    this.endTimer(`firebase-${operation}`);
  }

  // Component render monitoring
  startComponentRender(componentName: string): void {
    this.startTimer(`render-${componentName}`);
  }

  endComponentRender(componentName: string): void {
    this.endTimer(`render-${componentName}`);
  }

  // API call monitoring
  startAPICall(endpoint: string): void {
    this.startTimer(`api-${endpoint}`);
  }

  endAPICall(endpoint: string): void {
    this.endTimer(`api-${endpoint}`);
  }

  // Memory usage monitoring
  getMemoryUsage(): Record<string, number> {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        memoryUsagePercent: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };
    }
    return {};
  }

  // Performance score calculation
  calculatePerformanceScore(): number {
    const lcp = this.coreWebVitals.get('LCP') || 0;
    const fid = this.coreWebVitals.get('FID') || 0;
    const cls = this.coreWebVitals.get('CLS') || 0;

    let score = 100;

    // LCP scoring (0-2500ms is good, 2500-4000ms needs improvement, >4000ms is poor)
    if (lcp > 4000) score -= 30;
    else if (lcp > 2500) score -= 15;

    // FID scoring (0-100ms is good, 100-300ms needs improvement, >300ms is poor)
    if (fid > 300) score -= 30;
    else if (fid > 100) score -= 15;

    // CLS scoring (0-0.1 is good, 0.1-0.25 needs improvement, >0.25 is poor)
    if (cls > 0.25) score -= 30;
    else if (cls > 0.1) score -= 15;

    return Math.max(0, score);
  }

  // Cleanup observers
  cleanup(): void {
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers.clear();
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance(); 