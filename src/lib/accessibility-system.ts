// Comprehensive Accessibility System for WCAG 2.1 AA Compliance
export interface AccessibilityConfig {
  enableScreenReader: boolean;
  enableKeyboardNavigation: boolean;
  enableHighContrast: boolean;
  enableReducedMotion: boolean;
  enableVoiceCommands: boolean;
  focusIndicatorStyle: 'outline' | 'ring' | 'glow';
  announcementDelay: number;
}

export interface AccessibilityAnnouncement {
  id: string;
  message: string;
  priority: 'polite' | 'assertive';
  timestamp: number;
}

export class AccessibilitySystem {
  private static instance: AccessibilitySystem;
  private config: AccessibilityConfig;
  private announcements: AccessibilityAnnouncement[] = [];
  private focusHistory: HTMLElement[] = [];
  private isInitialized = false;

  private constructor() {
    this.config = {
      enableScreenReader: true,
      enableKeyboardNavigation: true,
      enableHighContrast: false,
      enableReducedMotion: false,
      enableVoiceCommands: false,
      focusIndicatorStyle: 'outline',
      announcementDelay: 100,
    };
  }

  static getInstance(): AccessibilitySystem {
    if (!AccessibilitySystem.instance) {
      AccessibilitySystem.instance = new AccessibilitySystem();
    }
    return AccessibilitySystem.instance;
  }

  // Initialize accessibility system
  public initialize(): void {
    if (this.isInitialized) return;

    this.setupFocusManagement();
    this.setupKeyboardNavigation();
    this.setupScreenReaderSupport();
    this.setupHighContrastMode();
    this.setupReducedMotion();
    this.setupVoiceCommands();
    this.setupAccessibilityStyles();
    this.setupSkipLinks();
    this.setupLiveRegions();

    this.isInitialized = true;
    console.log('♿ Accessibility system initialized');
  }

  // Focus Management
  private setupFocusManagement(): void {
    // Track focus history
    document.addEventListener('focusin', (event) => {
      const target = event.target as HTMLElement;
      if (target && target !== document.body) {
        this.focusHistory.push(target);
        if (this.focusHistory.length > 10) {
          this.focusHistory.shift();
        }
      }
    });

    // Add focus indicators
    document.addEventListener('focusin', (event) => {
      const target = event.target as HTMLElement;
      if (target && !target.classList.contains('no-focus-indicator')) {
        target.classList.add('focus-visible');
      }
    });

    document.addEventListener('focusout', (event) => {
      const target = event.target as HTMLElement;
      if (target) {
        target.classList.remove('focus-visible');
      }
    });
  }

  // Keyboard Navigation
  private setupKeyboardNavigation(): void {
    if (!this.config.enableKeyboardNavigation) return;

    // Handle tab navigation
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });

    // Handle mouse navigation
    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });

    // Escape key handling
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.handleEscapeKey();
      }
    });

    // Arrow key navigation for custom components
    document.addEventListener('keydown', (event) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        this.handleArrowKeyNavigation(event);
      }
    });
  }

  // Screen Reader Support
  private setupScreenReaderSupport(): void {
    if (!this.config.enableScreenReader) return;

    // Create live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.id = 'accessibility-live-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
  }

  // High Contrast Mode
  private setupHighContrastMode(): void {
    if (!this.config.enableHighContrast) return;

    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    const handleContrastChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
    };

    mediaQuery.addEventListener('change', handleContrastChange);
    
    // Initial check
    if (mediaQuery.matches) {
      document.documentElement.classList.add('high-contrast');
    }
  }

  // Reduced Motion
  private setupReducedMotion(): void {
    if (!this.config.enableReducedMotion) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.documentElement.classList.add('reduced-motion');
      } else {
        document.documentElement.classList.remove('reduced-motion');
      }
    };

    mediaQuery.addEventListener('change', handleMotionChange);
    
    // Initial check
    if (mediaQuery.matches) {
      document.documentElement.classList.add('reduced-motion');
    }
  }

  // Voice Commands
  private setupVoiceCommands(): void {
    if (!this.config.enableVoiceCommands) return;

    // Basic voice command recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
        this.handleVoiceCommand(command);
      };

      // Start listening when voice command mode is activated
      this.enableVoiceCommands = () => {
        recognition.start();
      };
    }
  }

  // Accessibility Styles
  private setupAccessibilityStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      /* Focus indicators */
      .focus-visible {
        outline: 2px solid #3b82f6 !important;
        outline-offset: 2px !important;
      }

      .focus-visible.focus-ring {
        outline: none !important;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5) !important;
      }

      .focus-visible.focus-glow {
        outline: none !important;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3) !important;
      }

      /* High contrast mode */
      .high-contrast {
        --background: #000000 !important;
        --foreground: #ffffff !important;
        --primary: #ffffff !important;
        --primary-foreground: #000000 !important;
        --muted: #333333 !important;
        --muted-foreground: #cccccc !important;
        --border: #ffffff !important;
        --input: #000000 !important;
        --ring: #ffffff !important;
      }

      .high-contrast * {
        border-color: var(--border) !important;
        color: var(--foreground) !important;
        background-color: var(--background) !important;
      }

      .high-contrast button,
      .high-contrast input,
      .high-contrast select,
      .high-contrast textarea {
        border: 2px solid var(--border) !important;
        background-color: var(--input) !important;
        color: var(--foreground) !important;
      }

      /* Reduced motion */
      .reduced-motion *,
      .reduced-motion *::before,
      .reduced-motion *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }

      /* Skip links */
      .skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: #000;
        color: #fff;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1000;
        transition: top 0.3s;
      }

      .skip-link:focus {
        top: 6px;
      }

      /* Screen reader only */
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      /* Keyboard navigation indicator */
      .keyboard-navigation .focus-visible {
        outline: 2px solid #3b82f6 !important;
        outline-offset: 2px !important;
      }

      /* Live regions */
      [aria-live="polite"] {
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      }

      [aria-live="assertive"] {
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      }

      /* Error states */
      .error-message {
        color: #dc2626;
        font-weight: 500;
        margin-top: 0.5rem;
      }

      .error-message[role="alert"] {
        border-left: 4px solid #dc2626;
        padding-left: 1rem;
      }

      /* Success states */
      .success-message {
        color: #059669;
        font-weight: 500;
        margin-top: 0.5rem;
      }

      .success-message[role="status"] {
        border-left: 4px solid #059669;
        padding-left: 1rem;
      }
    `;
    document.head.appendChild(style);
  }

  // Skip Links
  private setupSkipLinks(): void {
    const skipLinks = [
      { href: '#main-content', text: 'Skip to main content' },
      { href: '#navigation', text: 'Skip to navigation' },
      { href: '#search', text: 'Skip to search' },
    ];

    skipLinks.forEach(link => {
      const skipLink = document.createElement('a');
      skipLink.href = link.href;
      skipLink.textContent = link.text;
      skipLink.className = 'skip-link';
      document.body.insertBefore(skipLink, document.body.firstChild);
    });
  }

  // Live Regions
  private setupLiveRegions(): void {
    const regions = [
      { id: 'notifications', live: 'polite', atomic: 'true' },
      { id: 'status', live: 'polite', atomic: 'false' },
      { id: 'alerts', live: 'assertive', atomic: 'true' },
    ];

    regions.forEach(region => {
      const element = document.createElement('div');
      element.id = region.id;
      element.setAttribute('aria-live', region.live);
      element.setAttribute('aria-atomic', region.atomic);
      element.className = 'sr-only';
      document.body.appendChild(element);
    });
  }

  // Public Methods

  // Announce to screen reader
  public announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const announcement: AccessibilityAnnouncement = {
      id: `announcement-${Date.now()}`,
      message,
      priority,
      timestamp: Date.now(),
    };

    this.announcements.push(announcement);

    // Announce to live region
    const liveRegion = document.getElementById('accessibility-live-region');
    if (liveRegion) {
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        liveRegion.textContent = '';
      }, this.config.announcementDelay);
    }

    // Log for debugging
    console.log(`♿ Accessibility Announcement [${priority}]:`, message);
  }

  // Focus management
  public focusElement(selector: string): boolean {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
      return true;
    }
    return false;
  }

  public focusPrevious(): boolean {
    if (this.focusHistory.length > 1) {
      this.focusHistory.pop(); // Remove current
      const previous = this.focusHistory[this.focusHistory.length - 1];
      if (previous) {
        previous.focus();
        return true;
      }
    }
    return false;
  }

  // Keyboard navigation handlers
  private handleEscapeKey(): void {
    // Close modals, dropdowns, etc.
    const modals = document.querySelectorAll('[role="dialog"][aria-modal="true"]');
    modals.forEach(modal => {
      const closeButton = modal.querySelector('[aria-label*="close"], [aria-label*="Close"]') as HTMLElement;
      if (closeButton) {
        closeButton.click();
      }
    });

    // Close dropdowns
    const dropdowns = document.querySelectorAll('[data-state="open"]');
    dropdowns.forEach(dropdown => {
      const trigger = dropdown.querySelector('[aria-expanded="true"]') as HTMLElement;
      if (trigger) {
        trigger.click();
      }
    });
  }

  private handleArrowKeyNavigation(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    
    // Handle custom select components
    if (target.getAttribute('role') === 'option') {
      const listbox = target.closest('[role="listbox"]');
      if (listbox) {
        const options = Array.from(listbox.querySelectorAll('[role="option"]'));
        const currentIndex = options.indexOf(target);
        
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          const nextIndex = (currentIndex + 1) % options.length;
          (options[nextIndex] as HTMLElement).focus();
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          const prevIndex = currentIndex === 0 ? options.length - 1 : currentIndex - 1;
          (options[prevIndex] as HTMLElement).focus();
        }
      }
    }
  }

  // Voice command handler
  private handleVoiceCommand(command: string): void {
    console.log('🎤 Voice command received:', command);

    // Basic voice commands
    if (command.includes('go to') || command.includes('navigate to')) {
      if (command.includes('home')) {
        window.location.href = '/';
      } else if (command.includes('profile')) {
        window.location.href = '/profile';
      } else if (command.includes('tasks')) {
        window.location.href = '/post';
      }
    } else if (command.includes('search')) {
      const searchInput = document.querySelector('input[type="search"], input[placeholder*="search"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    } else if (command.includes('help')) {
      window.location.href = '/help';
    }
  }

  // Configuration
  public updateConfig(newConfig: Partial<AccessibilityConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('♿ Accessibility config updated:', this.config);
  }

  public getConfig(): AccessibilityConfig {
    return { ...this.config };
  }

  // Utility methods
  public isKeyboardNavigation(): boolean {
    return document.body.classList.contains('keyboard-navigation');
  }

  public isHighContrastMode(): boolean {
    return document.documentElement.classList.contains('high-contrast');
  }

  public isReducedMotion(): boolean {
    return document.documentElement.classList.contains('reduced-motion');
  }

  // Enable voice commands
  public enableVoiceCommands: () => void = () => {
    console.log('🎤 Voice commands not available');
  };
}

// Export singleton instance
export const accessibilitySystem = AccessibilitySystem.getInstance(); 