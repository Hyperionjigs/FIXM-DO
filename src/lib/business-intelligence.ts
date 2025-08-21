// Business Intelligence & Analytics System for FixMo
// Advanced analytics, revenue optimization, and market intelligence

export interface BusinessMetrics {
  revenue: RevenueMetrics;
  users: UserMetrics;
  tasks: TaskMetrics;
  performance: PerformanceMetrics;
  market: MarketMetrics;
  trends: TrendMetrics;
}

export interface RevenueMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  averageTransactionValue: number;
  revenueByCategory: Record<string, number>;
  commissionRevenue: number;
  subscriptionRevenue: number;
  netRevenue: number;
}

export interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  churnRate: number;
  userRetention: number;
  userLifetimeValue: number;
  userEngagement: number;
}

export interface TaskMetrics {
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  averageTaskValue: number;
  taskCompletionRate: number;
  averageTaskDuration: number;
  tasksByCategory: Record<string, number>;
}

export interface PerformanceMetrics {
  systemUptime: number;
  averageResponseTime: number;
  errorRate: number;
  pageLoadTime: number;
  mobilePerformance: number;
}

export interface MarketMetrics {
  marketSize: number;
  marketShare: number;
  competitorAnalysis: CompetitorMetrics[];
  demandForecast: DemandForecast;
  pricingAnalysis: PricingAnalysis;
}

export interface CompetitorMetrics {
  name: string;
  marketShare: number;
  pricing: number;
  features: string[];
  threatLevel: 'low' | 'medium' | 'high';
}

export interface DemandForecast {
  shortTerm: number;
  mediumTerm: number;
  longTerm: number;
  confidence: number;
  factors: string[];
}

export interface PricingAnalysis {
  currentPricing: Record<string, number>;
  optimalPricing: Record<string, number>;
  priceElasticity: Record<string, number>;
  pricingRecommendations: PricingRecommendation[];
}

export interface PricingRecommendation {
  category: string;
  currentPrice: number;
  recommendedPrice: number;
  expectedImpact: number;
  confidence: number;
  reasoning: string;
}

export interface TrendMetrics {
  userGrowth: TrendData;
  revenueGrowth: TrendData;
  taskGrowth: TrendData;
  engagementGrowth: TrendData;
}

export interface TrendData {
  current: number;
  previous: number;
  change: number;
  percentageChange: number;
  trend: 'up' | 'down' | 'stable';
  forecast: number[];
}

export interface AnalyticsEvent {
  id: string;
  userId?: string;
  eventType: string;
  eventData: Record<string, any>;
  timestamp: Date;
}

export interface RevenueOptimization {
  dynamicPricing: DynamicPricingConfig;
  commissionOptimization: CommissionConfig;
  subscriptionOptimization: SubscriptionConfig;
  premiumFeatures: PremiumFeatureConfig;
}

export interface DynamicPricingConfig {
  enabled: boolean;
  factors: string[];
  updateFrequency: number;
  minPrice: number;
  maxPrice: number;
}

export interface CommissionConfig {
  baseRate: number;
  tieredRates: Record<string, number>;
  volumeDiscounts: Record<string, number>;
  optimizationTarget: number;
}

export interface SubscriptionConfig {
  plans: SubscriptionPlan[];
  pricing: Record<string, number>;
  conversionTarget: number;
  retentionTarget: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  targetUsers: string[];
  conversionRate: number;
}

export interface PremiumFeatureConfig {
  features: PremiumFeature[];
  pricing: Record<string, number>;
  adoptionTarget: number;
  revenueTarget: number;
}

export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  price: number;
  adoptionRate: number;
  revenueGenerated: number;
}

class BusinessIntelligence {
  private static instance: BusinessIntelligence;
  private metrics: BusinessMetrics;
  private events: AnalyticsEvent[] = [];
  private revenueOptimization: RevenueOptimization;

  private constructor() {
    this.initializeMetrics();
    this.initializeRevenueOptimization();
  }

  static getInstance(): BusinessIntelligence {
    if (!BusinessIntelligence.instance) {
      BusinessIntelligence.instance = new BusinessIntelligence();
    }
    return BusinessIntelligence.instance;
  }

  private initializeMetrics(): void {
    this.metrics = {
      revenue: {
        totalRevenue: 0,
        monthlyRevenue: 0,
        revenueGrowth: 0,
        averageTransactionValue: 0,
        revenueByCategory: {},
        commissionRevenue: 0,
        subscriptionRevenue: 0,
        netRevenue: 0
      },
      users: {
        totalUsers: 0,
        activeUsers: 0,
        newUsers: 0,
        churnRate: 0,
        userRetention: 0,
        userLifetimeValue: 0,
        userEngagement: 0
      },
      tasks: {
        totalTasks: 0,
        completedTasks: 0,
        activeTasks: 0,
        averageTaskValue: 0,
        taskCompletionRate: 0,
        averageTaskDuration: 0,
        tasksByCategory: {}
      },
      performance: {
        systemUptime: 99.9,
        averageResponseTime: 200,
        errorRate: 0.1,
        pageLoadTime: 1500,
        mobilePerformance: 85
      },
      market: {
        marketSize: 1000000,
        marketShare: 5,
        competitorAnalysis: [
          {
            name: 'Competitor A',
            marketShare: 25,
            pricing: 15,
            features: ['basic_tasks', 'mobile_app'],
            threatLevel: 'high'
          }
        ],
        demandForecast: {
          shortTerm: 5000,
          mediumTerm: 15000,
          longTerm: 50000,
          confidence: 0.80,
          factors: ['seasonal_demand', 'market_growth']
        },
        pricingAnalysis: {
          currentPricing: {
            'home_repair': 50,
            'cleaning': 30,
            'moving': 100
          },
          optimalPricing: {
            'home_repair': 55,
            'cleaning': 35,
            'moving': 110
          },
          priceElasticity: {
            'home_repair': -0.8,
            'cleaning': -1.2,
            'moving': -0.6
          },
          pricingRecommendations: [
            {
              category: 'home_repair',
              currentPrice: 50,
              recommendedPrice: 55,
              expectedImpact: 0.10,
              confidence: 0.85,
              reasoning: 'High demand, low elasticity'
            }
          ]
        }
      },
      trends: {
        userGrowth: { current: 1000, previous: 800, change: 200, percentageChange: 25, trend: 'up', forecast: [1200, 1400, 1600] },
        revenueGrowth: { current: 50000, previous: 40000, change: 10000, percentageChange: 25, trend: 'up', forecast: [60000, 70000, 80000] },
        taskGrowth: { current: 500, previous: 400, change: 100, percentageChange: 25, trend: 'up', forecast: [600, 700, 800] },
        engagementGrowth: { current: 0.75, previous: 0.70, change: 0.05, percentageChange: 7.14, trend: 'up', forecast: [0.78, 0.80, 0.82] }
      }
    };
  }

  private initializeRevenueOptimization(): void {
    this.revenueOptimization = {
      dynamicPricing: {
        enabled: true,
        factors: ['demand', 'supply', 'competition', 'seasonality'],
        updateFrequency: 24,
        minPrice: 10,
        maxPrice: 1000
      },
      commissionOptimization: {
        baseRate: 0.15,
        tieredRates: {
          'basic': 0.10,
          'premium': 0.15,
          'enterprise': 0.20
        },
        volumeDiscounts: {
          '1000': 0.02,
          '5000': 0.05,
          '10000': 0.10
        },
        optimizationTarget: 0.18
      },
      subscriptionOptimization: {
        plans: [
          {
            id: 'basic',
            name: 'Basic Plan',
            price: 9.99,
            features: ['basic_tasks', 'email_support'],
            targetUsers: 'individuals',
            conversionRate: 0.05
          },
          {
            id: 'premium',
            name: 'Premium Plan',
            price: 29.99,
            features: ['unlimited_tasks', 'priority_support', 'analytics'],
            targetUsers: 'professionals',
            conversionRate: 0.03
          }
        ],
        pricing: {
          'basic': 9.99,
          'premium': 29.99
        },
        conversionTarget: 0.05,
        retentionTarget: 0.85
      },
      premiumFeatures: {
        features: [
          {
            id: 'priority_support',
            name: 'Priority Support',
            description: '24/7 priority customer support',
            price: 4.99,
            adoptionRate: 0.15,
            revenueGenerated: 0
          },
          {
            id: 'advanced_analytics',
            name: 'Advanced Analytics',
            description: 'Detailed business analytics and insights',
            price: 9.99,
            adoptionRate: 0.10,
            revenueGenerated: 0
          }
        ],
        pricing: {
          'priority_support': 4.99,
          'advanced_analytics': 9.99
        },
        adoptionTarget: 0.20,
        revenueTarget: 10000
      }
    };
  }

  // Analytics Event Tracking
  public async trackEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<void> {
    const analyticsEvent: AnalyticsEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...event,
      timestamp: new Date()
    };

    this.events.push(analyticsEvent);
    this.updateMetrics(analyticsEvent);
  }

  private updateMetrics(event: AnalyticsEvent): void {
    switch (event.eventType) {
      case 'task_created':
        this.metrics.tasks.totalTasks++;
        this.metrics.tasks.activeTasks++;
        break;
      case 'task_completed':
        this.metrics.tasks.completedTasks++;
        this.metrics.tasks.activeTasks--;
        if (event.eventData.revenue) {
          this.metrics.revenue.totalRevenue += event.eventData.revenue;
          this.metrics.revenue.monthlyRevenue += event.eventData.revenue;
        }
        break;
      case 'user_registered':
        this.metrics.users.totalUsers++;
        this.metrics.users.newUsers++;
        break;
      case 'user_login':
        this.metrics.users.activeUsers++;
        break;
      case 'payment_processed':
        if (event.eventData.amount) {
          this.metrics.revenue.totalRevenue += event.eventData.amount;
          this.metrics.revenue.monthlyRevenue += event.eventData.amount;
        }
        break;
    }
  }

  // Revenue Optimization
  public async optimizePricing(category: string, demand: number, supply: number, competition: number): Promise<number> {
    const currentPrice = this.metrics.market.pricingAnalysis.currentPricing[category] || 50;
    const elasticity = this.metrics.market.pricingAnalysis.priceElasticity[category] || -1.0;
    
    const demandFactor = demand / supply;
    const competitionFactor = 1 - (competition / 100);
    const optimalPrice = currentPrice * (1 + (demandFactor - 1) * 0.1) * competitionFactor;
    
    const minPrice = this.revenueOptimization.dynamicPricing.minPrice;
    const maxPrice = this.revenueOptimization.dynamicPricing.maxPrice;
    
    return Math.max(minPrice, Math.min(maxPrice, optimalPrice));
  }

  public async calculateOptimalCommission(volume: number, performance: number): Promise<number> {
    const baseRate = this.revenueOptimization.commissionOptimization.baseRate;
    
    let volumeDiscount = 0;
    for (const [threshold, discount] of Object.entries(this.revenueOptimization.commissionOptimization.volumeDiscounts)) {
      if (volume >= parseInt(threshold)) {
        volumeDiscount = Math.max(volumeDiscount, discount);
      }
    }
    
    return baseRate - volumeDiscount;
  }

  // Business Metrics
  public async getBusinessMetrics(): Promise<BusinessMetrics> {
    this.metrics.revenue.revenueGrowth = this.calculateGrowth(
      this.metrics.revenue.monthlyRevenue,
      this.metrics.revenue.totalRevenue
    );
    
    this.metrics.users.churnRate = this.calculateChurnRate();
    this.metrics.users.userRetention = 1 - this.metrics.users.churnRate;
    
    this.metrics.tasks.taskCompletionRate = this.metrics.tasks.completedTasks / this.metrics.tasks.totalTasks;
    
    return this.metrics;
  }

  public async getRevenueMetrics(): Promise<RevenueMetrics> {
    return this.metrics.revenue;
  }

  public async getUserMetrics(): Promise<UserMetrics> {
    return this.metrics.users;
  }

  public async getTaskMetrics(): Promise<TaskMetrics> {
    return this.metrics.tasks;
  }

  public async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    return this.metrics.performance;
  }

  public async getMarketMetrics(): Promise<MarketMetrics> {
    return this.metrics.market;
  }

  public async getTrendMetrics(): Promise<TrendMetrics> {
    return this.metrics.trends;
  }

  public async getRevenueOptimization(): Promise<RevenueOptimization> {
    return this.revenueOptimization;
  }

  public async generateBusinessReport(): Promise<any> {
    const metrics = await this.getBusinessMetrics();
    
    return {
      summary: {
        totalRevenue: metrics.revenue.totalRevenue,
        totalUsers: metrics.users.totalUsers,
        totalTasks: metrics.tasks.totalTasks,
        marketShare: metrics.market.marketShare,
        growthRate: metrics.trends.revenueGrowth.percentageChange
      },
      metrics,
      recommendations: this.generateRecommendations(),
      timestamp: new Date()
    };
  }

  private calculateGrowth(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  private calculateChurnRate(): number {
    const totalUsers = this.metrics.users.totalUsers;
    const activeUsers = this.metrics.users.activeUsers;
    return totalUsers > 0 ? (totalUsers - activeUsers) / totalUsers : 0;
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (this.metrics.users.churnRate > 0.1) {
      recommendations.push('High churn rate detected. Focus on user retention strategies.');
    }
    
    if (this.metrics.tasks.taskCompletionRate < 0.8) {
      recommendations.push('Low task completion rate. Improve task matching and support.');
    }
    
    if (this.metrics.revenue.revenueGrowth < 10) {
      recommendations.push('Slow revenue growth. Consider pricing optimization and market expansion.');
    }
    
    return recommendations;
  }
}

// Export singleton instance
export const businessIntelligence = BusinessIntelligence.getInstance();

// Convenience functions
export async function trackEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<void> {
  return businessIntelligence.trackEvent(event);
}

export async function getBusinessMetrics(): Promise<BusinessMetrics> {
  return businessIntelligence.getBusinessMetrics();
}

export async function optimizePricing(category: string, demand: number, supply: number, competition: number): Promise<number> {
  return businessIntelligence.optimizePricing(category, demand, supply, competition);
}

export async function generateBusinessReport(): Promise<any> {
  return businessIntelligence.generateBusinessReport();
} 