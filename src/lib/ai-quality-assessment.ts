// AI-Powered Quality Assessment System for FixMo
// Automated content moderation, image quality scoring, and fraud detection

export interface QualityMetrics {
  overallScore: number;
  contentQuality: number;
  imageQuality: number;
  safetyScore: number;
  spamScore: number;
  fraudRisk: number;
  recommendations: string[];
}

export interface ContentAnalysis {
  text: string;
  language: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  toxicity: number;
  spamProbability: number;
  inappropriateContent: boolean;
  flaggedWords: string[];
  suggestions: string[];
}

export interface ImageAnalysis {
  quality: {
    brightness: number;
    contrast: number;
    sharpness: number;
    noise: number;
    overall: number;
  };
  content: {
    isAppropriate: boolean;
    containsPerson: boolean;
    containsText: boolean;
    blurry: boolean;
    dark: boolean;
  };
  metadata: {
    size: number;
    format: string;
    dimensions: { width: number; height: number };
    compression: number;
  };
  recommendations: string[];
}

export interface UserBehaviorAnalysis {
  userId: string;
  riskScore: number;
  suspiciousActivities: string[];
  patterns: {
    postingFrequency: number;
    responseTime: number;
    cancellationRate: number;
    reviewPattern: string;
  };
  recommendations: string[];
}

export interface FraudDetectionResult {
  isFraudulent: boolean;
  confidence: number;
  riskFactors: string[];
  evidence: any[];
  recommendations: string[];
}

class AIQualityAssessment {
  private static instance: AIQualityAssessment;
  private contentFilters: Set<string> = new Set();
  private spamPatterns: RegExp[] = [];
  private fraudIndicators: Map<string, number> = new Map();
  private qualityThresholds: Record<string, number> = {};

  private constructor() {
    this.initializeFilters();
    this.initializePatterns();
    this.initializeThresholds();
  }

  static getInstance(): AIQualityAssessment {
    if (!AIQualityAssessment.instance) {
      AIQualityAssessment.instance = new AIQualityAssessment();
    }
    return AIQualityAssessment.instance;
  }

  private initializeFilters(): void {
    // Inappropriate content filters
    const inappropriateWords = [
      'spam', 'scam', 'fake', 'fraud', 'illegal', 'inappropriate',
      // Add more filters as needed
    ];
    inappropriateWords.forEach(word => this.contentFilters.add(word.toLowerCase()));
  }

  private initializePatterns(): void {
    // Spam detection patterns
    this.spamPatterns = [
      /\b(?:buy|sell|earn|money|cash|profit|rich|wealth)\b/gi,
      /\b(?:click|visit|website|link|url)\b/gi,
      /\b(?:urgent|limited|offer|discount|free)\b/gi,
      /[A-Z]{5,}/g, // Excessive caps
      /!{3,}/g, // Excessive exclamation marks
      /\d{10,}/g, // Long number sequences
    ];
  }

  private initializeThresholds(): void {
    this.qualityThresholds = {
      minImageQuality: 0.6,
      maxToxicity: 0.3,
      maxSpamProbability: 0.5,
      maxFraudRisk: 0.4,
      minContentLength: 10,
      maxContentLength: 1000,
    };
  }

  // Main quality assessment function
  public async assessQuality(
    content: string,
    images?: File[],
    userId?: string
  ): Promise<QualityMetrics> {
    try {
      const contentAnalysis = await this.analyzeContent(content);
      const imageAnalysis = images ? await this.analyzeImages(images) : null;
      const userAnalysis = userId ? await this.analyzeUserBehavior(userId) : null;
      const fraudAnalysis = await this.detectFraud(content, userId);

      const overallScore = this.calculateOverallScore(
        contentAnalysis,
        imageAnalysis,
        userAnalysis,
        fraudAnalysis
      );

      const recommendations = this.generateRecommendations(
        contentAnalysis,
        imageAnalysis,
        userAnalysis,
        fraudAnalysis
      );

      return {
        overallScore,
        contentQuality: contentAnalysis.overallQuality || 0,
        imageQuality: imageAnalysis?.quality.overall || 1.0,
        safetyScore: 1 - Math.max(contentAnalysis.toxicity, fraudAnalysis.confidence),
        spamScore: contentAnalysis.spamProbability,
        fraudRisk: fraudAnalysis.confidence,
        recommendations
      };

    } catch (error) {
      console.error('[AI] Quality assessment failed:', error);
      return {
        overallScore: 0.5,
        contentQuality: 0.5,
        imageQuality: 0.5,
        safetyScore: 0.5,
        spamScore: 0.5,
        fraudRisk: 0.5,
        recommendations: ['Quality assessment failed. Please review manually.']
      };
    }
  }

  private async analyzeContent(text: string): Promise<ContentAnalysis> {
    const analysis: ContentAnalysis = {
      text,
      language: this.detectLanguage(text),
      sentiment: this.analyzeSentiment(text),
      toxicity: this.calculateToxicity(text),
      spamProbability: this.calculateSpamProbability(text),
      inappropriateContent: this.checkInappropriateContent(text),
      flaggedWords: this.findFlaggedWords(text),
      suggestions: []
    };

    // Generate suggestions based on analysis
    if (analysis.toxicity > this.qualityThresholds.maxToxicity) {
      analysis.suggestions.push('Consider using more professional language');
    }

    if (analysis.spamProbability > this.qualityThresholds.maxSpamProbability) {
      analysis.suggestions.push('Content appears promotional. Focus on task details');
    }

    if (text.length < this.qualityThresholds.minContentLength) {
      analysis.suggestions.push('Please provide more details about the task');
    }

    if (text.length > this.qualityThresholds.maxContentLength) {
      analysis.suggestions.push('Consider being more concise');
    }

    // Calculate overall content quality
    analysis.overallQuality = this.calculateContentQuality(analysis);

    return analysis;
  }

  private detectLanguage(text: string): string {
    // Simple language detection (in production, use a proper library)
    const englishWords = /\b(?:the|and|or|but|in|on|at|to|for|of|with|by)\b/gi;
    const englishMatches = text.match(englishWords) || [];
    return englishMatches.length > 2 ? 'en' : 'unknown';
  }

  private analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'perfect'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'disappointing'];

    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private calculateToxicity(text: string): number {
    const toxicWords = [
      'hate', 'stupid', 'idiot', 'dumb', 'useless', 'worthless',
      'terrible', 'awful', 'horrible', 'disgusting', 'offensive'
    ];

    const words = text.toLowerCase().split(/\s+/);
    const toxicMatches = words.filter(word => toxicWords.includes(word));
    
    return Math.min(toxicMatches.length / words.length * 2, 1);
  }

  private calculateSpamProbability(text: string): number {
    let spamScore = 0;
    let totalMatches = 0;

    this.spamPatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      totalMatches += matches.length;
    });

    // Normalize based on text length
    const words = text.split(/\s+/).length;
    spamScore = Math.min(totalMatches / Math.max(words, 1) * 10, 1);

    // Additional spam indicators
    if (text.includes('http://') || text.includes('https://')) spamScore += 0.2;
    if (text.includes('@') && text.includes('.com')) spamScore += 0.3;
    if (text.match(/\d{3}[-.]?\d{3}[-.]?\d{4}/)) spamScore += 0.1; // Phone numbers

    return Math.min(spamScore, 1);
  }

  private checkInappropriateContent(text: string): boolean {
    const words = text.toLowerCase().split(/\s+/);
    return words.some(word => this.contentFilters.has(word));
  }

  private findFlaggedWords(text: string): string[] {
    const words = text.toLowerCase().split(/\s+/);
    return words.filter(word => this.contentFilters.has(word));
  }

  private calculateContentQuality(analysis: ContentAnalysis): number {
    let quality = 1.0;

    // Penalize toxicity
    quality -= analysis.toxicity * 0.4;

    // Penalize spam
    quality -= analysis.spamProbability * 0.3;

    // Penalize inappropriate content
    if (analysis.inappropriateContent) quality -= 0.5;

    // Bonus for appropriate length
    const length = analysis.text.length;
    if (length >= 50 && length <= 500) quality += 0.1;

    // Bonus for positive sentiment
    if (analysis.sentiment === 'positive') quality += 0.1;

    return Math.max(0, Math.min(1, quality));
  }

  private async analyzeImages(images: File[]): Promise<ImageAnalysis[]> {
    const analyses: ImageAnalysis[] = [];

    for (const image of images) {
      const analysis = await this.analyzeSingleImage(image);
      analyses.push(analysis);
    }

    return analyses;
  }

  private async analyzeSingleImage(image: File): Promise<ImageAnalysis> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        if (!imageData) {
          resolve(this.createDefaultImageAnalysis());
          return;
        }

        const analysis: ImageAnalysis = {
          quality: this.analyzeImageQuality(imageData),
          content: this.analyzeImageContent(imageData),
          metadata: {
            size: image.size,
            format: image.type,
            dimensions: { width: img.width, height: img.height },
            compression: this.calculateCompression(image.size, img.width * img.height)
          },
          recommendations: []
        };

        // Generate recommendations
        if (analysis.quality.brightness < 0.3) {
          analysis.recommendations.push('Image is too dark. Try taking it in better lighting');
        }

        if (analysis.quality.sharpness < 0.5) {
          analysis.recommendations.push('Image is blurry. Hold the camera steady');
        }

        if (analysis.quality.noise > 0.7) {
          analysis.recommendations.push('Image has too much noise. Try a cleaner background');
        }

        if (analysis.content.blurry) {
          analysis.recommendations.push('Image appears blurry. Please retake');
        }

        resolve(analysis);
      };

      img.onerror = () => {
        resolve(this.createDefaultImageAnalysis());
      };

      img.src = URL.createObjectURL(image);
    });
  }

  private analyzeImageQuality(imageData: ImageData): any {
    const { data, width, height } = imageData;
    let totalBrightness = 0;
    let totalContrast = 0;
    let totalSharpness = 0;
    let totalNoise = 0;

    // Calculate brightness and contrast
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      const brightness = (r + g + b) / 3 / 255;
      totalBrightness += brightness;
    }

    const avgBrightness = totalBrightness / (data.length / 4);

    // Calculate contrast (simplified)
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      const brightness = (r + g + b) / 3 / 255;
      totalContrast += Math.abs(brightness - avgBrightness);
    }

    const avgContrast = totalContrast / (data.length / 4);

    // Simplified sharpness calculation
    let edgeCount = 0;
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        const current = data[idx];
        const right = data[idx + 4];
        const down = data[idx + width * 4];
        
        if (Math.abs(current - right) > 30 || Math.abs(current - down) > 30) {
          edgeCount++;
        }
      }
    }

    const sharpness = Math.min(edgeCount / (width * height) * 10, 1);

    // Simplified noise calculation
    const noise = Math.max(0, 1 - sharpness - avgContrast);

    return {
      brightness: avgBrightness,
      contrast: avgContrast,
      sharpness,
      noise,
      overall: (avgBrightness + avgContrast + sharpness + (1 - noise)) / 4
    };
  }

  private analyzeImageContent(imageData: ImageData): any {
    // Simplified content analysis
    // In production, this would use computer vision APIs
    return {
      isAppropriate: true,
      containsPerson: false,
      containsText: false,
      blurry: imageData.data.length < 100000, // Very simplified
      dark: false
    };
  }

  private calculateCompression(fileSize: number, pixelCount: number): number {
    const theoreticalSize = pixelCount * 3; // RGB
    return Math.max(0, 1 - (fileSize / theoreticalSize));
  }

  private createDefaultImageAnalysis(): ImageAnalysis {
    return {
      quality: { brightness: 0.5, contrast: 0.5, sharpness: 0.5, noise: 0.5, overall: 0.5 },
      content: { isAppropriate: true, containsPerson: false, containsText: false, blurry: false, dark: false },
      metadata: { size: 0, format: '', dimensions: { width: 0, height: 0 }, compression: 0 },
      recommendations: ['Unable to analyze image quality']
    };
  }

  private async analyzeUserBehavior(userId: string): Promise<UserBehaviorAnalysis> {
    // In production, this would analyze user history from database
    const analysis: UserBehaviorAnalysis = {
      userId,
      riskScore: 0.1, // Default low risk
      suspiciousActivities: [],
      patterns: {
        postingFrequency: 1.0,
        responseTime: 30,
        cancellationRate: 0.05,
        reviewPattern: 'normal'
      },
      recommendations: []
    };

    // Add recommendations based on patterns
    if (analysis.patterns.cancellationRate > 0.2) {
      analysis.recommendations.push('High cancellation rate detected');
    }

    if (analysis.patterns.postingFrequency > 10) {
      analysis.recommendations.push('Unusually high posting frequency');
    }

    return analysis;
  }

  private async detectFraud(content: string, userId?: string): Promise<FraudDetectionResult> {
    const riskFactors: string[] = [];
    let confidence = 0;

    // Check for common fraud indicators
    if (content.includes('urgent') && content.includes('money')) {
      riskFactors.push('Urgent money requests');
      confidence += 0.3;
    }

    if (content.includes('bank') && content.includes('transfer')) {
      riskFactors.push('Bank transfer requests');
      confidence += 0.4;
    }

    if (content.includes('personal information') || content.includes('password')) {
      riskFactors.push('Personal information requests');
      confidence += 0.5;
    }

    if (content.includes('lottery') || content.includes('prize')) {
      riskFactors.push('Lottery/prize scams');
      confidence += 0.6;
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /\b(?:urgent|emergency|immediate)\b/gi,
      /\b(?:bank|account|transfer|wire)\b/gi,
      /\b(?:personal|private|confidential)\b/gi,
      /\b(?:lottery|prize|winner|claim)\b/gi,
    ];

    suspiciousPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches && matches.length > 2) {
        riskFactors.push('Multiple suspicious keywords');
        confidence += 0.2;
      }
    });

    return {
      isFraudulent: confidence > this.qualityThresholds.maxFraudRisk,
      confidence: Math.min(confidence, 1),
      riskFactors,
      evidence: [],
      recommendations: confidence > 0.3 ? ['Content flagged for review'] : []
    };
  }

  private calculateOverallScore(
    contentAnalysis: any,
    imageAnalysis: ImageAnalysis[] | null,
    userAnalysis: UserBehaviorAnalysis | null,
    fraudAnalysis: FraudDetectionResult
  ): number {
    let score = 1.0;

    // Content quality impact
    score *= contentAnalysis.overallQuality || 0.5;

    // Image quality impact (if images present)
    if (imageAnalysis && imageAnalysis.length > 0) {
      const avgImageQuality = imageAnalysis.reduce((sum, img) => sum + img.quality.overall, 0) / imageAnalysis.length;
      score *= (0.7 + 0.3 * avgImageQuality);
    }

    // User behavior impact
    if (userAnalysis) {
      score *= (1 - userAnalysis.riskScore);
    }

    // Fraud risk impact
    score *= (1 - fraudAnalysis.confidence);

    return Math.max(0, Math.min(1, score));
  }

  private generateRecommendations(
    contentAnalysis: any,
    imageAnalysis: ImageAnalysis[] | null,
    userAnalysis: UserBehaviorAnalysis | null,
    fraudAnalysis: FraudDetectionResult
  ): string[] {
    const recommendations: string[] = [];

    // Content recommendations
    recommendations.push(...contentAnalysis.suggestions);

    // Image recommendations
    if (imageAnalysis) {
      imageAnalysis.forEach(img => {
        recommendations.push(...img.recommendations);
      });
    }

    // User behavior recommendations
    if (userAnalysis) {
      recommendations.push(...userAnalysis.recommendations);
    }

    // Fraud recommendations
    recommendations.push(...fraudAnalysis.recommendations);

    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }

  // Public API methods
  public async assessTaskQuality(task: any): Promise<QualityMetrics> {
    return this.assessQuality(task.description, task.images, task.authorId);
  }

  public async assessUserProfile(userId: string): Promise<UserBehaviorAnalysis> {
    return this.analyzeUserBehavior(userId);
  }

  public async assessImageQuality(image: File): Promise<ImageAnalysis> {
    return this.analyzeSingleImage(image);
  }

  public getQualityThresholds(): Record<string, number> {
    return { ...this.qualityThresholds };
  }

  public updateQualityThresholds(newThresholds: Partial<Record<string, number>>): void {
    this.qualityThresholds = { ...this.qualityThresholds, ...newThresholds };
  }
}

// Export singleton instance
export const aiQualityAssessment = AIQualityAssessment.getInstance();

// Convenience functions
export async function assessContentQuality(content: string): Promise<QualityMetrics> {
  return aiQualityAssessment.assessQuality(content);
}

export async function assessTaskQuality(task: any): Promise<QualityMetrics> {
  return aiQualityAssessment.assessTaskQuality(task);
} 