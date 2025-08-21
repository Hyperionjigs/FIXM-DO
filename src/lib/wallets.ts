export type WalletName = 'gcash' | 'paymaya' | 'gotyme' | 'cash';

export interface WalletInfo {
  /** Unique identifier matching PaymentMethod type */
  name: WalletName;
  /** Friendly label we can display to the payer */
  displayName: string;
  /** The account / mobile number or bank number where the payer should transfer */
  accountNumber: string;
  /** Optional public QR code URL for quick-pay */
  qrCodeUrl?: string;
}

/**
 * Central registry of all wallets supported by the platform.
 *
 * NOTE: These are static placeholders. Replace the accountNumber / qrCodeUrl
 * with your own values in production.
 */
export const wallets: Record<WalletName, WalletInfo> = {
  gcash: {
    name: 'gcash',
    displayName: 'GCash Wallet',
    accountNumber: '09XXXXXXXXX',
    qrCodeUrl: '/wallets/gcash-qr.png',
  },
  paymaya: {
    name: 'paymaya',
    displayName: 'PayMaya Wallet',
    accountNumber: '09XXXXXXXXX',
    qrCodeUrl: '/wallets/paymaya-qr.png',
  },
  gotyme: {
    name: 'gotyme',
    displayName: 'GoTyme Wallet',
    accountNumber: 'XXXXXXXXXXXX',
    qrCodeUrl: '/wallets/gotyme-qr.png',
  },
  cash: {
    name: 'cash',
    displayName: 'Cash on Site',
    accountNumber: '',
  },
};

/** Convenience helper – returns wallet metadata or throws */
export function getWallet(name: WalletName): WalletInfo {
  const info = wallets[name];
  if (!info) throw new Error(`Unsupported wallet: ${name}`);
  return info;
}