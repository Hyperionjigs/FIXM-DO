/**
 * Payment Configuration
 * 
 * Centralized configuration for all payment account details
 * Update these values when payment account information changes
 */

export const PAYMENT_CONFIG = {
  // GCash Account Configuration
  gcash: {
    phoneNumber: '09565121085',
    accountName: 'FixMo Platform',
    instructions: 'Send to GCash number: 09565121085',
    isActive: true
  },

  // PayMaya Account Configuration
  paymaya: {
    phoneNumber: '09603845762',
    accountName: 'FixMo Platform',
    instructions: 'Send to PayMaya number: 09603845762',
    isActive: true
  },

  // GoTyme Account Configuration
  gotyme: {
    phoneNumber: '09603845762',
    accountName: 'FixMo Platform',
    instructions: 'Send to GoTyme number: 09603845762',
    isActive: true
  },

  // General Payment Settings
  general: {
    currency: 'PHP',
    defaultExpiryMinutes: 60,
    maxPaymentAmount: 10000,
    minPaymentAmount: 100,
    transactionFee: 0, // No fees for manual payments
    platformName: 'FixMo Platform'
  },

  // Admin Contact Information
  admin: {
    primaryEmail: 'eroybelcesar@gmail.com',
    supportEmail: 'payments@fixmo.com',
    primaryPhone: '09565121085',
    businessHours: '9:00 AM - 6:00 PM (PHT)',
    responseTime: 'Within 15 minutes during business hours'
  }
};

/**
 * Get payment account information for a specific method
 */
export function getPaymentAccount(method: 'gcash' | 'paymaya' | 'gotyme') {
  return PAYMENT_CONFIG[method];
}

/**
 * Check if a payment method is active
 */
export function isPaymentMethodActive(method: 'gcash' | 'paymaya' | 'gotyme'): boolean {
  return PAYMENT_CONFIG[method].isActive;
}

/**
 * Get all active payment methods
 */
export function getActivePaymentMethods(): Array<'gcash' | 'paymaya' | 'gotyme'> {
  return (['gcash', 'paymaya', 'gotyme'] as const).filter(method => 
    isPaymentMethodActive(method)
  );
}

/**
 * Update payment account configuration
 * Note: In production, this should be done through a secure admin interface
 */
export function updatePaymentAccount(
  method: 'gcash' | 'paymaya' | 'gotyme',
  updates: Partial<typeof PAYMENT_CONFIG.gcash>
) {
  Object.assign(PAYMENT_CONFIG[method], updates);
}

/**
 * Get payment instructions for a specific method
 */
export function getPaymentInstructions(method: 'gcash' | 'paymaya' | 'gotyme'): string {
  const account = PAYMENT_CONFIG[method];
  
  switch (method) {
    case 'gcash':
      return `Send payment to GCash number: ${account.phoneNumber}`;
    case 'paymaya':
      return account.phoneNumber ? 
        `Send payment to PayMaya number: ${account.phoneNumber}` :
        'PayMaya account not configured yet';
    case 'gotyme':
      return account.phoneNumber ? 
        `Send payment to GoTyme number: ${account.phoneNumber}` :
        'GoTyme account not configured yet';
    default:
      return 'Payment instructions not available';
  }
} 