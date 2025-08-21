// Accessibility and SEO enhancement utilities
export class AccessibilitySEO {
  private static instance: AccessibilitySEO;
  private focusableElements: string[] = [
    'a[href]',
    'area[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'button:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ];

  private constructor() {
    this.initializeAccessibility();
    this.initializeSEO();
  }

  static getInstance(): AccessibilitySEO {
    if (!AccessibilitySEO.instance) {
      AccessibilitySEO.instance = new AccessibilitySEO();
    }
    return AccessibilitySEO.instance;
  }

  private initializeAccessibility(): void {
    // Add skip to main content link
    this.addSkipToMainContent();
    
    // Add focus management
    this.setupFocusManagement();
    
    // Add keyboard navigation
    this.setupKeyboardNavigation();
    
    // Add ARIA live regions
    this.setupLiveRegions();
    
    // Add high contrast mode support
    this.setupHighContrastMode();
  }

  private initializeSEO(): void {
    // Add structured data
    this.addStructuredData();
    
    // Add meta tags
    this.addMetaTags();
    
    // Add Open Graph tags
    this.addOpenGraphTags();
    
    // Add Twitter Card tags
    this.addTwitterCardTags();
    
    // Add canonical URLs
    this.addCanonicalURLs();
  }

  private addSkipToMainContent(): void {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50';
    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  private setupFocusManagement(): void {
    // Track focus for better UX
    let lastFocusedElement: HTMLElement | null = null;

    document.addEventListener('focusin', (e) => {
      lastFocusedElement = e.target as HTMLElement;
    });

    // Restore focus when modal closes
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (lastFocusedElement) {
          lastFocusedElement.focus();
        }
      }
    });
  }

  private setupKeyboardNavigation(): void {
    // Trap focus in modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const modals = document.querySelectorAll('[role="dialog"]');
        modals.forEach(modal => {
          if (modal.getAttribute('aria-hidden') !== 'true') {
            this.trapFocus(modal as HTMLElement, e);
          }
        });
      }
    });
  }

  private trapFocus(element: HTMLElement, event: KeyboardEvent): void {
    const focusableElements = element.querySelectorAll(this.focusableElements.join(','));
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  private setupLiveRegions(): void {
    // Add live regions for dynamic content
    const liveRegions = [
      { id: 'notifications', ariaLive: 'polite' },
      { id: 'search-results', ariaLive: 'polite' },
      { id: 'loading-status', ariaLive: 'assertive' }
    ];

    liveRegions.forEach(region => {
      const element = document.createElement('div');
      element.id = region.id;
      element.setAttribute('aria-live', region.ariaLive);
      element.className = 'sr-only';
      document.body.appendChild(element);
    });
  }

  private setupHighContrastMode(): void {
    // Add high contrast mode detection
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

  private addStructuredData(): void {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "FixMo",
      "description": "Your trusted neighborhood marketplace for tasks and skills. Connect with reliable people in your community.",
      "url": window.location.origin,
      "applicationCategory": "SocialNetworkingApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "author": {
        "@type": "Organization",
        "name": "FixMo"
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }

  private addMetaTags(): void {
    const metaTags = [
      { name: 'description', content: 'Your trusted neighborhood marketplace for tasks and skills. Connect with reliable people in your community.' },
      { name: 'keywords', content: 'neighborhood, tasks, services, community, local, help, marketplace' },
      { name: 'author', content: 'FixMo' },
      { name: 'robots', content: 'index, follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#3b82f6' },
      { name: 'msapplication-TileColor', content: '#3b82f6' }
    ];

    metaTags.forEach(tag => {
      if (!document.querySelector(`meta[name="${tag.name}"]`)) {
        const meta = document.createElement('meta');
        meta.name = tag.name;
        meta.content = tag.content;
        document.head.appendChild(meta);
      }
    });
  }

  private addOpenGraphTags(): void {
    const ogTags = [
      { property: 'og:title', content: 'FixMo - Your Neighborhood Marketplace' },
      { property: 'og:description', content: 'Connect with reliable people in your community for tasks and services.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: window.location.href },
      { property: 'og:image', content: `${window.location.origin}/og-image.jpg` },
      { property: 'og:site_name', content: 'FixMo' },
      { property: 'og:locale', content: 'en_US' }
    ];

    ogTags.forEach(tag => {
      if (!document.querySelector(`meta[property="${tag.property}"]`)) {
        const meta = document.createElement('meta');
        meta.setAttribute('property', tag.property);
        meta.content = tag.content;
        document.head.appendChild(meta);
      }
    });
  }

  private addTwitterCardTags(): void {
    const twitterTags = [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'FixMo - Your Neighborhood Marketplace' },
      { name: 'twitter:description', content: 'Connect with reliable people in your community for tasks and services.' },
      { name: 'twitter:image', content: `${window.location.origin}/twitter-image.jpg` },
      { name: 'twitter:site', content: '@fixmo' }
    ];

    twitterTags.forEach(tag => {
      if (!document.querySelector(`meta[name="${tag.name}"]`)) {
        const meta = document.createElement('meta');
        meta.name = tag.name;
        meta.content = tag.content;
        document.head.appendChild(meta);
      }
    });
  }

  private addCanonicalURLs(): void {
    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = window.location.href;
    document.head.appendChild(canonical);
  }

  // Public methods for dynamic content
  public announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const liveRegion = document.getElementById('notifications');
    if (liveRegion) {
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  }

  public updatePageTitle(title: string): void {
    document.title = `${title} - FixMo`;
  }

  public updateMetaDescription(description: string): void {
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);
  }

  public addBreadcrumbs(items: Array<{ name: string; url?: string }>): void {
    const breadcrumbData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.url || window.location.href
      }))
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(breadcrumbData);
    document.head.appendChild(script);
  }

  public addTaskStructuredData(task: any): void {
    const taskData = {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": task.title,
      "description": task.description,
      "provider": {
        "@type": "Person",
        "name": task.authorName
      },
      "areaServed": {
        "@type": "Place",
        "name": task.location
      },
      "offers": {
        "@type": "Offer",
        "price": task.pay,
        "priceCurrency": "PHP"
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(taskData);
    document.head.appendChild(script);
  }

  public setupFormAccessibility(form: HTMLFormElement): void {
    // Add proper labels and descriptions
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      const inputElement = input as HTMLInputElement;
      
      // Add aria-describedby if there's a help text
      const helpText = inputElement.parentElement?.querySelector('.help-text');
      if (helpText) {
        const helpId = `help-${inputElement.id || inputElement.name}`;
        helpText.id = helpId;
        inputElement.setAttribute('aria-describedby', helpId);
      }

      // Add aria-required for required fields
      if (inputElement.required) {
        inputElement.setAttribute('aria-required', 'true');
      }

      // Add aria-invalid for validation
      if (inputElement.validity && !inputElement.validity.valid) {
        inputElement.setAttribute('aria-invalid', 'true');
      }
    });
  }

  public setupImageAccessibility(): void {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      const imgElement = img as HTMLImageElement;
      
      // Add alt text if missing
      if (!imgElement.alt && !imgElement.getAttribute('aria-label')) {
        imgElement.alt = 'Image';
      }

      // Add loading="lazy" for better performance
      if (!imgElement.loading) {
        imgElement.loading = 'lazy';
      }
    });
  }

  public setupButtonAccessibility(): void {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      const buttonElement = button as HTMLButtonElement;
      
      // Add aria-label if no text content
      if (!buttonElement.textContent?.trim() && !buttonElement.getAttribute('aria-label')) {
        const icon = buttonElement.querySelector('svg, img');
        if (icon) {
          buttonElement.setAttribute('aria-label', 'Button');
        }
      }

      // Add aria-expanded for toggle buttons
      if (buttonElement.getAttribute('aria-expanded') === null && 
          buttonElement.classList.contains('toggle')) {
        buttonElement.setAttribute('aria-expanded', 'false');
      }
    });
  }

  public setupNavigationAccessibility(): void {
    const navs = document.querySelectorAll('nav');
    navs.forEach(nav => {
      const navElement = nav as HTMLElement;
      
      // Add role="navigation" if not present
      if (!navElement.getAttribute('role')) {
        navElement.setAttribute('role', 'navigation');
      }

      // Add aria-label if not present
      if (!navElement.getAttribute('aria-label')) {
        navElement.setAttribute('aria-label', 'Main navigation');
      }
    });
  }

  // Performance monitoring for accessibility
  public trackAccessibilityMetrics(): void {
    // Track focus management
    let focusChanges = 0;
    document.addEventListener('focusin', () => {
      focusChanges++;
    });

    // Track keyboard navigation
    let keyboardEvents = 0;
    document.addEventListener('keydown', () => {
      keyboardEvents++;
    });

    // Report metrics periodically
    setInterval(() => {
      console.log('🔍 Accessibility Metrics:', {
        focusChanges,
        keyboardEvents,
        screenReaderAnnouncements: 0 // Would be tracked in announceToScreenReader
      });
    }, 30000);
  }
}

export const accessibilitySEO = AccessibilitySEO.getInstance(); 