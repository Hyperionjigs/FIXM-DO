import { User, Task, Appointment } from '@/types';

export interface CRMContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  tags?: string[];
  customFields?: Record<string, any>;
  externalId?: string;
  crmProvider: 'salesforce' | 'hubspot' | 'pipedrive' | 'zoho' | 'fixmo';
}

export interface CRMOpportunity {
  id: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  probability: number;
  expectedCloseDate: Date;
  contactId: string;
  assignedTo?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  externalId?: string;
  crmProvider: 'salesforce' | 'hubspot' | 'pipedrive' | 'zoho' | 'fixmo';
}

export interface CRMDeal {
  id: string;
  title: string;
  description?: string;
  value: number;
  currency: string;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  contactId: string;
  assignedTo?: string;
  expectedCloseDate: Date;
  tags?: string[];
  customFields?: Record<string, any>;
  externalId?: string;
  crmProvider: 'salesforce' | 'hubspot' | 'pipedrive' | 'zoho' | 'fixmo';
}

export interface CRMProvider {
  name: string;
  id: string;
  isConnected: boolean;
  apiKey?: string;
  accessToken?: string;
  refreshToken?: string;
  lastSync?: Date;
  syncEnabled: boolean;
  webhookUrl?: string;
}

export interface CRMSyncOptions {
  syncDirection: 'bidirectional' | 'import' | 'export';
  syncContacts: boolean;
  syncOpportunities: boolean;
  syncDeals: boolean;
  autoSync: boolean;
  syncInterval: number; // minutes
}

export class CRMIntegrationService {
  private static instance: CRMIntegrationService;
  private providers: Map<string, CRMProvider> = new Map();
  private syncOptions: CRMSyncOptions = {
    syncDirection: 'bidirectional',
    syncContacts: true,
    syncOpportunities: true,
    syncDeals: true,
    autoSync: true,
    syncInterval: 30
  };

  private constructor() {
    this.initializeProviders();
  }

  static getInstance(): CRMIntegrationService {
    if (!CRMIntegrationService.instance) {
      CRMIntegrationService.instance = new CRMIntegrationService();
    }
    return CRMIntegrationService.instance;
  }

  private initializeProviders() {
    // Initialize with default providers
    this.providers.set('salesforce', {
      name: 'Salesforce',
      id: 'salesforce',
      isConnected: false,
      syncEnabled: true
    });

    this.providers.set('hubspot', {
      name: 'HubSpot',
      id: 'hubspot',
      isConnected: false,
      syncEnabled: true
    });

    this.providers.set('pipedrive', {
      name: 'Pipedrive',
      id: 'pipedrive',
      isConnected: false,
      syncEnabled: true
    });

    this.providers.set('zoho', {
      name: 'Zoho CRM',
      id: 'zoho',
      isConnected: false,
      syncEnabled: true
    });
  }

  // Salesforce Integration
  async connectSalesforce(): Promise<boolean> {
    try {
      // Initialize Salesforce connection
      const clientId = process.env.NEXT_PUBLIC_SALESFORCE_CLIENT_ID;
      const redirectUri = `${window.location.origin}/api/crm/salesforce/callback`;

      // Redirect to Salesforce OAuth
      const authUrl = `https://login.salesforce.com/services/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=api%20refresh_token`;
      
      window.location.href = authUrl;
      
      return true;
    } catch (error) {
      console.error('Failed to connect to Salesforce:', error);
      return false;
    }
  }

  async handleSalesforceCallback(code: string): Promise<boolean> {
    try {
      const response = await fetch('/api/crm/salesforce/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const { accessToken, refreshToken, instanceUrl } = await response.json();

      const provider = this.providers.get('salesforce');
      if (provider) {
        provider.isConnected = true;
        provider.accessToken = accessToken;
        provider.refreshToken = refreshToken;
        provider.lastSync = new Date();
      }

      return true;
    } catch (error) {
      console.error('Failed to handle Salesforce callback:', error);
      return false;
    }
  }

  async syncSalesforceContacts(): Promise<CRMContact[]> {
    try {
      const provider = this.providers.get('salesforce');
      if (!provider?.isConnected) {
        throw new Error('Salesforce not connected');
      }

      const response = await fetch('/api/crm/salesforce/contacts', {
        headers: {
          'Authorization': `Bearer ${provider.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Salesforce contacts');
      }

      const data = await response.json();
      return data.records.map((contact: any) => ({
        id: contact.Id,
        firstName: contact.FirstName || '',
        lastName: contact.LastName || '',
        email: contact.Email || '',
        phone: contact.Phone,
        company: contact.Account?.Name,
        title: contact.Title,
        address: contact.MailingAddress ? {
          street: contact.MailingAddress.street || '',
          city: contact.MailingAddress.city || '',
          state: contact.MailingAddress.state || '',
          zipCode: contact.MailingAddress.postalCode || '',
          country: contact.MailingAddress.country || ''
        } : undefined,
        tags: contact.Tags__c ? contact.Tags__c.split(';') : [],
        customFields: {
          leadSource: contact.LeadSource,
          industry: contact.Industry,
          description: contact.Description
        },
        externalId: contact.Id,
        crmProvider: 'salesforce'
      }));
    } catch (error) {
      console.error('Failed to sync Salesforce contacts:', error);
      throw error;
    }
  }

  async createSalesforceContact(contact: Omit<CRMContact, 'id' | 'crmProvider'>): Promise<string> {
    try {
      const provider = this.providers.get('salesforce');
      if (!provider?.isConnected) {
        throw new Error('Salesforce not connected');
      }

      const response = await fetch('/api/crm/salesforce/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${provider.accessToken}`
        },
        body: JSON.stringify({
          FirstName: contact.firstName,
          LastName: contact.lastName,
          Email: contact.email,
          Phone: contact.phone,
          Title: contact.title,
          Description: contact.customFields?.description,
          LeadSource: contact.customFields?.leadSource,
          Industry: contact.customFields?.industry
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create Salesforce contact');
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('Failed to create Salesforce contact:', error);
      throw error;
    }
  }

  // HubSpot Integration
  async connectHubSpot(): Promise<boolean> {
    try {
      const clientId = process.env.NEXT_PUBLIC_HUBSPOT_CLIENT_ID;
      const redirectUri = `${window.location.origin}/api/crm/hubspot/callback`;

      const authUrl = `https://app.hubspot.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=contacts%20crm.objects.contacts.read%20crm.objects.contacts.write`;
      
      window.location.href = authUrl;
      
      return true;
    } catch (error) {
      console.error('Failed to connect to HubSpot:', error);
      return false;
    }
  }

  async handleHubSpotCallback(code: string): Promise<boolean> {
    try {
      const response = await fetch('/api/crm/hubspot/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const { accessToken, refreshToken } = await response.json();

      const provider = this.providers.get('hubspot');
      if (provider) {
        provider.isConnected = true;
        provider.accessToken = accessToken;
        provider.refreshToken = refreshToken;
        provider.lastSync = new Date();
      }

      return true;
    } catch (error) {
      console.error('Failed to handle HubSpot callback:', error);
      return false;
    }
  }

  async syncHubSpotContacts(): Promise<CRMContact[]> {
    try {
      const provider = this.providers.get('hubspot');
      if (!provider?.isConnected) {
        throw new Error('HubSpot not connected');
      }

      const response = await fetch('/api/crm/hubspot/contacts', {
        headers: {
          'Authorization': `Bearer ${provider.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch HubSpot contacts');
      }

      const data = await response.json();
      return data.results.map((contact: any) => ({
        id: contact.id,
        firstName: contact.properties.firstname || '',
        lastName: contact.properties.lastname || '',
        email: contact.properties.email || '',
        phone: contact.properties.phone,
        company: contact.properties.company,
        title: contact.properties.jobtitle,
        tags: contact.properties.hs_lead_status ? [contact.properties.hs_lead_status] : [],
        customFields: {
          leadStatus: contact.properties.hs_lead_status,
          lifecycleStage: contact.properties.lifecyclestage,
          leadSource: contact.properties.lead_source
        },
        externalId: contact.id,
        crmProvider: 'hubspot'
      }));
    } catch (error) {
      console.error('Failed to sync HubSpot contacts:', error);
      throw error;
    }
  }

  // Universal CRM Operations
  async syncAllCRMContacts(): Promise<CRMContact[]> {
    const allContacts: CRMContact[] = [];

    for (const [providerId, provider] of this.providers) {
      if (provider.isConnected && provider.syncEnabled) {
        try {
          let contacts: CRMContact[] = [];

          switch (providerId) {
            case 'salesforce':
              contacts = await this.syncSalesforceContacts();
              break;
            case 'hubspot':
              contacts = await this.syncHubSpotContacts();
              break;
            default:
              console.warn(`Unknown CRM provider: ${providerId}`);
              continue;
          }

          allContacts.push(...contacts);
        } catch (error) {
          console.error(`Failed to sync ${provider.name} contacts:`, error);
        }
      }
    }

    return allContacts;
  }

  async createCRMContact(contact: Omit<CRMContact, 'id' | 'crmProvider'>, providerId: string): Promise<string> {
    switch (providerId) {
      case 'salesforce':
        return await this.createSalesforceContact(contact);
      case 'hubspot':
        // Implement HubSpot contact creation
        throw new Error('HubSpot contact creation not yet implemented');
      default:
        throw new Error(`Unknown CRM provider: ${providerId}`);
    }
  }

  async updateCRMContact(contactId: string, updates: Partial<CRMContact>, providerId: string): Promise<void> {
    switch (providerId) {
      case 'salesforce':
        await this.updateSalesforceContact(contactId, updates);
        break;
      case 'hubspot':
        // Implement HubSpot contact update
        throw new Error('HubSpot contact update not yet implemented');
      default:
        throw new Error(`Unknown CRM provider: ${providerId}`);
    }
  }

  private async updateSalesforceContact(contactId: string, updates: Partial<CRMContact>): Promise<void> {
    try {
      const provider = this.providers.get('salesforce');
      if (!provider?.isConnected) {
        throw new Error('Salesforce not connected');
      }

      const response = await fetch(`/api/crm/salesforce/contacts/${contactId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${provider.accessToken}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update Salesforce contact');
      }
    } catch (error) {
      console.error('Failed to update Salesforce contact:', error);
      throw error;
    }
  }

  // Task/Appointment to CRM Integration
  async syncTaskToCRM(task: Task, providerId: string): Promise<string> {
    try {
      // Convert task to CRM opportunity/deal
      const opportunity: Omit<CRMOpportunity, 'id' | 'crmProvider'> = {
        title: task.title,
        description: task.description,
        amount: task.budget || 0,
        currency: 'PHP',
        stage: 'qualified',
        probability: 75,
        expectedCloseDate: new Date(task.deadline || Date.now() + 7 * 24 * 60 * 60 * 1000),
        contactId: task.clientId,
        assignedTo: task.taskerId,
        tags: task.categories || [],
        customFields: {
          taskType: task.type,
          location: task.location,
          urgency: task.urgency
        }
      };

      // Create opportunity in CRM
      return await this.createCRMOpportunity(opportunity, providerId);
    } catch (error) {
      console.error('Failed to sync task to CRM:', error);
      throw error;
    }
  }

  async createCRMOpportunity(opportunity: Omit<CRMOpportunity, 'id' | 'crmProvider'>, providerId: string): Promise<string> {
    switch (providerId) {
      case 'salesforce':
        // Implement Salesforce opportunity creation
        throw new Error('Salesforce opportunity creation not yet implemented');
      case 'hubspot':
        // Implement HubSpot deal creation
        throw new Error('HubSpot deal creation not yet implemented');
      default:
        throw new Error(`Unknown CRM provider: ${providerId}`);
    }
  }

  // Provider Management
  getProviders(): CRMProvider[] {
    return Array.from(this.providers.values());
  }

  getProvider(providerId: string): CRMProvider | undefined {
    return this.providers.get(providerId);
  }

  updateProvider(providerId: string, updates: Partial<CRMProvider>): void {
    const provider = this.providers.get(providerId);
    if (provider) {
      Object.assign(provider, updates);
    }
  }

  // Sync Options Management
  getSyncOptions(): CRMSyncOptions {
    return { ...this.syncOptions };
  }

  updateSyncOptions(options: Partial<CRMSyncOptions>): void {
    Object.assign(this.syncOptions, options);
  }

  // Utility Methods
  async findContactByEmail(email: string): Promise<CRMContact | null> {
    const allContacts = await this.syncAllCRMContacts();
    return allContacts.find(contact => contact.email === email) || null;
  }

  async findContactByPhone(phone: string): Promise<CRMContact | null> {
    const allContacts = await this.syncAllCRMContacts();
    return allContacts.find(contact => contact.phone === phone) || null;
  }

  async getContactOpportunities(contactId: string): Promise<CRMOpportunity[]> {
    // Implementation would fetch opportunities/deals for a specific contact
    // across all connected CRM providers
    return [];
  }

  async getContactDeals(contactId: string): Promise<CRMDeal[]> {
    // Implementation would fetch deals for a specific contact
    // across all connected CRM providers
    return [];
  }
}

// Convenience functions
export const crmService = CRMIntegrationService.getInstance();

export const connectSalesforce = () => crmService.connectSalesforce();
export const connectHubSpot = () => crmService.connectHubSpot();
export const syncAllCRMContacts = () => crmService.syncAllCRMContacts();
export const syncTaskToCRM = (task: Task, providerId: string) => crmService.syncTaskToCRM(task, providerId); 