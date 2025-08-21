/**
 * Currency utility functions for Philippine Peso (PHP)
 */

export interface CurrencyConfig {
  code: string;
  symbol: string;
  locale: string;
  minimumFractionDigits: number;
  maximumFractionDigits: number;
}

export const PHP_CONFIG: CurrencyConfig = {
  code: 'PHP',
  symbol: '₱',
  locale: 'en-PH',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};

/**
 * Format a number as Philippine Peso currency
 */
export function formatPHP(amount: number): string {
  return new Intl.NumberFormat(PHP_CONFIG.locale, {
    style: 'currency',
    currency: PHP_CONFIG.code,
    minimumFractionDigits: PHP_CONFIG.minimumFractionDigits,
    maximumFractionDigits: PHP_CONFIG.maximumFractionDigits,
  }).format(amount);
}

/**
 * Format a number as Philippine Peso with custom options
 */
export function formatPHPWithOptions(
  amount: number,
  options: Partial<Intl.NumberFormatOptions> = {}
): string {
  return new Intl.NumberFormat(PHP_CONFIG.locale, {
    style: 'currency',
    currency: PHP_CONFIG.code,
    minimumFractionDigits: PHP_CONFIG.minimumFractionDigits,
    maximumFractionDigits: PHP_CONFIG.maximumFractionDigits,
    ...options,
  }).format(amount);
}

/**
 * Format a number as Philippine Peso without the currency symbol
 */
export function formatPHPAmount(amount: number): string {
  return new Intl.NumberFormat(PHP_CONFIG.locale, {
    minimumFractionDigits: PHP_CONFIG.minimumFractionDigits,
    maximumFractionDigits: PHP_CONFIG.maximumFractionDigits,
  }).format(amount);
}

/**
 * Get the Philippine Peso symbol
 */
export function getPHPSymbol(): string {
  return PHP_CONFIG.symbol;
}

/**
 * Parse a PHP currency string back to a number
 */
export function parsePHP(currencyString: string): number {
  // Remove currency symbol and commas, then parse
  const cleaned = currencyString.replace(/[₱,\s]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Validate if a number is a valid PHP amount
 */
export function isValidPHPAmount(amount: number): boolean {
  return !isNaN(amount) && amount >= 0 && amount <= 1000000; // Max 1M PHP
} 