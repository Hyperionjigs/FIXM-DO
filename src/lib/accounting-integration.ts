import { Task, Payment, User } from '@/types';

export interface AccountingTransaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  currency: string;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  account: string;
  reference?: string;
  notes?: string;
  attachments?: string[];
  externalId?: string;
  accountingProvider: 'quickbooks' | 'xero' | 'freshbooks' | 'wave' | 'fixmo';
}

export interface AccountingInvoice {
  id: string;
  invoiceNumber: string;
  date: Date;
  dueDate: Date;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: AccountingInvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  externalId?: string;
  accountingProvider: 'quickbooks' | 'xero' | 'freshbooks' | 'wave' | 'fixmo';
}

export interface AccountingInvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxRate?: number;
}

export interface AccountingCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  taxId?: string;
  externalId?: string;
  accountingProvider: 'quickbooks' | 'xero' | 'freshbooks' | 'wave' | 'fixmo';
}

export interface AccountingProvider {
  name: string;
  id: string;
  isConnected: boolean;
  apiKey?: string;
  accessToken?: string;
  refreshToken?: string;
  lastSync?: Date;
  syncEnabled: boolean;
  companyId?: string;
}

export interface AccountingSyncOptions {
  syncDirection: 'bidirectional' | 'import' | 'export';
  syncTransactions: boolean;
  syncInvoices: boolean;
  syncCustomers: boolean;
  autoSync: boolean;
  syncInterval: number; // minutes
  taxRates: Record<string, number>;
}

export class AccountingIntegrationService {
  private static instance: AccountingIntegrationService;
  private providers: Map<string, AccountingProvider> = new Map();
  private syncOptions: AccountingSyncOptions = {
    syncDirection: 'bidirectional',
    syncTransactions: true,
    syncInvoices: true,
    syncCustomers: true,
    autoSync: true,
    syncInterval: 60,
    taxRates: {
      'VAT': 0.12,
      'GST': 0.10,
      'Sales Tax': 0.08
    }
  };

  private constructor() {
    this.initializeProviders();
  }

  static getInstance(): AccountingIntegrationService {
    if (!AccountingIntegrationService.instance) {
      AccountingIntegrationService.instance = new AccountingIntegrationService();
    }
    return AccountingIntegrationService.instance;
  }

  private initializeProviders() {
    // Initialize with default providers
    this.providers.set('quickbooks', {
      name: 'QuickBooks Online',
      id: 'quickbooks',
      isConnected: false,
      syncEnabled: true
    });

    this.providers.set('xero', {
      name: 'Xero',
      id: 'xero',
      isConnected: false,
      syncEnabled: true
    });

    this.providers.set('freshbooks', {
      name: 'FreshBooks',
      id: 'freshbooks',
      isConnected: false,
      syncEnabled: true
    });

    this.providers.set('wave', {
      name: 'Wave',
      id: 'wave',
      isConnected: false,
      syncEnabled: true
    });
  }

  // QuickBooks Integration
  async connectQuickBooks(): Promise<boolean> {
    try {
      const clientId = process.env.NEXT_PUBLIC_QUICKBOOKS_CLIENT_ID;
      const redirectUri = `${window.location.origin}/api/accounting/quickbooks/callback`;

      const authUrl = `https://appcenter.intuit.com/connect/oauth2?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=com.intuit.quickbooks.accounting&response_type=code&state=teststate`;
      
      window.location.href = authUrl;
      
      return true;
    } catch (error) {
      console.error('Failed to connect to QuickBooks:', error);
      return false;
    }
  }

  async handleQuickBooksCallback(code: string, realmId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/accounting/quickbooks/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, realmId })
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const { accessToken, refreshToken } = await response.json();

      const provider = this.providers.get('quickbooks');
      if (provider) {
        provider.isConnected = true;
        provider.accessToken = accessToken;
        provider.refreshToken = refreshToken;
        provider.companyId = realmId;
        provider.lastSync = new Date();
      }

      return true;
    } catch (error) {
      console.error('Failed to handle QuickBooks callback:', error);
      return false;
    }
  }

  async syncQuickBooksTransactions(): Promise<AccountingTransaction[]> {
    try {
      const provider = this.providers.get('quickbooks');
      if (!provider?.isConnected) {
        throw new Error('QuickBooks not connected');
      }

      const response = await fetch('/api/accounting/quickbooks/transactions', {
        headers: {
          'Authorization': `Bearer ${provider.accessToken}`,
          'X-Company-ID': provider.companyId || ''
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch QuickBooks transactions');
      }

      const data = await response.json();
      return data.transactions.map((transaction: any) => ({
        id: transaction.Id,
        date: new Date(transaction.TxnDate),
        description: transaction.DocNumber || transaction.Line[0]?.Description || '',
        amount: transaction.TotalAmt || 0,
        currency: transaction.CurrencyRef?.value || 'USD',
        type: transaction.TxnType === 'Invoice' ? 'income' : 'expense',
        category: transaction.Line[0]?.AccountBasedExpenseLineDetail?.AccountRef?.name || '',
        account: transaction.Line[0]?.AccountBasedExpenseLineDetail?.AccountRef?.name || '',
        reference: transaction.DocNumber,
        notes: transaction.PrivateNote,
        externalId: transaction.Id,
        accountingProvider: 'quickbooks'
      }));
    } catch (error) {
      console.error('Failed to sync QuickBooks transactions:', error);
      throw error;
    }
  }

  async createQuickBooksInvoice(invoice: Omit<AccountingInvoice, 'id' | 'accountingProvider'>): Promise<string> {
    try {
      const provider = this.providers.get('quickbooks');
      if (!provider?.isConnected) {
        throw new Error('QuickBooks not connected');
      }

      const response = await fetch('/api/accounting/quickbooks/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${provider.accessToken}`,
          'X-Company-ID': provider.companyId || ''
        },
        body: JSON.stringify({
          Line: invoice.items.map(item => ({
            Amount: item.amount,
            DetailType: 'SalesItemLineDetail',
            SalesItemLineDetail: {
              ItemRef: {
                value: '1', // Default item reference
                name: item.description
              },
              Qty: item.quantity,
              UnitPrice: item.unitPrice
            }
          })),
          CustomerRef: {
            value: invoice.customerId
          },
          DueDate: invoice.dueDate.toISOString().split('T')[0],
          DocNumber: invoice.invoiceNumber,
          PrivateNote: invoice.notes
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create QuickBooks invoice');
      }

      const data = await response.json();
      return data.Invoice.Id;
    } catch (error) {
      console.error('Failed to create QuickBooks invoice:', error);
      throw error;
    }
  }

  // Xero Integration
  async connectXero(): Promise<boolean> {
    try {
      const clientId = process.env.NEXT_PUBLIC_XERO_CLIENT_ID;
      const redirectUri = `${window.location.origin}/api/accounting/xero/callback`;

      const authUrl = `https://login.xero.com/identity/connect/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=offline_access accounting.transactions accounting.contacts`;
      
      window.location.href = authUrl;
      
      return true;
    } catch (error) {
      console.error('Failed to connect to Xero:', error);
      return false;
    }
  }

  async handleXeroCallback(code: string): Promise<boolean> {
    try {
      const response = await fetch('/api/accounting/xero/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const { accessToken, refreshToken, tenantId } = await response.json();

      const provider = this.providers.get('xero');
      if (provider) {
        provider.isConnected = true;
        provider.accessToken = accessToken;
        provider.refreshToken = refreshToken;
        provider.companyId = tenantId;
        provider.lastSync = new Date();
      }

      return true;
    } catch (error) {
      console.error('Failed to handle Xero callback:', error);
      return false;
    }
  }

  async syncXeroTransactions(): Promise<AccountingTransaction[]> {
    try {
      const provider = this.providers.get('xero');
      if (!provider?.isConnected) {
        throw new Error('Xero not connected');
      }

      const response = await fetch('/api/accounting/xero/transactions', {
        headers: {
          'Authorization': `Bearer ${provider.accessToken}`,
          'X-Tenant-ID': provider.companyId || ''
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Xero transactions');
      }

      const data = await response.json();
      return data.transactions.map((transaction: any) => ({
        id: transaction.transactionID,
        date: new Date(transaction.date),
        description: transaction.reference || transaction.lineItems[0]?.description || '',
        amount: transaction.total || 0,
        currency: transaction.currencyCode || 'USD',
        type: transaction.type === 'ACCREC' ? 'income' : 'expense',
        category: transaction.lineItems[0]?.accountCode || '',
        account: transaction.lineItems[0]?.accountCode || '',
        reference: transaction.reference,
        notes: transaction.lineItems[0]?.description,
        externalId: transaction.transactionID,
        accountingProvider: 'xero'
      }));
    } catch (error) {
      console.error('Failed to sync Xero transactions:', error);
      throw error;
    }
  }

  // Universal Accounting Operations
  async syncAllTransactions(): Promise<AccountingTransaction[]> {
    const allTransactions: AccountingTransaction[] = [];

    for (const [providerId, provider] of this.providers) {
      if (provider.isConnected && provider.syncEnabled) {
        try {
          let transactions: AccountingTransaction[] = [];

          switch (providerId) {
            case 'quickbooks':
              transactions = await this.syncQuickBooksTransactions();
              break;
            case 'xero':
              transactions = await this.syncXeroTransactions();
              break;
            default:
              console.warn(`Unknown accounting provider: ${providerId}`);
              continue;
          }

          allTransactions.push(...transactions);
        } catch (error) {
          console.error(`Failed to sync ${provider.name} transactions:`, error);
        }
      }
    }

    return allTransactions;
  }

  async createInvoice(invoice: Omit<AccountingInvoice, 'id' | 'accountingProvider'>, providerId: string): Promise<string> {
    switch (providerId) {
      case 'quickbooks':
        return await this.createQuickBooksInvoice(invoice);
      case 'xero':
        // Implement Xero invoice creation
        throw new Error('Xero invoice creation not yet implemented');
      default:
        throw new Error(`Unknown accounting provider: ${providerId}`);
    }
  }

  // Task/Payment to Accounting Integration
  async syncTaskToAccounting(task: Task, payment: Payment, providerId: string): Promise<string> {
    try {
      // Convert task and payment to accounting transaction
      const transaction: Omit<AccountingTransaction, 'id' | 'accountingProvider'> = {
        date: new Date(payment.timestamp),
        description: `Task: ${task.title}`,
        amount: payment.amount,
        currency: payment.currency || 'PHP',
        type: 'income',
        category: 'Service Revenue',
        account: 'Accounts Receivable',
        reference: payment.transactionId,
        notes: task.description,
        externalId: payment.transactionId
      };

      // Create transaction in accounting system
      return await this.createTransaction(transaction, providerId);
    } catch (error) {
      console.error('Failed to sync task to accounting:', error);
      throw error;
    }
  }

  async createTransaction(transaction: Omit<AccountingTransaction, 'id' | 'accountingProvider'>, providerId: string): Promise<string> {
    switch (providerId) {
      case 'quickbooks':
        // Implement QuickBooks transaction creation
        throw new Error('QuickBooks transaction creation not yet implemented');
      case 'xero':
        // Implement Xero transaction creation
        throw new Error('Xero transaction creation not yet implemented');
      default:
        throw new Error(`Unknown accounting provider: ${providerId}`);
    }
  }

  // Financial Reporting
  async generateFinancialReport(startDate: Date, endDate: Date, providerId: string): Promise<{
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    transactions: AccountingTransaction[];
    topCategories: Array<{ category: string; amount: number }>;
  }> {
    try {
      const transactions = await this.syncAllTransactions();
      
      // Filter transactions by date range
      const filteredTransactions = transactions.filter(t => 
        t.date >= startDate && t.date <= endDate
      );

      const totalIncome = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpenses = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const netProfit = totalIncome - totalExpenses;

      // Calculate top categories
      const categoryTotals = new Map<string, number>();
      filteredTransactions.forEach(t => {
        const current = categoryTotals.get(t.category) || 0;
        categoryTotals.set(t.category, current + t.amount);
      });

      const topCategories = Array.from(categoryTotals.entries())
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10);

      return {
        totalIncome,
        totalExpenses,
        netProfit,
        transactions: filteredTransactions,
        topCategories
      };
    } catch (error) {
      console.error('Failed to generate financial report:', error);
      throw error;
    }
  }

  // Provider Management
  getProviders(): AccountingProvider[] {
    return Array.from(this.providers.values());
  }

  getProvider(providerId: string): AccountingProvider | undefined {
    return this.providers.get(providerId);
  }

  updateProvider(providerId: string, updates: Partial<AccountingProvider>): void {
    const provider = this.providers.get(providerId);
    if (provider) {
      Object.assign(provider, updates);
    }
  }

  // Sync Options Management
  getSyncOptions(): AccountingSyncOptions {
    return { ...this.syncOptions };
  }

  updateSyncOptions(options: Partial<AccountingSyncOptions>): void {
    Object.assign(this.syncOptions, options);
  }

  // Utility Methods
  async getTaxCalculation(amount: number, taxRate: string): Promise<number> {
    const rate = this.syncOptions.taxRates[taxRate] || 0;
    return amount * rate;
  }

  async getCurrencyConversion(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    // Implementation would use a currency conversion API
    // For now, return the original amount
    return amount;
  }

  async exportToCSV(transactions: AccountingTransaction[]): Promise<string> {
    const headers = ['Date', 'Description', 'Amount', 'Currency', 'Type', 'Category', 'Account', 'Reference'];
    const rows = transactions.map(t => [
      t.date.toISOString().split('T')[0],
      t.description,
      t.amount.toString(),
      t.currency,
      t.type,
      t.category,
      t.account,
      t.reference || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  }
}

// Convenience functions
export const accountingService = AccountingIntegrationService.getInstance();

export const connectQuickBooks = () => accountingService.connectQuickBooks();
export const connectXero = () => accountingService.connectXero();
export const syncAllTransactions = () => accountingService.syncAllTransactions();
export const syncTaskToAccounting = (task: Task, payment: Payment, providerId: string) => 
  accountingService.syncTaskToAccounting(task, payment, providerId); 