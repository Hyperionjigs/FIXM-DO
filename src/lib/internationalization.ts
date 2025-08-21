import React from 'react';

// Comprehensive Internationalization System
export type SupportedLocale = 'en' | 'tl' | 'ceb';

export interface TranslationData {
  [key: string]: string | TranslationData;
}

export interface LocaleConfig {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  dateFormat: string;
  timeFormat: string;
  currency: string;
  numberFormat: Intl.NumberFormatOptions;
}

export interface I18nConfig {
  defaultLocale: SupportedLocale;
  fallbackLocale: SupportedLocale;
  supportedLocales: SupportedLocale[];
  loadPath: string;
  debug: boolean;
}

// Locale configurations
export const localeConfigs: Record<SupportedLocale, LocaleConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 'HH:mm',
    currency: 'PHP',
    numberFormat: {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    },
  },
  tl: {
    code: 'tl',
    name: 'Tagalog',
    nativeName: 'Tagalog',
    direction: 'ltr',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 'HH:mm',
    currency: 'PHP',
    numberFormat: {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    },
  },
  ceb: {
    code: 'ceb',
    name: 'Cebuano',
    nativeName: 'Cebuano',
    direction: 'ltr',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 'HH:mm',
    currency: 'PHP',
    numberFormat: {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    },
  },
};

// Translation data
const translations: Record<SupportedLocale, TranslationData> = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      submit: 'Submit',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      refresh: 'Refresh',
      retry: 'Retry',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      required: 'Required',
      optional: 'Optional',
      welcome: 'Welcome',
      user: 'User',
      locationUnavailable: 'Location unavailable',
    },
    navigation: {
      home: 'Home',
      profile: 'Profile',
      tasks: 'Tasks',
      messages: 'Messages',
      notifications: 'Notifications',
      settings: 'Settings',
      help: 'Help',
      logout: 'Logout',
      login: 'Login',
      signup: 'Sign Up',
      post: 'Post',
      dashboard: 'Dashboard',
    },
    auth: {
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot Password?',
      rememberMe: 'Remember Me',
      loginSuccess: 'Successfully logged in',
      loginError: 'Login failed',
      signupSuccess: 'Account created successfully',
      signupError: 'Sign up failed',
      logoutSuccess: 'Successfully logged out',
      logIn: 'Log In',
      signUp: 'Sign Up',
      logOut: 'Log Out',
    },
    tasks: {
      createTask: 'Create Task',
      taskTitle: 'Task Title',
      taskDescription: 'Task Description',
      taskCategory: 'Category',
      taskLocation: 'Location',
      taskBudget: 'Budget',
      taskDeadline: 'Deadline',
      taskStatus: 'Status',
      taskCreated: 'Task created successfully',
      taskUpdated: 'Task updated successfully',
      taskDeleted: 'Task deleted successfully',
      noTasks: 'No tasks found',
      acceptTask: 'Accept Task',
      completeTask: 'Complete Task',
      cancelTask: 'Cancel Task',
    },
    profile: {
      personalInfo: 'Personal Information',
      firstName: 'First Name',
      lastName: 'Last Name',
      phone: 'Phone Number',
      address: 'Address',
      bio: 'Bio',
      skills: 'Skills',
      experience: 'Experience',
      rating: 'Rating',
      reviews: 'Reviews',
      profileUpdated: 'Profile updated successfully',
    },
    verification: {
      verifyIdentity: 'Verify Your Identity',
      takePhoto: 'Take Photo',
      uploadDocument: 'Upload Document',
      verificationPending: 'Verification pending',
      verificationApproved: 'Verification approved',
      verificationRejected: 'Verification rejected',
      pleaseWait: 'Please wait while we verify your identity',
    },
    payments: {
      paymentMethod: 'Payment Method',
      addPaymentMethod: 'Add Payment Method',
      removePaymentMethod: 'Remove Payment Method',
      paymentSuccess: 'Payment successful',
      paymentFailed: 'Payment failed',
      insufficientFunds: 'Insufficient funds',
      transactionHistory: 'Transaction History',
    },
  },
  tl: {
    common: {
      loading: 'Naglo-load...',
      error: 'May naganap na error',
      success: 'Tagumpay',
      cancel: 'Kanselahin',
      save: 'I-save',
      delete: 'Tanggalin',
      edit: 'I-edit',
      close: 'Isara',
      submit: 'I-submit',
      back: 'Bumalik',
      next: 'Susunod',
      previous: 'Nakaraan',
      search: 'Maghanap',
      filter: 'I-filter',
      sort: 'I-sort',
      refresh: 'I-refresh',
      retry: 'Subukan ulit',
      yes: 'Oo',
      no: 'Hindi',
      ok: 'OK',
      required: 'Kailangan',
      optional: 'Opsiyonal',
      welcome: 'Maligayang pagdating',
      user: 'User',
      locationUnavailable: 'Hindi available ang lokasyon',
    },
    navigation: {
      home: 'Bahay',
      profile: 'Profile',
      tasks: 'Mga Gawain',
      messages: 'Mga Mensahe',
      notifications: 'Mga Abiso',
      settings: 'Mga Setting',
      help: 'Tulong',
      logout: 'Mag-logout',
      login: 'Mag-login',
      signup: 'Mag-signup',
      post: 'Mag-post',
      dashboard: 'Dashboard',
    },
    auth: {
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Kumpirmahin ang Password',
      forgotPassword: 'Nakalimutan ang Password?',
      rememberMe: 'Tandaan Ako',
      loginSuccess: 'Matagumpay na nag-login',
      loginError: 'Hindi nag-login',
      signupSuccess: 'Matagumpay na nag-create ng account',
      signupError: 'Hindi nag-signup',
      logoutSuccess: 'Matagumpay na nag-logout',
      logIn: 'Mag-login',
      signUp: 'Mag-signup',
      logOut: 'Mag-logout',
    },
    tasks: {
      createTask: 'Gumawa ng Gawain',
      taskTitle: 'Pamagat ng Gawain',
      taskDescription: 'Deskripsyon ng Gawain',
      taskCategory: 'Kategorya',
      taskLocation: 'Lokasyon',
      taskBudget: 'Badget',
      taskDeadline: 'Deadline',
      taskStatus: 'Status',
      taskCreated: 'Matagumpay na nag-create ng gawain',
      taskUpdated: 'Matagumpay na na-update ang gawain',
      taskDeleted: 'Matagumpay na na-delete ang gawain',
      noTasks: 'Walang nahanap na gawain',
      acceptTask: 'Tanggapin ang Gawain',
      completeTask: 'Kumpletuhin ang Gawain',
      cancelTask: 'Kanselahin ang Gawain',
    },
    profile: {
      personalInfo: 'Personal na Impormasyon',
      firstName: 'Pangalan',
      lastName: 'Apelyido',
      phone: 'Numero ng Telepono',
      address: 'Address',
      bio: 'Bio',
      skills: 'Mga Kasanayan',
      experience: 'Karanasan',
      rating: 'Rating',
      reviews: 'Mga Review',
      profileUpdated: 'Matagumpay na na-update ang profile',
    },
    verification: {
      verifyIdentity: 'I-verify ang Iyong Identity',
      takePhoto: 'Kumuha ng Larawan',
      uploadDocument: 'I-upload ang Dokumento',
      verificationPending: 'Naghihintay ng verification',
      verificationApproved: 'Na-approve ang verification',
      verificationRejected: 'Na-reject ang verification',
      pleaseWait: 'Mangyaring maghintay habang ini-verify namin ang iyong identity',
    },
    payments: {
      paymentMethod: 'Paraan ng Pagbabayad',
      addPaymentMethod: 'Magdagdag ng Paraan ng Pagbabayad',
      removePaymentMethod: 'Tanggalin ang Paraan ng Pagbabayad',
      paymentSuccess: 'Matagumpay ang pagbabayad',
      paymentFailed: 'Hindi nagtagumpay ang pagbabayad',
      insufficientFunds: 'Kulang ang pondo',
      transactionHistory: 'Kasaysayan ng Transaksyon',
    },
  },
  ceb: {
    common: {
      loading: 'Nag-loading...',
      error: 'Adunay nahitabo nga error',
      success: 'Kalampusan',
      cancel: 'Kanselahon',
      save: 'I-save',
      delete: 'Tangtangon',
      edit: 'I-edit',
      close: 'Isira',
      submit: 'I-submit',
      back: 'Balik',
      next: 'Sunod',
      previous: 'Niaging',
      search: 'Pangita',
      filter: 'I-filter',
      sort: 'I-sort',
      refresh: 'I-refresh',
      retry: 'Sulayan pag-usab',
      yes: 'Oo',
      no: 'Dili',
      ok: 'OK',
      required: 'Gikinahanglan',
      optional: 'Opsiyonal',
      welcome: 'Maayong pag-abot',
      user: 'User',
      locationUnavailable: 'Wala available ang lokasyon',
    },
    navigation: {
      home: 'Balay',
      profile: 'Profile',
      tasks: 'Mga Buluhaton',
      messages: 'Mga Mensahe',
      notifications: 'Mga Pahibalo',
      settings: 'Mga Setting',
      help: 'Tabang',
      logout: 'Mag-logout',
      login: 'Mag-login',
      signup: 'Mag-signup',
      post: 'Mag-post',
      dashboard: 'Dashboard',
    },
    auth: {
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Kumpirmaha ang Password',
      forgotPassword: 'Nakalimtan ang Password?',
      rememberMe: 'Hinumdumi Ako',
      loginSuccess: 'Malampuson nga nag-login',
      loginError: 'Wala nag-login',
      signupSuccess: 'Malampuson nga nag-create og account',
      signupError: 'Wala mag-signup',
      logoutSuccess: 'Malampuson nga nag-logout',
      logIn: 'Mag-login',
      signUp: 'Mag-signup',
      logOut: 'Mag-logout',
    },
    tasks: {
      createTask: 'Himo og Buluhaton',
      taskTitle: 'Titulo sa Buluhaton',
      taskDescription: 'Deskripsyon sa Buluhaton',
      taskCategory: 'Kategorya',
      taskLocation: 'Lokasyon',
      taskBudget: 'Badget',
      taskDeadline: 'Deadline',
      taskStatus: 'Status',
      taskCreated: 'Malampuson nga nag-create og buluhaton',
      taskUpdated: 'Malampuson nga na-update ang buluhaton',
      taskDeleted: 'Malampuson nga na-delete ang buluhaton',
      noTasks: 'Wala\'y nakit-an nga buluhaton',
      acceptTask: 'Dawaton ang Buluhaton',
      completeTask: 'Kumpletuhon ang Buluhaton',
      cancelTask: 'Kanselahon ang Buluhaton',
    },
    profile: {
      personalInfo: 'Personal nga Impormasyon',
      firstName: 'Pangalan',
      lastName: 'Apelyido',
      phone: 'Numero sa Telepono',
      address: 'Address',
      bio: 'Bio',
      skills: 'Mga Kahanas',
      experience: 'Kasinatian',
      rating: 'Rating',
      reviews: 'Mga Review',
      profileUpdated: 'Malampuson nga na-update ang profile',
    },
    verification: {
      verifyIdentity: 'I-verify ang Imong Identity',
      takePhoto: 'Kuha og Larawan',
      uploadDocument: 'I-upload ang Dokumento',
      verificationPending: 'Nagpaabot og verification',
      verificationApproved: 'Na-approve ang verification',
      verificationRejected: 'Na-reject ang verification',
      pleaseWait: 'Palihug magpaabot samtang gi-verify namo ang imong identity',
    },
    payments: {
      paymentMethod: 'Paagi sa Pagbayad',
      addPaymentMethod: 'Magdugang og Paagi sa Pagbayad',
      removePaymentMethod: 'Tangtangon ang Paagi sa Pagbayad',
      paymentSuccess: 'Malampuson ang pagbayad',
      paymentFailed: 'Wala magmalampuson ang pagbayad',
      insufficientFunds: 'Kulang ang pondo',
      transactionHistory: 'Kasaysayan sa Transaksyon',
    },
  },
};

export class InternationalizationSystem {
  private static instance: InternationalizationSystem;
  private currentLocale: SupportedLocale;
  private config: I18nConfig;
  private listeners: Set<(locale: SupportedLocale) => void> = new Set();

  private constructor() {
    this.config = {
      defaultLocale: 'en',
      fallbackLocale: 'en',
      supportedLocales: ['en', 'tl', 'ceb'],
      loadPath: '/locales',
      debug: false,
    };

    // Initialize with stored locale or default
    this.currentLocale = this.getStoredLocale() || this.config.defaultLocale;
    this.setupLocale();
  }

  static getInstance(): InternationalizationSystem {
    if (!InternationalizationSystem.instance) {
      InternationalizationSystem.instance = new InternationalizationSystem();
    }
    return InternationalizationSystem.instance;
  }

  // Get translation
  public t(key: string, params?: Record<string, string | number>): string {
    const keys = key.split('.');
    let value: any = translations[this.currentLocale];

    // Navigate through nested keys
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to default locale
        value = this.getFallbackValue(keys);
        break;
      }
    }

    if (typeof value !== 'string') {
      if (this.config.debug) {
        console.warn(`Translation key not found: ${key}`);
      }
      return key;
    }

    // Replace parameters
    if (params) {
      return this.interpolate(value, params);
    }

    return value;
  }

  // Get fallback value
  private getFallbackValue(keys: string[]): string {
    let value: any = translations[this.config.fallbackLocale];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return keys.join('.');
      }
    }

    return typeof value === 'string' ? value : keys.join('.');
  }

  // Interpolate parameters
  private interpolate(text: string, params: Record<string, string | number>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key]?.toString() || match;
    });
  }

  // Change locale
  public changeLocale(locale: SupportedLocale): void {
    if (!this.config.supportedLocales.includes(locale)) {
      console.warn(`Unsupported locale: ${locale}`);
      return;
    }

    this.currentLocale = locale;
    this.storeLocale(locale);
    this.setupLocale();
    this.notifyListeners();

    if (this.config.debug) {
      console.log(`Locale changed to: ${locale}`);
    }
  }

  // Setup locale-specific configurations
  private setupLocale(): void {
    const config = localeConfigs[this.currentLocale];
    
    // Set document direction
    document.documentElement.dir = config.direction;
    document.documentElement.lang = config.code;

    // Update number formatting
    this.updateNumberFormatting(config);
  }

  // Update number formatting
  private updateNumberFormatting(config: LocaleConfig): void {
    // This would be used by formatting utilities
    window.__NEXT_DATA__ = window.__NEXT_DATA__ || {};
    window.__NEXT_DATA__.locale = config;
  }

  // Format number
  public formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    const config = localeConfigs[this.currentLocale];
    try {
      const formatter = new Intl.NumberFormat(config.code, {
        ...config.numberFormat,
        ...options,
      });
      return formatter.format(value);
    } catch (error) {
      // Fallback to English if locale is not supported
      const formatter = new Intl.NumberFormat('en', {
        ...config.numberFormat,
        ...options,
      });
      return formatter.format(value);
    }
  }

  // Format currency
  public formatCurrency(value: number, currency?: string): string {
    const config = localeConfigs[this.currentLocale];
    try {
      const formatter = new Intl.NumberFormat(config.code, {
        style: 'currency',
        currency: currency || config.currency,
      });
      return formatter.format(value);
    } catch (error) {
      // Fallback to English if locale is not supported
      const formatter = new Intl.NumberFormat('en', {
        style: 'currency',
        currency: currency || config.currency,
      });
      return formatter.format(value);
    }
  }

  // Format date
  public formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    const config = localeConfigs[this.currentLocale];
    try {
      const formatter = new Intl.DateTimeFormat(config.code, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options,
      });
      return formatter.format(date);
    } catch (error) {
      // Fallback to English if locale is not supported
      const formatter = new Intl.DateTimeFormat('en', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options,
      });
      return formatter.format(date);
    }
  }

  // Format time
  public formatTime(date: Date, options?: Intl.DateTimeFormatOptions): string {
    const config = localeConfigs[this.currentLocale];
    try {
      const formatter = new Intl.DateTimeFormat(config.code, {
        hour: 'numeric',
        minute: 'numeric',
        ...options,
      });
      return formatter.format(date);
    } catch (error) {
      // Fallback to English if locale is not supported
      const formatter = new Intl.DateTimeFormat('en', {
        hour: 'numeric',
        minute: 'numeric',
        ...options,
      });
      return formatter.format(date);
    }
  }

  // Get current locale
  public getCurrentLocale(): SupportedLocale {
    return this.currentLocale;
  }

  // Get supported locales
  public getSupportedLocales(): SupportedLocale[] {
    return [...this.config.supportedLocales];
  }

  // Get locale config
  public getLocaleConfig(locale?: SupportedLocale): LocaleConfig {
    const targetLocale = locale || this.currentLocale;
    return localeConfigs[targetLocale];
  }

  // Add locale change listener
  public addLocaleChangeListener(listener: (locale: SupportedLocale) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Notify listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentLocale));
  }

  // Store locale in localStorage
  private storeLocale(locale: SupportedLocale): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('fixmo-locale', locale);
    }
  }

  // Get stored locale
  private getStoredLocale(): SupportedLocale | null {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('fixmo-locale');
      if (stored && this.config.supportedLocales.includes(stored as SupportedLocale)) {
        return stored as SupportedLocale;
      }
    }
    return null;
  }

  // Update configuration
  public updateConfig(newConfig: Partial<I18nConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Get configuration
  public getConfig(): I18nConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const i18n = InternationalizationSystem.getInstance();

// React hook for translations
export function useTranslation() {
  const [locale, setLocale] = React.useState(i18n.getCurrentLocale());

  React.useEffect(() => {
    const unsubscribe = i18n.addLocaleChangeListener(setLocale);
    return unsubscribe;
  }, []);

  return {
    t: i18n.t.bind(i18n),
    locale,
    changeLocale: i18n.changeLocale.bind(i18n),
    formatNumber: i18n.formatNumber.bind(i18n),
    formatCurrency: i18n.formatCurrency.bind(i18n),
    formatDate: i18n.formatDate.bind(i18n),
    formatTime: i18n.formatTime.bind(i18n),
    getSupportedLocales: i18n.getSupportedLocales.bind(i18n),
    getLocaleConfig: i18n.getLocaleConfig.bind(i18n),
  };
}

// Declare global types
declare global {
  interface Window {
    __NEXT_DATA__: any;
  }
} 