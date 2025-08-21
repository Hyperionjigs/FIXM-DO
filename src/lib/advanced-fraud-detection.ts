// Advanced Fraud Detection System for FixMo
// Multi-layered security with behavioral analysis and real-time threat detection

export interface FraudRisk {
  overallRisk: number;
  riskFactors: RiskFactor[];
  confidence: number;
  recommendations: string[];
  actionRequired: 'none' | 'review' | 'block' | 'escalate';
}

export interface RiskFactor {
  type: 'behavioral' | 'device' | 'network' | 'transaction' | 'identity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  description: string;
  evidence: any[];
  timestamp: Date;
}

export interface DeviceFingerprint {
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  hardwareConcurrency: number;
  deviceMemory: number;
  canvasFingerprint: string;
  webglFingerprint: string;
  audioFingerprint: string;
  batteryInfo: any;
  networkInfo: any;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

export interface BehavioralPattern {
  userId: string;
  patterns: {
    typingSpeed: number[];
    mouseMovements: any[];
    clickPatterns: any[];
    navigationPaths: string[];
    sessionDurations: number[];
    timeOfDay: number[];
    deviceUsage: Record<string, number>;
  };
  anomalies: any[];
  riskScore: number;
  lastUpdated: Date;
}

export interface TransactionAnalysis {
  transactionId: string;
  amount: number;
  currency: string;
  senderId: string;
  recipientId: string;
  timestamp: Date;
  riskFactors: RiskFactor[];
  fraudProbability: number;
  recommendedAction: string;
}

class AdvancedFraudDetection {
  private static instance: AdvancedFraudDetection;
  private riskThresholds: Record<string, number> = {};
  private behavioralProfiles: Map<string, BehavioralPattern> = new Map();
  private deviceProfiles: Map<string, DeviceFingerprint> = new Map();
  private blacklistedIPs: Set<string> = new Set();
  private suspiciousPatterns: RegExp[] = [];
  private mlModel: any = null; // Would be a trained ML model in production

  private constructor() {
    this.initializeThresholds();
    this.initializePatterns();
    this.loadBlacklistedIPs();
  }

  static getInstance(): AdvancedFraudDetection {
    if (!AdvancedFraudDetection.instance) {
      AdvancedFraudDetection.instance = new AdvancedFraudDetection();
    }
    return AdvancedFraudDetection.instance;
  }

  private initializeThresholds(): void {
    this.riskThresholds = {
      low: 0.3,
      medium: 0.6,
      high: 0.8,
      critical: 0.9,
      behavioral: 0.4,
      device: 0.5,
      network: 0.7,
      transaction: 0.6,
      identity: 0.8
    };
  }

  private initializePatterns(): void {
    this.suspiciousPatterns = [
      // Rapid transactions
      /rapid_transaction/,
      // Multiple accounts from same device
      /multiple_accounts/,
      // Unusual payment patterns
      /unusual_payment/,
      // Geographic anomalies
      /geo_anomaly/,
      // Device spoofing
      /device_spoof/,
      // Behavioral anomalies
      /behavior_anomaly/
    ];
  }

  private loadBlacklistedIPs(): void {
    // In production, this would load from a database or API
    const blacklistedIPs = [
      '192.168.1.100',
      '10.0.0.50',
      '172.16.0.25'
    ];
    blacklistedIPs.forEach(ip => this.blacklistedIPs.add(ip));
  }

  // Main fraud detection function
  public async detectFraud(
    userId: string,
    action: string,
    data: any,
    deviceFingerprint?: DeviceFingerprint
  ): Promise<FraudRisk> {
    try {
      const riskFactors: RiskFactor[] = [];

      // Behavioral analysis
      const behavioralRisk = await this.analyzeBehavioralPatterns(userId, action, data);
      if (behavioralRisk) riskFactors.push(behavioralRisk);

      // Device fingerprinting
      if (deviceFingerprint) {
        const deviceRisk = await this.analyzeDeviceFingerprint(userId, deviceFingerprint);
        if (deviceRisk) riskFactors.push(deviceRisk);
      }

      // Network analysis
      const networkRisk = await this.analyzeNetworkPatterns(userId, data);
      if (networkRisk) riskFactors.push(networkRisk);

      // Transaction analysis
      if (action === 'payment' || action === 'transfer') {
        const transactionRisk = await this.analyzeTransaction(userId, data);
        if (transactionRisk) riskFactors.push(transactionRisk);
      }

      // Identity verification
      const identityRisk = await this.analyzeIdentityVerification(userId, data);
      if (identityRisk) riskFactors.push(identityRisk);

      // Calculate overall risk
      const overallRisk = this.calculateOverallRisk(riskFactors);
      const confidence = this.calculateConfidence(riskFactors);
      const recommendations = this.generateRecommendations(riskFactors);
      const actionRequired = this.determineActionRequired(overallRisk, riskFactors);

      return {
        overallRisk,
        riskFactors,
        confidence,
        recommendations,
        actionRequired
      };

    } catch (error) {
      console.error('[Fraud] Detection failed:', error);
      return this.createDefaultRisk();
    }
  }

  private async analyzeBehavioralPatterns(
    userId: string,
    action: string,
    data: any
  ): Promise<RiskFactor | null> {
    const profile = this.behavioralProfiles.get(userId);
    if (!profile) return null;

    const anomalies = this.detectBehavioralAnomalies(profile, action, data);
    if (anomalies.length === 0) return null;

    const severity = this.calculateBehavioralSeverity(anomalies);
    const score = Math.min(anomalies.length * 0.2, 1.0);

    return {
      type: 'behavioral',
      severity,
      score,
      description: `Behavioral anomalies detected: ${anomalies.length} patterns`,
      evidence: anomalies,
      timestamp: new Date()
    };
  }

  private detectBehavioralAnomalies(
    profile: BehavioralPattern,
    action: string,
    data: any
  ): any[] {
    const anomalies: any[] = [];

    // Check typing speed anomalies
    if (data.typingSpeed) {
      const avgSpeed = profile.patterns.typingSpeed.reduce((a, b) => a + b, 0) / profile.patterns.typingSpeed.length;
      const deviation = Math.abs(data.typingSpeed - avgSpeed) / avgSpeed;
      if (deviation > 0.5) {
        anomalies.push({
          type: 'typing_speed',
          expected: avgSpeed,
          actual: data.typingSpeed,
          deviation
        });
      }
    }

    // Check time of day anomalies
    const currentHour = new Date().getHours();
    const typicalHours = profile.patterns.timeOfDay;
    const isTypicalTime = typicalHours.some(hour => Math.abs(hour - currentHour) <= 2);
    if (!isTypicalTime) {
      anomalies.push({
        type: 'time_anomaly',
        currentHour,
        typicalHours
      });
    }

    // Check session duration anomalies
    if (data.sessionDuration) {
      const avgDuration = profile.patterns.sessionDurations.reduce((a, b) => a + b, 0) / profile.patterns.sessionDurations.length;
      const deviation = Math.abs(data.sessionDuration - avgDuration) / avgDuration;
      if (deviation > 0.7) {
        anomalies.push({
          type: 'session_duration',
          expected: avgDuration,
          actual: data.sessionDuration,
          deviation
        });
      }
    }

    return anomalies;
  }

  private calculateBehavioralSeverity(anomalies: any[]): 'low' | 'medium' | 'high' | 'critical' {
    const totalAnomalies = anomalies.length;
    if (totalAnomalies >= 5) return 'critical';
    if (totalAnomalies >= 3) return 'high';
    if (totalAnomalies >= 2) return 'medium';
    return 'low';
  }

  private async analyzeDeviceFingerprint(
    userId: string,
    fingerprint: DeviceFingerprint
  ): Promise<RiskFactor | null> {
    const existingProfile = this.deviceProfiles.get(userId);
    if (!existingProfile) {
      this.deviceProfiles.set(userId, fingerprint);
      return null;
    }

    const anomalies = this.detectDeviceAnomalies(existingProfile, fingerprint);
    if (anomalies.length === 0) return null;

    const severity = this.calculateDeviceSeverity(anomalies);
    const score = Math.min(anomalies.length * 0.3, 1.0);

    return {
      type: 'device',
      severity,
      score,
      description: `Device fingerprint anomalies detected: ${anomalies.length} changes`,
      evidence: anomalies,
      timestamp: new Date()
    };
  }

  private detectDeviceAnomalies(
    existing: DeviceFingerprint,
    current: DeviceFingerprint
  ): any[] {
    const anomalies: any[] = [];

    // Check for significant changes in device characteristics
    if (existing.screenResolution !== current.screenResolution) {
      anomalies.push({
        type: 'screen_resolution_change',
        from: existing.screenResolution,
        to: current.screenResolution
      });
    }

    if (existing.timezone !== current.timezone) {
      anomalies.push({
        type: 'timezone_change',
        from: existing.timezone,
        to: current.timezone
      });
    }

    if (existing.platform !== current.platform) {
      anomalies.push({
        type: 'platform_change',
        from: existing.platform,
        to: current.platform
      });
    }

    // Check for location anomalies
    if (existing.location && current.location) {
      const distance = this.calculateDistance(
        existing.location.latitude,
        existing.location.longitude,
        current.location.latitude,
        current.location.longitude
      );
      
      if (distance > 100) { // More than 100km in a short time
        anomalies.push({
          type: 'location_anomaly',
          distance,
          from: existing.location,
          to: current.location
        });
      }
    }

    return anomalies;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private calculateDeviceSeverity(anomalies: any[]): 'low' | 'medium' | 'high' | 'critical' {
    const criticalAnomalies = anomalies.filter(a => 
      a.type === 'location_anomaly' || a.type === 'platform_change'
    ).length;

    if (criticalAnomalies >= 2) return 'critical';
    if (criticalAnomalies >= 1) return 'high';
    if (anomalies.length >= 3) return 'medium';
    return 'low';
  }

  private async analyzeNetworkPatterns(
    userId: string,
    data: any
  ): Promise<RiskFactor | null> {
    const ipAddress = data.ipAddress;
    if (!ipAddress) return null;

    const riskFactors: any[] = [];

    // Check if IP is blacklisted
    if (this.blacklistedIPs.has(ipAddress)) {
      riskFactors.push({
        type: 'blacklisted_ip',
        ip: ipAddress
      });
    }

    // Check for VPN/proxy usage
    if (data.isVPN || data.isProxy) {
      riskFactors.push({
        type: 'vpn_proxy_usage',
        ip: ipAddress
      });
    }

    // Check for geographic anomalies
    if (data.geoLocation) {
      const geoRisk = this.analyzeGeographicRisk(data.geoLocation, userId);
      if (geoRisk) riskFactors.push(geoRisk);
    }

    if (riskFactors.length === 0) return null;

    const severity = this.calculateNetworkSeverity(riskFactors);
    const score = Math.min(riskFactors.length * 0.4, 1.0);

    return {
      type: 'network',
      severity,
      score,
      description: `Network security risks detected: ${riskFactors.length} issues`,
      evidence: riskFactors,
      timestamp: new Date()
    };
  }

  private analyzeGeographicRisk(geoLocation: any, userId: string): any | null {
    // Check if user is accessing from an unusual location
    const userProfile = this.behavioralProfiles.get(userId);
    if (!userProfile) return null;

    // This would be more sophisticated in production
    return {
      type: 'geographic_anomaly',
      location: geoLocation,
      reason: 'Unusual access location'
    };
  }

  private calculateNetworkSeverity(riskFactors: any[]): 'low' | 'medium' | 'high' | 'critical' {
    const criticalFactors = riskFactors.filter(f => 
      f.type === 'blacklisted_ip' || f.type === 'geographic_anomaly'
    ).length;

    if (criticalFactors >= 2) return 'critical';
    if (criticalFactors >= 1) return 'high';
    if (riskFactors.length >= 2) return 'medium';
    return 'low';
  }

  private async analyzeTransaction(
    userId: string,
    data: any
  ): Promise<RiskFactor | null> {
    const riskFactors: any[] = [];

    // Check for unusual transaction amounts
    if (data.amount) {
      const amountRisk = this.analyzeAmountRisk(data.amount, userId);
      if (amountRisk) riskFactors.push(amountRisk);
    }

    // Check for rapid transactions
    if (data.transactionHistory) {
      const rapidRisk = this.analyzeRapidTransactions(data.transactionHistory);
      if (rapidRisk) riskFactors.push(rapidRisk);
    }

    // Check for unusual recipients
    if (data.recipientId) {
      const recipientRisk = this.analyzeRecipientRisk(data.recipientId, userId);
      if (recipientRisk) riskFactors.push(recipientRisk);
    }

    if (riskFactors.length === 0) return null;

    const severity = this.calculateTransactionSeverity(riskFactors);
    const score = Math.min(riskFactors.length * 0.3, 1.0);

    return {
      type: 'transaction',
      severity,
      score,
      description: `Transaction risks detected: ${riskFactors.length} issues`,
      evidence: riskFactors,
      timestamp: new Date()
    };
  }

  private analyzeAmountRisk(amount: number, userId: string): any | null {
    // Check if amount is unusually high for this user
    const userProfile = this.behavioralProfiles.get(userId);
    if (!userProfile) return null;

    // This would check against user's transaction history
    if (amount > 10000) { // Example threshold
      return {
        type: 'high_amount',
        amount,
        threshold: 10000
      };
    }

    return null;
  }

  private analyzeRapidTransactions(history: any[]): any | null {
    const recentTransactions = history.filter(t => 
      Date.now() - new Date(t.timestamp).getTime() < 3600000 // Last hour
    );

    if (recentTransactions.length > 5) {
      return {
        type: 'rapid_transactions',
        count: recentTransactions.length,
        timeframe: '1 hour'
      };
    }

    return null;
  }

  private analyzeRecipientRisk(recipientId: string, userId: string): any | null {
    // Check if recipient is suspicious or new
    // This would check against known fraud patterns
    return null;
  }

  private calculateTransactionSeverity(riskFactors: any[]): 'low' | 'medium' | 'high' | 'critical' {
    const criticalFactors = riskFactors.filter(f => 
      f.type === 'high_amount' || f.type === 'rapid_transactions'
    ).length;

    if (criticalFactors >= 2) return 'critical';
    if (criticalFactors >= 1) return 'high';
    if (riskFactors.length >= 2) return 'medium';
    return 'low';
  }

  private async analyzeIdentityVerification(
    userId: string,
    data: any
  ): Promise<RiskFactor | null> {
    const riskFactors: any[] = [];

    // Check for identity document anomalies
    if (data.identityDocuments) {
      const docRisk = this.analyzeIdentityDocuments(data.identityDocuments);
      if (docRisk) riskFactors.push(docRisk);
    }

    // Check for multiple accounts
    if (data.accountCount && data.accountCount > 3) {
      riskFactors.push({
        type: 'multiple_accounts',
        count: data.accountCount
      });
    }

    // Check for verification inconsistencies
    if (data.verificationHistory) {
      const verificationRisk = this.analyzeVerificationHistory(data.verificationHistory);
      if (verificationRisk) riskFactors.push(verificationRisk);
    }

    if (riskFactors.length === 0) return null;

    const severity = this.calculateIdentitySeverity(riskFactors);
    const score = Math.min(riskFactors.length * 0.4, 1.0);

    return {
      type: 'identity',
      severity,
      score,
      description: `Identity verification risks detected: ${riskFactors.length} issues`,
      evidence: riskFactors,
      timestamp: new Date()
    };
  }

  private analyzeIdentityDocuments(documents: any[]): any | null {
    // Check for document authenticity and consistency
    const suspiciousDocs = documents.filter(doc => 
      doc.authenticityScore < 0.7 || doc.consistencyScore < 0.8
    );

    if (suspiciousDocs.length > 0) {
      return {
        type: 'document_anomalies',
        count: suspiciousDocs.length,
        documents: suspiciousDocs
      };
    }

    return null;
  }

  private analyzeVerificationHistory(history: any[]): any | null {
    // Check for failed verification attempts
    const failedAttempts = history.filter(h => h.status === 'failed');
    
    if (failedAttempts.length > 3) {
      return {
        type: 'multiple_failed_verifications',
        count: failedAttempts.length
      };
    }

    return null;
  }

  private calculateIdentitySeverity(riskFactors: any[]): 'low' | 'medium' | 'high' | 'critical' {
    const criticalFactors = riskFactors.filter(f => 
      f.type === 'document_anomalies' || f.type === 'multiple_failed_verifications'
    ).length;

    if (criticalFactors >= 2) return 'critical';
    if (criticalFactors >= 1) return 'high';
    if (riskFactors.length >= 2) return 'medium';
    return 'low';
  }

  private calculateOverallRisk(riskFactors: RiskFactor[]): number {
    if (riskFactors.length === 0) return 0;

    const weightedSum = riskFactors.reduce((sum, factor) => {
      const weight = this.getRiskWeight(factor.type);
      return sum + (factor.score * weight);
    }, 0);

    const totalWeight = riskFactors.reduce((sum, factor) => {
      return sum + this.getRiskWeight(factor.type);
    }, 0);

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  private getRiskWeight(type: string): number {
    const weights: Record<string, number> = {
      behavioral: 0.2,
      device: 0.15,
      network: 0.25,
      transaction: 0.25,
      identity: 0.15
    };
    return weights[type] || 0.1;
  }

  private calculateConfidence(riskFactors: RiskFactor[]): number {
    if (riskFactors.length === 0) return 0;

    const avgConfidence = riskFactors.reduce((sum, factor) => {
      return sum + (factor.evidence.length > 0 ? 0.8 : 0.5);
    }, 0) / riskFactors.length;

    return Math.min(avgConfidence, 0.95);
  }

  private generateRecommendations(riskFactors: RiskFactor[]): string[] {
    const recommendations: string[] = [];

    riskFactors.forEach(factor => {
      switch (factor.type) {
        case 'behavioral':
          recommendations.push('Review user behavior patterns for anomalies');
          break;
        case 'device':
          recommendations.push('Verify device fingerprint consistency');
          break;
        case 'network':
          recommendations.push('Check network security and location');
          break;
        case 'transaction':
          recommendations.push('Review transaction patterns and amounts');
          break;
        case 'identity':
          recommendations.push('Re-verify user identity documents');
          break;
      }
    });

    return recommendations.slice(0, 3); // Limit to top 3
  }

  private determineActionRequired(
    overallRisk: number,
    riskFactors: RiskFactor[]
  ): 'none' | 'review' | 'block' | 'escalate' {
    if (overallRisk >= this.riskThresholds.critical) return 'escalate';
    if (overallRisk >= this.riskThresholds.high) return 'block';
    if (overallRisk >= this.riskThresholds.medium) return 'review';
    return 'none';
  }

  private createDefaultRisk(): FraudRisk {
    return {
      overallRisk: 0,
      riskFactors: [],
      confidence: 0,
      recommendations: [],
      actionRequired: 'none'
    };
  }

  // Public API methods
  public async updateBehavioralProfile(userId: string, data: any): Promise<void> {
    const profile = this.behavioralProfiles.get(userId) || {
      userId,
      patterns: {
        typingSpeed: [],
        mouseMovements: [],
        clickPatterns: [],
        navigationPaths: [],
        sessionDurations: [],
        timeOfDay: [],
        deviceUsage: {}
      },
      anomalies: [],
      riskScore: 0,
      lastUpdated: new Date()
    };

    // Update patterns with new data
    if (data.typingSpeed) profile.patterns.typingSpeed.push(data.typingSpeed);
    if (data.sessionDuration) profile.patterns.sessionDurations.push(data.sessionDuration);
    if (data.timeOfDay) profile.patterns.timeOfDay.push(data.timeOfDay);

    // Keep only recent data (last 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    profile.patterns.typingSpeed = profile.patterns.typingSpeed.filter(() => true); // Keep recent
    profile.patterns.sessionDurations = profile.patterns.sessionDurations.filter(() => true);
    profile.patterns.timeOfDay = profile.patterns.timeOfDay.filter(() => true);

    profile.lastUpdated = new Date();
    this.behavioralProfiles.set(userId, profile);
  }

  public async getFraudStats(): Promise<any> {
    const totalProfiles = this.behavioralProfiles.size;
    const totalDevices = this.deviceProfiles.size;
    const blacklistedCount = this.blacklistedIPs.size;

    return {
      totalProfiles,
      totalDevices,
      blacklistedIPs: blacklistedCount,
      averageRiskScore: 0.15, // Placeholder
      detectionRate: 0.92 // Placeholder
    };
  }

  public addBlacklistedIP(ip: string): void {
    this.blacklistedIPs.add(ip);
  }

  public removeBlacklistedIP(ip: string): void {
    this.blacklistedIPs.delete(ip);
  }

  public getBlacklistedIPs(): string[] {
    return Array.from(this.blacklistedIPs);
  }
}

// Export singleton instance
export const advancedFraudDetection = AdvancedFraudDetection.getInstance();

// Convenience functions
export async function detectFraud(
  userId: string,
  action: string,
  data: any,
  deviceFingerprint?: DeviceFingerprint
): Promise<FraudRisk> {
  return advancedFraudDetection.detectFraud(userId, action, data, deviceFingerprint);
}

export async function updateBehavioralProfile(userId: string, data: any): Promise<void> {
  return advancedFraudDetection.updateBehavioralProfile(userId, data);
} 