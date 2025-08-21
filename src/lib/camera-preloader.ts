// Camera preloader utility to improve loading performance
class CameraPreloader {
  private static instance: CameraPreloader;
  private cameraPermissionRequested = false;
  private openCVLoadingStarted = false;

  private constructor() {}

  static getInstance(): CameraPreloader {
    if (!CameraPreloader.instance) {
      CameraPreloader.instance = new CameraPreloader();
    }
    return CameraPreloader.instance;
  }

  // Preload camera permissions
  async preloadCameraPermissions(): Promise<void> {
    if (this.cameraPermissionRequested) return;
    
    try {
      // Request camera permissions early
      await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 }
        } 
      });
      this.cameraPermissionRequested = true;
      console.log('Camera permissions preloaded successfully');
    } catch (error) {
      console.log('Camera permissions not granted yet, will request when needed');
    }
  }

  // Preload OpenCV library
  async preloadOpenCV(): Promise<void> {
    if (this.openCVLoadingStarted) return;
    
    this.openCVLoadingStarted = true;
    
    try {
      // Check if OpenCV is already loaded
      if (window.cv) {
        console.log('OpenCV already loaded');
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="opencv.js"]');
      if (existingScript) {
        console.log('OpenCV script already loading');
        return;
      }

      // Load OpenCV script
      const script = document.createElement('script');
      script.src = 'https://docs.opencv.org/4.8.0/opencv.js';
      script.async = true;
      script.onload = () => {
        console.log('OpenCV preloaded successfully');
      };
      script.onerror = () => {
        console.warn('OpenCV preloading failed, will load when needed');
      };
      document.head.appendChild(script);
    } catch (error) {
      console.warn('OpenCV preloading error:', error);
    }
  }

  // Start all preloading
  async preloadAll(): Promise<void> {
    // Start both preloading tasks in parallel
    await Promise.allSettled([
      this.preloadCameraPermissions(),
      this.preloadOpenCV()
    ]);
  }
}

// Export singleton instance
export const cameraPreloader = CameraPreloader.getInstance();

// Auto-start preloading when this module is imported
if (typeof window !== 'undefined') {
  // Start preloading after a short delay to not block initial page load
  setTimeout(() => {
    cameraPreloader.preloadAll();
  }, 1000);
} 