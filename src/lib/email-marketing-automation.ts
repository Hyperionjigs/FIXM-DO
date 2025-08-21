import { User, Task } from '@/types';

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  template?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
  type: 'broadcast' | 'drip' | 'triggered' | 'ab_test';
  targetAudience: {
    segments: string[];
    filters: Record<string, any>;
    excludeSegments: string[];
  };
  schedule?: {
    sendTime: Date;
    timezone: string;
  };
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
    openRate: number;
    clickRate: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  category: 'welcome' | 'onboarding' | 'promotional' | 'transactional' | 'newsletter' | 'custom';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailSegment {
  id: string;
  name: string;
  description?: string;
  criteria: {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
    value: any;
  }[];
  userCount: number;
  isDynamic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailAutomation {
  id: string;
  name: string;
  description?: string;
  trigger: {
    type: 'user_signup' | 'task_created' | 'task_completed' | 'payment_received' | 'inactive_user' | 'custom';
    conditions: Record<string, any>;
  };
  steps: EmailAutomationStep[];
  status: 'draft' | 'active' | 'paused' | 'archived';
  metrics: {
    triggered: number;
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailAutomationStep {
  id: string;
  type: 'send_email' | 'wait' | 'condition' | 'webhook' | 'tag_user';
  config: {
    emailTemplateId?: string;
    delay?: number; // minutes
    condition?: Record<string, any>;
    webhookUrl?: string;
    tag?: string;
  };
  order: number;
}

export interface EmailSubscriber {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  tags: string[];
  segments: string[];
  status: 'subscribed' | 'unsubscribed' | 'bounced' | 'pending';
  subscribedAt: Date;
  unsubscribedAt?: Date;
  lastEmailSent?: Date;
  lastEmailOpened?: Date;
  lastEmailClicked?: Date;
  metadata?: Record<string, any>;
}

export class EmailMarketingAutomationService {
  private static instance: EmailMarketingAutomationService;
  private campaigns: Map<string, EmailCampaign> = new Map();
  private templates: Map<string, EmailTemplate> = new Map();
  private segments: Map<string, EmailSegment> = new Map();
  private automations: Map<string, EmailAutomation> = new Map();
  private subscribers: Map<string, EmailSubscriber> = new Map();

  private constructor() {
    this.initializeDefaultTemplates();
    this.initializeDefaultSegments();
    this.initializeDefaultAutomations();
  }

  static getInstance(): EmailMarketingAutomationService {
    if (!EmailMarketingAutomationService.instance) {
      EmailMarketingAutomationService.instance = new EmailMarketingAutomationService();
    }
    return EmailMarketingAutomationService.instance;
  }

  private initializeDefaultTemplates() {
    // Welcome Email Template
    this.templates.set('welcome', {
      id: 'welcome',
      name: 'Welcome to FixMo',
      subject: 'Welcome to FixMo! 🎉',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Welcome to FixMo, {{firstName}}! 🎉</h1>
          <p>We're excited to have you join our community of trusted taskers and clients.</p>
          <p>Here's what you can do with FixMo:</p>
          <ul>
            <li>Post tasks and find reliable help</li>
            <li>Offer your services and earn money</li>
            <li>Connect with trusted neighbors</li>
            <li>Get things done safely and securely</li>
          </ul>
          <a href="{{dashboardUrl}}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Get Started</a>
        </div>
      `,
      textContent: `
        Welcome to FixMo, {{firstName}}!
        
        We're excited to have you join our community of trusted taskers and clients.
        
        Here's what you can do with FixMo:
        - Post tasks and find reliable help
        - Offer your services and earn money
        - Connect with trusted neighbors
        - Get things done safely and securely
        
        Get started: {{dashboardUrl}}
      `,
      variables: ['firstName', 'dashboardUrl'],
      category: 'welcome',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Task Completion Template
    this.templates.set('task_completed', {
      id: 'task_completed',
      name: 'Task Completed',
      subject: 'Your task has been completed! ✅',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Task Completed! ✅</h1>
          <p>Great news, {{firstName}}! Your task "{{taskTitle}}" has been completed.</p>
          <p><strong>Task Details:</strong></p>
          <ul>
            <li>Task: {{taskTitle}}</li>
            <li>Tasker: {{taskerName}}</li>
            <li>Amount: ₱{{taskAmount}}</li>
            <li>Completed: {{completionDate}}</li>
          </ul>
          <p>Please review the work and release payment if you're satisfied.</p>
          <a href="{{taskUrl}}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Task</a>
        </div>
      `,
      textContent: `
        Task Completed! ✅
        
        Great news, {{firstName}}! Your task "{{taskTitle}}" has been completed.
        
        Task Details:
        - Task: {{taskTitle}}
        - Tasker: {{taskerName}}
        - Amount: ₱{{taskAmount}}
        - Completed: {{completionDate}}
        
        Please review the work and release payment if you're satisfied.
        
        View task: {{taskUrl}}
      `,
      variables: ['firstName', 'taskTitle', 'taskerName', 'taskAmount', 'completionDate', 'taskUrl'],
      category: 'transactional',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Newsletter Template
    this.templates.set('newsletter', {
      id: 'newsletter',
      name: 'FixMo Newsletter',
      subject: 'FixMo Weekly: {{newsletterTitle}}',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>FixMo Weekly Newsletter</h1>
          <h2>{{newsletterTitle}}</h2>
          <p>{{newsletterSummary}}</p>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>This Week's Highlights</h3>
            <ul>
              {{#each highlights}}
                <li>{{this}}</li>
              {{/each}}
            </ul>
          </div>
          <a href="{{newsletterUrl}}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Read More</a>
        </div>
      `,
      textContent: `
        FixMo Weekly Newsletter
        {{newsletterTitle}}
        
        {{newsletterSummary}}
        
        This Week's Highlights:
        {{#each highlights}}
          - {{this}}
        {{/each}}
        
        Read more: {{newsletterUrl}}
      `,
      variables: ['newsletterTitle', 'newsletterSummary', 'highlights', 'newsletterUrl'],
      category: 'newsletter',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  private initializeDefaultSegments() {
    // Active Users Segment
    this.segments.set('active_users', {
      id: 'active_users',
      name: 'Active Users',
      description: 'Users who have been active in the last 30 days',
      criteria: [
        {
          field: 'lastActivity',
          operator: 'greater_than',
          value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      ],
      userCount: 0,
      isDynamic: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // New Users Segment
    this.segments.set('new_users', {
      id: 'new_users',
      name: 'New Users',
      description: 'Users who signed up in the last 7 days',
      criteria: [
        {
          field: 'createdAt',
          operator: 'greater_than',
          value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      ],
      userCount: 0,
      isDynamic: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Inactive Users Segment
    this.segments.set('inactive_users', {
      id: 'inactive_users',
      name: 'Inactive Users',
      description: 'Users who haven\'t been active in the last 60 days',
      criteria: [
        {
          field: 'lastActivity',
          operator: 'less_than',
          value: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
        }
      ],
      userCount: 0,
      isDynamic: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  private initializeDefaultAutomations() {
    // Welcome Series Automation
    this.automations.set('welcome_series', {
      id: 'welcome_series',
      name: 'Welcome Series',
      description: 'Automated welcome emails for new users',
      trigger: {
        type: 'user_signup',
        conditions: {}
      },
      steps: [
        {
          id: 'welcome_email',
          type: 'send_email',
          config: {
            emailTemplateId: 'welcome'
          },
          order: 1
        },
        {
          id: 'wait_2_days',
          type: 'wait',
          config: {
            delay: 2880 // 48 hours
          },
          order: 2
        },
        {
          id: 'onboarding_email',
          type: 'send_email',
          config: {
            emailTemplateId: 'onboarding'
          },
          order: 3
        }
      ],
      status: 'active',
      metrics: {
        triggered: 0,
        sent: 0,
        opened: 0,
        clicked: 0,
        converted: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Task Completion Automation
    this.automations.set('task_completion', {
      id: 'task_completion',
      name: 'Task Completion Follow-up',
      description: 'Follow-up emails when tasks are completed',
      trigger: {
        type: 'task_completed',
        conditions: {}
      },
      steps: [
        {
          id: 'completion_email',
          type: 'send_email',
          config: {
            emailTemplateId: 'task_completed'
          },
          order: 1
        },
        {
          id: 'wait_3_days',
          type: 'wait',
          config: {
            delay: 4320 // 72 hours
          },
          order: 2
        },
        {
          id: 'review_reminder',
          type: 'send_email',
          config: {
            emailTemplateId: 'review_reminder'
          },
          order: 3
        }
      ],
      status: 'active',
      metrics: {
        triggered: 0,
        sent: 0,
        opened: 0,
        clicked: 0,
        converted: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  // Campaign Management
  async createCampaign(campaign: Omit<EmailCampaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.campaigns.set(campaignId, {
      ...campaign,
      id: campaignId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return campaignId;
  }

  async sendCampaign(campaignId: string): Promise<void> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      throw new Error('Campaign cannot be sent in current status');
    }

    // Update campaign status
    campaign.status = 'sending';
    campaign.updatedAt = new Date();

    // Get target subscribers
    const subscribers = await this.getSubscribersForCampaign(campaign);

    // Send emails
    for (const subscriber of subscribers) {
      try {
        await this.sendEmailToSubscriber(subscriber, campaign);
        campaign.metrics.sent++;
      } catch (error) {
        console.error(`Failed to send email to ${subscriber.email}:`, error);
        campaign.metrics.bounced++;
      }
    }

    // Update campaign status and metrics
    campaign.status = 'sent';
    campaign.metrics.openRate = campaign.metrics.opened / campaign.metrics.sent;
    campaign.metrics.clickRate = campaign.metrics.clicked / campaign.metrics.sent;
    campaign.updatedAt = new Date();
  }

  private async getSubscribersForCampaign(campaign: EmailCampaign): Promise<EmailSubscriber[]> {
    const allSubscribers = Array.from(this.subscribers.values());
    
    return allSubscribers.filter(subscriber => {
      // Check if subscriber is in target segments
      const inTargetSegment = campaign.targetAudience.segments.some(segmentId => 
        subscriber.segments.includes(segmentId)
      );

      // Check if subscriber is excluded
      const isExcluded = campaign.targetAudience.excludeSegments.some(segmentId => 
        subscriber.segments.includes(segmentId)
      );

      return inTargetSegment && !isExcluded && subscriber.status === 'subscribed';
    });
  }

  private async sendEmailToSubscriber(subscriber: EmailSubscriber, campaign: EmailCampaign): Promise<void> {
    // Get template
    const template = this.templates.get(campaign.template || 'default');
    if (!template) {
      throw new Error('Email template not found');
    }

    // Replace variables in content
    const htmlContent = this.replaceTemplateVariables(template.htmlContent, subscriber, campaign);
    const textContent = this.replaceTemplateVariables(template.textContent, subscriber, campaign);
    const subject = this.replaceTemplateVariables(campaign.subject, subscriber, campaign);

    // Send email using email service
    // This would integrate with your existing email service
    console.log(`Sending email to ${subscriber.email}:`, { subject, htmlContent, textContent });

    // Update subscriber metrics
    subscriber.lastEmailSent = new Date();
  }

  private replaceTemplateVariables(content: string, subscriber: EmailSubscriber, campaign: EmailCampaign): string {
    let replacedContent = content;

    // Replace subscriber variables
    replacedContent = replacedContent.replace(/\{\{firstName\}\}/g, subscriber.firstName || '');
    replacedContent = replacedContent.replace(/\{\{lastName\}\}/g, subscriber.lastName || '');
    replacedContent = replacedContent.replace(/\{\{email\}\}/g, subscriber.email);

    // Replace campaign variables
    replacedContent = replacedContent.replace(/\{\{campaignName\}\}/g, campaign.name);

    // Replace common variables
    replacedContent = replacedContent.replace(/\{\{dashboardUrl\}\}/g, `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
    replacedContent = replacedContent.replace(/\{\{unsubscribeUrl\}\}/g, `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?email=${subscriber.email}`);

    return replacedContent;
  }

  // Template Management
  async createTemplate(template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const templateId = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.templates.set(templateId, {
      ...template,
      id: templateId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return templateId;
  }

  getTemplates(): EmailTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplate(templateId: string): EmailTemplate | undefined {
    return this.templates.get(templateId);
  }

  // Segment Management
  async createSegment(segment: Omit<EmailSegment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const segmentId = `segment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.segments.set(segmentId, {
      ...segment,
      id: segmentId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return segmentId;
  }

  async updateSegmentUserCount(segmentId: string): Promise<void> {
    const segment = this.segments.get(segmentId);
    if (!segment) return;

    // Calculate user count based on criteria
    const allSubscribers = Array.from(this.subscribers.values());
    const matchingSubscribers = allSubscribers.filter(subscriber => 
      this.matchesSegmentCriteria(subscriber, segment.criteria)
    );

    segment.userCount = matchingSubscribers.length;
    segment.updatedAt = new Date();
  }

  private matchesSegmentCriteria(subscriber: EmailSubscriber, criteria: EmailSegment['criteria']): boolean {
    return criteria.every(criterion => {
      const value = subscriber.metadata?.[criterion.field];
      
      switch (criterion.operator) {
        case 'equals':
          return value === criterion.value;
        case 'not_equals':
          return value !== criterion.value;
        case 'contains':
          return String(value).includes(String(criterion.value));
        case 'not_contains':
          return !String(value).includes(String(criterion.value));
        case 'greater_than':
          return value > criterion.value;
        case 'less_than':
          return value < criterion.value;
        case 'in':
          return Array.isArray(criterion.value) && criterion.value.includes(value);
        case 'not_in':
          return Array.isArray(criterion.value) && !criterion.value.includes(value);
        default:
          return false;
      }
    });
  }

  // Automation Management
  async createAutomation(automation: Omit<EmailAutomation, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const automationId = `automation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.automations.set(automationId, {
      ...automation,
      id: automationId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return automationId;
  }

  async triggerAutomation(automationId: string, userId: string, context?: Record<string, any>): Promise<void> {
    const automation = this.automations.get(automationId);
    if (!automation || automation.status !== 'active') {
      return;
    }

    // Update metrics
    automation.metrics.triggered++;
    automation.updatedAt = new Date();

    // Execute automation steps
    await this.executeAutomationSteps(automation, userId, context);
  }

  private async executeAutomationSteps(automation: EmailAutomation, userId: string, context?: Record<string, any>): Promise<void> {
    const sortedSteps = automation.steps.sort((a, b) => a.order - b.order);

    for (const step of sortedSteps) {
      try {
        await this.executeAutomationStep(step, userId, context);
      } catch (error) {
        console.error(`Failed to execute automation step ${step.id}:`, error);
      }
    }
  }

  private async executeAutomationStep(step: EmailAutomationStep, userId: string, context?: Record<string, any>): Promise<void> {
    switch (step.type) {
      case 'send_email':
        if (step.config.emailTemplateId) {
          const template = this.templates.get(step.config.emailTemplateId);
          if (template) {
            // Send email to user
            console.log(`Sending automation email to user ${userId} using template ${step.config.emailTemplateId}`);
          }
        }
        break;

      case 'wait':
        if (step.config.delay) {
          // In a real implementation, this would be handled by a job queue
          console.log(`Waiting ${step.config.delay} minutes before next step`);
        }
        break;

      case 'condition':
        if (step.config.condition) {
          // Evaluate condition and potentially skip next steps
          console.log('Evaluating automation condition:', step.config.condition);
        }
        break;

      case 'webhook':
        if (step.config.webhookUrl) {
          // Call webhook
          console.log(`Calling webhook: ${step.config.webhookUrl}`);
        }
        break;

      case 'tag_user':
        if (step.config.tag) {
          // Add tag to user
          console.log(`Adding tag "${step.config.tag}" to user ${userId}`);
        }
        break;
    }
  }

  // Subscriber Management
  async addSubscriber(subscriber: Omit<EmailSubscriber, 'id'>): Promise<string> {
    const subscriberId = `subscriber_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.subscribers.set(subscriberId, {
      ...subscriber,
      id: subscriberId
    });

    return subscriberId;
  }

  async updateSubscriber(subscriberId: string, updates: Partial<EmailSubscriber>): Promise<void> {
    const subscriber = this.subscribers.get(subscriberId);
    if (subscriber) {
      Object.assign(subscriber, updates);
    }
  }

  async unsubscribeSubscriber(email: string): Promise<void> {
    const subscriber = Array.from(this.subscribers.values()).find(s => s.email === email);
    if (subscriber) {
      subscriber.status = 'unsubscribed';
      subscriber.unsubscribedAt = new Date();
    }
  }

  // Analytics and Reporting
  async getCampaignAnalytics(campaignId: string): Promise<EmailCampaign['metrics']> {
    const campaign = this.campaigns.get(campaignId);
    return campaign?.metrics || {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      unsubscribed: 0,
      openRate: 0,
      clickRate: 0
    };
  }

  async getAutomationAnalytics(automationId: string): Promise<EmailAutomation['metrics']> {
    const automation = this.automations.get(automationId);
    return automation?.metrics || {
      triggered: 0,
      sent: 0,
      opened: 0,
      clicked: 0,
      converted: 0
    };
  }

  // Utility Methods
  async trackEmailOpen(email: string, campaignId?: string): Promise<void> {
    const subscriber = Array.from(this.subscribers.values()).find(s => s.email === email);
    if (subscriber) {
      subscriber.lastEmailOpened = new Date();
    }

    if (campaignId) {
      const campaign = this.campaigns.get(campaignId);
      if (campaign) {
        campaign.metrics.opened++;
        campaign.metrics.openRate = campaign.metrics.opened / campaign.metrics.sent;
      }
    }
  }

  async trackEmailClick(email: string, campaignId?: string): Promise<void> {
    const subscriber = Array.from(this.subscribers.values()).find(s => s.email === email);
    if (subscriber) {
      subscriber.lastEmailClicked = new Date();
    }

    if (campaignId) {
      const campaign = this.campaigns.get(campaignId);
      if (campaign) {
        campaign.metrics.clicked++;
        campaign.metrics.clickRate = campaign.metrics.clicked / campaign.metrics.sent;
      }
    }
  }
}

// Convenience functions
export const emailMarketingService = EmailMarketingAutomationService.getInstance();

export const createEmailCampaign = (campaign: Omit<EmailCampaign, 'id' | 'createdAt' | 'updatedAt'>) => 
  emailMarketingService.createCampaign(campaign);
export const sendEmailCampaign = (campaignId: string) => emailMarketingService.sendCampaign(campaignId);
export const createEmailTemplate = (template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>) => 
  emailMarketingService.createTemplate(template);
export const triggerEmailAutomation = (automationId: string, userId: string, context?: Record<string, any>) => 
  emailMarketingService.triggerAutomation(automationId, userId, context); 