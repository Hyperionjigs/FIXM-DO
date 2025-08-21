/**
 * AI Engineering Enhancements for FixMo
 * 
 * This file provides advanced AI engineering capabilities including:
 * - Prompt optimization and versioning
 * - Token usage tracking and cost management
 * - A/B testing framework for AI responses
 * - Evaluation metrics and quality assessment
 * - Fallback strategies and error handling
 */

import { z } from 'genkit';

// AI Engineering: Prompt versioning and management
export interface PromptVersion {
  version: string;
  prompt: string;
  performance: {
    successRate: number;
    averageResponseTime: number;
    tokenUsage: number;
    userSatisfaction: number;
  };
  createdAt: Date;
  isActive: boolean;
}

export class PromptManager {
  private prompts: Map<string, PromptVersion[]> = new Map();
  private currentVersions: Map<string, string> = new Map();

  addPrompt(category: string, version: string, prompt: string): void {
    if (!this.prompts.has(category)) {
      this.prompts.set(category, []);
    }
    
    const promptVersion: PromptVersion = {
      version,
      prompt,
      performance: {
        successRate: 0,
        averageResponseTime: 0,
        tokenUsage: 0,
        userSatisfaction: 0
      },
      createdAt: new Date(),
      isActive: false
    };
    
    this.prompts.get(category)!.push(promptVersion);
  }

  getActivePrompt(category: string): string | null {
    const version = this.currentVersions.get(category);
    if (!version) return null;
    
    const categoryPrompts = this.prompts.get(category);
    if (!categoryPrompts) return null;
    
    const activePrompt = categoryPrompts.find(p => p.version === version && p.isActive);
    return activePrompt?.prompt || null;
  }

  activateVersion(category: string, version: string): boolean {
    const categoryPrompts = this.prompts.get(category);
    if (!categoryPrompts) return false;
    
    // Deactivate all other versions
    categoryPrompts.forEach(p => p.isActive = false);
    
    // Activate the specified version
    const targetPrompt = categoryPrompts.find(p => p.version === version);
    if (targetPrompt) {
      targetPrompt.isActive = true;
      this.currentVersions.set(category, version);
      return true;
    }
    
    return false;
  }

  updatePerformance(category: string, version: string, metrics: Partial<PromptVersion['performance']>): void {
    const categoryPrompts = this.prompts.get(category);
    if (!categoryPrompts) return;
    
    const prompt = categoryPrompts.find(p => p.version === version);
    if (prompt) {
      Object.assign(prompt.performance, metrics);
    }
  }
}

// AI Engineering: Token usage tracking and cost management
export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  model: string;
  timestamp: Date;
}

export class TokenTracker {
  private usageHistory: TokenUsage[] = [];
  private costRates: Map<string, { input: number; output: number }> = new Map();

  constructor() {
    // Initialize cost rates (per 1K tokens)
    this.costRates.set('gpt-4', { input: 0.03, output: 0.06 });
    this.costRates.set('gpt-3.5-turbo', { input: 0.001, output: 0.002 });
    this.costRates.set('claude-3', { input: 0.015, output: 0.075 });
    this.costRates.set('gemini-pro', { input: 0.0005, output: 0.0015 });
  }

  trackUsage(model: string, inputTokens: number, outputTokens: number): TokenUsage {
    const totalTokens = inputTokens + outputTokens;
    const rates = this.costRates.get(model) || { input: 0.01, output: 0.02 };
    
    const estimatedCost = (inputTokens / 1000) * rates.input + (outputTokens / 1000) * rates.output;
    
    const usage: TokenUsage = {
      inputTokens,
      outputTokens,
      totalTokens,
      estimatedCost,
      model,
      timestamp: new Date()
    };
    
    this.usageHistory.push(usage);
    return usage;
  }

  getTotalCost(timeframe: 'day' | 'week' | 'month' = 'day'): number {
    const now = new Date();
    const cutoff = new Date();
    
    switch (timeframe) {
      case 'day':
        cutoff.setDate(now.getDate() - 1);
        break;
      case 'week':
        cutoff.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoff.setMonth(now.getMonth() - 1);
        break;
    }
    
    return this.usageHistory
      .filter(usage => usage.timestamp > cutoff)
      .reduce((total, usage) => total + usage.estimatedCost, 0);
  }

  getUsageStats(): {
    totalTokens: number;
    averageTokensPerRequest: number;
    mostUsedModel: string;
    costBreakdown: Record<string, number>;
  } {
    const totalTokens = this.usageHistory.reduce((sum, usage) => sum + usage.totalTokens, 0);
    const averageTokensPerRequest = totalTokens / Math.max(this.usageHistory.length, 1);
    
    const modelUsage = new Map<string, number>();
    const costBreakdown: Record<string, number> = {};
    
    this.usageHistory.forEach(usage => {
      modelUsage.set(usage.model, (modelUsage.get(usage.model) || 0) + usage.totalTokens);
      costBreakdown[usage.model] = (costBreakdown[usage.model] || 0) + usage.estimatedCost;
    });
    
    const mostUsedModel = Array.from(modelUsage.entries())
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'unknown';
    
    return {
      totalTokens,
      averageTokensPerRequest,
      mostUsedModel,
      costBreakdown
    };
  }
}

// AI Engineering: A/B testing framework for AI responses
export interface ABTestConfig {
  testId: string;
  description: string;
  variants: {
    id: string;
    weight: number;
    config: any;
  }[];
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
}

export class ABTestManager {
  private tests: Map<string, ABTestConfig> = new Map();
  private results: Map<string, Map<string, any[]>> = new Map();

  createTest(config: ABTestConfig): void {
    this.tests.set(config.testId, config);
    this.results.set(config.testId, new Map());
    config.variants.forEach(variant => {
      this.results.get(config.testId)!.set(variant.id, []);
    });
  }

  getVariant(testId: string, userId: string): string | null {
    const test = this.tests.get(testId);
    if (!test || !test.isActive) return null;
    
    // Simple hash-based assignment for consistent user experience
    const hash = this.hashString(userId + testId);
    const normalizedHash = hash / 0xffffffff; // Normalize to 0-1
    
    let cumulativeWeight = 0;
    for (const variant of test.variants) {
      cumulativeWeight += variant.weight;
      if (normalizedHash <= cumulativeWeight) {
        return variant.id;
      }
    }
    
    return test.variants[0]?.id || null;
  }

  recordResult(testId: string, variantId: string, result: any): void {
    const testResults = this.results.get(testId);
    if (testResults) {
      const variantResults = testResults.get(variantId) || [];
      variantResults.push(result);
      testResults.set(variantId, variantResults);
    }
  }

  getTestResults(testId: string): any {
    const test = this.tests.get(testId);
    const results = this.results.get(testId);
    
    if (!test || !results) return null;
    
    const analysis: any = {};
    
    test.variants.forEach(variant => {
      const variantResults = results.get(variant.id) || [];
      analysis[variant.id] = {
        sampleSize: variantResults.length,
        metrics: this.calculateMetrics(variantResults)
      };
    });
    
    return analysis;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private calculateMetrics(results: any[]): any {
    if (results.length === 0) return {};
    
    // Calculate various metrics based on result structure
    const successRate = results.filter(r => r.success).length / results.length;
    const avgResponseTime = results.reduce((sum, r) => sum + (r.responseTime || 0), 0) / results.length;
    const avgConfidence = results.reduce((sum, r) => sum + (r.confidence || 0), 0) / results.length;
    
    return {
      successRate,
      avgResponseTime,
      avgConfidence,
      totalResults: results.length
    };
  }
}

// AI Engineering: Evaluation metrics and quality assessment
export interface EvaluationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  responseTime: number;
  userSatisfaction: number;
  costEfficiency: number;
}

export class EvaluationEngine {
  private groundTruth: Map<string, any> = new Map();
  private predictions: Map<string, any[]> = new Map();

  addGroundTruth(id: string, truth: any): void {
    this.groundTruth.set(id, truth);
  }

  addPrediction(id: string, prediction: any): void {
    if (!this.predictions.has(id)) {
      this.predictions.set(id, []);
    }
    this.predictions.get(id)!.push(prediction);
  }

  calculateMetrics(): EvaluationMetrics {
    const allIds = Array.from(this.groundTruth.keys());
    let correctPredictions = 0;
    let totalPredictions = 0;
    let truePositives = 0;
    let falsePositives = 0;
    let falseNegatives = 0;
    let totalResponseTime = 0;
    let totalSatisfaction = 0;
    let totalCost = 0;

    allIds.forEach(id => {
      const truth = this.groundTruth.get(id);
      const predictions = this.predictions.get(id) || [];
      
      predictions.forEach(prediction => {
        totalPredictions++;
        totalResponseTime += prediction.responseTime || 0;
        totalSatisfaction += prediction.userSatisfaction || 0;
        totalCost += prediction.cost || 0;
        
        if (this.isCorrect(prediction, truth)) {
          correctPredictions++;
          truePositives++;
        } else {
          if (prediction.isVerified && !truth.isVerified) {
            falsePositives++;
          } else if (!prediction.isVerified && truth.isVerified) {
            falseNegatives++;
          }
        }
      });
    });

    const accuracy = totalPredictions > 0 ? correctPredictions / totalPredictions : 0;
    const precision = (truePositives + falsePositives) > 0 ? truePositives / (truePositives + falsePositives) : 0;
    const recall = (truePositives + falseNegatives) > 0 ? truePositives / (truePositives + falseNegatives) : 0;
    const f1Score = (precision + recall) > 0 ? 2 * (precision * recall) / (precision + recall) : 0;
    const avgResponseTime = totalPredictions > 0 ? totalResponseTime / totalPredictions : 0;
    const avgSatisfaction = totalPredictions > 0 ? totalSatisfaction / totalPredictions : 0;
    const avgCost = totalPredictions > 0 ? totalCost / totalPredictions : 0;

    return {
      accuracy,
      precision,
      recall,
      f1Score,
      responseTime: avgResponseTime,
      userSatisfaction: avgSatisfaction,
      costEfficiency: 1 / (avgCost + 0.001) // Higher is better, avoid division by zero
    };
  }

  private isCorrect(prediction: any, truth: any): boolean {
    // Custom logic for verification correctness
    if (prediction.isVerified === truth.isVerified) {
      // Additional checks for confidence levels, etc.
      return Math.abs(prediction.confidence - truth.confidence) < 0.2;
    }
    return false;
  }
}

// AI Engineering: Global instances for easy access
export const promptManager = new PromptManager();
export const tokenTracker = new TokenTracker();
export const abTestManager = new ABTestManager();
export const evaluationEngine = new EvaluationEngine();

// AI Engineering: Initialize default prompts
promptManager.addPrompt('verification', 'v1.0', `
You are an expert in biometric verification and fraud detection. Analyze the verification attempt and provide insights for a task marketplace platform.

Key considerations:
- Ensure the person is real and not using a photo or screen
- Check for appropriate lighting and image quality
- Verify face detection and liveness indicators
- Assess risk factors based on device and location context
- Provide clear, actionable recommendations

Respond with structured analysis including confidence scores, risk assessment, and specific recommendations.
`);

promptManager.addPrompt('task-suggestion', 'v1.0', `
You are an AI assistant helping users create task or service postings. Based on the user's input, suggest appropriate categories and detailed descriptions.

Guidelines:
- Analyze the title and context to determine the best category
- Generate detailed, professional descriptions
- Ask follow-up questions when more information is needed
- Ensure descriptions are clear and actionable
- Consider the user's intent (task vs service)

Provide structured output with category, description, and any follow-up questions.
`);

// Activate default versions
promptManager.activateVersion('verification', 'v1.0');
promptManager.activateVersion('task-suggestion', 'v1.0'); 