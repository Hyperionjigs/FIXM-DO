// FixMo PWA Service
// Handles service worker registration, push notifications, and app installation

export class PWAService {
  private static instance: PWAService;
  private registration: ServiceWorkerRegistration | null = null;
  private deferredPrompt: any = null;
  // Rename to avoid clashing with the public isOnline() method
  private online = navigator.onLine;

  private constructor() {
    this.initialize();
  }

  static getInstance(): PWAService {
    if (!PWAService.instance) {
      PWAService.instance = new PWAService();
    }
    return PWAService.instance;
  }

  private async initialize(): Promise<void> {
    try {
      // Register service worker
      await this.registerServiceWorker();
      
      // Set up app installation prompt
      this.setupInstallPrompt();
      
      // Set up online/offline detection
      this.setupConnectionDetection();
      
      // Set up push notification permission (non-blocking)
      this.setupPushNotifications().catch(error => {
        console.log('[PWA] Push notifications setup failed:', error);
      });
      
      console.log('[PWA] Service initialized successfully');
    } catch (error) {
      console.error('[PWA] Failed to initialize:', error);
    }
  }

  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        console.log('[PWA] Service worker registered:', this.registration);

        // Handle service worker updates
        this.registration.addEventListener('updatefound', () => {
          const newWorker = this.registration!.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateNotification();
              }
            });
          }
        });

        // Handle service worker messages
        navigator.serviceWorker.addEventListener('message', (event) => {
          this.handleServiceWorkerMessage(event.data);
        });

      } catch (error) {
        console.error('[PWA] Service worker registration failed:', error);
      }
    }
  }

  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.deferredPrompt = event;
      this.showInstallPrompt();
    });

    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installed successfully');
      this.deferredPrompt = null;
      this.hideInstallPrompt();
    });
  }

  private setupConnectionDetection(): void {
    window.addEventListener('online', () => {
      this.online = true;
      this.handleOnlineStatus(true);
    });

    window.addEventListener('offline', () => {
      this.online = false;
      this.handleOnlineStatus(false);
    });
  }

  private async setupPushNotifications(): Promise<void> {
    if ('Notification' in window && this.registration) {
      try {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          console.log('[PWA] Push notifications enabled');
          await this.subscribeToPushNotifications();
        } else {
          console.log('[PWA] Push notifications not granted');
        }
      } catch (error) {
        console.log('[PWA] Push notifications setup failed:', error);
      }
    } else {
      console.log('[PWA] Push notifications not supported');
    }
  }

  private async subscribeToPushNotifications(): Promise<void> {
    if (!this.registration) return;

    // Check if VAPID key is available
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      console.log('[PWA] VAPID key not configured, skipping push notification subscription');
      return;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidKey)
      });

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      
      console.log('[PWA] Push subscription created:', subscription);
    } catch (error) {
      console.error('[PWA] Failed to subscribe to push notifications:', error);
    }
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      });

      if (!response.ok) {
        throw new Error('Failed to send subscription to server');
      }
    } catch (error) {
      console.error('[PWA] Failed to send subscription to server:', error);
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private handleServiceWorkerMessage(data: any): void {
    switch (data.type) {
      case 'CACHE_UPDATED':
        console.log('[PWA] Cache updated:', data.payload);
        break;
      case 'BACKGROUND_SYNC':
        console.log('[PWA] Background sync triggered');
        break;
      case 'PUSH_RECEIVED':
        console.log('[PWA] Push notification received:', data.payload);
        break;
      default:
        console.log('[PWA] Unknown message type:', data.type);
    }
  }

  private handleOnlineStatus(isOnline: boolean): void {
    if (isOnline) {
      console.log('[PWA] Connection restored');
      this.triggerBackgroundSync();
    } else {
      console.log('[PWA] Connection lost');
    }
  }

  private async triggerBackgroundSync(): Promise<void> {
    if (this.registration && 'sync' in this.registration) {
      try {
        await this.registration.sync.register('background-sync');
        console.log('[PWA] Background sync registered');
      } catch (error) {
        console.error('[PWA] Failed to register background sync:', error);
      }
    }
  }

  // Public methods
  public async installApp(): Promise<void> {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt');
      } else {
        console.log('[PWA] User dismissed the install prompt');
      }
      
      this.deferredPrompt = null;
    }
  }

  public async sendPushNotification(title: string, options: NotificationOptions): Promise<void> {
    if (this.registration) {
      try {
        await this.registration.showNotification(title, {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          vibrate: [100, 50, 100],
          ...options
        });
      } catch (error) {
        console.error('[PWA] Failed to show notification:', error);
      }
    }
  }

  public async updateApp(): Promise<void> {
    if (this.registration) {
      try {
        await this.registration.update();
        console.log('[PWA] App update triggered');
      } catch (error) {
        console.error('[PWA] Failed to update app:', error);
      }
    }
  }

  public isAppInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  public isOnline(): boolean {
    return this.online;
  }

  public getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  // UI notification methods
  private showInstallPrompt(): void {
    // Create install prompt UI
    const prompt = document.createElement('div');
    prompt.id = 'pwa-install-prompt';
    prompt.innerHTML = `
      <div class="pwa-prompt">
        <div class="pwa-prompt-content">
          <h3>📱 Install FixMo</h3>
          <p>Get the full app experience with offline access and push notifications!</p>
          <div class="pwa-prompt-actions">
            <button class="pwa-install-btn" onclick="window.pwaService.installApp()">
              Install App
            </button>
            <button class="pwa-dismiss-btn" onclick="window.pwaService.hideInstallPrompt()">
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .pwa-prompt {
        position: fixed;
        bottom: 20px;
        left: 20px;
        right: 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideUp 0.3s ease-out;
      }
      .pwa-prompt-content {
        padding: 20px;
        text-align: center;
      }
      .pwa-prompt h3 {
        margin: 0 0 10px 0;
        color: #2d3748;
      }
      .pwa-prompt p {
        margin: 0 0 20px 0;
        color: #718096;
      }
      .pwa-prompt-actions {
        display: flex;
        gap: 10px;
        justify-content: center;
      }
      .pwa-install-btn {
        background: #667eea;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 25px;
        cursor: pointer;
        font-weight: 600;
      }
      .pwa-dismiss-btn {
        background: transparent;
        color: #667eea;
        border: 1px solid #667eea;
        padding: 10px 20px;
        border-radius: 25px;
        cursor: pointer;
      }
      @keyframes slideUp {
        from { transform: translateY(100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(prompt);
  }

  private hideInstallPrompt(): void {
    const prompt = document.getElementById('pwa-install-prompt');
    if (prompt) {
      prompt.remove();
    }
  }

  private showUpdateNotification(): void {
    const notification = document.createElement('div');
    notification.id = 'pwa-update-notification';
    notification.innerHTML = `
      <div class="pwa-update">
        <div class="pwa-update-content">
          <h3>🔄 Update Available</h3>
          <p>A new version of FixMo is available!</p>
          <button class="pwa-update-btn" onclick="window.pwaService.updateApp()">
            Update Now
          </button>
        </div>
      </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .pwa-update {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #48bb78;
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
      }
      .pwa-update-content {
        padding: 15px;
        text-align: center;
      }
      .pwa-update h3 {
        margin: 0 0 5px 0;
        font-size: 14px;
      }
      .pwa-update p {
        margin: 0 0 10px 0;
        font-size: 12px;
        opacity: 0.9;
      }
      .pwa-update-btn {
        background: rgba(255,255,255,0.2);
        color: white;
        border: none;
        padding: 5px 15px;
        border-radius: 15px;
        cursor: pointer;
        font-size: 12px;
      }
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 10000);
  }
}

// Export singleton instance
export const pwaService = PWAService.getInstance();

// Make available globally for UI components
if (typeof window !== 'undefined') {
  (window as any).pwaService = pwaService;
} 