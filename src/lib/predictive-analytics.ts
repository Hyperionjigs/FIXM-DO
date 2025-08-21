// Predictive Analytics Engine for FixMo
// AI-powered forecasting for task demand, pricing, and user behavior

export interface DemandForecast {
  category: string;
  location: string;
  timeframe: 'daily' | 'weekly' | 'monthly';
  predictions: {
    date: string;
    demand: number;
    confidence: number;
  }[];
  trends: {
    direction: 'increasing' | 'decreasing' | 'stable';
    rate: number;
    factors: string[];
  };
}

export interface PricingPrediction {
  category: string;
  location: string;
  currentAverage: number;
  predictedAverage: number;
  confidence: number;
  factors: {
    demand: number;
    supply: number;
    seasonality: number;
    competition: number;
  };
  recommendations: string[];
}

export interface UserBehaviorPrediction {
  userId: string;
  predictions: {
    nextTaskPost: string | null;
    preferredCategories: string[];
    priceRange: { min: number; max: number };
    activityLevel: 'high' | 'medium' | 'low';
    churnRisk: number;
  };
  insights: string[];
}

export interface MarketTrends {
  topCategories: Array<{
    category: string;
    growth: number;
    demand: number;
  }>;
  seasonalPatterns: Array<{
    month: string;
    categories: string[];
    factor: number;
  }>;
  locationTrends: Array<{
    location: string;
    growth: number;
    topCategories: string[];
  }>;
  pricingTrends: Array<{
    category: string;
    trend: 'up' | 'down' | 'stable';
    percentage: number;
  }>;
}

export interface AnalyticsConfig {
  forecastHorizon: number; // days
  confidenceThreshold: number;
  minDataPoints: number;
  enableRealTimeUpdates: boolean;
  enableSeasonalAdjustments: boolean;
}

class PredictiveAnalytics {
  private static instance: PredictiveAnalytics;
  private config: AnalyticsConfig;
  private historicalData: Map<string, any[]> = new Map();
  private models: Map<string, any> = new Map();
  private lastUpdate: Date = new Date();

  private constructor() {
    this.config = {
      forecastHorizon: 30,
      confidenceThreshold: 0.7,
      minDataPoints: 50,
      enableRealTimeUpdates: true,
      enableSeasonalAdjustments: true
    };

    this.initializeModels();
  }

  static getInstance(): PredictiveAnalytics {
    if (!PredictiveAnalytics.instance) {
      PredictiveAnalytics.instance = new PredictiveAnalytics();
    }
    return PredictiveAnalytics.instance;
  }

  private initializeModels(): void {
    console.log('[Analytics] Initializing predictive models...');
    
    // In a real implementation, this would load trained ML models
    // For now, we'll use statistical models and heuristics
  }

  // Demand Forecasting
  public async forecastDemand(
    category: string,
    location: string,
    timeframe: 'daily' | 'weekly' | 'monthly' = 'daily'
  ): Promise<DemandForecast> {
    try {
      const data = await this.getHistoricalData(category, location);
      
      if (data.length < this.config.minDataPoints) {
        return this.createDefaultForecast(category, location, timeframe);
      }

      const predictions = this.generateDemandPredictions(data, timeframe);
      const trends = this.analyzeDemandTrends(data);

      return {
        category,
        location,
        timeframe,
        predictions,
        trends
      };

    } catch (error) {
      console.error('[Analytics] Demand forecasting failed:', error);
      return this.createDefaultForecast(category, location, timeframe);
    }
  }

  private generateDemandPredictions(data: any[], timeframe: string): any[] {
    const predictions = [];
    const today = new Date();

    for (let i = 1; i <= this.config.forecastHorizon; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      // Simple moving average with trend adjustment
      const recentData = data.slice(-7); // Last 7 days
      const avgDemand = recentData.reduce((sum, d) => sum + d.demand, 0) / recentData.length;
      
      // Add trend and seasonality
      const trend = this.calculateTrend(data);
      const seasonality = this.calculateSeasonality(date);
      
      const predictedDemand = Math.max(0, avgDemand * (1 + trend) * seasonality);
      const confidence = this.calculateConfidence(data, i);

      predictions.push({
        date: date.toISOString().split('T')[0],
        demand: Math.round(predictedDemand),
        confidence: Math.min(confidence, 0.95)
      });
    }

    return predictions;
  }

  private calculateTrend(data: any[]): number {
    if (data.length < 2) return 0;

    const recent = data.slice(-7);
    const older = data.slice(-14, -7);

    if (older.length === 0) return 0;

    const recentAvg = recent.reduce((sum, d) => sum + d.demand, 0) / recent.length;
    const olderAvg = older.reduce((sum, d) => sum + d.demand, 0) / older.length;

    return olderAvg > 0 ? (recentAvg - olderAvg) / olderAvg : 0;
  }

  private calculateSeasonality(date: Date): number {
    if (!this.config.enableSeasonalAdjustments) return 1.0;

    const month = date.getMonth();
    const dayOfWeek = date.getDay();

    // Monthly seasonality factors (example)
    const monthlyFactors = [
      0.9, 0.85, 1.0, 1.1, 1.2, 1.15, // Jan-Jun
      1.1, 1.05, 1.0, 0.95, 0.9, 0.85  // Jul-Dec
    ];

    // Weekly seasonality factors
    const weeklyFactors = [0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 0.8]; // Sun-Sat

    return monthlyFactors[month] * weeklyFactors[dayOfWeek];
  }

  private calculateConfidence(data: any[], daysAhead: number): number {
    // Confidence decreases with time and data variability
    const variability = this.calculateVariability(data);
    const timeDecay = Math.exp(-daysAhead / 30); // Exponential decay
    
    return Math.max(0.3, 0.9 * timeDecay * (1 - variability));
  }

  private calculateVariability(data: any[]): number {
    if (data.length < 2) return 0.5;

    const demands = data.map(d => d.demand);
    const mean = demands.reduce((sum, d) => sum + d, 0) / demands.length;
    const variance = demands.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / demands.length;
    
    return Math.min(1, Math.sqrt(variance) / mean);
  }

  private analyzeDemandTrends(data: any[]): any {
    const trend = this.calculateTrend(data);
    
    let direction: 'increasing' | 'decreasing' | 'stable';
    if (Math.abs(trend) < 0.05) {
      direction = 'stable';
    } else {
      direction = trend > 0 ? 'increasing' : 'decreasing';
    }

    const factors = this.identifyTrendFactors(data);

    return {
      direction,
      rate: Math.abs(trend),
      factors
    };
  }

  private identifyTrendFactors(data: any[]): string[] {
    const factors: string[] = [];
    
    // Analyze various factors that might influence demand
    const recentData = data.slice(-7);
    const avgDemand = recentData.reduce((sum, d) => sum + d.demand, 0) / recentData.length;

    if (avgDemand > 10) factors.push('High demand period');
    if (avgDemand < 3) factors.push('Low demand period');

    // Check for weekend patterns
    const weekendDemand = recentData.filter(d => {
      const day = new Date(d.date).getDay();
      return day === 0 || day === 6;
    });
    
    if (weekendDemand.length > 0) {
      const weekendAvg = weekendDemand.reduce((sum, d) => sum + d.demand, 0) / weekendDemand.length;
      if (weekendAvg > avgDemand * 1.2) factors.push('Weekend surge');
    }

    return factors;
  }

  // Pricing Predictions
  public async predictPricing(
    category: string,
    location: string
  ): Promise<PricingPrediction> {
    try {
      const data = await this.getHistoricalPricingData(category, location);
      
      if (data.length < this.config.minDataPoints) {
        return this.createDefaultPricingPrediction(category, location);
      }

      const currentAverage = this.calculateCurrentAverage(data);
      const predictedAverage = this.predictFutureAverage(data);
      const confidence = this.calculatePricingConfidence(data);
      const factors = this.analyzePricingFactors(category, location);
      const recommendations = this.generatePricingRecommendations(factors);

      return {
        category,
        location,
        currentAverage,
        predictedAverage,
        confidence,
        factors,
        recommendations
      };

    } catch (error) {
      console.error('[Analytics] Pricing prediction failed:', error);
      return this.createDefaultPricingPrediction(category, location);
    }
  }

  private calculateCurrentAverage(data: any[]): number {
    const recentData = data.slice(-7);
    return recentData.reduce((sum, d) => sum + d.price, 0) / recentData.length;
  }

  private predictFutureAverage(data: any[]): number {
    const currentAvg = this.calculateCurrentAverage(data);
    const trend = this.calculatePricingTrend(data);
    const seasonality = this.calculatePricingSeasonality();
    
    return currentAvg * (1 + trend) * seasonality;
  }

  private calculatePricingTrend(data: any[]): number {
    if (data.length < 14) return 0;

    const recent = data.slice(-7);
    const older = data.slice(-14, -7);

    const recentAvg = recent.reduce((sum, d) => sum + d.price, 0) / recent.length;
    const olderAvg = older.reduce((sum, d) => sum + d.price, 0) / older.length;

    return olderAvg > 0 ? (recentAvg - olderAvg) / olderAvg : 0;
  }

  private calculatePricingSeasonality(): number {
    const month = new Date().getMonth();
    
    // Seasonal pricing factors
    const seasonalFactors = [
      1.1, 1.05, 1.0, 0.95, 0.9, 0.95, // Jan-Jun
      1.0, 1.05, 1.1, 1.15, 1.1, 1.05  // Jul-Dec
    ];

    return seasonalFactors[month];
  }

  private calculatePricingConfidence(data: any[]): number {
    const variability = this.calculatePricingVariability(data);
    return Math.max(0.3, 0.9 * (1 - variability));
  }

  private calculatePricingVariability(data: any[]): number {
    if (data.length < 2) return 0.5;

    const prices = data.map(d => d.price);
    const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
    
    return Math.min(1, Math.sqrt(variance) / mean);
  }

  private analyzePricingFactors(category: string, location: string): any {
    // Analyze supply and demand factors
    return {
      demand: this.estimateDemandFactor(category, location),
      supply: this.estimateSupplyFactor(category, location),
      seasonality: this.calculatePricingSeasonality(),
      competition: this.estimateCompetitionFactor(category, location)
    };
  }

  private estimateDemandFactor(category: string, location: string): number {
    // Simplified demand estimation
    const baseDemand = 0.5;
    const categoryMultiplier = this.getCategoryDemandMultiplier(category);
    const locationMultiplier = this.getLocationDemandMultiplier(location);
    
    return baseDemand * categoryMultiplier * locationMultiplier;
  }

  private estimateSupplyFactor(category: string, location: string): number {
    // Simplified supply estimation
    return 0.6; // Placeholder
  }

  private estimateCompetitionFactor(category: string, location: string): number {
    // Simplified competition estimation
    return 0.7; // Placeholder
  }

  private getCategoryDemandMultiplier(category: string): number {
    const multipliers: Record<string, number> = {
      'Plumber': 1.2,
      'Electrician': 1.1,
      'Housekeeper': 0.9,
      'Gardener': 0.8,
      'Carpenter': 1.0
    };
    return multipliers[category] || 1.0;
  }

  private getLocationDemandMultiplier(location: string): number {
    // Simplified location-based demand
    return 1.0; // Placeholder
  }

  private generatePricingRecommendations(factors: any): string[] {
    const recommendations: string[] = [];

    if (factors.demand > 0.8) {
      recommendations.push('High demand - consider premium pricing');
    } else if (factors.demand < 0.3) {
      recommendations.push('Low demand - consider competitive pricing');
    }

    if (factors.competition > 0.8) {
      recommendations.push('High competition - focus on value proposition');
    }

    if (factors.seasonality > 1.1) {
      recommendations.push('Seasonal peak - pricing can be higher');
    } else if (factors.seasonality < 0.9) {
      recommendations.push('Seasonal low - consider promotional pricing');
    }

    return recommendations;
  }

  // User Behavior Predictions
  public async predictUserBehavior(userId: string): Promise<UserBehaviorPrediction> {
    try {
      const userData = await this.getUserHistoricalData(userId);
      
      if (userData.length === 0) {
        return this.createDefaultUserPrediction(userId);
      }

      const predictions = {
        nextTaskPost: this.predictNextTaskPost(userData),
        preferredCategories: this.identifyPreferredCategories(userData),
        priceRange: this.predictPriceRange(userData),
        activityLevel: this.predictActivityLevel(userData),
        churnRisk: this.calculateChurnRisk(userData)
      };

      const insights = this.generateUserInsights(userData, predictions);

      return {
        userId,
        predictions,
        insights
      };

    } catch (error) {
      console.error('[Analytics] User behavior prediction failed:', error);
      return this.createDefaultUserPrediction(userId);
    }
  }

  private predictNextTaskPost(userData: any[]): string | null {
    if (userData.length === 0) return null;

    const lastPost = userData[userData.length - 1];
    const avgInterval = this.calculateAveragePostingInterval(userData);
    
    if (avgInterval === 0) return null;

    const nextPost = new Date(lastPost.date);
    nextPost.setDate(nextPost.getDate() + avgInterval);
    
    return nextPost.toISOString().split('T')[0];
  }

  private calculateAveragePostingInterval(userData: any[]): number {
    if (userData.length < 2) return 0;

    const intervals: number[] = [];
    for (let i = 1; i < userData.length; i++) {
      const current = new Date(userData[i].date);
      const previous = new Date(userData[i - 1].date);
      const interval = (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24);
      intervals.push(interval);
    }

    return intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  }

  private identifyPreferredCategories(userData: any[]): string[] {
    const categoryCounts: Record<string, number> = {};
    
    userData.forEach(post => {
      categoryCounts[post.category] = (categoryCounts[post.category] || 0) + 1;
    });

    return Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);
  }

  private predictPriceRange(userData: any[]): { min: number; max: number } {
    const prices = userData.map(post => post.price);
    const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const std = Math.sqrt(prices.reduce((sum, price) => sum + Math.pow(price - avg, 2), 0) / prices.length);
    
    return {
      min: Math.max(0, avg - std),
      max: avg + std
    };
  }

  private predictActivityLevel(userData: any[]): 'high' | 'medium' | 'low' {
    const recentActivity = userData.filter(post => {
      const postDate = new Date(post.date);
      const daysAgo = (Date.now() - postDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 30;
    }).length;

    if (recentActivity >= 5) return 'high';
    if (recentActivity >= 2) return 'medium';
    return 'low';
  }

  private calculateChurnRisk(userData: any[]): number {
    const lastActivity = userData[userData.length - 1];
    const daysSinceLastActivity = (Date.now() - new Date(lastActivity.date).getTime()) / (1000 * 60 * 60 * 24);
    
    // Simple churn risk calculation
    if (daysSinceLastActivity > 90) return 0.9;
    if (daysSinceLastActivity > 60) return 0.7;
    if (daysSinceLastActivity > 30) return 0.5;
    if (daysSinceLastActivity > 7) return 0.2;
    return 0.1;
  }

  private generateUserInsights(userData: any[], predictions: any): string[] {
    const insights: string[] = [];

    if (predictions.activityLevel === 'high') {
      insights.push('Very active user - high engagement potential');
    } else if (predictions.activityLevel === 'low') {
      insights.push('Low activity - consider re-engagement strategies');
    }

    if (predictions.churnRisk > 0.7) {
      insights.push('High churn risk - immediate attention needed');
    }

    if (predictions.preferredCategories.length > 0) {
      insights.push(`Specializes in: ${predictions.preferredCategories.join(', ')}`);
    }

    return insights;
  }

  // Market Trends Analysis
  public async analyzeMarketTrends(): Promise<MarketTrends> {
    try {
      const allData = await this.getAllMarketData();
      
      return {
        topCategories: this.identifyTopCategories(allData),
        seasonalPatterns: this.analyzeSeasonalPatterns(allData),
        locationTrends: this.analyzeLocationTrends(allData),
        pricingTrends: this.analyzePricingTrends(allData)
      };

    } catch (error) {
      console.error('[Analytics] Market trends analysis failed:', error);
      return this.createDefaultMarketTrends();
    }
  }

  private identifyTopCategories(data: any[]): any[] {
    const categoryStats: Record<string, { count: number; growth: number }> = {};
    
    // Calculate category statistics
    data.forEach(post => {
      if (!categoryStats[post.category]) {
        categoryStats[post.category] = { count: 0, growth: 0 };
      }
      categoryStats[post.category].count++;
    });

    // Calculate growth rates (simplified)
    Object.keys(categoryStats).forEach(category => {
      const recent = data.filter(post => 
        post.category === category && 
        new Date(post.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length;
      const older = data.filter(post => 
        post.category === category && 
        new Date(post.date) > new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) &&
        new Date(post.date) <= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length;
      
      categoryStats[category].growth = older > 0 ? (recent - older) / older : 0;
    });

    return Object.entries(categoryStats)
      .map(([category, stats]) => ({
        category,
        growth: stats.growth,
        demand: stats.count
      }))
      .sort((a, b) => b.demand - a.demand)
      .slice(0, 10);
  }

  private analyzeSeasonalPatterns(data: any[]): any[] {
    const monthlyPatterns: Record<string, { count: number; categories: string[] }> = {};
    
    // Initialize months
    for (let i = 0; i < 12; i++) {
      monthlyPatterns[i] = { count: 0, categories: [] };
    }

    // Analyze data by month
    data.forEach(post => {
      const month = new Date(post.date).getMonth();
      monthlyPatterns[month].count++;
      if (!monthlyPatterns[month].categories.includes(post.category)) {
        monthlyPatterns[month].categories.push(post.category);
      }
    });

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return Object.entries(monthlyPatterns).map(([month, stats]) => ({
      month: monthNames[parseInt(month)],
      categories: stats.categories.slice(0, 3),
      factor: stats.count / Math.max(...Object.values(monthlyPatterns).map(s => s.count))
    }));
  }

  private analyzeLocationTrends(data: any[]): any[] {
    const locationStats: Record<string, { count: number; categories: string[] }> = {};
    
    data.forEach(post => {
      if (!locationStats[post.location]) {
        locationStats[post.location] = { count: 0, categories: [] };
      }
      locationStats[post.location].count++;
      if (!locationStats[post.location].categories.includes(post.category)) {
        locationStats[post.location].categories.push(post.category);
      }
    });

    return Object.entries(locationStats)
      .map(([location, stats]) => ({
        location,
        growth: 0.1, // Placeholder
        topCategories: stats.categories.slice(0, 3)
      }))
      .sort((a, b) => b.growth - a.growth)
      .slice(0, 10);
  }

  private analyzePricingTrends(data: any[]): any[] {
    const categoryPricing: Record<string, number[]> = {};
    
    data.forEach(post => {
      if (!categoryPricing[post.category]) {
        categoryPricing[post.category] = [];
      }
      categoryPricing[post.category].push(post.price);
    });

    return Object.entries(categoryPricing).map(([category, prices]) => {
      const recent = prices.slice(-10);
      const older = prices.slice(-20, -10);
      
      const recentAvg = recent.reduce((sum, p) => sum + p, 0) / recent.length;
      const olderAvg = older.reduce((sum, p) => sum + p, 0) / older.length;
      
      const change = olderAvg > 0 ? (recentAvg - olderAvg) / olderAvg : 0;
      
      return {
        category,
        trend: change > 0.05 ? 'up' : change < -0.05 ? 'down' : 'stable',
        percentage: Math.abs(change * 100)
      };
    });
  }

  // Data management methods
  private async getHistoricalData(category: string, location: string): Promise<any[]> {
    // In production, this would fetch from database
    const key = `${category}-${location}`;
    return this.historicalData.get(key) || [];
  }

  private async getHistoricalPricingData(category: string, location: string): Promise<any[]> {
    // In production, this would fetch pricing data from database
    return this.getHistoricalData(category, location);
  }

  private async getUserHistoricalData(userId: string): Promise<any[]> {
    // In production, this would fetch user data from database
    return this.historicalData.get(`user-${userId}`) || [];
  }

  private async getAllMarketData(): Promise<any[]> {
    // In production, this would fetch all market data
    const allData: any[] = [];
    this.historicalData.forEach(data => allData.push(...data));
    return allData;
  }

  // Default/fallback methods
  private createDefaultForecast(category: string, location: string, timeframe: string): DemandForecast {
    return {
      category,
      location,
      timeframe: timeframe as any,
      predictions: [],
      trends: { direction: 'stable', rate: 0, factors: ['Insufficient data'] }
    };
  }

  private createDefaultPricingPrediction(category: string, location: string): PricingPrediction {
    return {
      category,
      location,
      currentAverage: 100,
      predictedAverage: 100,
      confidence: 0.5,
      factors: { demand: 0.5, supply: 0.5, seasonality: 1.0, competition: 0.5 },
      recommendations: ['Insufficient data for accurate prediction']
    };
  }

  private createDefaultUserPrediction(userId: string): UserBehaviorPrediction {
    return {
      userId,
      predictions: {
        nextTaskPost: null,
        preferredCategories: [],
        priceRange: { min: 0, max: 0 },
        activityLevel: 'low',
        churnRisk: 0.5
      },
      insights: ['New user - limited data available']
    };
  }

  private createDefaultMarketTrends(): MarketTrends {
    return {
      topCategories: [],
      seasonalPatterns: [],
      locationTrends: [],
      pricingTrends: []
    };
  }

  // Public API methods
  public getConfig(): AnalyticsConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public async addDataPoint(key: string, data: any): Promise<void> {
    if (!this.historicalData.has(key)) {
      this.historicalData.set(key, []);
    }
    this.historicalData.get(key)!.push(data);
  }

  public getLastUpdate(): Date {
    return this.lastUpdate;
  }
}

// Export singleton instance
export const predictiveAnalytics = PredictiveAnalytics.getInstance();

// Convenience functions
export async function forecastDemand(category: string, location: string): Promise<DemandForecast> {
  return predictiveAnalytics.forecastDemand(category, location);
}

export async function predictPricing(category: string, location: string): Promise<PricingPrediction> {
  return predictiveAnalytics.predictPricing(category, location);
}

export async function predictUserBehavior(userId: string): Promise<UserBehaviorPrediction> {
  return predictiveAnalytics.predictUserBehavior(userId);
}

export async function analyzeMarketTrends(): Promise<MarketTrends> {
  return predictiveAnalytics.analyzeMarketTrends();
} 